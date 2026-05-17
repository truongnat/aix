import { Injectable, NotFoundException } from '@nestjs/common'
import { createHash } from 'crypto'
import { v4 as uuidv4 } from 'uuid'
import neo4j from 'neo4j-driver'
import { Neo4jService } from '../neo4j/neo4j.service'
import { CacheService } from '../cache/cache.service'
import { SearchService } from '../search/search.service'
import { GithubService } from '../github/github.service'
import { PushKbDto } from './dto/push-kb.dto'
import { UpdateKbDto } from './dto/update-kb.dto'
import { SuggestedTagDto } from './dto/suggest-tags.dto'
import { SolutionRevisionDto, SolutionHistoryResponseDto, RevisionDiffDto } from './dto/solution-revision.dto'
import { KbMetricsDto } from './dto/kb-metrics.dto'

@Injectable()
export class KbService {
  constructor(
    private neo4j: Neo4jService,
    private cache: CacheService,
    private searchSvc: SearchService,
    private github: GithubService,
  ) {}

  async push(dto: PushKbDto): Promise<{ id: string; message: string; related_found: number }> {
    const id = uuidv4()
    const now = new Date().toISOString()
    const summary = dto.content.replace(/#+\s/g, '').slice(0, 200)
    const tags = dto.tags ?? []
    const technologies = dto.technologies ?? []

    await this.neo4j.runQuery(
      `CREATE (s:Solution {
        id: $id,
        title: $title,
        content: $content,
        summary: $summary,
        ticket_ref: $ticketRef,
        project: $project,
        created_at: $now,
        updated_at: $now,
        version_count: 1
      })`,
      { id, title: dto.title, content: dto.content, summary, ticketRef: dto.ticket_ref ?? null, project: dto.project ?? null, now },
    )

    // Create initial revision
    await this.createRevision(id, 1, dto.title, summary, dto.content, tags)

    // Batch tag creation with UNWIND (single query instead of N)
    if (tags.length > 0) {
      await this.neo4j.runQuery(
        `UNWIND $tags AS tagName
         MERGE (t:Tag { name: tagName })
         WITH t
         MATCH (s:Solution { id: $id })
         MERGE (s)-[:TAGGED_WITH]->(t)`,
        { tags, id },
      )
    }

    if (dto.project) {
      await this.neo4j.runQuery(
        `MERGE (p:Project { name: $project })
         WITH p
         MATCH (s:Solution { id: $id })
         MERGE (s)-[:BELONGS_TO]->(p)`,
        { project: dto.project, id },
      )
    }

    // Batch technology creation with UNWIND (single query instead of N)
    if (technologies.length > 0) {
      await this.neo4j.runQuery(
        `UNWIND $technologies AS techName
         MERGE (t:Technology { name: techName })
         WITH t
         MATCH (s:Solution { id: $id })
         MERGE (s)-[:USES]->(t)`,
        { technologies, id },
      )
    }

    // Handle GitHub issue linking
    if (dto.github_issues && dto.github_issues.length > 0) {
      const issues = []
      for (const issueRef of dto.github_issues) {
        try {
          const issue = await this.github.resolveIssue(issueRef)
          issues.push(issue)
        } catch (err: any) {
          // Log error but continue; don't fail the entire push
          console.warn(`Failed to resolve GitHub issue ${issueRef}: ${err.message}`)
        }
      }

      if (issues.length > 0) {
        const { cypher, params } = await this.github.createIssueLinkQuery(id, issues)
        await this.neo4j.runQuery(cypher, params)
      }
    }

    let relatedFound = 0
    if (tags.length > 0) {
      const related = await this.neo4j.runQuery(
        `MATCH (existing:Solution)-[:TAGGED_WITH]->(t:Tag)
         WHERE t.name IN $tags AND existing.id <> $id
         WITH DISTINCT existing
         MATCH (s:Solution { id: $id })
         MERGE (s)-[:RELATED_TO]->(existing)
         RETURN count(existing) AS cnt`,
        { tags, id },
      )
      relatedFound = related.records[0]?.get('cnt')?.toNumber() ?? 0
    }

    await this.searchSvc.indexDocument('solutions', {
      id,
      title: dto.title,
      content: dto.content,
      tags,
      project: dto.project ?? null,
      technologies,
      created_at: now,
    })

    await this.cache.delByPattern('search:*')

    return { id, message: 'Pushed successfully', related_found: relatedFound }
  }

  async search(query: string, limit = 5): Promise<{ results: any[]; total: number; cached: boolean }> {
    const cacheKey = 'search:' + createHash('md5').update(query + limit).digest('hex')
    const cached = await this.cache.get<any>(cacheKey)
    if (cached) return { ...cached, cached: true }

    const { hits, totalHits } = await this.searchSvc.search('solutions', query, { limit })

    const results: any[] = []
    if (hits.length > 0) {
      // Batch fetch all solutions in a single Neo4j query (eliminates N+1)
      const ids = hits.map((h) => h.id)
      const res = await this.neo4j.runQuery(
        `UNWIND $ids AS sid
         MATCH (s:Solution { id: sid })
         OPTIONAL MATCH (s)-[:RELATED_TO]->(rel:Solution)
         RETURN s, collect({ id: rel.id, title: rel.title }) AS related`,
        { ids },
      )

      // Build a map for O(1) lookup by id, preserving Meilisearch rank order
      const byId = new Map<string, any>()
      for (const rec of res.records) {
        const s = rec.get('s').properties
        byId.set(s.id, {
          id: s.id,
          title: s.title,
          summary: s.summary,
          ticket_ref: s.ticket_ref,
          project: s.project,
          created_at: s.created_at,
          related: (rec.get('related') as any[]).filter((r) => r.id),
        })
      }

      // Re-order by Meilisearch rank and attach tags + score from search index
      for (const hit of hits) {
        const node = byId.get(hit.id)
        if (!node) continue
        results.push({
          ...node,
          tags: hit.tags ?? [],
          score: hit._rankingScore ?? 0,
        })
      }
    }

    const payload = { results, total: totalHits }
    await this.cache.set(cacheKey, payload, 300)
    return { ...payload, cached: false }
  }

  async list(opts: { tag?: string; project?: string; page?: number; limit?: number }) {
    const page = opts.page ?? 1
    const limit = opts.limit ?? 20
    const skip = neo4j.int((page - 1) * limit)

    let cypher = `MATCH (s:Solution)`
    const params: any = { skip, limit: neo4j.int(limit) }

    if (opts.tag) {
      cypher = `MATCH (s:Solution)-[:TAGGED_WITH]->(t:Tag { name: $tag })`
      params.tag = opts.tag
    } else if (opts.project) {
      cypher = `MATCH (s:Solution)-[:BELONGS_TO]->(p:Project { name: $project })`
      params.project = opts.project
    }

    const countRes = await this.neo4j.runQuery(cypher + ' RETURN count(s) AS cnt', params)
    const total = countRes.records[0]?.get('cnt')?.toNumber() ?? 0

    const result = await this.neo4j.runQuery(
      cypher + ' RETURN s ORDER BY s.created_at DESC SKIP $skip LIMIT $limit',
      params,
    )

    const items = result.records.map((r) => {
      const s = r.get('s').properties
      return { id: s.id, title: s.title, summary: s.summary, ticket_ref: s.ticket_ref, project: s.project, created_at: s.created_at }
    })

    return { items, total, page, limit }
  }

  async getById(id: string) {
    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution { id: $id })
       OPTIONAL MATCH (s)-[:TAGGED_WITH]->(t:Tag)
       OPTIONAL MATCH (s)-[:USES]->(tech:Technology)
       OPTIONAL MATCH (s)-[:RELATED_TO]->(rel:Solution)
       RETURN s,
         collect(DISTINCT t.name) AS tags,
         collect(DISTINCT tech.name) AS technologies,
         collect(DISTINCT { id: rel.id, title: rel.title }) AS related`,
      { id },
    )
    if (result.records.length === 0) throw new NotFoundException(`Solution ${id} not found`)

    const rec = result.records[0]
    const s = rec.get('s').properties
    return {
      id: s.id,
      title: s.title,
      content: s.content,
      tags: rec.get('tags'),
      ticket_ref: s.ticket_ref,
      project: s.project,
      technologies: rec.get('technologies'),
      created_at: s.created_at,
      updated_at: s.updated_at,
      related: (rec.get('related') as any[]).filter((r) => r.id),
    }
  }

  async update(id: string, dto: UpdateKbDto) {
    const existing = await this.getById(id)
    const now = new Date().toISOString()

    await this.neo4j.runQuery(
      `MATCH (s:Solution { id: $id })
       SET s.title = $title,
           s.content = $content,
           s.summary = $summary,
           s.ticket_ref = $ticketRef,
           s.project = $project,
           s.updated_at = $now`,
      {
        id,
        title: dto.title ?? existing.title,
        content: dto.content ?? existing.content,
        summary: (dto.content ?? existing.content).replace(/#+\s/g, '').slice(0, 200),
        ticketRef: dto.ticket_ref ?? existing.ticket_ref,
        project: dto.project ?? existing.project,
        now,
      },
    )

    await this.searchSvc.updateDocument('solutions', {
      id,
      title: dto.title ?? existing.title,
      content: dto.content ?? existing.content,
      tags: dto.tags ?? existing.tags,
      project: dto.project ?? existing.project,
    })

    await this.cache.delByPattern('search:*')
    return { id, message: 'Updated successfully' }
  }

  async delete(id: string) {
    await this.neo4j.runQuery(
      `MATCH (s:Solution { id: $id }) DETACH DELETE s`,
      { id },
    )
    await this.searchSvc.deleteDocument('solutions', id)
    await this.cache.delByPattern('search:*')
    return { message: 'Deleted successfully' }
  }

  async suggestTags(content: string, project?: string): Promise<SuggestedTagDto[]> {
    // 1. Extract keywords from content (heuristic)
    const keywords = this.extractKeywords(content)
    if (keywords.length === 0) return []

    // 2. Query Meilisearch for similar solutions
    const { hits } = await this.searchSvc.search('solutions', keywords.join(' '), { limit: 10 })

    // 3. Aggregate tags from similar solutions (frequency-based)
    const tagFrequency = new Map<string, number>()
    for (const hit of hits) {
      const tags = (hit.tags as string[]) ?? []
      for (const tag of tags) {
        tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1)
      }
    }

    // 4. Query graph for related tags (co-occurrence patterns)
    const graphTags = await this.getRelatedTagsByGraph(keywords)

    // 5. Merge and rank by confidence
    const suggested = this.rankTagSuggestions(tagFrequency, graphTags, keywords, project)

    // 6. Return top 10 with confidence scores
    return suggested.slice(0, 10)
  }

  private extractKeywords(content: string): string[] {
    // Remove common words, extract meaningful terms
    const stopwords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'be', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'that', 'this', 'it', 'have', 'has', 'do', 'does', 'did', 'can', 'could', 'would', 'should'])
    const words = content.toLowerCase().match(/\b\w+\b/g) || []

    return words
      .filter((w) => w.length > 3 && !stopwords.has(w))
      .slice(0, 10)
  }

  private async getRelatedTagsByGraph(keywords: string[]): Promise<Map<string, number>> {
    const tagMap = new Map<string, number>()

    // For each keyword, find tags that co-occur frequently in the graph
    for (const keyword of keywords) {
      const result = await this.neo4j.runQuery(
        `
        MATCH (t:Tag { name: $keyword })<-[:TAGGED_WITH]-(s:Solution)
              -[:TAGGED_WITH]->(related:Tag)
        WHERE related.name <> $keyword
        RETURN related.name AS name, count(DISTINCT s) AS cnt
        ORDER BY cnt DESC
        LIMIT 5
        `,
        { keyword },
      )

      for (const record of result.records) {
        const name = record.get('name')
        const cnt = record.get('cnt').toNumber()
        tagMap.set(name, (tagMap.get(name) || 0) + cnt)
      }
    }

    return tagMap
  }

  private rankTagSuggestions(
    frequency: Map<string, number>,
    graphTags: Map<string, number>,
    keywords: string[],
    project?: string,
  ): SuggestedTagDto[] {
    const scored = new Map<string, SuggestedTagDto>()

    // Score from frequency (0-1, weighted by occurrences)
    frequency.forEach((count, tag) => {
      const confidence = Math.min(count / 5, 1.0) * 0.6 // Weight frequency at 60%
      scored.set(tag, {
        tag,
        confidence,
        reason: 'frequency',
        relatedSolutions: count,
      })
    })

    // Score from graph patterns (co-occurrence)
    graphTags.forEach((count, tag) => {
      if (scored.has(tag)) {
        const existing = scored.get(tag)!
        existing.confidence = Math.max(existing.confidence, (Math.min(count / 10, 1.0) * 0.4))
      } else {
        scored.set(tag, {
          tag,
          confidence: Math.min(count / 10, 1.0) * 0.4, // Weight graph at 40%
          reason: 'graph',
          relatedSolutions: 0,
        })
      }
    })

    // Boost keyword matches (direct content match)
    keywords.forEach((keyword) => {
      if (scored.has(keyword)) {
        const existing = scored.get(keyword)!
        existing.confidence = Math.min(existing.confidence + 0.3, 1.0)
        existing.reason = 'content_match'
      }
    })

    // Filter low-confidence, sort by confidence (descending)
    return Array.from(scored.values())
      .filter((t) => t.confidence > 0.2)
      .sort((a, b) => b.confidence - a.confidence)
  }

  private async createRevision(solutionId: string, version: number, title: string, summary: string, content: string, tags: string[]): Promise<void> {
    const revisionId = uuidv4()
    const now = new Date().toISOString()
    const contentHash = createHash('sha256').update(content).digest('hex')

    await this.neo4j.runQuery(
      `CREATE (r:SolutionRevision {
        id: $revisionId,
        solution_id: $solutionId,
        version: $version,
        title: $title,
        summary: $summary,
        content_hash: $contentHash,
        tags_snapshot: $tagsSnapshot,
        created_at: $now
      })`,
      { revisionId, solutionId, version, title, summary, contentHash, tagsSnapshot: JSON.stringify(tags), now },
    )
  }

  async getHistory(solutionId: string): Promise<SolutionHistoryResponseDto> {
    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution { id: $solutionId })
       OPTIONAL MATCH (s)<-[:FOR]-(r:SolutionRevision)
       RETURN s, collect(r) AS revisions ORDER BY r.version DESC`,
      { solutionId },
    )

    if (result.records.length === 0) throw new NotFoundException(`Solution ${solutionId} not found`)

    const rec = result.records[0]
    const s = rec.get('s').properties
    const revisions = rec.get('revisions')

    return {
      id: s.id,
      title: s.title,
      totalRevisions: revisions.length,
      revisions: revisions
        .sort((a: any, b: any) => b.properties.version - a.properties.version)
        .map((r: any) => {
          const props = r.properties
          return {
            id: props.id,
            solutionId: props.solution_id,
            version: props.version.toNumber?.() ?? props.version,
            title: props.title,
            summary: props.summary,
            contentHash: props.content_hash,
            tagsSnapshot: JSON.parse(props.tags_snapshot ?? '[]'),
            createdAt: props.created_at,
          }
        }),
    }
  }

  async findByGithubIssue(repo: string, number: number): Promise<any[]> {
    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution)-[:SOLVES]->(gh:GitHubIssue { repo: $repo, number: $number })
       OPTIONAL MATCH (s)-[:TAGGED_WITH]->(t:Tag)
       RETURN s, collect(DISTINCT t.name) AS tags`,
      { repo, number },
    )

    return result.records.map((rec) => {
      const s = rec.get('s').properties
      return {
        id: s.id,
        title: s.title,
        summary: s.summary,
        project: s.project,
        tags: rec.get('tags'),
        created_at: s.created_at,
        updated_at: s.updated_at,
      }
    })
  }

  async getMetrics(): Promise<KbMetricsDto> {
    const cacheKey = 'metrics:kb:health'
    const cached = await this.cache.get<KbMetricsDto>(cacheKey)
    if (cached) return cached

    // Run all metric queries in parallel
    const [
      overview,
      byProject,
      topTags,
      topTechnologies,
      coverage,
      recentActivity,
      qualityMetrics,
    ] = await Promise.all([
      this.queryOverview(),
      this.queryByProject(),
      this.queryTopTags(),
      this.queryTopTechnologies(),
      this.queryCoverage(),
      this.queryRecentActivity(),
      this.queryQualityMetrics(),
    ])

    const metrics: KbMetricsDto = {
      overview,
      by_project: byProject,
      top_tags: topTags,
      top_technologies: topTechnologies,
      coverage,
      recent_activity: recentActivity,
      quality_metrics: qualityMetrics,
    }

    // Cache for 1 hour
    await this.cache.set(cacheKey, metrics, 3600)
    return metrics
  }

  private async queryOverview() {
    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution)
       OPTIONAL MATCH (t:Tag)
       OPTIONAL MATCH (p:Project)
       OPTIONAL MATCH (tech:Technology)
       OPTIONAL MATCH (s)-[:SOLVES]->(gh:GitHubIssue)
       WITH count(DISTINCT s) AS totalSolutions,
            count(DISTINCT t) AS totalTags,
            count(DISTINCT p) AS totalProjects,
            count(DISTINCT tech) AS totalTechnologies,
            count(DISTINCT gh) AS totalGithubLinks
       OPTIONAL MATCH (s:Solution)-[:TAGGED_WITH]->(tag:Tag)
       WITH totalSolutions, totalTags, totalProjects, totalTechnologies, totalGithubLinks,
            count(tag) AS totalTagAssignments
       RETURN totalSolutions, totalTags, totalProjects, totalTechnologies, totalGithubLinks,
              CASE WHEN totalSolutions > 0 THEN toFloat(totalTagAssignments) / totalSolutions ELSE 0 END AS avgTagsPerSolution`,
    )
    const rec = result.records[0]
    return {
      total_solutions: rec.get('totalSolutions').toNumber() || 0,
      total_tags: rec.get('totalTags').toNumber() || 0,
      total_projects: rec.get('totalProjects').toNumber() || 0,
      total_technologies: rec.get('totalTechnologies').toNumber() || 0,
      average_tags_per_solution: rec.get('avgTagsPerSolution').toNumber() || 0,
      solutions_with_github_links: rec.get('totalGithubLinks').toNumber() || 0,
    }
  }

  private async queryByProject() {
    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution)-[:BELONGS_TO]->(p:Project)
       WITH p.name AS project, count(s) AS count
       WITH project, count,
            (SELECT count(s2) FROM (:Solution)) AS total
       RETURN project, count, ROUND(toFloat(count) / total * 100) AS percentage
       ORDER BY count DESC`,
    )
    return result.records.map((r) => ({
      name: r.get('project'),
      count: r.get('count').toNumber(),
      percentage: r.get('percentage').toNumber() || 0,
    }))
  }

  private async queryTopTags() {
    const result = await this.neo4j.runQuery(
      `MATCH (t:Tag)<-[:TAGGED_WITH]-(s:Solution)
       WITH t.name AS name, count(DISTINCT s) AS solutions
       RETURN name, solutions, solutions AS count
       ORDER BY count DESC
       LIMIT 20`,
    )
    return result.records.map((r) => ({
      name: r.get('name'),
      count: r.get('count').toNumber(),
      solutions: r.get('solutions').toNumber(),
    }))
  }

  private async queryTopTechnologies() {
    const result = await this.neo4j.runQuery(
      `MATCH (tech:Technology)<-[:USES]-(s:Solution)
       WITH tech.name AS name, count(DISTINCT s) AS solutions
       RETURN name, solutions, solutions AS count
       ORDER BY count DESC
       LIMIT 20`,
    )
    return result.records.map((r) => ({
      name: r.get('name'),
      count: r.get('count').toNumber(),
      solutions: r.get('solutions').toNumber(),
    }))
  }

  private async queryCoverage() {
    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution)
       WITH count(s) AS totalSolutions,
            sum(CASE WHEN s.content CONTAINS '```' THEN 1 ELSE 0 END) AS withCode,
            sum(CASE WHEN (s)-[:USES]->() THEN 1 ELSE 0 END) AS withTech,
            sum(CASE WHEN (s)<-[:FOR]-() THEN 1 ELSE 0 END) AS withRevisions
       OPTIONAL MATCH (s:Solution)<-[:FOR]-(r:SolutionRevision)
       WITH totalSolutions, withCode, withTech, withRevisions,
            CASE WHEN totalSolutions > 0 THEN AVG(COUNT(*)) ELSE 0 END AS avgRevisions
       OPTIONAL MATCH (s:Solution)-[:SOLVES]-(gh:GitHubIssue)
       WITH totalSolutions, withCode, withTech, withRevisions, avgRevisions,
            count(DISTINCT gh) AS withGithubLinks
       RETURN totalSolutions, withCode, withTech, withRevisions, avgRevisions, withGithubLinks`,
    )
    const rec = result.records[0]
    return {
      solutions_with_code_examples: rec.get('withCode').toNumber() || 0,
      solutions_with_tech_tags: rec.get('withTech').toNumber() || 0,
      solutions_with_revisions: rec.get('withRevisions').toNumber() || 0,
      average_revisions: rec.get('avgRevisions').toNumber() || 0,
      solutions_with_github_links: rec.get('withGithubLinks').toNumber() || 0,
    }
  }

  private async queryRecentActivity() {
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution)
       RETURN
         sum(CASE WHEN s.created_at > $sevenDaysAgo THEN 1 ELSE 0 END) AS created7d,
         sum(CASE WHEN s.updated_at > $sevenDaysAgo THEN 1 ELSE 0 END) AS updated7d,
         sum(CASE WHEN s.created_at > $thirtyDaysAgo THEN 1 ELSE 0 END) AS created30d,
         sum(CASE WHEN s.updated_at > $thirtyDaysAgo THEN 1 ELSE 0 END) AS updated30d`,
      { sevenDaysAgo, thirtyDaysAgo },
    )
    const rec = result.records[0]
    return {
      created_last_7_days: rec.get('created7d').toNumber() || 0,
      updated_last_7_days: rec.get('updated7d').toNumber() || 0,
      created_last_30_days: rec.get('created30d').toNumber() || 0,
      updated_last_30_days: rec.get('updated30d').toNumber() || 0,
    }
  }

  private async queryQualityMetrics() {
    const result = await this.neo4j.runQuery(
      `MATCH (s:Solution)
       WITH avg(size(s.content)) AS avgLength
       OPTIONAL MATCH (s)-[:TAGGED_WITH]->()
       WITH avgLength,
            sum(CASE WHEN 1=1 THEN 1 ELSE 0 END) AS totalTags,
            count(DISTINCT s) AS totalSolutions,
            sum(CASE WHEN (s)-[:TAGGED_WITH]->() AND EXISTS((s)-[:TAGGED_WITH]->()(2)) THEN 1 ELSE 0 END) AS multipleTags
       OPTIONAL MATCH (s:Solution) WHERE NOT (s)-[:TAGGED_WITH]->()
       WITH avgLength, multipleTags, totalSolutions,
            count(DISTINCT s) AS withoutTags,
            (totalSolutions - multipleTags - count(DISTINCT s)) AS singleTag
       OPTIONAL MATCH (s:Solution) WHERE NOT (s)-[:RELATED_TO]->() AND NOT (s)<-[:RELATED_TO]-()
       WITH avgLength, multipleTags, withoutTags, singleTag, totalSolutions,
            count(DISTINCT s) AS isolated
       OPTIONAL MATCH (s:Solution)-[:RELATED_TO]->()
       WITH avgLength, multipleTags, withoutTags, singleTag, totalSolutions, isolated,
            count(DISTINCT s) AS connectedRelations
       RETURN ROUND(avgLength) AS avgLength, multipleTags, withoutTags, singleTag, totalSolutions,
              isolated, connectedRelations`,
    )
    const rec = result.records[0]
    const totalSolutions = rec.get('totalSolutions').toNumber() || 0
    const connectedViaRelations = rec.get('connectedRelations').toNumber() || 0
    const isolated = rec.get('isolated').toNumber() || 0
    const connectedViaTags = totalSolutions - isolated - connectedViaRelations

    return {
      avg_solution_length: rec.get('avgLength').toNumber() || 0,
      avg_tags_per_solution: totalSolutions > 0 ? (totalSolutions - rec.get('withoutTags').toNumber()) / totalSolutions : 0,
      solutions_with_multiple_tags: rec.get('multipleTags').toNumber() || 0,
      solutions_with_single_tag: rec.get('singleTag').toNumber() || 0,
      solutions_without_tags: rec.get('withoutTags').toNumber() || 0,
      graph_connectivity: {
        isolated_solutions: isolated,
        connected_via_tags: Math.max(0, connectedViaTags),
        connected_via_relations: connectedViaRelations,
      },
    }
  }
}
