export interface KbMetricsDto {
  overview: {
    total_solutions: number
    total_tags: number
    total_projects: number
    total_technologies: number
    average_tags_per_solution: number
    solutions_with_github_links: number
  }

  by_project: Array<{
    name: string
    count: number
    percentage: number
  }>

  top_tags: Array<{
    name: string
    count: number
    solutions: number
  }>

  top_technologies: Array<{
    name: string
    count: number
    solutions: number
  }>

  coverage: {
    solutions_with_code_examples: number
    solutions_with_tech_tags: number
    solutions_with_revisions: number
    average_revisions: number
    solutions_with_github_links: number
  }

  recent_activity: {
    created_last_7_days: number
    updated_last_7_days: number
    created_last_30_days: number
    updated_last_30_days: number
  }

  quality_metrics: {
    avg_solution_length: number
    avg_tags_per_solution: number
    solutions_with_multiple_tags: number
    solutions_with_single_tag: number
    solutions_without_tags: number
    graph_connectivity: {
      isolated_solutions: number
      connected_via_tags: number
      connected_via_relations: number
    }
  }
}
