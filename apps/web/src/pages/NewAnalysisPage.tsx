import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import AppShell from "../components/AppShell";
import { apiClient } from "../lib/api";
import type { Platform } from "../lib/schemas";

const platformOptions: Platform[] = ["tiktok", "instagram", "youtube"];

export default function NewAnalysisPage(): JSX.Element {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [caption, setCaption] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await apiClient.createAnalysis({
        platform,
        caption,
        transcript: transcript.trim() ? transcript : null,
      });
      navigate(`/analyses/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create analysis");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell
      title="Analyze Draft"
      subtitle="Submit caption and optional transcript to estimate stage pass rates and get rewrite suggestions."
    >
      <form onSubmit={(event) => void onSubmit(event)} className="space-y-5">
        {error ? (
          <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div>
          <label htmlFor="platform" className="mb-2 block text-sm font-semibold text-ink">
            Platform
          </label>
          <select
            id="platform"
            value={platform}
            onChange={(event) => setPlatform(event.target.value as Platform)}
            className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm text-ink focus:border-sky focus:outline-none"
          >
            {platformOptions.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="caption" className="mb-2 block text-sm font-semibold text-ink">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            required
            rows={5}
            maxLength={2200}
            className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm text-ink focus:border-sky focus:outline-none"
            placeholder="Paste your draft caption"
          />
          <p className="mt-1 text-xs text-ink/60">{caption.length} / 2200</p>
        </div>

        <div>
          <label htmlFor="transcript" className="mb-2 block text-sm font-semibold text-ink">
            Transcript (optional)
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            rows={8}
            maxLength={20000}
            className="w-full rounded-xl border border-ink/20 bg-white px-4 py-3 text-sm text-ink focus:border-sky focus:outline-none"
            placeholder="Paste spoken transcript if available"
          />
          <p className="mt-1 text-xs text-ink/60">{transcript.length} / 20000</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || caption.trim().length === 0}
          className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Analyzing..." : "Run Analysis"}
        </button>
      </form>
    </AppShell>
  );
}
