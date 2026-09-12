import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { SourceChip } from "@/components/media-embed";
import { isEmbedSrc } from "@/lib/media";
import { useResolvedSrc } from "@/lib/local-media";
import { compactNumber, formatDuration, timeAgo } from "@/lib/utils";
import type { VideoItem } from "@/lib/types";

export function VideoCard({ video, compact = false }: { video: VideoItem; compact?: boolean }) {
  const vid = useRef<HTMLVideoElement>(null);
  const [hot, setHot] = useState(false);
  const embed = isEmbedSrc(video.srcUrl);
  const resolved = useResolvedSrc(hot && !embed ? video.srcUrl : undefined);

  function play() {
    if (embed) return;
    setHot(true);
  }
  function stop() {
    const el = vid.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setHot(false);
  }

  return (
    <article className="group">
      <Link
        to="/watch/$videoId"
        params={{ videoId: video.id }}
        className="block"
        onMouseEnter={play}
        onMouseLeave={stop}
      >
        <div
          className={
            compact
              ? "relative aspect-video overflow-hidden rounded-md bg-raised"
              : "relative aspect-video overflow-hidden rounded-lg bg-raised"
          }
        >
          {video.posterUrl ? (
            <img
              src={video.posterUrl}
              alt=""
              className="absolute inset-0 size-full object-cover"
            />
          ) : null}
          {hot && resolved ? (
            <video
              ref={vid}
              src={resolved}
              muted
              autoPlay
              playsInline
              loop
              preload="metadata"
              className="absolute inset-0 size-full object-cover"
            />
          ) : null}
          <span className="absolute right-2 bottom-2 rounded-xs bg-bg/80 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-fg">
            {formatDuration(video.durationSec)}
          </span>
          <span className="absolute left-2 top-2">
            <SourceChip src={video.srcUrl} />
          </span>
        </div>
      </Link>
      <div className={compact ? "mt-2 flex gap-2" : "mt-3 flex gap-3"}>
        <Link to="/c/$handle" params={{ handle: video.handle }} className="shrink-0">
          {video.avatarUrl ? (
            <img
              src={video.avatarUrl}
              alt=""
              className={compact ? "size-7 rounded-full object-cover" : "size-9 rounded-full object-cover"}
            />
          ) : (
            <span className="grid size-9 place-items-center rounded-full bg-raised text-xs font-medium">
              {video.displayName.charAt(0)}
            </span>
          )}
        </Link>
        <div className="min-w-0">
          <Link
            to="/watch/$videoId"
            params={{ videoId: video.id }}
            className="line-clamp-2 text-[15px] font-medium leading-snug text-fg"
          >
            {video.title}
          </Link>
          <Link
            to="/c/$handle"
            params={{ handle: video.handle }}
            className="mt-1 block truncate text-sm text-muted hover:text-fg"
          >
            {video.displayName}
          </Link>
          <p className="text-sm text-subtle tabular-nums">
            {compactNumber(video.viewCount)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function DropShelfCard({ video }: { video: VideoItem }) {
  return (
    <Link
      to="/shorts"
      search={{ start: video.id }}
      className="group relative w-[148px] shrink-0 snap-start overflow-hidden rounded-lg bg-raised sm:w-[168px]"
    >
      <div className="relative aspect-[9/16]">
        {video.posterUrl ? (
          <img src={video.posterUrl} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-raised" />
        )}
        <div className="absolute left-2 top-2">
          <SourceChip src={video.srcUrl} />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-bg/80 to-transparent p-2.5 pt-10">
          <p className="line-clamp-2 text-xs font-medium leading-snug text-fg">{video.title}</p>
          <p className="mt-1 text-[11px] text-muted tabular-nums">{compactNumber(video.viewCount)} views</p>
        </div>
      </div>
    </Link>
  );
}
