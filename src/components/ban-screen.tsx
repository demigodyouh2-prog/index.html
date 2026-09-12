import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

export function BanScreen({
  profile,
  restoring,
  onRestore,
}: {
  profile: Profile;
  restoring: boolean;
  onRestore: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-bg px-5 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-soft sm:p-8">
        <div className="mb-5 grid size-12 place-items-center rounded-md bg-danger/15 text-danger">
          <ShieldAlert className="size-6" />
        </div>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-danger">Bombom Guard</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg">
          This account is banned
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {profile.banReason ||
            "Bombom Guard removed your content for a policy violation and locked the account."}
        </p>
        {profile.banCategory ? (
          <p className="mt-4 rounded-md border border-border bg-raised px-3 py-2 text-xs text-subtle">
            Category · {profile.banCategory}
          </p>
        ) : null}
        <p className="mt-5 text-sm leading-relaxed text-subtle">
          Sexual content, graphic violence, hate, self-harm, and illegal activity are removed on
          sight. If this was a test of Guard, you can restore access once.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onRestore} disabled={restoring} variant="outline">
            {restoring ? "Restoring…" : "Restore account"}
          </Button>
          <Button asChild variant="ghost">
            <a href="/safety">Read the standards</a>
          </Button>
        </div>
      </div>
    </main>
  );
}
