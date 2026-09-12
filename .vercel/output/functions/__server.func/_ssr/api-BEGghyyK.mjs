import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { c as slugify, s as getSql, t as authMiddleware } from "./utils-B7wQydhJ.mjs";
import { n as scanContent } from "./moderation-Bq8v8ftU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-BEGghyyK.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function asIso(value) {
	if (typeof value === "string") return value;
	if (value instanceof Date) return value.toISOString();
	return String(value ?? "");
}
function asNum(value) {
	if (typeof value === "number") return value;
	if (typeof value === "bigint") return Number(value);
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}
function mapProfile(row) {
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
		videoCount: asNum(row.video_count)
	};
}
function mapVideo(row) {
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
		avatarUrl: row.avatar_url
	};
}
function mapComment(row) {
	return {
		id: row.id,
		videoId: row.video_id,
		userId: row.user_id,
		body: row.body,
		createdAt: asIso(row.created_at),
		handle: row.handle,
		displayName: row.display_name,
		avatarUrl: row.avatar_url
	};
}
var VIDEO_SELECT = `
  v.id, v.user_id, v.title, v.description, v.tags, v.src_url, v.poster_url,
  v.duration_sec, v.is_short, v.status, v.takedown_reason, v.takedown_category,
  v.view_count, v.like_count, v.comment_count, v.created_at,
  p.handle, p.display_name, p.avatar_url
`;
async function getProfileRow(userId) {
	const rows = await (await getSql())`
    select
      p.*,
      (select count(*) from follows f where f.creator_id = p.user_id) as follower_count,
      (select count(*) from videos v where v.user_id = p.user_id and v.status = 'published') as video_count
    from profiles p
    where p.user_id = ${userId}
  `;
	return rows[0] ? mapProfile(rows[0]) : null;
}
async function logEvent(input) {
	await (await getSql())`
    insert into moderation_events (id, user_id, video_id, comment_id, action, category, severity, details)
    values (
      ${crypto.randomUUID()},
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
async function banUser(userId, reason, category) {
	await (await getSql())`
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
async function requireActivePoster(userId) {
	const profile = await getProfileRow(userId);
	if (!profile) throw new Error("Create a profile first.");
	if (profile.banned || profile.postingLocked) throw new Error("Your account is locked by Pulse Guard.");
	return profile;
}
var listVideos_createServerFn_handler = createServerRpc({
	id: "cecd2200045a3199d61f49604eb5685d765f872342cdc9cd05eeeb3205125f10",
	name: "listVideos",
	filename: "src/lib/api.ts"
}, (opts) => listVideos.__executeServer(opts));
var listVideos = createServerFn({ method: "GET" }).validator((data) => data).handler(listVideos_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const kind = data.kind ?? "all";
	const q = data.q?.trim() ?? "";
	const handle = data.handle?.trim() ?? "";
	const whereShort = kind === "short" ? "and v.is_short = true" : kind === "long" ? "and v.is_short = false" : "";
	const params = [];
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
	return (await sql.query(text, params)).map(mapVideo);
});
async function fetchVideo(id) {
	const rows = await (await getSql())`
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
var getVideo_createServerFn_handler = createServerRpc({
	id: "4ae16f52318a452c69be0dfc49359d969416bc422f19a3df6a39a247ec0486d1",
	name: "getVideo",
	filename: "src/lib/api.ts"
}, (opts) => getVideo.__executeServer(opts));
var getVideo = createServerFn({ method: "GET" }).validator((id) => id).handler(getVideo_createServerFn_handler, async ({ data: id }) => fetchVideo(id));
var listComments_createServerFn_handler = createServerRpc({
	id: "5e9bb38a2405a44cf900912cb0cc5b0a320aa221acef5a9b7c51cf64c225356c",
	name: "listComments",
	filename: "src/lib/api.ts"
}, (opts) => listComments.__executeServer(opts));
var listComments = createServerFn({ method: "GET" }).validator((videoId) => videoId).handler(listComments_createServerFn_handler, async ({ data: videoId }) => {
	return (await (await getSql())`
      select c.id, c.video_id, c.user_id, c.body, c.created_at,
             p.handle, p.display_name, p.avatar_url
      from comments c
      join profiles p on p.user_id = c.user_id
      where c.video_id = ${videoId} and c.status = 'visible'
      order by c.created_at desc
      limit 80
    `).map(mapComment);
});
var incrementView_createServerFn_handler = createServerRpc({
	id: "8b113ca150650831251a709060f91a6ad4b020d6466bc845b7ca470340852028",
	name: "incrementView",
	filename: "src/lib/api.ts"
}, (opts) => incrementView.__executeServer(opts));
var incrementView = createServerFn({ method: "POST" }).validator((id) => id).handler(incrementView_createServerFn_handler, async ({ data: id }) => {
	await (await getSql())`update videos set view_count = view_count + 1 where id = ${id} and status = 'published'`;
	return { ok: true };
});
var listModeration_createServerFn_handler = createServerRpc({
	id: "5c080872ad9c4ef4315502855d49b2f2afae504b1389348f52708c1c1b13780c",
	name: "listModeration",
	filename: "src/lib/api.ts"
}, (opts) => listModeration.__executeServer(opts));
var listModeration = createServerFn({ method: "GET" }).handler(listModeration_createServerFn_handler, async () => {
	return (await (await getSql())`
    select id, user_id, video_id, action, category, severity, details, created_at
    from moderation_events
    order by created_at desc
    limit 24
  `).map((r) => ({
		id: r.id,
		userId: r.user_id,
		videoId: r.video_id,
		action: r.action,
		category: r.category,
		severity: r.severity,
		details: r.details,
		createdAt: asIso(r.created_at)
	}));
});
var getChannel_createServerFn_handler = createServerRpc({
	id: "10c5a54eca8ca7e5256edd278c396740f94638f2cf57724345e31d43b5602dcf",
	name: "getChannel",
	filename: "src/lib/api.ts"
}, (opts) => getChannel.__executeServer(opts));
var getChannel = createServerFn({ method: "GET" }).validator((handle) => handle).handler(getChannel_createServerFn_handler, async ({ data: handle }) => {
	const rows = await (await getSql())`
      select
        p.*,
        (select count(*) from follows f where f.creator_id = p.user_id) as follower_count,
        (select count(*) from videos v where v.user_id = p.user_id and v.status = 'published') as video_count
      from profiles p
      where p.handle = ${handle}
    `;
	return rows[0] ? mapProfile(rows[0]) : null;
});
var ensureMyProfile_createServerFn_handler = createServerRpc({
	id: "de5eaaebf28ac8bb41799d8391fcd2e0dcfdfedb1072b18fa83f60560fcd0b33",
	name: "ensureMyProfile",
	filename: "src/lib/api.ts"
}, (opts) => ensureMyProfile.__executeServer(opts));
var ensureMyProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(ensureMyProfile_createServerFn_handler, async ({ context, data }) => {
	const existing = await getProfileRow(context.userId);
	if (existing) return existing;
	const sql = await getSql();
	const base = slugify(data.displayName || "member");
	let handle = base;
	for (let i = 0; i < 8; i += 1) {
		if (!(await sql`select handle from profiles where handle = ${handle}`)[0]) break;
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
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "22a50234c6834efe75f77295bd1caf7f4acbbd2c9125cf8814913c6d6980e0c8",
	name: "getMyProfile",
	filename: "src/lib/api.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMyProfile_createServerFn_handler, async ({ context }) => getProfileRow(context.userId));
var listMyVideos_createServerFn_handler = createServerRpc({
	id: "32e7bcc8246f269566c11f952fe2c41279a1f1a7fba653ae7976ab719480bb64",
	name: "listMyVideos",
	filename: "src/lib/api.ts"
}, (opts) => listMyVideos.__executeServer(opts));
var listMyVideos = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyVideos_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select
        v.id, v.user_id, v.title, v.description, v.tags, v.src_url, v.poster_url,
        v.duration_sec, v.is_short, v.status, v.takedown_reason, v.takedown_category,
        v.view_count, v.like_count, v.comment_count, v.created_at,
        p.handle, p.display_name, p.avatar_url
      from videos v
      join profiles p on p.user_id = v.user_id
      where v.user_id = ${context.userId}
      order by v.created_at desc
    `).map(mapVideo);
});
var myLikedIds_createServerFn_handler = createServerRpc({
	id: "f44c34b2fb26657020fd038b867173b688a48533976ba5ec38dce4419b33768a",
	name: "myLikedIds",
	filename: "src/lib/api.ts"
}, (opts) => myLikedIds.__executeServer(opts));
var myLikedIds = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(myLikedIds_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select video_id from likes where user_id = ${context.userId}
    `).map((r) => r.video_id);
});
var myFollowedIds_createServerFn_handler = createServerRpc({
	id: "f7088ddfaca8a1e8ba19ea583dda5034ea1a2f6be5f7dc9e027d565b0f9c315c",
	name: "myFollowedIds",
	filename: "src/lib/api.ts"
}, (opts) => myFollowedIds.__executeServer(opts));
var myFollowedIds = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(myFollowedIds_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select creator_id from follows where follower_id = ${context.userId}
    `).map((r) => r.creator_id);
});
var toggleLike_createServerFn_handler = createServerRpc({
	id: "a6f84edd865bbbaa65abf800a22c63158008fde8fe7fcade6b46617587767a29",
	name: "toggleLike",
	filename: "src/lib/api.ts"
}, (opts) => toggleLike.__executeServer(opts));
var toggleLike = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((videoId) => videoId).handler(toggleLike_createServerFn_handler, async ({ context, data: videoId }) => {
	await requireActivePoster(context.userId);
	const sql = await getSql();
	if ((await sql`
      select user_id from likes where user_id = ${context.userId} and video_id = ${videoId}
    `)[0]) {
		await sql`delete from likes where user_id = ${context.userId} and video_id = ${videoId}`;
		await sql`update videos set like_count = greatest(like_count - 1, 0) where id = ${videoId}`;
		return { liked: false };
	}
	await sql`insert into likes (user_id, video_id) values (${context.userId}, ${videoId})`;
	await sql`update videos set like_count = like_count + 1 where id = ${videoId}`;
	return { liked: true };
});
var toggleFollow_createServerFn_handler = createServerRpc({
	id: "af968e8569b0807af525af9a1dbff53db4e355c461df5638aa0881440b8dccac",
	name: "toggleFollow",
	filename: "src/lib/api.ts"
}, (opts) => toggleFollow.__executeServer(opts));
var toggleFollow = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((creatorId) => creatorId).handler(toggleFollow_createServerFn_handler, async ({ context, data: creatorId }) => {
	if (creatorId === context.userId) return { following: false };
	await requireActivePoster(context.userId);
	const sql = await getSql();
	if ((await sql`
      select follower_id from follows where follower_id = ${context.userId} and creator_id = ${creatorId}
    `)[0]) {
		await sql`delete from follows where follower_id = ${context.userId} and creator_id = ${creatorId}`;
		return { following: false };
	}
	await sql`insert into follows (follower_id, creator_id) values (${context.userId}, ${creatorId})`;
	return { following: true };
});
var addComment_createServerFn_handler = createServerRpc({
	id: "25b6412aceff27134358c97e01104a602869247612bdb1e0387460ec42dae950",
	name: "addComment",
	filename: "src/lib/api.ts"
}, (opts) => addComment.__executeServer(opts));
var addComment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({
	videoId: data.videoId,
	body: data.body.trim().slice(0, 500)
})).handler(addComment_createServerFn_handler, async ({ context, data }) => {
	await requireActivePoster(context.userId);
	if (!data.body) return { guard: { ok: true } };
	const scan = await scanContent({
		title: "",
		description: data.body,
		kind: "comment"
	});
	if (scan.action !== "allow") {
		await banUser(context.userId, scan.reason, scan.categories[0] ?? "policy-violation");
		await logEvent({
			userId: context.userId,
			action: "ban",
			category: scan.categories[0] ?? "policy-violation",
			severity: scan.severity,
			details: `Comment blocked: ${scan.reason}`
		});
		return { guard: {
			ok: false,
			banned: true,
			action: "ban",
			category: scan.categories[0] ?? "policy-violation",
			reason: scan.reason
		} };
	}
	const sql = await getSql();
	const id = crypto.randomUUID();
	await sql`
      insert into comments (id, video_id, user_id, body)
      values (${id}, ${data.videoId}, ${context.userId}, ${data.body})
    `;
	await sql`update videos set comment_count = comment_count + 1 where id = ${data.videoId}`;
	const rows = await sql`
      select c.id, c.video_id, c.user_id, c.body, c.created_at,
             p.handle, p.display_name, p.avatar_url
      from comments c
      join profiles p on p.user_id = c.user_id
      where c.id = ${id}
    `;
	return {
		comment: rows[0] ? mapComment(rows[0]) : void 0,
		guard: { ok: true }
	};
});
var publishVideo_createServerFn_handler = createServerRpc({
	id: "718f5f1b806943ac461c23eada46a02dfc017a1dda97a2077a1ed66a883f0406",
	name: "publishVideo",
	filename: "src/lib/api.ts"
}, (opts) => publishVideo.__executeServer(opts));
var publishVideo = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({
	title: data.title.trim().slice(0, 120),
	description: data.description.trim().slice(0, 2e3),
	tags: data.tags.trim().slice(0, 200),
	srcUrl: data.srcUrl.slice(0, 24e5),
	posterUrl: data.posterUrl?.slice(0, 4e5) ?? null,
	durationSec: Math.max(0, Math.round(data.durationSec ?? 0)),
	isShort: Boolean(data.isShort)
})).handler(publishVideo_createServerFn_handler, async ({ context, data }) => {
	await requireActivePoster(context.userId);
	if (!data.title || !data.srcUrl) throw new Error("Title and video are required.");
	const scan = await scanContent({
		title: data.title,
		description: data.description,
		tags: data.tags,
		kind: "video",
		posterDataUrl: data.posterUrl?.startsWith("data:image/") ? data.posterUrl : null
	});
	const id = crypto.randomUUID();
	if (scan.action !== "allow") {
		await (await getSql())`
        insert into videos (
          id, user_id, title, description, tags, src_url, poster_url, duration_sec, is_short,
          status, takedown_reason, takedown_category
        ) values (
          ${id}, ${context.userId}, ${data.title}, ${data.description}, ${data.tags},
          ${""}, ${null}, ${data.durationSec}, ${data.isShort},
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
			details: scan.reason
		});
		return { guard: {
			ok: false,
			banned: true,
			action: "ban",
			category: scan.categories[0] ?? "policy-violation",
			reason: scan.reason
		} };
	}
	const sql = await getSql();
	await sql`
      insert into videos (
        id, user_id, title, description, tags, src_url, poster_url, duration_sec, is_short, status
      ) values (
        ${id}, ${context.userId}, ${data.title}, ${data.description}, ${data.tags},
        ${data.srcUrl}, ${data.posterUrl}, ${data.durationSec}, ${data.isShort}, ${"published"}
      )
    `;
	const inserted = await sql`
      select
        v.id, v.user_id, v.title, v.description, v.tags, v.src_url, v.poster_url,
        v.duration_sec, v.is_short, v.status, v.takedown_reason, v.takedown_category,
        v.view_count, v.like_count, v.comment_count, v.created_at,
        p.handle, p.display_name, p.avatar_url
      from videos v
      join profiles p on p.user_id = v.user_id
      where v.id = ${id}
    `;
	return {
		video: inserted[0] ? mapVideo(inserted[0]) : void 0,
		guard: { ok: true }
	};
});
var reportVideo_createServerFn_handler = createServerRpc({
	id: "2a96486f9d0fb2ac0e6a2624c9c3cb5614f08346d981ee533b6e8252971edccd",
	name: "reportVideo",
	filename: "src/lib/api.ts"
}, (opts) => reportVideo.__executeServer(opts));
var reportVideo = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => data).handler(reportVideo_createServerFn_handler, async ({ context, data }) => {
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
		kind: "video"
	});
	const isSeed = video.userId.startsWith("seed-");
	const child = data.reason === "child-safety" && !isSeed;
	if (scan.action !== "allow" || child) {
		const reason = child ? "Removed after a child-safety report. Pulse Guard takes these reports immediately." : scan.reason;
		const category = child ? "child-safety" : scan.categories[0] ?? "policy-violation";
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
			details: `Report ${data.reason}: ${reason}`
		});
		await sql`update reports set status = 'actioned' where id = ${reportId}`;
		return { guard: {
			ok: false,
			banned: true,
			action: "ban",
			category,
			reason
		} };
	}
	await sql`update reports set status = 'reviewed' where id = ${reportId}`;
	return { guard: { ok: true } };
});
var restoreMyAccount_createServerFn_handler = createServerRpc({
	id: "90ab717bee1aed4155327fa65c8084ab02362b3845f2006374e0766930fd4ff6",
	name: "restoreMyAccount",
	filename: "src/lib/api.ts"
}, (opts) => restoreMyAccount.__executeServer(opts));
var restoreMyAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(restoreMyAccount_createServerFn_handler, async ({ context }) => {
	await (await getSql())`
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
		details: "Account restored after Guard lock."
	});
	return getProfileRow(context.userId);
});
//#endregion
export { addComment_createServerFn_handler, ensureMyProfile_createServerFn_handler, getChannel_createServerFn_handler, getMyProfile_createServerFn_handler, getVideo_createServerFn_handler, incrementView_createServerFn_handler, listComments_createServerFn_handler, listModeration_createServerFn_handler, listMyVideos_createServerFn_handler, listVideos_createServerFn_handler, myFollowedIds_createServerFn_handler, myLikedIds_createServerFn_handler, publishVideo_createServerFn_handler, reportVideo_createServerFn_handler, restoreMyAccount_createServerFn_handler, toggleFollow_createServerFn_handler, toggleLike_createServerFn_handler };
