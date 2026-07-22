import { useState } from 'react';
import {
  Alert, AlertDescription, AlertTitle, Badge, Button, Check, Section, Source, Textarea,
} from '../components/ui';
import { catalog, evalsByClaim } from '../data';
import { judgeSource, UNAVAILABLE_NOTE, type ApiResponse, type JudgeResult } from '../api';

// Piqueray, not the retired demo: `Stack` never existed here and the Button's
// enum is default/orange/blanc/outlineBlanc/link/outilneNoir — `secondary` was
// a demo variant. A starter that cites absent components teaches the wrong API.
const JUDGE_STARTER = `import { Button } from 'ds-contracts-poc';

export function Snippet() {
  return (
    <div>
      <Button variant="link">En savoir plus</Button>
      <Button variant="orange">Contactez-nous</Button>
    </div>
  );
}
`;

function JudgePlayground() {
  const [source, setSource] = useState(JUDGE_STARTER);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ApiResponse<JudgeResult> | null>(null);

  const run = async () => {
    setBusy(true);
    setResult(await judgeSource(source));
    setBusy(false);
  };

  const report = result?.status === 'ok' ? result.data.report.reports[0] : null;

  return (
    <div className="max-w-3xl space-y-3">
      <Textarea
        aria-label="Screen source to judge"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="min-h-44"
      />
      <Button onClick={run} disabled={busy}>
        {busy ? 'Judging…' : 'Judge this screen'}
      </Button>
      {result?.status === 'unavailable' ? (
        <p className="text-muted-foreground text-sm">{UNAVAILABLE_NOTE}</p>
      ) : null}
      {report ? (
        <Alert variant={report.adherent ? 'success' : 'destructive'}>
          <AlertTitle>
            Score {report.score} — {report.violations.length} violation(s) across {report.checks} checks
          </AlertTitle>
          <AlertDescription>
            {report.violations.length === 0 ? (
              'Fully adherent: every element from the catalog, all values legal, tokens only.'
            ) : (
              <ul className="mt-1 space-y-1">
                {report.violations.map((v, i) => (
                  <li key={i} className="font-mono text-xs">
                    [{v.rule}] {v.detail}
                  </li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      ) : null}
      <p className="text-muted-foreground text-xs">
        This is the same deterministic judge that scored the A/B eval — it runs live in the repo against whatever you
        paste. Try <code>variant="huge"</code> or a hex color to watch it object.
      </p>
    </div>
  );
}

export function Governance() {
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Governance</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl text-sm">
          The org rules ship inside the catalog, so every consumer — human or agent — reads the same constitution.
          Deterministic rules are enforced by the judge; the rest guide the agent.
        </p>
      </div>

      <Section
        title={`Org rules · ${catalog.rules.length}`}
        lead="Each rule is either mechanically checkable (enforced by the judge) or advisory (guides the agent)."
      >
        <div className="grid max-w-4xl grid-cols-1 gap-2">
          {catalog.rules.map((rule) => (
            <div key={rule.id} className="bg-card flex flex-wrap items-start justify-between gap-2 rounded-lg border px-4 py-3">
              <div className="min-w-0">
                <code className="text-xs">{rule.id}</code>
                <p className="mt-1 text-sm">{rule.statement}</p>
              </div>
              <Badge variant={rule.enforcement === 'judge' ? 'success' : 'secondary'}>
                {rule.enforcement === 'judge' ? 'deterministic' : 'guidance'}
              </Badge>
            </div>
          ))}
        </div>
        <Source path="catalog/catalog.json (compiled from context/rules.json)" />
      </Section>

      <Section
        title="Judge playground"
        lead="Paste any screen and get the deterministic verdict — the catalog is the spec, so adherence is checked, not opined."
      >
        <JudgePlayground />
      </Section>

      {/* ARCHIVED 2026-07-22 — the per-screen adherence table lived here. It
          scored five screens generated against the retired 51-component demo
          catalog; none of it describes Piqueray. Kept on disk under
          evals/adherence/, explained in evals/adherence/ARCHIVE.md. */}

      <Section
        title="Deterministic eval suite"
        lead="The PoC's falsifiable claims, each backed by evals that run the real pipeline in a scratch copy — not mocks."
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[...evalsByClaim().entries()].map(([claim, results]) => (
            <div key={claim} className="bg-card rounded-lg border px-4 py-3">
              <p className="text-xs font-medium tracking-widest uppercase">{claim}</p>
              <ul className="mt-2 space-y-1">
                {results.map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-xs">
                    <Check ok={r.pass} /> <code>{r.id}</code>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Source path="evals/results.json" />
      </Section>
    </>
  );
}
