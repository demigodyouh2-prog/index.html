import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DropFeed } from "@/components/drop-feed";
import {
  listVideos,
  myFollowedIds,
  myLikedIds,
  reportVideo,
  toggleFollow,
  toggleLike,
} from "@/lib/api";
import { REPORT_REASONS } from "@/lib/moderation";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/shorts")({
  validateSearch: (s: Record<string, unknown>) => ({
    start: typeof s.start === "string" ? s.start : undefined,
  }),
  loader: async () => listVideos({ data: { kind: "short" } }),
  component: ShortsPage,
});

function ShortsPage() {
  const videos = Route.useLoaderData();
  const { start } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [reportFor, setReportFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void myLikedIds()
      .then((ids) => setLiked(new Set(ids)))
      .catch(() => {});
    void myFollowedIds()
      .then((ids) => setFollowing(new Set(ids)))
      .catch(() => {});
  }, [user]);

  function needAuth() {
    if (isPending) return true;
    if (!user) {
      void navigate({ to: "/login" });
      return true;
    }
    return false;
  }

  return (
    <>
      <DropFeed
        videos={videos}
        startId={start}
        liked={liked}
        following={following}
        onLike={(id) => {
          if (needAuth()) return;
          setLiked((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
          void toggleLike({ data: id }).catch(() => toast.error("Could not like this."));
        }}
        onFollow={(creatorId) => {
          if (needAuth()) return;
          setFollowing((prev) => {
            const next = new Set(prev);
            if (next.has(creatorId)) next.delete(creatorId);
            else next.add(creatorId);
            return next;
          });
          void toggleFollow({ data: creatorId }).catch(() => toast.error("Could not follow."));
        }}
        onReport={(id) => {
          if (needAuth()) return;
          setReportFor(id);
        }}
      />
      {reportFor ? (
        <ReportSheet
          onClose={() => setReportFor(null)}
          onPick={(reason) => {
            void reportVideo({ data: { videoId: reportFor, reason } })
              .then((r) => {
                if (!r.guard.ok) toast.message("Bombom Guard took this down.");
                else toast.success("Report received. Guard reviewed it.");
              })
              .catch(() => toast.error("Report failed."))
              .finally(() => setReportFor(null));
          }}
        />
      ) : null}
    </>
  );
}

function ReportSheet({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (reason: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-bg/60 sm:place-items-center">
      <div className="w-full max-w-md rounded-t-xl border border-border bg-surface p-5 sm:rounded-xl">
        <h2 className="font-display text-lg font-semibold">Report this Drop</h2>
        <p className="mt-1 text-sm text-muted">
          Bombom Guard reviews every report. Child-safety reports take the video down immediately.
        </p>
        <div className="mt-4 flex flex-col gap-1">
          {REPORT_REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onPick(r.id)}
              className="h-11 rounded-md px-3 text-left text-sm hover:bg-raised"
            >
              {r.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} className="mt-3 h-10 w-full text-sm text-muted">
          Cancel
        </button>
      </div>
    </div>
  );
}
