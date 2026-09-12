export type MediaKind = "file" | "youtube" | "tiktok";

export type ParsedMedia = {
  kind: MediaKind;
  id?: string;
  embedUrl?: string;
  label?: string;
};

const YT =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const TT = /tiktok\.com\/@[\w.]+\/video\/(\d+)/;

export function parseMedia(src: string | undefined | null): ParsedMedia {
  if (!src) return { kind: "file" };
  const yt = src.match(YT);
  if (yt) {
    return {
      kind: "youtube",
      id: yt[1],
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt[1]}`,
      label: "YouTube",
    };
  }
  const tt = src.match(TT);
  if (tt) {
    return {
      kind: "tiktok",
      id: tt[1],
      embedUrl: `https://www.tiktok.com/player/v1/${tt[1]}`,
      label: "TikTok",
    };
  }
  return { kind: "file" };
}

export function youtubePoster(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function isEmbedSrc(src: string | undefined | null): boolean {
  const kind = parseMedia(src).kind;
  return kind === "youtube" || kind === "tiktok";
}
