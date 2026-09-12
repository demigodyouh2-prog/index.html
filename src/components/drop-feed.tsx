import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  Flag,
  Heart,
  MessageCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { compactNumber } from "@/lib/utils";
import { isEmbedSrc } from "@/lib/media";
import { useResolvedSrc } from "@/lib/local-media";
import { MediaEmbed, SourceChip } from "@/components/media-embed";
import type { VideoItem } from "@/lib/types";

export function DropFeed({
  videos,
  startId,
  liked,
  following,
  onLike,
  onFollow,
  onReport,
}: {
  videos: VideoItem[];
  startId?: string;
  liked: Set<string>;
  following: Set<string>;
  onLike: (id: string) => void;
  onFollow: (creatorId: string) => void;
  onReport: (id: string) => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(startId ?? videos[0]?.id);
  const [muted, setMuted] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!startId) return;
    const node = scroller.current?.querySelector(`[data-drop-id="${startId}"]`);
    node?.scrollIntoView({ block: "start" });
  }, [startId]);

  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            const id = (entry.target as HTMLElement).dataset.dropId;
            if (id) setActive(id);
          }
        }
      },
      { root, threshold: [0.65] },
    );
    root.querySelectorAll("[data-drop-id]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [videos]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "m") {
        setMuted((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function step(dir: 1 | -1) {
    const idx = videos.findIndex((v) => v.id === active);
    const next = videos[idx + dir];
    if (!next) return;
    const node = scroller.current?.querySelector(`[data-drop-id="${next.id}"]`);
    node?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  if (!videos.length) {
    return (
      <div className="grid min-h-[100dvh] place-items-center bg-bg text-muted">
        Nothing in Drop yet.
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] bg-bg">
      <div className="mx-auto flex h-full max-w-[520px] items-stretch lg:max-w-[720px]">
        <div
          ref={scroller}
          className="drop-scroller h-full w-full snap-y snap-mandatory overflow-y-auto"
        >
          {videos.map((video) => (
            <section
              key={video.id}
              data-drop-id={video.id}
              className="relative flex h-[100dvh] snap-start snap-always items-stretch"
            >
              <div className="relative h-full flex-1 overflow-hidden bg-black md:mx-auto md:max-w-[420px] md:rounded-none">
                <DropVideo
                  src={video.srcUrl}
                  poster={video.posterUrl}
                  muted={muted}
                  active={active === video.id}
                  onToggleMute={() => setMuted((v) => !v)}
                />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-bg/90 via-bg/40 to-transparent px-4 pt-24 pb-24 md:pb-8">
                  <Link
                    to="/c/$handle"
                    params={{ handle: video.handle }}
                    className="flex items-center gap-2"
                  >
                    {video.avatarUrl ? (
                      <img src={video.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
                    ) : (
                      <span className="grid size-8 place-items-center rounded-full bg-raised text-xs">
                        {video.displayName.charAt(0)}
                      </span>
                    )}
                    <span className="text-sm font-medium">@{video.handle}</span>
                  </Link>
                  <p className="mt-2 max-w-[34ch] text-[15px] font-medium leading-snug">{video.title}</p>
                  <div className="mt-2">
                    <SourceChip src={video.srcUrl} />
                  </div>
                  {video.description ? (
                    <p className="mt-1 line-clamp-2 max-w-[36ch] text-sm text-muted">{video.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setMuted((v) => !v)}
                  className="absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-bg/45 text-fg"
                  aria-label={muted ? "Unmute" : "Mute"}
                >
                  {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
              </div>
              <aside className="absolute right-3 bottom-28 z-10 flex flex-col items-center gap-4 md:static md:justify-end md:px-4 md:pb-16">
                <RailButton
                  label={compactNumber(video.likeCount)}
                  active={liked.has(video.id)}
                  onClick={() => onLike(video.id)}
                >
                  <Heart className={liked.has(video.id) ? "size-6 fill-danger text-danger" : "size-6"} />
                </RailButton>
                <RailButton
                  label="Watch"
                  onClick={() =>
                    navigate({ to: "/watch/$videoId", params: { videoId: video.id } })
                  }
                >
                  <MessageCircle className="size-6" />
                </RailButton>
                <RailButton label="Report" onClick={() => onReport(video.id)}>
                  <Flag className="size-6" />
                </RailButton>
                <button
                  type="button"
                  onClick={() => onFollow(video.userId)}
                  className="relative mt-1"
                  aria-label="Follow"
                >
                  {video.avatarUrl ? (
                    <img src={video.avatarUrl} alt="" className="size-12 rounded-full object-cover ring-2 ring-fg" />
                  ) : (
                    <span className="grid size-12 place-items-center rounded-full bg-raised ring-2 ring-fg">
                      {video.displayName.charAt(0)}
                    </span>
                  )}
                  <span className="absolute -bottom-2 left-1/2 grid size-5 -translate-x-1/2 place-items-center rounded-full bg-fg text-[11px] font-semibold text-bg">
                    {following.has(video.userId) ? "✓" : "+"}
                  </span>
                </button>
              </aside>
            </section>
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <button
          type="button"
          className="pointer-events-auto grid size-10 place-items-center rounded-full border border-border bg-surface text-fg"
          onClick={() => step(-1)}
          aria-label="Previous"
        >
          <ChevronUp className="size-4" />
        </button>
        <button
          type="button"
          className="pointer-events-auto grid size-10 place-items-center rounded-full border border-border bg-surface text-fg"
          onClick={() => step(1)}
          aria-label="Next"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  );
}

function DropVideo({
  src,
  poster,
  muted,
  active,
  onToggleMute,
}: {
  src: string;
  poster: string | null;
  muted: boolean;
  active: boolean;
  onToggleMute: () => void;
}) {
  const embed = isEmbedSrc(src);
  const resolved = useResolvedSrc(embed ? undefined : src);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (embed) return;
    const el = ref.current;
    if (!el) return;
    el.muted = muted;
    if (active) void el.play().catch(() => {});
    else el.pause();
  }, [active, muted, embed]);

  if (embed) {
    return (
      <>
        {poster ? (
          <img src={poster} alt="" className="absolute inset-0 size-full object-cover" />
        ) : null}
        {active ? (
          <MediaEmbed
            src={src}
            autoPlay
            muted={muted}
            loop
            vertical
            className="absolute inset-0 size-full"
          />
        ) : null}
      </>
    );
  }

  return (
    <video
      ref={ref}
      src={resolved || undefined}
      poster={poster ?? undefined}
      loop
      playsInline
      muted={muted}
      className="absolute inset-0 size-full object-cover"
      onClick={onToggleMute}
    />
  );
}

function RailButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 text-fg">
      <span
        className={
          active
            ? "grid size-12 place-items-center rounded-full bg-fg/15"
            : "grid size-12 place-items-center rounded-full bg-bg/40"
        }
      >
        {children}
      </span>
      <span className="text-[11px] font-medium tabular-nums">{label}</span>
    </button>
  );
}
