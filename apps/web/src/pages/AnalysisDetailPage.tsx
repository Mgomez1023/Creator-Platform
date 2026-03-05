import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AppShell from "../components/AppShell";
import MetricCard from "../components/MetricCard";
import { apiClient } from "../lib/api";
import { formatPercent, titleCase } from "../lib/format";
import type { Analysis } from "../lib/schemas";

export default function AnalysisDetailPage(): JSX.Element {
  const params = useParams();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      setError("Invalid analysis id");
      setIsLoading(false);
      return;
    }

    const load = async (): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.getAnalysis(id);
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analysis detail");
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [params.id]);

  if (isLoading) {
    return (
      <AppShell title="Analysis Detail">
        <p className="text-sm text-ink/70">Loading analysis...</p>
      </AppShell>
    );
  }

  if (error || !analysis) {
    return (
      <AppShell title="Analysis Detail">
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "Analysis not found"}
        </div>
        <Link to="/" className="mt-4 inline-block text-sm font-semibold text-sky hover:underline">
          Back to dashboard
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Analysis #${analysis.id}`}
      subtitle={`${titleCase(analysis.platform)} draft diagnostic and recommendation output`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Predicted Score" value={`${analysis.predicted_score.toFixed(1)} / 10`} tone="highlight" />
        <MetricCard label="Stage 1 Pass" value={formatPercent(analysis.stage1_pass_prob)} />
        <MetricCard label="Stage 2 Pass" value={formatPercent(analysis.stage2_pass_prob)} />
        <MetricCard label="Viral Prob" value={formatPercent(analysis.viral_prob)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-ink/10 bg-white p-4">
          <h2 className="text-lg font-bold text-ink">Top Recommendations</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/85">
            {analysis.top_recommendations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-ink/10 bg-white p-4">
          <h2 className="text-lg font-bold text-ink">Why This Score</h2>
          <p className="mt-3 text-sm leading-6 text-ink/85">{analysis.why_this_score}</p>
        </article>

        <article className="rounded-2xl border border-ink/10 bg-white p-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-ink">Rewritten Caption</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/90">{analysis.rewritten_caption}</p>
        </article>

        <article className="rounded-2xl border border-ink/10 bg-white p-4 lg:col-span-2">
          <h2 className="text-lg font-bold text-ink">Hook Options</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {analysis.hook_options.map((hook) => (
              <div key={hook} className="rounded-xl border border-mint/30 bg-mint/10 p-3 text-sm text-ink">
                {hook}
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <Link to="/" className="rounded-xl border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/5">
          Back to Dashboard
        </Link>
        <Link to="/new" className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90">
          Analyze Another Draft
        </Link>
      </div>
    </AppShell>
  );
}
