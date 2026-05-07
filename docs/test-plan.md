# Skills Devkit - Comprehensive Test Plan

## Overview

This test plan covers all features of the Skills Devkit project, including skill management, knowledge base operations, project indexing, CLI tools, and installation workflows.

## Test Categories

### 1. Skill Management Tests

#### 1.1 List Skills
- **Test**: List all skills without template
- **Command**: `node dist/tools.js list-skills`
- **Expected**: Output shows all 92 skills with names
- **Test**: List skills with template included
- **Command**: `node dist/tools.js list-skills --include-template`
- **Expected**: Output includes template skill
- **Test**: List skills as JSON
- **Command**: `node dist/tools.js list-skills --json`
- **Expected**: JSON output with skill metadata

#### 1.2 Validate Skills
- **Test**: Validate all skills
- **Command**: `node dist/tools.js validate-skills`
- **Expected**: All 92 skills pass validation
- **Test**: Validate with template included
- **Command**: `node dist/tools.js validate-skills --include-template`
- **Expected**: Template skill also validated
- **Test**: Force validation failure
- **Precondition**: Modify a skill to have invalid name
- **Command**: `node dist/tools.js validate-skills`
- **Expected**: Error message with validation failures

#### 1.3 Audit Skill Structure
- **Test**: Audit all skills for canonical sections
- **Command**: `node dist/tools.js audit-skill-structure`
- **Expected**: All 92 skills show OK status
- **Test**: Audit with only incomplete skills
- **Command**: `node dist/tools.js audit-skill-structure --only-actionable`
- **Expected**: Only shows incomplete skills (should be 0)
- **Test**: Audit as JSON
- **Command**: `node dist/tools.js audit-skill-structure --json`
- **Expected**: JSON output with missing sections
- **Test**: Audit as Markdown
- **Command**: `node dist/tools.js audit-skill-structure --markdown`
- **Expected**: Markdown table output
- **Test**: Strict mode audit
- **Command**: `node dist/tools.js audit-skill-structure --strict`
- **Expected**: Exit code 2 if any incomplete skills

#### 1.4 Analyze Skills
- **Test**: Analyze all skills
- **Command**: `node dist/tools.js analyze-skills`
- **Expected**: Shows skill tiers (strong/consider/low)
- **Test**: Analyze with self-review
- **Command**: `node dist/tools.js analyze-skills --self-review`
- **Expected**: Includes self-review recommendations
- **Test**: Analyze as JSON
- **Command**: `node dist/tools.js analyze-skills --json`
- **Expected**: JSON output with analysis data
- **Test**: Analyze only actionable skills
- **Command**: `node dist/tools.js analyze-skills --only-actionable`
- **Expected**: Only shows skills needing improvement

### 2. Knowledge Base Tests

#### 2.1 Build Knowledge Base
- **Test**: Build KB from documents
- **Command**: `node dist/tools.js build-kb`
- **Expected**: Embeddings generated in knowledge-base/embeddings/
- **Test**: Build KB with custom config
- **Command**: `node dist/tools.js build-kb --config config.example.md`
- **Expected**: Uses custom configuration
- **Test**: Incremental build
- **Precondition**: KB already built
- **Command**: `node dist/tools.js build-kb`
- **Expected**: Only processes changed documents

#### 2.2 Query Knowledge Base
- **Test**: Single query
- **Command**: `node dist/tools.js query-kb "how to create a skill"`
- **Expected**: Returns relevant documents with scores
- **Test**: Query with custom index
- **Command**: `node dist/tools.js query-kb "test" --index custom/`
- **Expected**: Queries from custom index
- **Test**: Query with top-k limit
- **Command**: `node dist/tools.js query-kb "test" --top 5`
- **Expected**: Returns top 5 results
- **Test**: Query with threshold
- **Command**: `node dist/tools.js query-kb "test" --threshold 0.7`
- **Expected**: Only returns results above threshold
- **Test**: Query as JSON
- **Command**: `node dist/tools.js query-kb "test" --json`
- **Expected**: JSON output with results

#### 2.3 Batch Query Knowledge Base
- **Test**: Batch query from file
- **Precondition**: Create queries.json with test queries
- **Command**: `node dist/tools.js query-kb-batch queries.json`
- **Expected**: Processes all queries and outputs results
- **Test**: Batch query with output file
- **Command**: `node dist/tools.js query-kb-batch queries.json --output results.json`
- **Expected**: Results saved to output file

#### 2.4 Verify Knowledge Base
- **Test**: Verify KB integrity
- **Command**: `node dist/tools.js verify-kb`
- **Expected**: Checks embeddings exist and are valid
- **Test**: Verify with custom index
- **Command**: `node dist/tools.js verify-kb --index custom/`
- **Expected**: Verifies custom index

### 3. Project Indexing Tests

#### 3.1 Index Project
- **Test**: Index current project
- **Command**: `node dist/tools.js index-project --dir . --out .project-index`
- **Expected**: Creates index with documents and embeddings
- **Test**: Index external project
- **Precondition**: Clone test project
- **Command**: `node dist/tools.js index-project --dir /path/to/project --out index/`
- **Expected**: Successfully indexes external project
- **Test**: Index with custom chunk size
- **Command**: `node dist/tools.js index-project --dir . --out index/ --chunk-size 1000`
- **Expected**: Uses custom chunk size
- **Test**: Index with overlap
- **Command**: `node dist/tools.js index-project --dir . --out index/ --overlap 200`
- **Expected**: Uses custom overlap

#### 3.2 Generate Wiki
- **Test**: Generate wiki from index
- **Command**: `node dist/tools.js generate-wiki --docs .project-index/docs`
- **Expected**: Generates HTML wiki pages
- **Test**: Generate wiki with custom output
- **Command**: `node dist/tools.js generate-wiki --docs index/docs --out wiki/`
- **Expected**: Wiki generated in custom location
- **Test**: Watch mode
- **Command**: `node dist/tools.js generate-wiki --docs index/docs --watch`
- **Expected**: Watches for changes and regenerates
- **Test**: Open wiki in browser
- **Command**: `node dist/tools.js generate-wiki --docs index/docs --open`
- **Expected**: Opens wiki in browser

### 4. Routing Evaluation Tests

#### 4.1 Evaluate Skill Routing
- **Test**: Full routing evaluation
- **Command**: `node dist/tools.js eval-skill-routing`
- **Expected**: Evaluates routing cases and reports accuracy
- **Test**: Strict mode evaluation
- **Command**: `node dist/tools.js eval-skill-routing --strict`
- **Expected**: Fails if any routing failures
- **Test**: Evaluation with custom dataset
- **Command**: `node dist/tools.js eval-skill-routing --file custom-cases.json`
- **Expected**: Uses custom test cases
- **Test**: Evaluation as JSON
- **Command**: `node dist/tools.js eval-skill-routing --json`
- **Expected**: JSON output with detailed results
- **Test**: Evaluation as Markdown
- **Command**: `node dist/tools.js eval-skill-routing --markdown`
- **Expected**: Markdown table output

#### 4.2 Semantic Routing Fallback
- **Test**: Routing with semantic fallback
- **Precondition**: Skill embeddings pre-computed
- **Command**: `node dist/tools.js eval-skill-routing`
- **Expected**: Uses semantic fallback when keyword matching fails
- **Test**: Load pre-computed embeddings
- **Command**: `node dist/tools.js eval-skill-routing` (with embeddings cache)
- **Expected**: Loads embeddings from cache

### 5. Installation Tests

#### 5.1 Install Skill
- **Test**: Install skill to project
- **Command**: `node dist/tools.js install-skill --skill-dir skills/react-pro --project-dir /tmp/test-project`
- **Expected**: Skill installed in .cursor/skills/react-pro
- **Test**: Install with custom name
- **Command**: `node dist/tools.js install-skill --skill-dir skills/react-pro --project-dir /tmp/test-project --name my-react`
- **Expected**: Skill installed with custom name
- **Test**: Install to all IDEs
- **Command**: `node dist/tools.js install-skill --skill-dir skills/react-pro --project-dir /tmp/test-project --all-ides`
- **Expected**: Installed to cursor, claude, codex, antigravity
- **Test**: Install specific IDEs
- **Command**: `node dist/tools.js install-skill --skill-dir skills/react-pro --project-dir /tmp/test-project --ides cursor,claude`
- **Expected**: Installed only to specified IDEs
- **Test**: Copy mode installation
- **Command**: `node dist/tools.js install-skill --skill-dir skills/react-pro --project-dir /tmp/test-project --mode copy`
- **Expected**: Files copied instead of symlinked
- **Test**: Force reinstall
- **Command**: `node dist/tools.js install-skill --skill-dir skills/react-pro --project-dir /tmp/test-project --force`
- **Expected**: Overwrites existing installation

#### 5.2 Verify Bundle Install
- **Test**: Verify bundle installation
- **Command**: `node dist/tools.js verify-bundle-install --project-dir /tmp/test-project`
- **Expected**: Checks all skills are properly installed
- **Test**: Verify specific IDE
- **Command**: `node dist/tools.js verify-bundle-install --project-dir /tmp/test-project --ides cursor`
- **Expected**: Verifies only Cursor installation

### 6. Graph Operations Tests

#### 6.1 Query Graph
- **Test**: Query code graph
- **Command**: `node dist/tools.js query-graph "functionName"`
- **Expected**: Returns graph nodes and edges
- **Test**: Query with graph file
- **Command**: `node dist/tools.js query-graph "functionName" --graph .graph.json`
- **Expected**: Uses custom graph file
- **Test**: Query with limit
- **Command**: `node dist/tools.js query-graph "functionName" --limit 10`
- **Expected**: Returns limited results
- **Test**: Query as JSON
- **Command**: `node dist/tools.js query-graph "functionName" --json`
- **Expected**: JSON output

#### 6.2 Impact Analysis
- **Test**: Analyze impact of changes
- **Command**: `node dist/tools.js impact-analysis --changed-files src/lib/graph.ts`
- **Expected**: Shows affected functions and call sites
- **Test**: Impact analysis with depth
- **Command**: `node dist/tools.js impact-analysis --changed-files src/lib/graph.ts --depth 3`
- **Expected**: Shows impact up to 3 levels deep
- **Test**: Impact analysis as JSON
- **Command**: `node dist/tools.js impact-analysis --changed-files src/lib/graph.ts --json`
- **Expected**: JSON output with impact data

### 7. Gap Analysis Tests

#### 7.1 Generate Gap Analysis
- **Test**: Generate skill coverage gap analysis
- **Command**: `node dist/tools.js generate-gap-analysis`
- **Expected**: Shows gaps in skill coverage
- **Test**: Gap analysis with custom output
- **Command**: `node dist/tools.js generate-gap-analysis --output gaps.json`
- **Expected**: Results saved to output file
- **Test**: Gap analysis as JSON
- **Command**: `node dist/tools.js generate-gap-analysis --json`
- **Expected**: JSON output

### 8. Catalog Sync Tests

#### 8.1 Sync Catalogs
- **Test**: Sync skill catalogs
- **Command**: `node dist/tools.js sync-catalogs`
- **Expected**: Updates skill catalog files
- **Test**: Dry run sync
- **Command**: `node dist/tools.js sync-catalogs --dry-run`
- **Expected**: Shows what would be synced without changes
- **Test**: Write sync
- **Command**: `node dist/tools.js sync-catalogs --write`
- **Expected**: Writes catalog updates

### 9. Build Skill Index Tests

#### 9.1 Build Skill Index
- **Test**: Build skill search index
- **Command**: `node dist/tools.js build-skill-index`
- **Expected**: Creates skill_index.json
- **Test**: Build with custom output
- **Command**: `node dist/tools.js build-skill-index --output custom/`
- **Expected**: Index saved to custom location

### 10. Integration Tests

#### 10.1 End-to-End Skill Workflow
- **Test**: Create, validate, and install a skill
  1. Create new skill in skills/test-skill/SKILL.md
  2. Run `node dist/tools.js validate-skills`
  3. Run `node dist/tools.js audit-skill-structure`
  4. Run `node dist/tools.js install-skill --skill-dir skills/test-skill --project-dir /tmp/test`
- **Expected**: All steps succeed, skill installed correctly

#### 10.2 End-to-End KB Workflow
- **Test**: Add document, build KB, query
  1. Add document to knowledge-base/documents/test.md
  2. Run `node dist/tools.js build-kb`
  3. Run `node dist/tools.js query-kb "test query"`
- **Expected**: Document indexed and query returns relevant results

#### 10.3 End-to-End Project Index Workflow
- **Test**: Index project, generate wiki, query
  1. Run `node dist/tools.js index-project --dir . --out index/`
  2. Run `node dist/tools.js generate-wiki --docs index/docs`
  3. Run `node dist/tools.js query-kb "test" --index index/`
- **Expected**: Project indexed, wiki generated, queries work

#### 10.4 End-to-End Routing Evaluation
- **Test**: Modify skill triggers, evaluate routing
  1. Modify skill triggers in SKILL.md
  2. Run `node dist/tools.js eval-skill-routing --strict`
- **Expected**: Routing evaluation reflects trigger changes

### 11. Performance Tests

#### 11.1 KB Build Performance
- **Test**: Build KB with 1000 documents
- **Expected**: Completes within reasonable time (< 5 minutes)
- **Test**: Build KB with caching
- **Expected**: Second build is faster due to cache

#### 11.2 Query Performance
- **Test**: Query KB with 1000 documents
- **Command**: `node dist/tools.js query-kb "test"`
- **Expected**: Returns results within 1 second
- **Test**: Batch query 100 questions
- **Expected**: Completes within reasonable time

#### 11.3 Project Index Performance
- **Test**: Index large project (10k files)
- **Expected**: Completes within reasonable time
- **Test**: Graph build performance
- **Expected**: Graph build completes within reasonable time

### 12. Error Handling Tests

#### 12.1 Invalid Input
- **Test**: Query KB with empty query
- **Command**: `node dist/tools.js query-kb ""`
- **Expected**: Appropriate error message
- **Test**: Index non-existent directory
- **Command**: `node dist/tools.js index-project --dir /nonexistent`
- **Expected**: Error message about missing directory
- **Test**: Install skill with invalid path
- **Command**: `node dist/tools.js install-skill --skill-dir /nonexistent`
- **Expected**: Error message about missing skill

#### 12.2 Missing Dependencies
- **Test**: Query KB without embeddings
- **Precondition**: Remove embeddings directory
- **Command**: `node dist/tools.js query-kb "test"`
- **Expected**: Error message about missing embeddings
- **Test**: Build KB without documents
- **Precondition**: Empty documents directory
- **Command**: `node dist/tools.js build-kb`
- **Expected**: Handles empty documents gracefully

### 13. Security Tests

#### 13.1 Path Traversal
- **Test**: Attempt to access files outside project
- **Command**: `node dist/tools.js query-kb "../../../etc/passwd"`
- **Expected**: Path traversal prevented

#### 13.2 Code Injection
- **Test**: Attempt to inject code in skill metadata
- **Precondition**: Add malicious code to SKILL.md frontmatter
- **Command**: `node dist/tools.js validate-skills`
- **Expected**: Validation catches or sanitizes malicious content

#### 13.3 API Key Security
- **Test**: Verify API keys not logged
- **Command**: Run commands with API keys in config
- **Expected**: API keys not exposed in logs or output

### 14. Cross-Platform Tests

#### 14.1 Windows Compatibility
- **Test**: Run all commands on Windows
- **Expected**: All commands work correctly

#### 14.2 macOS Compatibility
- **Test**: Run all commands on macOS
- **Expected**: All commands work correctly

#### 14.3 Linux Compatibility
- **Test**: Run all commands on Linux
- **Expected**: All commands work correctly

## Test Execution Order

1. **Phase 1**: Unit Tests (Skill Management)
   - List, validate, audit, analyze skills

2. **Phase 2**: Knowledge Base Tests
   - Build, query, batch query, verify KB

3. **Phase 3**: Project Indexing Tests
   - Index project, generate wiki

4. **Phase 4**: Routing Tests
   - Evaluate routing, semantic fallback

5. **Phase 5**: Installation Tests
   - Install skill, verify installation

6. **Phase 6**: Graph Operations
   - Query graph, impact analysis

7. **Phase 7**: Integration Tests
   - End-to-end workflows

8. **Phase 8**: Performance Tests
   - KB build, query, index performance

9. **Phase 9**: Error Handling Tests
   - Invalid input, missing dependencies

10. **Phase 10**: Security Tests
    - Path traversal, code injection, API key security

## Success Criteria

- All 92 skills pass validation and structure audit
- KB builds and queries correctly
- Project indexing works on various codebases
- Routing evaluation accuracy > 90%
- Installation works across all IDEs
- All commands handle errors gracefully
- Performance meets specified thresholds
- Security tests pass
- Cross-platform compatibility verified

## Test Automation

Consider automating these tests using:
- Vitest for unit tests
- Playwright for end-to-end workflows
- Shell scripts for CLI command testing
- CI/CD integration for automated test runs
