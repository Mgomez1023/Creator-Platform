type MetricCardProps = {
  label: string;
  value: string;
  tone?: "default" | "highlight";
};

export default function MetricCard({ label, value, tone = "default" }: MetricCardProps): JSX.Element {
  const classes =
    tone === "highlight"
      ? "border-accent/50 bg-accent/10"
      : "border-ink/10 bg-paper/60";

  return (
    <article className={`rounded-2xl border p-4 ${classes}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </article>
  );
}
