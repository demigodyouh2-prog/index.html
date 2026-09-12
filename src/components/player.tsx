import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { MediaEmbed } from "@/components/media-embed";
import { isEmbedSrc } from "@/lib/media";
import { useResolvedSrc } from "@/lib/local-media";
import { cn, formatDuration } from "@/lib/utils";

export function Player({
  src,
  poster,
  autoPlay = false,
  className,
  onEnded,
}: {
  src: string;
  poster?: string | null;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
}) {
  const embed = isEmbedSrc(src);
  const resolved = useResolvedSrc(embed ? undefined : src);
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || !resolved) return;
    if (autoPlay) void el.play().catch(() => setPlaying(false));
  }, [resolved, autoPlay]);

  function togglePlay() {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  if (embed) {
    return (
      <div className={cn("relative aspect-video overflow-hidden rounded-lg bg-black", className)}>
        <MediaEmbed src={src} autoPlay={autoPlay} title="bombom player" className="absolute inset-0 size-full" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-black", className)}>
      <video
        ref={ref}
        src={resolved || undefined}
        poster={poster ?? undefined}
        playsInline
        className="aspect-video w-full bg-black object-contain"
        onClick={togglePlay}
        onTimeUpdate={() => {
          const el = ref.current;
          if (!el || !el.duration) return;
          setProgress(el.currentTime / el.duration);
          setDuration(el.duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={onEnded}
        onLoadedMetadata={() => setDuration(ref.current?.duration ?? 0)}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {!playing ? (
          <span className="grid size-16 place-items-center rounded-full bg-bg/55 text-fg">
            <Play className="size-7 fill-fg" />
          </span>
        ) : null}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-bg/80 to-transparent px-3 pt-8 pb-3">
        <button
          type="button"
          onClick={togglePlay}
          className="grid size-9 place-items-center rounded-md text-fg"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="size-4 fill-fg" /> : <Play className="size-4 fill-fg" />}
        </button>
        <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-fg/20">
          <div className="h-full bg-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <span className="min-w-10 text-right font-mono text-[11px] tabular-nums text-muted">
          {formatDuration(duration)}
        </span>
        <button
          type="button"
          onClick={() => {
            const el = ref.current;
            if (!el) return;
            el.muted = !el.muted;
            setMuted(el.muted);
          }}
          className="grid size-9 place-items-center rounded-md text-fg"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>
    </div>
  );
}
