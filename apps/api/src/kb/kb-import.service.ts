import { Injectable, Logger } from '@nestjs/common'
import { KbService } from './kb.service'
import { PushKbDto } from './dto/push-kb.dto'

export interface ImportResult {
  file: string
  success: boolean
  solution_id?: string
  error?: string
}

export interface ImportSummary {
  total_files: number
  successful: number
  failed: number
  results: ImportResult[]
}

export interface ParsedMarkdown {
  title: string
  content: string
  tags?: string[]
  technologies?: string[]
  project?: string
}

@Injectable()
export class KbImportService {
  private readonly logger = new Logger(KbImportService.name)

  constructor(private kb: KbService) {}

  /**
   * Parse markdown file content to extract title, content, frontmatter metadata
   * Supports multiple markdown formats:
   * 1. YAML frontmatter with metadata
   * 2. Title from H1 heading
   * 3. Tags extracted from special section (## Tags, ## Topics, etc.)
   */
  parseMarkdown(content: string): ParsedMarkdown {
    let title = ''
    let body = content
    let metadata: Record<string, any> = {}

    // Check for YAML frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/)
    if (frontmatterMatch) {
      // Simple YAML parsing for common fields
      const yamlContent = frontmatterMatch[1]
      const titleMatch = yamlContent.match(/title:\s*["']?([^"\n]+)["']?/)
      const tagsMatch = yamlContent.match(/tags:\s*\[([^\]]+)\]|tags:\s*([\w\s,]+)/)
      const techMatch = yamlContent.match(/technologies:\s*\[([^\]]+)\]|technologies:\s*([\w\s,]+)/)
      const projectMatch = yamlContent.match(/project:\s*["']?([^"\n]+)["']?/)

      if (titleMatch) title = titleMatch[1].trim()
      if (tagsMatch) {
        const tagStr = tagsMatch[1] || tagsMatch[2]
        metadata.tags = tagStr
          .split(',')
          .map((t) => t.trim().replace(/['"]/g, ''))
          .filter(Boolean)
      }
      if (techMatch) {
        const techStr = techMatch[1] || techMatch[2]
        metadata.technologies = techStr
          .split(',')
          .map((t) => t.trim().replace(/['"]/g, ''))
          .filter(Boolean)
      }
      if (projectMatch) metadata.project = projectMatch[1].trim()

      // Remove frontmatter from body
      body = content.replace(/^---\n[\s\S]*?\n---\n/, '').trim()
    }

    // Extract title from H1 if not in frontmatter
    if (!title) {
      const h1Match = body.match(/^#\s+(.+)/)
      if (h1Match) {
        title = h1Match[1].trim()
      }
    }

    // Extract tags from special sections
    let tags = metadata.tags || []
    const tagsSection = body.match(/##\s+(?:Tags|Topics)\s*\n([\s\S]*?)(?:\n##|\n\n|$)/)
    if (tagsSection) {
      const tagLines = tagsSection[1]
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => l.replace(/^[-*]\s+/, '').trim())
      tags = [...new Set([...tags, ...tagLines])] // deduplicate
    }

    // Extract technologies from special sections
    let technologies = metadata.technologies || []
    const techSection = body.match(/##\s+(?:Technologies|Tech|Stack)\s*\n([\s\S]*?)(?:\n##|\n\n|$)/)
    if (techSection) {
      const techLines = techSection[1]
        .split('\n')
        .filter((l) => l.trim())
        .map((l) => l.replace(/^[-*]\s+/, '').trim())
      technologies = [...new Set([...technologies, ...techLines])]
    }

    return {
      title,
      content: body,
      tags: tags.length > 0 ? tags : undefined,
      technologies: technologies.length > 0 ? technologies : undefined,
      project: metadata.project,
    }
  }

  /**
   * Batch import solutions from parsed markdown files
   * Returns summary of successes/failures
   */
  async importSolutions(
    files: Array<{ path: string; content: string }>,
    defaultProject?: string,
  ): Promise<ImportSummary> {
    this.logger.log(`Starting bulk import of ${files.length} files`)
    const results: ImportResult[] = []

    for (const file of files) {
      try {
        const parsed = this.parseMarkdown(file.content)

        if (!parsed.title) {
          results.push({
            file: file.path,
            success: false,
            error: 'No title found (add YAML title: or H1 heading)',
          })
          continue
        }

        const dto: PushKbDto = {
          title: parsed.title,
          content: parsed.content,
          tags: parsed.tags,
          technologies: parsed.technologies,
          project: parsed.project || defaultProject,
        }

        const pushResult = await this.kb.push(dto)
        results.push({
          file: file.path,
          success: true,
          solution_id: pushResult.id,
        })

        this.logger.debug(`Imported: ${parsed.title} [${pushResult.id}]`)
      } catch (err: any) {
        results.push({
          file: file.path,
          success: false,
          error: err.message,
        })
        this.logger.warn(`Failed to import ${file.path}: ${err.message}`)
      }
    }

    const successful = results.filter((r) => r.success).length
    const summary: ImportSummary = {
      total_files: files.length,
      successful,
      failed: files.length - successful,
      results,
    }

    this.logger.log(`Import complete: ${successful}/${files.length} successful`)
    return summary
  }

  /**
   * Extract metadata from Notion-exported markdown
   * Notion exports include metadata in header comments
   */
  parseNotionExport(content: string): ParsedMarkdown {
    let cleaned = content
      .replace(/^%% .+? %%/gm, '') // Remove Notion metadata comments
      .replace(/\n+/g, '\n') // Normalize newlines

    return this.parseMarkdown(cleaned)
  }

  /**
   * Extract metadata from Obsidian vault markdown
   * Obsidian files may have YAML frontmatter with tags as list
   */
  parseObsidianNote(content: string): ParsedMarkdown {
    let parsed = this.parseMarkdown(content)

    // Obsidian tags can be inline (#tag syntax) or in frontmatter
    const inlineTags = (content.match(/#[\w-]+/g) || [])
      .map((t) => t.replace('#', ''))
      .filter((t) => t.length > 0)

    if (inlineTags.length > 0) {
      parsed.tags = [...new Set([...(parsed.tags || []), ...inlineTags])]
    }

    return parsed
  }
}
