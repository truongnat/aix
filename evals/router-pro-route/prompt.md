---
schema_version: "1.1"
name: router-pro-route
description: Broad ambiguous request should route via router-pro to domain skills
tags: [spine, routing]
runs: 2
max_turns: 10
allowed_tools: [Skill, Read, Glob, Grep]
expected_outcome: Skill router-pro is invoked to analyze and route the request
---
I want to improve the checkout flow of our app — it's slow and users drop off,
but I'm not sure whether it's a performance problem or a UX problem. Figure out
where to start.
