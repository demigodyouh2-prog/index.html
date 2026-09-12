import { cn } from "@/lib/utils";
import { parseMedia } from "@/lib/media";

export function MediaEmbed({
  src,
  autoPlay = false,
  muted = false,
  loop = false,
  vertical = false,
  title = "Edit",
  className,
}: {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  vertical?: boolean;
  title?: string;
  className?: string;
}) {
  const media = parseMedia(src);
  if (media.kind === "youtube" && media.id) {
    const params = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      mute: muted || autoPlay ? (muted ? "1" : "0") : "0",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      controls: vertical ? "0" : "1",
    });
    if (loop) {
      params.set("loop", "1");
      params.set("playlist", media.id);
    }
    return (
      <div className={cn("overflow-hidden bg-black", className)}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${media.id}?${params.toString()}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={
            vertical
              ? "absolute top-1/2 left-1/2 h-[185%] w-full -translate-x-1/2 -translate-y-1/2 border-0"
              : "size-full border-0"
          }
        />
      </div>
    );
  }
  if (media.kind === "tiktok" && media.id) {
    const params = new URLSearchParams({
      autoplay: autoPlay ? "1" : "0",
      mute: muted ? "1" : "0",
      loop: loop ? "1" : "0",
      music_info: "0",
      description: "0",
      progress_bar: "1",
      native_context_menu: "0",
    });
    return (
      <div className={cn("overflow-hidden bg-black", className)}>
        <iframe
          src={`https://www.tiktok.com/player/v1/${media.id}?${params.toString()}`}
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }
  return null;
}

export function SourceChip({ src }: { src: string }) {
  const media = parseMedia(src);
  if (!media.label) return null;
  return (
    <span className="rounded-xs bg-bg/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fg">
      {media.label}
    </span>
  );
}
