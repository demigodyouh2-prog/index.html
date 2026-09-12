import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Clapperboard, Home, Plus, Search, Shield, UserRound } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { BanScreen } from "@/components/ban-screen";
import { BomWordmark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureMyProfile, getMyProfile, restoreMyAccount } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDrop = pathname.startsWith("/shorts");
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const mine = await ensureMyProfile({
          data: {
            displayName: user.displayName ?? user.primaryEmail ?? "Member",
            avatarUrl: user.profileImageUrl,
          },
        });
        if (!cancelled) setProfile(mine);
      } catch {
        try {
          const existing = await getMyProfile();
          if (!cancelled) setProfile(existing);
        } catch {
          if (!cancelled) setProfile(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (profile?.banned && !pathname.startsWith("/safety")) {
    return (
      <BanScreen
        profile={profile}
        restoring={restoring}
        onRestore={() => {
          setRestoring(true);
          void restoreMyAccount()
            .then((p) => setProfile(p))
            .finally(() => setRestoring(false));
        }}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-bg text-fg">
      {!isDrop ? (
        <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-3 sm:h-16 sm:px-5">
            <Link to="/" className="shrink-0">
              <BomWordmark />
            </Link>
            <SearchBox />
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <Button asChild variant="subtle" size="sm" className="hidden sm:inline-flex">
                <Link to="/upload">
                  <Plus className="size-4" />
                  Post
                </Link>
              </Button>
              <AuthSlot pending={isPending} />
            </div>
          </div>
        </header>
      ) : (
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 py-3">
          <Link to="/" className="pointer-events-auto">
            <BomWordmark compact />
          </Link>
          <Link
            to="/"
            className="pointer-events-auto rounded-full bg-bg/45 px-3 py-1.5 text-xs font-medium text-fg"
          >
            Close Drop
          </Link>
        </header>
      )}

      <div className="mx-auto flex max-w-[1440px]">
        {!isDrop ? (
          <nav className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-52 shrink-0 flex-col gap-1 self-start px-3 py-5 lg:flex">
            <NavLink to="/" icon={<Home className="size-4" />} active={pathname === "/"}>
              Home
            </NavLink>
            <NavLink
              to="/shorts"
              icon={<Clapperboard className="size-4" />}
              active={pathname.startsWith("/shorts")}
            >
              Drop
            </NavLink>
            <NavLink
              to="/upload"
              icon={<Plus className="size-4" />}
              active={pathname.startsWith("/upload")}
            >
              Post
            </NavLink>
            <NavLink
              to="/safety"
              icon={<Shield className="size-4" />}
              active={pathname.startsWith("/safety")}
            >
              Guard
            </NavLink>
            <NavLink to="/you" icon={<UserRound className="size-4" />} active={pathname.startsWith("/you")}>
              You
            </NavLink>
          </nav>
        ) : null}
        <div className={cn("min-w-0 flex-1", isDrop ? "" : "pb-20 lg:pb-8")}>{children}</div>
      </div>

      {!isDrop ? (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur-md lg:hidden">
          <div className="grid grid-cols-5 pb-[env(safe-area-inset-bottom)]">
            <Tab to="/" icon={<Home className="size-5" />} label="Home" active={pathname === "/"} />
            <Tab
              to="/shorts"
              icon={<Clapperboard className="size-5" />}
              label="Drop"
              active={pathname.startsWith("/shorts")}
            />
            <Tab
              to="/upload"
              icon={<Plus className="size-5" />}
              label="Post"
              active={pathname.startsWith("/upload")}
            />
            <Tab
              to="/safety"
              icon={<Shield className="size-5" />}
              label="Guard"
              active={pathname.startsWith("/safety")}
            />
            <Tab
              to="/you"
              icon={<UserRound className="size-5" />}
              label="You"
              active={pathname.startsWith("/you")}
            />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function SearchBox() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void navigate({ to: "/search", search: { q: q.trim() } });
  }
  return (
    <form onSubmit={onSubmit} className="mx-auto hidden min-w-0 flex-1 max-w-xl sm:block">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search bombom"
          className="h-10 rounded-full bg-raised pl-10"
        />
      </div>
    </form>
  );
}

function AuthSlot({ pending }: { pending: boolean }) {
  if (pending) return <Skeleton className="size-8 rounded-full" />;
  return (
    <>
      <SignedOut>
        <Button asChild size="sm" variant="outline">
          <Link to="/login">Sign in</Link>
        </Button>
      </SignedOut>
      <SignedIn>
        <div className="max-w-[42vw] truncate text-sm [&_button]:text-muted [&_span]:text-fg">
          <UserButton />
        </div>
      </SignedIn>
    </>
  );
}

function NavLink({
  to,
  icon,
  children,
  active,
  search,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
  active: boolean;
  search?: Record<string, string | undefined>;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
        active ? "bg-raised text-fg" : "text-muted hover:bg-raised hover:text-fg",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function Tab({
  to,
  icon,
  label,
  active,
  search,
}: {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  search?: Record<string, string | undefined>;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
        active ? "text-fg" : "text-subtle",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
