import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { VideoCard } from "@/components/video-card";
import { getChannel, listVideos, myFollowedIds, toggleFollow } from "@/lib/api";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { compactNumber } from "@/lib/utils";

export const Route = createFileRoute("/c/$handle")({
  loader: async ({ params }) => {
    const [channel, videos] = await Promise.all([
      getChannel({ data: params.handle }),
      listVideos({ data: { handle: params.handle } }),
    ]);
    return { channel, videos };
  },
  component: ChannelPage,
});

function ChannelPage() {
  const { channel, videos } = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    if (!user || !channel) return;
    void myFollowedIds()
      .then((ids) => setFollowing(ids.includes(channel.userId)))
      .catch(() => {});
  }, [user, channel]);

  if (!channel) {
    return (
      <main className="px-5 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Channel not found</h1>
      </main>
    );
  }

  return (
    <main className="px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-4">
        {channel.avatarUrl ? (
          <img src={channel.avatarUrl} alt="" className="size-20 rounded-full object-cover" />
        ) : (
          <span className="grid size-20 place-items-center rounded-full bg-raised font-display text-2xl">
            {channel.displayName.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{channel.displayName}</h1>
          <p className="text-sm text-muted">
            @{channel.handle} · {compactNumber(channel.followerCount)} followers · {channel.videoCount}{" "}
            videos
          </p>
          {channel.bio ? <p className="mt-2 max-w-xl text-sm text-muted">{channel.bio}</p> : null}
        </div>
        <Button
          variant={following ? "outline" : "default"}
          onClick={() => {
            if (isPending) return;
            if (!user) {
              void navigate({ to: "/login" });
              return;
            }
            setFollowing((v) => !v);
            void toggleFollow({ data: channel.userId }).catch(() => toast.error("Could not follow."));
          }}
        >
          {following ? "Following" : "Follow"}
        </Button>
      </div>
      <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </main>
  );
}
