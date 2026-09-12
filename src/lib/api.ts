import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { scanContent } from "@/lib/moderation";
import { slugify } from "@/lib/utils";
import type {
  CommentItem,
  GuardDecision,
  ModerationEvent,
  Profile,
  VideoItem,
} from "@/lib/types";

type ProfileRow = {
  user_id: string;
  handle: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  is_seed: boolean;
  posting_locked: boolean;
  banned: boolean;
  ban_reason: string | null;
  ban_category: string | null;
  strike_count: number;
  created_at: unknown;
  follower_count?: number | string;
  video_count?: number | string;
};

type VideoRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tags: string;
  src_url: string;
  poster_url: string | null;
  duration_sec: number;
  is_short: boolean;
  status: string;
  takedown_reason: string | null;
  takedown_category: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: unknown;
  handle: string;
  display_name: string;
  avatar_url: string | null;
};

type CommentRow = {
  id: string;
  video_id: string;
  user_id: string;
  body: string;
  created_at: unknown;
  handle: string;
  display_name: string;
  avatar_url: string | null;
};

function asIso(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

function asNum(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    handle: row.handle,
    displayName: row.display_name,
    bio: row.bio,
    avatarUrl: row.avatar_url,
    isSeed: Boolean(row.is_seed),
    postingLocked: Boolean(row.posting_locked),
    banned: Boolean(row.banned),
    banReason: row.ban_reason,
    banCategory: row.ban_category,
    strikeCount: asNum(row.strike_count),
    createdAt: asIso(row.created_at),
    followerCount: asNum(row.follower_count),
    videoCount: asNum(row.video_count),
  };
}

function mapVideo(row: VideoRow): VideoItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    tags: row.tags,
    srcUrl: row.src_url,
    posterUrl: row.poster_url,
    durationSec: asNum(row.duration_sec),
    isShort: Boolean(row.is_short),
    status: row.status === "taken_down" ? "taken_down" : "published",
    takedownReason: row.takedown_reason,
    takedownCategory: row.takedown_category,
    viewCount: asNum(row.view_count),
    likeCount: asNum(row.like_count),
    commentCount: asNum(row.comment_count),
    createdAt: asIso(row.created_at),
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

function mapComment(row: CommentRow): CommentItem {
  return {
    id: row.id,
    videoId: row.video_id,
    userId: row.user_id,
    body: row.body,
    createdAt: asIso(row.created_at),
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
  };
}

const VIDEO_SELECT = `
  v.id, v.user_id, v.title, v.description, v.tags, v.src_url, v.poster_url,
  v.duration_sec, v.is_short, v.status, v.takedown_reason, v.takedown_category,
  v.view_count, v.like_count, v.comment_count, v.created_at,
  p.handle, p.display_name, p.avatar_url
`;

async function getProfileRow(userId: string): Promise<Profile | null> {
  const sql = await getSql();
  const rows = await sql<ProfileRow>`
    select
      p.*,
      (select count(*) from follows f where f.creator_id = p.user_id) as follower_count,
      (select count(*) from videos v where v.user_id = p.user_id and v.status = 'published') as video_count
    from profiles p
    where p.user_id = ${userId}
  `;
  return rows[0] ? mapProfile(rows[0]) : null;
}

async function logEvent(input: {
  userId?: string | null;
  videoId?: string | null;
  commentId?: string | null;
  action: string;
  category: string;
  severity: string;
  details: string;
}) {
  const sql = await getSql();
  const id = crypto.randomUUID();
  await sql`
    insert into moderation_events (id, user_id, video_id, comment_id, action, category, severity, details)
    values (
      ${id},
      ${input.userId ?? null},
      ${input.videoId ?? null},
      ${input.commentId ?? null},
      ${input.action},
      ${input.category},
      ${input.severity},
      ${input.details}
    )
  `;
}

async function banUser(userId: string, reason: string, category: string) {
  const sql = await getSql();
  await sql`
    update profiles
    set banned = true,
        posting_locked = true,
        ban_reason = ${reason},
        ban_category = ${category},
        banned_at = now(),
        strike_count = strike_count + 1
    where user_id = ${userId}
  `;
}

async function requireActivePoster(userId: string): Promise<Profile> {
  const profile = await getProfileRow(userId);
  if (!profile) throw new Error("Create a profile first.");
  if (profile.banned || profile.postingLocked) {
    throw new Error("Your account is locked by Bombom Guard.");
  }
  return profile;
}

export const listVideos = createServerFn({ method: "GET" })
  .validator((data: { kind?: "all" | "long" | "short"; q?: string; handle?: string }) => data)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const kind = data.kind ?? "all";
    const q = data.q?.trim() ?? "";
    const handle = data.handle?.trim() ?? "";

    const whereShort =
      kind === "short" ? "and v.is_short = true" : kind === "long" ? "and v.is_short = false" : "";

    const params: unknown[] = [];
    let text = `
      select ${VIDEO_SELECT}
      from videos v
      join profiles p on p.user_id = v.user_id
      where v.status = 'published'
      ${whereShort}
    `;
    if (handle) {
      params.push(handle);
      text += ` and p.handle = $${params.length}`;
    }
    if (q) {
      params.push(`%${q.toLowerCase()}%`);
      text += ` and (
        lower(v.title) like $${params.length}
        or lower(v.description) like $${params.length}
        or lower(v.tags) like $${params.length}
        or lower(p.handle) like $${params.length}
        or lower(p.display_name) like $${params.length}
      )`;
    }
    text += ` order by v.like_count desc, v.view_count desc, v.created_at desc limit 60`;

    const rows = await sql.query<VideoRow>(text, params);
    return rows.map(mapVideo);
  });

async function fetchVideo(id: string): Promise<VideoItem | null> {
  const sql = await getSql();
  const rows = await sql<VideoRow>`
    select
      v.id, v.user_id, v.title, v.description, v.tags, v.src_url, v.poster_url,
      v.duration_sec, v.is_short, v.status, v.takedown_reason, v.takedown_category,
      v.view_count, v.like_count, v.comment_count, v.created_at,
      p.handle, p.display_name, p.avatar_url
    from videos v
    join profiles p on p.user_id = v.user_id
    where v.id = ${id}
  `;
  return rows[0] ? mapVideo(rows[0]) : null;
}

export const getVideo = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => fetchVideo(id));

export const listComments = createServerFn({ method: "GET" })
  .validator((videoId: string) => videoId)
  .handler(async ({ data: videoId }) => {
    const sql = await getSql();
    const rows = await sql<CommentRow>`
      select c.id, c.video_id, c.user_id, c.body, c.created_at,
             p.handle, p.display_name, p.avatar_url
      from comments c
      join profiles p on p.user_id = c.user_id
      where c.video_id = ${videoId} and c.status = 'visible'
      order by c.created_at desc
      limit 80
    `;
    return rows.map(mapComment);
  });

export const incrementView = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await getSql();
    await sql`update videos set view_count = view_count + 1 where id = ${id} and status = 'published'`;
    return { ok: true as const };
  });

export const listModeration = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    user_id: string | null;
    video_id: string | null;
    action: string;
    category: string;
    severity: string;
    details: string;
    created_at: unknown;
  }>`
    select id, user_id, video_id, action, category, severity, details, created_at
    from moderation_events
    order by created_at desc
    limit 24
  `;
  return rows.map(
    (r): ModerationEvent => ({
      id: r.id,
      userId: r.user_id,
      videoId: r.video_id,
      action: r.action,
      category: r.category,
      severity: r.severity,
      details: r.details,
      createdAt: asIso(r.created_at),
    }),
  );
});

export const getChannel = createServerFn({ method: "GET" })
  .validator((handle: string) => handle)
  .handler(async ({ data: handle }) => {
    const sql = await getSql();
    const rows = await sql<ProfileRow>`
      select
        p.*,
        (select count(*) from follows f where f.creator_id = p.user_id) as follower_count,
        (select count(*) from videos v where v.user_id = p.user_id and v.status = 'published') as video_count
      from profiles p
      where p.handle = ${handle}
    `;
    return rows[0] ? mapProfile(rows[0]) : null;
  });

export const ensureMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { displayName?: string; avatarUrl?: string | null }) => data)
  .handler(async ({ context, data }) => {
    const existing = await getProfileRow(context.userId);
    if (existing) return existing;
    const sql = await getSql();
    const base = slugify(data.displayName || "member");
    let handle = base;
    for (let i = 0; i < 8; i += 1) {
      const clash = await sql<{ handle: string }>`select handle from profiles where handle = ${handle}`;
      if (!clash[0]) break;
      handle = `${base}${Math.floor(Math.random() * 90 + 10)}`;
    }
    const name = (data.displayName || "Member").slice(0, 40);
    await sql`
      insert into profiles (user_id, handle, display_name, bio, avatar_url)
      values (${context.userId}, ${handle}, ${name}, ${""}, ${data.avatarUrl ?? null})
      on conflict (user_id) do nothing
    `;
    const created = await getProfileRow(context.userId);
    if (!created) throw new Error("Could not create profile.");
    return created;
  });

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => getProfileRow(context.userId));

export const listMyVideos = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<VideoRow>`
      select
        v.id, v.user_id, v.title, v.description, v.tags, v.src_url, v.poster_url,
        v.duration_sec, v.is_short, v.status, v.takedown_reason, v.takedown_category,
        v.view_count, v.like_count, v.comment_count, v.created_at,
        p.handle, p.display_name, p.avatar_url
      from videos v
      join profiles p on p.user_id = v.user_id
      where v.user_id = ${context.userId}
      order by v.created_at desc
    `;
    return rows.map(mapVideo);
  });

export const myLikedIds = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ video_id: string }>`
      select video_id from likes where user_id = ${context.userId}
    `;
    return rows.map((r) => r.video_id);
  });

export const myFollowedIds = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ creator_id: string }>`
      select creator_id from follows where follower_id = ${context.userId}
    `;
    return rows.map((r) => r.creator_id);
  });

export const toggleLike = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((videoId: string) => videoId)
  .handler(async ({ context, data: videoId }) => {
    await requireActivePoster(context.userId);
    const sql = await getSql();
    const existing = await sql<{ user_id: string }>`
      select user_id from likes where user_id = ${context.userId} and video_id = ${videoId}
    `;
    if (existing[0]) {
      await sql`delete from likes where user_id = ${context.userId} and video_id = ${videoId}`;
      await sql`update videos set like_count = greatest(like_count - 1, 0) where id = ${videoId}`;
      return { liked: false as const };
    }
    await sql`insert into likes (user_id, video_id) values (${context.userId}, ${videoId})`;
    await sql`update videos set like_count = like_count + 1 where id = ${videoId}`;
    return { liked: true as const };
  });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((creatorId: string) => creatorId)
  .handler(async ({ context, data: creatorId }) => {
    if (creatorId === context.userId) return { following: false as const };
    await requireActivePoster(context.userId);
    const sql = await getSql();
    const existing = await sql<{ follower_id: string }>`
      select follower_id from follows where follower_id = ${context.userId} and creator_id = ${creatorId}
    `;
    if (existing[0]) {
      await sql`delete from follows where follower_id = ${context.userId} and creator_id = ${creatorId}`;
      return { following: false as const };
    }
    await sql`insert into follows (follower_id, creator_id) values (${context.userId}, ${creatorId})`;
    return { following: true as const };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { videoId: string; body: string }) => ({
    videoId: data.videoId,
    body: data.body.trim().slice(0, 500),
  }))
  .handler(async ({ context, data }): Promise<{ comment?: CommentItem; guard: GuardDecision }> => {
    await requireActivePoster(context.userId);
    if (!data.body) return { guard: { ok: true } };

    const scan = await scanContent({
      title: "",
      description: data.body,
      kind: "comment",
    });

    if (scan.action !== "allow") {
      await banUser(context.userId, scan.reason, scan.categories[0] ?? "policy-violation");
      await logEvent({
        userId: context.userId,
        action: "ban",
        category: scan.categories[0] ?? "policy-violation",
        severity: scan.severity,
        details: `Comment blocked: ${scan.reason}`,
      });
      return {
        guard: {
          ok: false,
          banned: true,
          action: "ban",
          category: scan.categories[0] ?? "policy-violation",
          reason: scan.reason,
        },
      };
    }

    const sql = await getSql();
    const id = crypto.randomUUID();
    await sql`
      insert into comments (id, video_id, user_id, body)
      values (${id}, ${data.videoId}, ${context.userId}, ${data.body})
    `;
    await sql`update videos set comment_count = comment_count + 1 where id = ${data.videoId}`;
    const rows = await sql<CommentRow>`
      select c.id, c.video_id, c.user_id, c.body, c.created_at,
             p.handle, p.display_name, p.avatar_url
      from comments c
      join profiles p on p.user_id = c.user_id
      where c.id = ${id}
    `;
    return { comment: rows[0] ? mapComment(rows[0]) : undefined, guard: { ok: true } };
  });

export const publishVideo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: {
    title: string;
    description: string;
    tags: string;
    srcUrl: string;
    posterUrl?: string | null;
    durationSec?: number;
    isShort: boolean;
    localUpload?: boolean;
  }) => ({
    title: data.title.trim().slice(0, 120),
    description: data.description.trim().slice(0, 2000),
    tags: data.tags.trim().slice(0, 200),
    srcUrl: data.srcUrl.startsWith("data:")
      ? data.srcUrl.slice(0, 2_400_000)
      : data.srcUrl.slice(0, 2000),
    posterUrl: data.posterUrl?.slice(0, 400_000) ?? null,
    durationSec: Math.max(0, Math.round(data.durationSec ?? 0)),
    isShort: Boolean(data.isShort),
    localUpload: Boolean(data.localUpload),
  }))
  .handler(async ({ context, data }): Promise<{ video?: VideoItem; guard: GuardDecision }> => {
    await requireActivePoster(context.userId);
    if (!data.title || (!data.srcUrl && !data.localUpload)) {
      throw new Error("Title and video are required.");
    }

    const scan = await scanContent({
      title: data.title,
      description: data.description,
      tags: data.tags,
      kind: "video",
      posterDataUrl: data.posterUrl?.startsWith("data:image/") ? data.posterUrl : null,
    });

    const id = crypto.randomUUID();
    const storedSrc = data.localUpload ? `idb:${id}` : data.srcUrl;

    if (scan.action !== "allow") {
      const sql = await getSql();
      await sql`
        insert into videos (
          id, user_id, title, description, tags, src_url, poster_url, duration_sec, is_short,
          status, takedown_reason, takedown_category
        ) values (
          ${id}, ${context.userId}, ${data.title}, ${data.description}, ${data.tags},
          ${storedSrc}, ${null}, ${data.durationSec}, ${data.isShort},
          ${"taken_down"}, ${scan.reason}, ${scan.categories[0] ?? "policy-violation"}
        )
      `;
      await banUser(context.userId, scan.reason, scan.categories[0] ?? "policy-violation");
      await logEvent({
        userId: context.userId,
        videoId: id,
        action: "ban",
        category: scan.categories[0] ?? "policy-violation",
        severity: scan.severity,
        details: scan.reason,
      });
      return {
        guard: {
          ok: false,
          banned: true,
          action: "ban",
          category: scan.categories[0] ?? "policy-violation",
          reason: scan.reason,
        },
      };
    }

    const sql = await getSql();
    await sql`
      insert into videos (
        id, user_id, title, description, tags, src_url, poster_url, duration_sec, is_short, status
      ) values (
        ${id}, ${context.userId}, ${data.title}, ${data.description}, ${data.tags},
        ${storedSrc}, ${data.posterUrl}, ${data.durationSec}, ${data.isShort}, ${"published"}
      )
    `;
    const inserted = await sql<VideoRow>`
      select
        v.id, v.user_id, v.title, v.description, v.tags, v.src_url, v.poster_url,
        v.duration_sec, v.is_short, v.status, v.takedown_reason, v.takedown_category,
        v.view_count, v.like_count, v.comment_count, v.created_at,
        p.handle, p.display_name, p.avatar_url
      from videos v
      join profiles p on p.user_id = v.user_id
      where v.id = ${id}
    `;
    return { video: inserted[0] ? mapVideo(inserted[0]) : undefined, guard: { ok: true } };
  });

export const reportVideo = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { videoId: string; reason: string; details?: string }) => data)
  .handler(async ({ context, data }): Promise<{ guard: GuardDecision }> => {
    await requireActivePoster(context.userId);
    const sql = await getSql();
    const reportId = crypto.randomUUID();
    await sql`
      insert into reports (id, reporter_id, video_id, reason, details)
      values (${reportId}, ${context.userId}, ${data.videoId}, ${data.reason}, ${data.details ?? ""})
    `;

    const video = await fetchVideo(data.videoId);
    if (!video || video.status !== "published") return { guard: { ok: true } };

    const scan = await scanContent({
      title: video.title,
      description: video.description,
      tags: video.tags,
      kind: "video",
    });

    const isSeed = video.userId.startsWith("seed-");
    const child = data.reason === "child-safety" && !isSeed;
    if (scan.action !== "allow" || child) {
      const reason = child
        ? "Removed after a child-safety report. Bombom Guard takes these reports immediately."
        : scan.reason;
      const category = child ? "child-safety" : (scan.categories[0] ?? "policy-violation");
      await sql`
        update videos
        set status = 'taken_down', takedown_reason = ${reason}, takedown_category = ${category}
        where id = ${data.videoId}
      `;
      await banUser(video.userId, reason, category);
      await logEvent({
        userId: video.userId,
        videoId: data.videoId,
        action: "ban",
        category,
        severity: child ? "severe" : scan.severity,
        details: `Report ${data.reason}: ${reason}`,
      });
      await sql`update reports set status = 'actioned' where id = ${reportId}`;
      return {
        guard: { ok: false, banned: true, action: "ban", category, reason },
      };
    }

    await sql`update reports set status = 'reviewed' where id = ${reportId}`;
    return { guard: { ok: true } };
  });

export const restoreMyAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`
      update profiles
      set banned = false,
          posting_locked = false,
          ban_reason = null,
          ban_category = null,
          banned_at = null
      where user_id = ${context.userId}
    `;
    await logEvent({
      userId: context.userId,
      action: "restore",
      category: "appeal",
      severity: "none",
      details: "Account restored after Guard lock.",
    });
    return getProfileRow(context.userId);
  });
