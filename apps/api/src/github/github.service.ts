import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface GithubIssueInfo {
  repo: string // 'owner/repo'
  number: number // Issue or PR number
  url: string // Full GitHub URL
  title: string
  state: 'open' | 'closed'
  created_at: string
}

@Injectable()
export class GithubService {
  private readonly logger = new Logger(GithubService.name)
  private readonly token: string
  private readonly baseUrl = 'https://api.github.com'

  constructor(private config: ConfigService) {
    this.token = config.get<string>('GITHUB_TOKEN') || ''
  }

  /**
   * Validate GitHub issue/PR URL and fetch details
   * Supports formats:
   * - https://github.com/owner/repo/issues/123
   * - https://github.com/owner/repo/pull/456
   * - owner/repo#123
   */
  async resolveIssue(input: string): Promise<GithubIssueInfo> {
    const parsed = this.parseGithubRef(input)
    if (!parsed) {
      throw new Error(
        `Invalid GitHub reference: ${input}. Use https://github.com/owner/repo/issues/123 or owner/repo#123`,
      )
    }

    if (!this.token) {
      // Return basic info without API call if no token
      this.logger.warn('GITHUB_TOKEN not set; returning partial issue info')
      return {
        repo: parsed.repo,
        number: parsed.number,
        url: `https://github.com/${parsed.repo}/issues/${parsed.number}`,
        title: `Issue #${parsed.number}`,
        state: 'open',
        created_at: new Date().toISOString(),
      }
    }

    // Fetch full details from GitHub API
    return this.fetchIssueDetails(parsed.repo, parsed.number)
  }

  /**
   * Search for issues in a repository by keyword
   */
  async searchIssues(repo: string, query: string): Promise<GithubIssueInfo[]> {
    if (!this.token) {
      this.logger.warn('GITHUB_TOKEN not set; search disabled')
      return []
    }

    try {
      const url = `${this.baseUrl}/search/issues?q=repo:${repo}+${encodeURIComponent(query)}&per_page=10&sort=updated&order=desc`
      const res = await fetch(url, {
        headers: { Authorization: `token ${this.token}` },
      })

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.statusText}`)
      }

      const data = await res.json()
      return (data.items || []).map((item: any) => ({
        repo,
        number: item.number,
        url: item.html_url,
        title: item.title,
        state: item.state,
        created_at: item.created_at,
      }))
    } catch (err: any) {
      this.logger.error(`Failed to search GitHub issues: ${err.message}`)
      return []
    }
  }

  /**
   * Link multiple issues to a KB solution via Neo4j relationships
   */
  async createIssueLinkQuery(
    solutionId: string,
    issues: GithubIssueInfo[],
  ): Promise<{ cypher: string; params: Record<string, any> }> {
    const issueRefs = issues.map((i) => ({
      repo: i.repo,
      number: i.number,
      url: i.url,
      title: i.title,
    }))

    return {
      cypher: `
        MATCH (s:Solution { id: $solutionId })
        WITH s
        UNWIND $issues AS issue
        MERGE (gh:GitHubIssue { url: issue.url })
        SET gh.repo = issue.repo,
            gh.number = issue.number,
            gh.title = issue.title
        WITH s, gh
        MERGE (s)-[:SOLVES]->(gh)
      `,
      params: {
        solutionId,
        issues: issueRefs,
      },
    }
  }

  // Private helpers

  private parseGithubRef(input: string): { repo: string; number: number } | null {
    // Format 1: https://github.com/owner/repo/issues/123 or /pull/123
    const urlMatch = input.match(/github\.com\/([^/]+\/[^/]+)\/(issues|pull)\/(\d+)/)
    if (urlMatch) {
      return { repo: urlMatch[1], number: parseInt(urlMatch[3]) }
    }

    // Format 2: owner/repo#123
    const shortMatch = input.match(/^([^/]+\/[^#]+)#(\d+)$/)
    if (shortMatch) {
      return { repo: shortMatch[1], number: parseInt(shortMatch[2]) }
    }

    return null
  }

  private async fetchIssueDetails(repo: string, number: number): Promise<GithubIssueInfo> {
    try {
      const url = `${this.baseUrl}/repos/${repo}/issues/${number}`
      const res = await fetch(url, {
        headers: { Authorization: `token ${this.token}` },
      })

      if (res.status === 404) {
        throw new Error(`Issue not found: ${repo}#${number}`)
      }

      if (!res.ok) {
        throw new Error(`GitHub API error: ${res.statusText}`)
      }

      const data = await res.json()
      return {
        repo,
        number: data.number,
        url: data.html_url,
        title: data.title,
        state: data.state,
        created_at: data.created_at,
      }
    } catch (err: any) {
      this.logger.error(`Failed to fetch issue details: ${err.message}`)
      throw err
    }
  }
}
