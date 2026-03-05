import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppShell from "../components/AppShell";
import { apiClient } from "../lib/api";
import { formatDate, formatPercent, titleCase } from "../lib/format";
import type { Analysis } from "../lib/schemas";

export default function DashboardPage(): JSX.Element {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.listAnalyses();
      setAnalyses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analyses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAnalyses();
  }, [loadAnalyses]);

  return (
    <AppShell
      title="Recent Analyses"
      subtitle="Track draft quality and probability flow from stage-1 screening to viral potential."
    >
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-ink/70">Newest first</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadAnalyses()}
            className="rounded-xl border border-ink/20 px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5"
          >
            Refresh
          </button>
          <Link
            to="/new"
            className="rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink/90"
          >
            Analyze New Draft
          </Link>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {isLoading ? (
        <p className="text-sm text-ink/70">Loading analyses...</p>
      ) : analyses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink/20 bg-paper/50 px-6 py-10 text-center">
          <p className="text-ink/80">No analyses yet.</p>
          <Link to="/new" className="mt-3 inline-block font-semibold text-sky hover:underline">
            Create your first analysis
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink/10">
          <table className="min-w-full divide-y divide-ink/10 text-sm">
            <thead className="bg-paper/70">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-ink/70">Created</th>
                <th className="px-4 py-3 text-left font-semibold text-ink/70">Platform</th>
                <th className="px-4 py-3 text-left font-semibold text-ink/70">Score</th>
                <th className="px-4 py-3 text-left font-semibold text-ink/70">Viral Prob</th>
                <th className="px-4 py-3 text-left font-semibold text-ink/70">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 bg-white/70">
              {analyses.map((analysis) => (
                <tr key={analysis.id} className="hover:bg-white">
                  <td className="px-4 py-3 text-ink/80">{formatDate(analysis.created_at)}</td>
                  <td className="px-4 py-3">{titleCase(analysis.platform)}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{analysis.predicted_score.toFixed(1)} / 10</td>
                  <td className="px-4 py-3">{formatPercent(analysis.viral_prob)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/analyses/${analysis.id}`} className="font-semibold text-sky hover:underline">
                      View detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
