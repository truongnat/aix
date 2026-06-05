# README And Landing Refresh Design

## Goal

Refresh the repository README and GitHub Pages landing page so the project feels professional, open-source-first, beautiful, and easy to use, while integrating the `AI_Engineering_Harness.mp4` walkthrough.

## Direction

- Open-source homepage tone, not SaaS-heavy marketing.
- Faster explanation of what the harness is and why it exists.
- Prominent quickstart and trust signals near the top.
- Mid-page walkthrough section that embeds the local MP4 on the landing page.
- README demo section that prominently links to the MP4 and explains GitHub README rendering limits honestly.

## README Changes

- Tighten the opening summary and section ordering.
- Add a `Watch the walkthrough` section near the top.
- Link directly to `AI_Engineering_Harness.mp4`.
- Add a short note that the full embedded player lives on the landing page.
- Keep the rest of the README documentation-oriented and easy to scan.

## Landing Page Changes

- Adjust the hero to feel more open-source and practical.
- Make onboarding more obvious with stronger quickstart cues.
- Add a new mid-page `Product walkthrough` section with an HTML5 video player.
- Keep existing section architecture, but improve story flow from value -> workflow -> demo -> install.
- Preserve the existing visual system, but reduce scattered messaging and strengthen hierarchy.

## Constraints

- Do not overstate provider support.
- Keep provider messaging honest and aligned with the README.
- Use the existing `site/` React + Vite structure.
- Avoid a broad rewrite of every section unless needed for coherence.

## Verification

- Add a regression test that checks for the new README walkthrough section and the landing-page video section wiring.
- Run the new regression test.
- Run root `npm test`.
- Run `npm run build` in `site/`.
