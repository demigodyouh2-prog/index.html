import { createFileRoute } from "@tanstack/react-router";
import { VideoCard } from "@/components/video-card";
import { listVideos } from "@/lib/api";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: async ({ deps }) => listVideos({ data: { q: deps.q } }),
  component: SearchPage,
});

function SearchPage() {
  const videos = Route.useLoaderData();
  const { q } = Route.useSearch();
  return (
    <main className="px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {q ? `Results for “${q}”` : "Search"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {videos.length} {videos.length === 1 ? "video" : "videos"}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
      {!videos.length ? (
        <p className="mt-10 text-sm text-subtle">Nothing matched. Try gojo, tiktok, or a creator.</p>
      ) : null}
    </main>
  );
}
