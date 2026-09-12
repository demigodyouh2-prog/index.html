import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flag, Heart, ShieldOff } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Player } from "@/components/player";
import { SourceChip } from "@/components/media-embed";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addComment,
  getVideo,
  incrementView,
  listComments,
  listVideos,
  myFollowedIds,
  myLikedIds,
  reportVideo,
  toggleFollow,
  toggleLike,
} from "@/lib/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { REPORT_REASONS } from "@/lib/moderation";
import { compactNumber, timeAgo } from "@/lib/utils";
import type { CommentItem } from "@/lib/types";

export const Route = createFileRoute("/watch/$videoId")({
  loader: async ({ params }) => {
    const [video, comments, related] = await Promise.all([
      getVideo({ data: params.videoId }),
      listComments({ data: params.videoId }),
      listVideos({ data: { kind: "long" } }),
    ]);
    return {
      video,
      comments,
      related: related.filter((v) => v.id !== params.videoId).slice(0, 8),
    };
  },
  component: WatchPage,
});

function WatchPage() {
  const { video, comments: initialComments, related } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video?.likeCount ?? 0);
  const [following, setFollowing] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [body, setBody] = useState("");
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!video || video.status !== "published") return;
    void incrementView({ data: video.id });
  }, [video]);

  useEffect(() => {
    if (!user || !video) return;
    void myLikedIds()
      .then((ids) => setLiked(ids.includes(video.id)))
      .catch(() => {});
    void myFollowedIds()
      .then((ids) => setFollowing(ids.includes(video.userId)))
      .catch(() => {});
  }, [user, video]);

  function needAuth() {
    if (isPending) return true;
    if (!user) {
      void navigate({ to: "/login" });
      return true;
    }
    return false;
  }

  if (!video) {
    return (
      <main className="px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">This video is gone</h1>
        <p className="mt-2 text-sm text-muted">It may have been removed by Bombom Guard.</p>
        <Button asChild className="mt-6">
          <Link to="/">Back to bombom</Link>
        </Button>
      </main>
    );
  }

  if (video.status === "taken_down") {
    return (
      <main className="mx-auto max-w-xl px-5 py-20">
        <div className="rounded-xl border border-border bg-surface p-6">
          <ShieldOff className="size-8 text-danger" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Removed by Bombom Guard</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {video.takedownReason || "This video violated bombom standards and was taken down."}
          </p>
          {video.takedownCategory ? (
            <p className="mt-4 text-xs uppercase tracking-wide text-subtle">{video.takedownCategory}</p>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="px-3 py-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
      <div>
        <Player src={video.srcUrl} poster={video.posterUrl} autoPlay />
        <div className="mt-4 flex items-start justify-between gap-3">
          <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{video.title}</h1>
          <SourceChip src={video.srcUrl} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to="/c/$handle" params={{ handle: video.handle }} className="flex items-center gap-3">
            {video.avatarUrl ? (
              <img src={video.avatarUrl} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              <span className="grid size-10 place-items-center rounded-full bg-raised text-sm">
                {video.displayName.charAt(0)}
              </span>
            )}
            <div>
              <p className="text-sm font-medium">{video.displayName}</p>
              <p className="text-xs text-subtle">@{video.handle}</p>
            </div>
          </Link>
          <Button
            size="sm"
            variant={following ? "outline" : "default"}
            onClick={() => {
              if (needAuth()) return;
              setFollowing((v) => !v);
              void toggleFollow({ data: video.userId }).catch(() => toast.error("Could not follow."));
            }}
          >
            {following ? "Following" : "Follow"}
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant={liked ? "subtle" : "outline"}
              onClick={() => {
                if (needAuth()) return;
                setLiked((v) => !v);
                setLikeCount((c) => c + (liked ? -1 : 1));
                void toggleLike({ data: video.id }).catch(() => toast.error("Could not like."));
              }}
            >
              <Heart className={liked ? "size-4 fill-danger text-danger" : "size-4"} />
              <span className="tabular-nums">{compactNumber(likeCount)}</span>
            </Button>
            <Button size="icon" variant="outline" onClick={() => (needAuth() ? null : setReportOpen(true))}>
              <Flag className="size-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-raised px-4 py-3 text-sm leading-relaxed text-muted">
          <p className="text-xs text-subtle tabular-nums">
            {compactNumber(video.viewCount)} views · {timeAgo(video.createdAt)}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-fg">{video.description}</p>
        </div>

        <section className="mt-8">
          <h2 className="font-display text-base font-semibold">
            Comments
            <span className="ml-2 text-sm font-normal text-subtle tabular-nums">{comments.length}</span>
          </h2>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (needAuth()) return;
              const text = body.trim();
              if (!text) return;
              setBody("");
              void addComment({ data: { videoId: video.id, body: text } }).then((res) => {
                if (!res.guard.ok) {
                  toast.error(res.guard.reason);
                  window.location.reload();
                  return;
                }
                if (res.comment) setComments((c) => [res.comment!, ...c]);
              });
            }}
          >
            <Input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment"
              maxLength={500}
            />
            <Button type="submit" size="sm">
              Post
            </Button>
          </form>
          <ul className="mt-5 space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
                ) : (
                  <span className="grid size-8 place-items-center rounded-full bg-raised text-xs">
                    {c.displayName.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="text-xs text-subtle">
                    @{c.handle} · {timeAgo(c.createdAt)}
                  </p>
                  <p className="mt-0.5 text-sm">{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="mt-10 space-y-5 lg:mt-0">
        <h2 className="font-display text-sm font-semibold text-muted">Up next</h2>
        {related.map((v) => (
          <VideoCard key={v.id} video={v} compact />
        ))}
      </aside>

      {reportOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-bg/60 sm:place-items-center">
          <div className="w-full max-w-md rounded-t-xl border border-border bg-surface p-5 sm:rounded-xl">
            <h2 className="font-display text-lg font-semibold">Report this video</h2>
            <div className="mt-4 flex flex-col gap-1">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="h-11 rounded-md px-3 text-left text-sm hover:bg-raised"
                  onClick={() => {
                    void reportVideo({ data: { videoId: video.id, reason: r.id } }).then((res) => {
                      if (!res.guard.ok) toast.message("Bombom Guard took this down.");
                      else toast.success("Report received.");
                      setReportOpen(false);
                    });
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button type="button" className="mt-3 h-10 w-full text-sm text-muted" onClick={() => setReportOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
