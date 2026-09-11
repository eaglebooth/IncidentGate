# Phase 02 — Frontend route composer

## Overview

- Date: 2026-09-11
- Priority: high
- Status: complete
- Replace two hard-coded profiles with a clear, constrained operation composer.

## Requirements

- Authority, scope, asset, and action selectors must only produce contract-approved routes.
- Explain internal scope versus real network scope in plain language.
- Show route count and audited authority/source identity.
- Preserve wallet, policy, intent, assessment, and execution workflow.
- Remain responsive and keyboard accessible.

## Related files

- Modify `G:/Genlayer/IncidentGate/app/page.tsx`
- Modify `G:/Genlayer/IncidentGate/app/globals.css`

## Implementation

1. Mirror the V7 catalog as typed UI data.
2. Derive dependent selector options from the selected authority.
3. Generate a stable default policy identifier from the route.
4. Update previews, proof copy, and mobile layout.
5. Confirm sticky navigation and existing reveal/marquee behavior remain balanced.

## Success criteria

- User cannot compose an unsupported tuple through the UI.
- Internal and network-bound actions are visually unambiguous.
- Lint and production build pass without warnings introduced by this phase.
