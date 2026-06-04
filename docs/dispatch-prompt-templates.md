# Dispatch Prompt Templates

`commands/*.md` and `prompt-templates/*.md` do different jobs.

## Command Docs

Command docs are the reference layer:

- purpose
- minimum read set
- preconditions
- redirects
- completion gate

They explain how the workflow should behave.

## Prompt Templates

Prompt templates are the execution layer:

- role
- required inputs
- gate checks
- blocking conditions
- blocked output branch
- success output branch
- critical rules

They tell an agent exactly how to execute a guarded command without freestyling.

## Blocked Output

Blocked output is a first-class result, not a note.

If a command is missing approval, evidence, or required input, the template should return a blocked branch and stop.

## How To Use

For guarded commands:

1. Read `.ai-harness/activation.md`
2. Read the matching runtime command file
3. Read the matching prompt template
4. Fill placeholders from local artifacts
5. Follow the blocked or success output format exactly
