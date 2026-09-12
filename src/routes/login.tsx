import { createFileRoute, Link } from "@tanstack/react-router";
import { BomMark } from "@/components/logo";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <BomMark className="size-12" />
        <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight lowercase">Sign in to bombom</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Posting, likes, comments, and reports need an account. Watching is open. Bombom Guard
          scans every upload.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="h-12 w-full rounded-md border border-border bg-surface text-sm font-medium text-fg transition-colors duration-150 hover:bg-raised"
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-subtle">Sign-in is disabled.</p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-subtle">
          By continuing you agree to Bombom Guard.{" "}
          <Link to="/safety" className="underline underline-offset-4">
            Read the standards
          </Link>
        </p>
      </div>
    </main>
  );
}
