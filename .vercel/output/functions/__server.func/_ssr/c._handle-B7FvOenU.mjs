import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as compactNumber } from "./utils-B7wQydhJ.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as useCurrentUserState, b as toggleFollow, d as Button, g as myFollowedIds, r as Route$2 } from "./router-BOwyOPdB.mjs";
import { n as VideoCard } from "./video-card-DRNykNRu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/c._handle-B7FvOenU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChannelPage() {
	const { channel, videos } = Route$2.useLoaderData();
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [following, setFollowing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user || !channel) return;
		myFollowedIds().then((ids) => setFollowing(ids.includes(channel.userId))).catch(() => {});
	}, [user, channel]);
	if (!channel) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-5 py-20 text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl font-semibold",
			children: "Channel not found"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 py-8 sm:px-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-4",
			children: [
				channel.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: channel.avatarUrl,
					alt: "",
					className: "size-20 rounded-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-20 place-items-center rounded-full bg-raised font-display text-2xl",
					children: channel.displayName.charAt(0)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-semibold tracking-tight",
							children: channel.displayName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted",
							children: [
								"@",
								channel.handle,
								" · ",
								compactNumber(channel.followerCount),
								" followers · ",
								channel.videoCount,
								" ",
								"videos"
							]
						}),
						channel.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 max-w-xl text-sm text-muted",
							children: channel.bio
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: following ? "outline" : "default",
					onClick: () => {
						if (isPending) return;
						if (!user) {
							navigate({ to: "/login" });
							return;
						}
						setFollowing((v) => !v);
						toggleFollow({ data: channel.userId }).catch(() => toast.error("Could not follow."));
					},
					children: following ? "Following" : "Follow"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3",
			children: videos.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, { video: v }, v.id))
		})]
	});
}
//#endregion
export { ChannelPage as component };
