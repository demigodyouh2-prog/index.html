import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { listModeration } from "@/lib/api";
import { timeAgo } from "@/lib/utils";

export const Route = createFileRoute("/safety")({
  loader: () => listModeration(),
  component: SafetyPage,
});

const RULES = [
  {
    title: "No sexual content",
    body: "Nudity, pornography, fetish content, and sexualization of anyone are banned. Suggestive titles are enough.",
  },
  {
    title: "No graphic violence",
    body: "Gore, real harm, torture, and glorified weapons are taken down. Fictional film violence in credited cinema may stay if it is not the point of the upload.",
  },
  {
    title: "No hate or harassment",
    body: "Attacks on people or groups, slurs, doxxing, and threats ban the account on the first strike.",
  },
  {
    title: "No self-harm",
    body: "Instructions, encouragement, or graphic depiction of suicide or self-injury are removed immediately.",
  },
  {
    title: "No child endangerment",
    body: "Any sexual or exploitative content involving minors is a permanent ban. Reports in this category take the video down on sight.",
  },
  {
    title: "No scams or crime",
    body: "Fraud, drug sales, weapons trafficking, and how-to crime do not get a warning.",
  },
];

function SafetyPage() {
  const events = Route.useLoaderData();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-raised">
          <Shield className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Bombom Guard</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Standards</h1>
        </div>
      </div>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
        Guard scans every title, description, tag, thumbnail, and comment before it is public. A
        violation takes the video down and bans the account. There is no strike theatre for severe
        harm.
      </p>

      <ol className="mt-8 space-y-4">
        {RULES.map((r, i) => (
          <li key={r.title} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs tabular-nums text-subtle">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-1 font-display text-base font-semibold">{r.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{r.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold">Recent enforcement</h2>
        <p className="mt-1 text-sm text-subtle">Public log. Account names are not shown.</p>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          {events.map((e) => (
            <li key={e.id} className="px-4 py-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-medium capitalize">
                  {e.action} · {e.category}
                </p>
                <p className="text-xs text-subtle tabular-nums">{timeAgo(e.createdAt)}</p>
              </div>
              <p className="mt-1 text-sm text-muted">{e.details}</p>
            </li>
          ))}
          {!events.length ? (
            <li className="px-4 py-6 text-sm text-subtle">No events yet.</li>
          ) : null}
        </ul>
      </section>
    </main>
  );
}
