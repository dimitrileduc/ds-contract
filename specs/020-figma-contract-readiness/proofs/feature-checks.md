# Contrôles automatisés ciblés — 2026-08-09

Passés dans le worktree :

```bash
npx tsc --noEmit
npx tsx evals/fixtures/figma-readiness/foundation-check.ts
npx tsx evals/fixtures/figma-readiness/timeline-check.ts
npx tsx evals/fixtures/figma-readiness/candidate-ranking-check.ts
npx tsx evals/fixtures/figma-readiness/owner-gate-check.ts
npx tsx evals/fixtures/figma-readiness/owner-gate-refusal-check.ts
npx tsx evals/fixtures/figma-readiness/findings-check.ts
npx tsx evals/fixtures/figma-readiness/impact-graph-check.ts
npx tsx evals/fixtures/figma-readiness/routing-refusal-check.ts
npx tsx evals/fixtures/figma-readiness/consolidation-check.ts
npx tsx evals/fixtures/figma-readiness/end-to-end-check.ts
npm run audit:readiness -- --campaign specs/020-figma-contract-readiness/registry/campaign.json --check
git diff --check
```

Tous ces contrôles ont réussi. `npm run eval` a été démarré mais non conservé jusqu’au résultat :
le harness réinitialise un scratch complet pour chaque cas et recopie les artefacts visuels lourds.
Il reste donc une porte de clôture ouverte dans `tasks.md` (T050), sans faux rapport vert.
