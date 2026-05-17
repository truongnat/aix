import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { GithubService } from './github.service'

describe('GithubService', () => {
  let service: GithubService
  let mockConfigService: any

  beforeEach(async () => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'GITHUB_TOKEN') return 'mock-token'
        return null
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<GithubService>(GithubService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('parseGithubRef', () => {
    it('should parse GitHub issue URL', async () => {
      const result = await service.resolveIssue('https://github.com/owner/repo/issues/123')
      expect(result.repo).toBe('owner/repo')
      expect(result.number).toBe(123)
    })

    it('should parse short GitHub reference', async () => {
      const result = await service.resolveIssue('owner/repo#456')
      expect(result.repo).toBe('owner/repo')
      expect(result.number).toBe(456)
    })

    it('should throw on invalid reference', async () => {
      await expect(service.resolveIssue('invalid-ref')).rejects.toThrow()
    })
  })

  describe('createIssueLinkQuery', () => {
    it('should generate valid Cypher query', async () => {
      const issues = [
        { repo: 'owner/repo', number: 123, url: 'https://github.com/owner/repo/issues/123', title: 'Fix bug' },
      ]
      const { cypher, params } = await service.createIssueLinkQuery('solution-id', issues)
      expect(cypher).toContain('MERGE (gh:GitHubIssue')
      expect(cypher).toContain(':SOLVES')
      expect(params.solutionId).toBe('solution-id')
      expect(params.issues).toHaveLength(1)
    })
  })
})
