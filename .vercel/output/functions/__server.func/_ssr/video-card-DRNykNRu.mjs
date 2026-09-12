import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatDuration, l as timeAgo, r as compactNumber } from "./utils-B7wQydhJ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/video-card-DRNykNRu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function VideoCard({ video, compact = false }) {
	const vid = (0, import_react.useRef)(null);
	function play() {
		const el = vid.current;
		if (!el) return;
		el.muted = true;
		el.play().catch(() => {});
	}
	function stop() {
		const el = vid.current;
		if (!el) return;
		el.pause();
		el.currentTime = 0;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "group",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/watch/$videoId",
			params: { videoId: video.id },
			className: "block",
			onMouseEnter: play,
			onMouseLeave: stop,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: compact ? "relative aspect-video overflow-hidden rounded-md bg-raised" : "relative aspect-video overflow-hidden rounded-lg bg-raised",
				children: [
					video.posterUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: video.posterUrl,
						alt: "",
						className: "absolute inset-0 size-full object-cover transition-opacity duration-300 group-hover:opacity-0"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: vid,
						src: video.srcUrl,
						poster: video.posterUrl ?? void 0,
						muted: true,
						playsInline: true,
						preload: "metadata",
						className: "absolute inset-0 size-full object-cover"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "absolute right-2 bottom-2 rounded-xs bg-bg/80 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-fg",
						children: formatDuration(video.durationSec)
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: compact ? "mt-2 flex gap-2" : "mt-3 flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/c/$handle",
				params: { handle: video.handle },
				className: "shrink-0",
				children: video.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: video.avatarUrl,
					alt: "",
					className: compact ? "size-7 rounded-full object-cover" : "size-9 rounded-full object-cover"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-9 place-items-center rounded-full bg-raised text-xs font-medium",
					children: video.displayName.charAt(0)
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/watch/$videoId",
						params: { videoId: video.id },
						className: "line-clamp-2 text-[15px] font-medium leading-snug text-fg",
						children: video.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/c/$handle",
						params: { handle: video.handle },
						className: "mt-1 block truncate text-sm text-muted hover:text-fg",
						children: video.displayName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-subtle tabular-nums",
						children: [
							compactNumber(video.viewCount),
							" views · ",
							timeAgo(video.createdAt)
						]
					})
				]
			})]
		})]
	});
}
function DropShelfCard({ video }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/shorts",
		search: { start: video.id },
		className: "group relative w-[148px] shrink-0 snap-start overflow-hidden rounded-lg bg-raised sm:w-[168px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[9/16]",
			children: [video.posterUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: video.posterUrl,
				alt: "",
				className: "absolute inset-0 size-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				src: video.srcUrl,
				muted: true,
				playsInline: true,
				className: "absolute inset-0 size-full object-cover"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 bg-linear-to-t from-bg/80 to-transparent p-2.5 pt-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-xs font-medium leading-snug text-fg",
					children: video.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-[11px] text-muted tabular-nums",
					children: [compactNumber(video.viewCount), " views"]
				})]
			})]
		})
	});
}
//#endregion
export { VideoCard as n, DropShelfCard as t };
