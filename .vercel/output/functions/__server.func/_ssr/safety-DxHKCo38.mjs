import { C as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { l as timeAgo } from "./utils-B7wQydhJ.mjs";
import { a as Shield } from "../_libs/lucide-react.mjs";
import { o as Route$7 } from "./router-BOwyOPdB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/safety-DxHKCo38.js
var import_jsx_runtime = require_jsx_runtime();
var RULES = [
	{
		title: "No sexual content",
		body: "Nudity, pornography, fetish content, and sexualization of anyone are banned. Suggestive titles are enough."
	},
	{
		title: "No graphic violence",
		body: "Gore, real harm, torture, and glorified weapons are taken down. Fictional film violence in credited cinema may stay if it is not the point of the upload."
	},
	{
		title: "No hate or harassment",
		body: "Attacks on people or groups, slurs, doxxing, and threats ban the account on the first strike."
	},
	{
		title: "No self-harm",
		body: "Instructions, encouragement, or graphic depiction of suicide or self-injury are removed immediately."
	},
	{
		title: "No child endangerment",
		body: "Any sexual or exploitative content involving minors is a permanent ban. Reports in this category take the video down on sight."
	},
	{
		title: "No scams or crime",
		body: "Fraud, drug sales, weapons trafficking, and how-to crime do not get a warning."
	}
];
function SafetyPage() {
	const events = Route$7.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-11 place-items-center rounded-md bg-raised",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
					children: "Pulse Guard"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold tracking-tight",
					children: "Standards"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 max-w-2xl text-sm leading-relaxed text-muted",
				children: "Guard scans every title, description, tag, thumbnail, and comment before it is public. A violation takes the video down and bans the account. There is no strike theatre for severe harm."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-8 space-y-4",
				children: RULES.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg border border-border bg-surface p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs tabular-nums text-subtle",
							children: String(i + 1).padStart(2, "0")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 font-display text-base font-semibold",
							children: r.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm leading-relaxed text-muted",
							children: r.body
						})
					]
				}, r.title))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Recent enforcement"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-subtle",
						children: "Public log. Account names are not shown."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "mt-4 divide-y divide-border rounded-lg border border-border",
						children: [events.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "px-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium capitalize",
									children: [
										e.action,
										" · ",
										e.category
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-subtle tabular-nums",
									children: timeAgo(e.createdAt)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: e.details
							})]
						}, e.id)), !events.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "px-4 py-6 text-sm text-subtle",
							children: "No events yet."
						}) : null]
					})
				]
			})
		]
	});
}
//#endregion
export { SafetyPage as component };
