# Artificial Thought Project Context

Last updated: 2026-05-31

This file is the durable narrative context for Artificial Thought. It is meant to capture why the project exists, what Andrew wants it to become, where the work is hosted, and the non-secret project history that future agent sessions should recover before making changes.

Detailed requirements, implementation plans, and work orders should live in Software Factory. This document should stay higher-level: project intent, product direction, operational context, and lessons learned.

## Project Summary

Artificial Thought is a multi-agent writing system where frontier AI models write essays and respond to each other's thoughts. Andrew built it more than a year before this revival effort and still likes the core idea.

The project is currently being restarted with a more mature engineering approach: agentic programming, tests, Software Factory-backed requirements and blueprints, and a substantial overhaul before putting it back online.

## Historical Context

- Andrew originally built this project mostly with Cursor, before AI agents and composer-style workflows were part of his normal development loop.
- The original development style was comparatively manual and file-by-file. Andrew sees that phase as less mature than his current engineering practice.
- The project was personally meaningful enough that Andrew wants to revive and improve it rather than discard it.
- The original README described the core concept as: "a multi-agent system where frontier models write essays and respond to eachothers thoughts."

## Outage And Motivation For Revival

- The deployed service was hosted on Hetzner.
- It went down after a recent Next.js security vulnerability affected Andrew's hosting/deployment of this project.
- Before bringing it back online, Andrew wants to improve the project substantially instead of simply restoring the old deployment.
- Known technical fact from the current repo: the project is pinned to `next@15.0.4`, which should be reviewed during the security and dependency upgrade work.

Open questions to fill in later:

- Which specific Next.js vulnerability or advisory caused the shutdown?
- Which Hetzner host, domain, and deployment path were used?
- What production data or Supabase state, if any, needs to be preserved or migrated?
- What uptime, backup, and deployment expectations should the revived project meet?

## Current Hosting And Operations Notes

- Historical hosting provider: Hetzner.
- Current operational status: not operational.
- Current local checkout: `/Users/andrewmelbourne/devroot/artificial-thought`.
- Current default branch: `main`.
- Secrets and provider keys should not be recorded here. If operational details are sensitive, document only the system shape and where the secret is managed.

## Collaboration Direction

Andrew wants this overhaul to be tracked and recoverable across future sessions. Important context to preserve here includes:

- Why Andrew made the project and why it matters.
- Product direction, taste, and philosophical framing.
- High-level architecture choices and tradeoffs.
- Hosting and operational lessons.
- Decisions about what the revived project should or should not become.

Details that should generally go elsewhere:

- Fine-grained implementation tasks: Software Factory work orders.
- Formal technical designs: Software Factory blueprints.
- Test plans tied to specific code changes: PRs, work orders, or repo docs when useful.
- Secrets, tokens, private infrastructure details, and sensitive production data: never commit here.

## Software Factory

The Software Factory project for this work is connected through MCP as:

- MCP server name: `software-factory-artificial-thou`
- Intended use: requirements, blueprints, work orders, and implementation tracking.

The first repository change in the revival was adding the 8090 Software Factory agent skill so agents can work against that project consistently.

## Running Project Notes

### 2026-05-31 - Revival Kickoff

Andrew asked to check out `Melbourneandrew/artificial-thought` into `/Users/andrewmelbourne/devroot/artificial-thought`, add the 8090 Software Factory agent skill, verify the Software Factory MCP connection, and push the first change.

Initial setup completed:

- Repository checked out locally.
- Software Factory agent skill added under `.agents/skills/software-factory`.
- First setup commit pushed to `main`.
- Software Factory MCP connection verified from Codex CLI with `whoami`.

Andrew then asked for repo-local project files to capture the work context, historical background, outage reason, hosting notes, and future direction. This document and `AGENTS.md` were created for that purpose.
