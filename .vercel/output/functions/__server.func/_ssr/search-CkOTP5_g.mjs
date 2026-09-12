import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Route$6 } from "./router-BOwyOPdB.mjs";
import { n as VideoCard } from "./video-card-DRNykNRu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-CkOTP5_g.js
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const videos = Route$6.useLoaderData();
	const { q } = Route$6.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold tracking-tight",
				children: q ? `Results for “${q}”` : "Search"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted",
				children: [
					videos.length,
					" ",
					videos.length === 1 ? "video" : "videos"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3",
				children: videos.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, { video: v }, v.id))
			}),
			!videos.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-10 text-sm text-subtle",
				children: "Nothing matched. Try a creator or a landscape."
			}) : null
		]
	});
}
//#endregion
export { SearchPage as component };
