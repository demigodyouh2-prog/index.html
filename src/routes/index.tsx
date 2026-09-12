import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { DropShelfCard, VideoCard } from "@/components/video-card";
import { SourceChip } from "@/components/media-embed";
import { listVideos } from "@/lib/api";
import { compactNumber } from "@/lib/utils";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [all, shorts] = await Promise.all([
      listVideos({ data: { kind: "long" } }),
      listVideos({ data: { kind: "short" } }),
    ]);
    return { all, shorts };
  },
  component: Home,
});

function Home() {
  const { all, shorts } = Route.useLoaderData();
  const gojoLong = all.filter((v) => v.tags.includes("gojo"));
  const gojoShort = shorts.filter((v) => v.tags.includes("gojo"));
  const featured = gojoLong[0] ?? all[0];
  const rest = all.filter((v) => v.id !== featured?.id);

  return (
    <main className="px-3 pt-5 pb-8 sm:px-6">
      {featured ? (
        <section className="relative mb-8 overflow-hidden rounded-xl bg-raised">
          <Link to="/watch/$videoId" params={{ videoId: featured.id }} className="block">
            <div className="relative aspect-[16/9] max-h-[520px] w-full sm:aspect-[21/9]">
              {featured.posterUrl ? (
                <img src={featured.posterUrl} alt="" className="size-full object-cover" />
              ) : null}
              <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/25 to-transparent" />
              <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8">
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                    Featured
                  </p>
                  <SourceChip src={featured.srcUrl} />
                </div>
                <h1 className="mt-1 max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-4xl">
                  {featured.title}
                </h1>
                <p className="mt-2 max-w-lg text-sm text-muted sm:text-base">
                  {featured.displayName} · {compactNumber(featured.viewCount)} views
                </p>
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      {gojoShort.length || gojoLong.length ? (
        <section className="mb-10">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Gojo edits</h2>
              <p className="text-sm text-subtle">YouTube AMVs and TikTok cuts. The strongest, on loop.</p>
            </div>
            <Link
              to="/search"
              search={{ q: "gojo" }}
              className="flex items-center gap-1 text-sm text-muted hover:text-fg"
            >
              All Gojo
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {gojoShort.map((v) => (
              <DropShelfCard key={v.id} video={v} />
            ))}
          </div>
          {gojoLong.length > 1 ? (
            <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
              {gojoLong.slice(featured?.tags.includes("gojo") ? 1 : 0).map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {shorts.length ? (
        <section className="mb-10">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Drop</h2>
              <p className="text-sm text-subtle">Vertical, looping, hard to leave.</p>
            </div>
            <Link to="/shorts" search={{ start: undefined }} className="flex items-center gap-1 text-sm text-muted hover:text-fg">
              Open Drop
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
            {shorts.map((v) => (
              <DropShelfCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">Trending on bombom</h2>
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          {rest.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      </section>
    </main>
  );
}
