import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as compactNumber } from "./utils-B7wQydhJ.mjs";
import { v as ChevronRight } from "../_libs/lucide-react.mjs";
import { s as Route$9 } from "./router-BOwyOPdB.mjs";
import { n as VideoCard, t as DropShelfCard } from "./video-card-DRNykNRu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-FsBS0oIn.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { all, shorts } = Route$9.useLoaderData();
	const featured = all[0];
	const rest = all.slice(1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-3 pt-5 pb-8 sm:px-6",
		children: [
			featured ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "relative mb-8 overflow-hidden rounded-xl bg-raised",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/watch/$videoId",
					params: { videoId: featured.id },
					className: "block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative aspect-[16/9] max-h-[520px] w-full sm:aspect-[21/9]",
						children: [
							featured.posterUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: featured.posterUrl,
								alt: "",
								className: "size-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: featured.srcUrl,
								className: "size-full object-cover",
								muted: true,
								playsInline: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-linear-to-t from-bg via-bg/20 to-transparent" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute right-0 bottom-0 left-0 p-5 sm:p-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-medium uppercase tracking-[0.18em] text-muted",
										children: "Featured"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-1 max-w-xl font-display text-2xl font-semibold tracking-tight sm:text-4xl",
										children: featured.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 max-w-lg text-sm text-muted sm:text-base",
										children: [
											featured.displayName,
											" · ",
											compactNumber(featured.viewCount),
											" views"
										]
									})
								]
							})
						]
					})
				})
			}) : null,
			shorts.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-end justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold tracking-tight",
						children: "Drop"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-subtle",
						children: "Vertical, looping, hard to leave."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/shorts",
						className: "flex items-center gap-1 text-sm text-muted hover:text-fg",
						children: ["Open Drop", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "no-scrollbar flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory",
					children: shorts.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropShelfCard, { video: v }, v.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-lg font-semibold tracking-tight",
				children: "Trending on Pulse"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3",
				children: rest.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, { video: v }, v.id))
			})] })
		]
	});
}
//#endregion
export { Home as component };
