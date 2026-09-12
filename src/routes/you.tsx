import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video-card";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMyProfile, listMyVideos } from "@/lib/api";
import type { Profile, VideoItem } from "@/lib/types";

export const Route = createFileRoute("/you")({ component: YouPage });

function YouPage() {
  const { user, isPending } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (!user) return;
    void getMyProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
    void listMyVideos()
      .then(setVideos)
      .catch(() => setVideos([]));
  }, [user]);

  if (isPending) return <div className="px-5 py-16 text-sm text-muted">Loading…</div>;
  if (!user) return <RedirectToSignIn />;

  const live = videos.filter((v) => v.status === "published");
  const down = videos.filter((v) => v.status === "taken_down");

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Studio</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {profile?.displayName ?? user.displayName ?? "You"}
          </h1>
          {profile ? (
            <p className="mt-1 text-sm text-muted">
              @{profile.handle} · {profile.strikeCount} Guard strikes
            </p>
          ) : null}
        </div>
        <Button asChild>
          <Link to="/upload">Post</Link>
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Your videos</h2>
        {live.length ? (
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {live.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-subtle">Nothing published yet.</p>
        )}
      </section>

      {down.length ? (
        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold">Taken down</h2>
          <ul className="mt-3 space-y-2">
            {down.map((v) => (
              <li key={v.id} className="rounded-md border border-border bg-surface px-4 py-3">
                <p className="text-sm font-medium">{v.title}</p>
                <p className="text-xs text-danger">{v.takedownReason}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
