import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { publishVideo } from "@/lib/api";
import { STOCK_CLIPS } from "@/lib/stock";
import { formatBytes, MAX_UPLOAD_BYTES, putLocalVideo } from "@/lib/local-media";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/upload")({ component: UploadPage });

function UploadPage() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isShort, setIsShort] = useState(true);
  const [stockId, setStockId] = useState<string>(STOCK_CLIPS[0].id);
  const [file, setFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return <div className="px-5 py-16 text-sm text-muted">Checking session…</div>;
  }
  if (!user) return <RedirectToSignIn />;

  async function onFile(next: File) {
    if (next.size > MAX_UPLOAD_BYTES) {
      toast.error("Keep uploads at 500 MB or smaller.");
      return;
    }
    setFile(next);
    const poster = await capturePoster(next);
    setPosterUrl(poster);
    const duration = await readDuration(next);
    setDurationSec(duration);
    setIsShort(duration > 0 && duration <= 60);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const stock = STOCK_CLIPS.find((c) => c.id === stockId);
    if (!title.trim() || (!file && !stock)) {
      toast.error("Add a title and a clip.");
      return;
    }
    setBusy(true);
    try {
      const result = await publishVideo({
        data: {
          title,
          description,
          tags,
          srcUrl: file ? "local" : (stock?.src ?? ""),
          localUpload: Boolean(file),
          posterUrl: posterUrl ?? stock?.poster ?? null,
          durationSec: file ? durationSec : (stock?.duration ?? 0),
          isShort: file ? isShort : Boolean(stock?.isShort || isShort),
        },
      });
      if (!result.guard.ok) {
        toast.error(result.guard.reason);
        window.location.assign("/");
        return;
      }
      if (file && result.video) {
        await putLocalVideo(result.video.id, file);
      }
      toast.success("Published.");
      if (result.video?.isShort) {
        void navigate({ to: "/shorts", search: { start: result.video.id } });
      } else if (result.video) {
        void navigate({ to: "/watch/$videoId", params: { videoId: result.video.id } });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Studio</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Post a video</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Bombom Guard reads the title, description, tags, and thumbnail before anything goes live.
        Sexual content, violence, hate, self-harm, and illegal activity get the video taken down
        and the account banned.
      </p>

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-danger" />
        <p className="text-sm leading-relaxed text-muted">
          Zero tolerance. If you want to see Guard work, use{" "}
          <button
            type="button"
            className="font-medium text-fg underline underline-offset-4"
            onClick={() => {
              setTitle("uncensored graphic gore compilation");
              setDescription("A test of Bombom Guard. This should never publish.");
              setTags("nsfw, gore");
            }}
          >
            this banned title
          </button>
          — do not actually post harm.
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Title</span>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Description</span>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Tags</span>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="gojo, edit, amv"
            maxLength={200}
          />
        </label>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">Format</legend>
          <div className="flex gap-2">
            <Toggle pressed={isShort} onClick={() => setIsShort(true)}>
              Drop (vertical)
            </Toggle>
            <Toggle pressed={!isShort} onClick={() => setIsShort(false)}>
              Watch (landscape)
            </Toggle>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-sm font-medium">bombom clip</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {STOCK_CLIPS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setStockId(c.id);
                  setFile(null);
                  setPosterUrl(c.poster);
                  setIsShort(c.isShort);
                }}
                className={cn(
                  "overflow-hidden rounded-md border text-left",
                  stockId === c.id && !file ? "border-fg" : "border-border",
                )}
              >
                <img src={c.poster} alt="" className="aspect-video w-full object-cover" />
                <span className="block px-2 py-1.5 text-xs text-muted">{c.title}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Or upload your own (up to 500 MB)</span>
          <Input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => {
              const next = e.target.files?.[0];
              if (next) void onFile(next);
            }}
          />
          {file ? (
            <p className="mt-1 text-xs text-subtle">
              {file.name} · {formatBytes(file.size)}
            </p>
          ) : null}
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Scanning with Guard…" : "Publish"}
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link to="/safety">Standards</Link>
          </Button>
        </div>
      </form>
    </main>
  );
}

function Toggle({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-full px-4 text-sm font-medium",
        pressed ? "bg-fg text-bg" : "bg-raised text-muted",
      )}
    >
      {children}
    </button>
  );
}

function capturePoster(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.onloadeddata = () => {
      video.currentTime = Math.min(0.4, (video.duration || 1) * 0.1);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      const w = 480;
      const h = Math.max(1, Math.round((video.videoHeight / (video.videoWidth || 1)) * w));
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
  });
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      const d = Number.isFinite(video.duration) ? video.duration : 0;
      URL.revokeObjectURL(url);
      resolve(d);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
  });
}
