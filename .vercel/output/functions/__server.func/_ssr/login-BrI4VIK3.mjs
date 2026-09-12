import { C as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn } from "./client-B40BzJxt.mjs";
import { t as GROK_PROVIDERS } from "./server-BNcj8hZl.mjs";
import { u as PulseMark } from "./router-BOwyOPdB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BrI4VIK3.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-[70dvh] place-items-center px-5 py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseMark, { className: "size-12" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-5 font-display text-2xl font-semibold tracking-tight",
					children: "Sign in to Pulse"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: "Posting, likes, comments, and reports need an account. Watching is open. Pulse Guard scans every upload."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 flex flex-col gap-2",
					children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => signIn(p.providerId, { callbackURL: "/" }),
						className: "h-12 w-full rounded-md border border-border bg-surface text-sm font-medium text-fg transition-colors duration-150 hover:bg-raised",
						children: ["Continue with ", p.label]
					}, p.providerId))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-center text-xs text-subtle",
					children: [
						"By continuing you agree to Pulse Guard.",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/safety",
							className: "underline underline-offset-4",
							children: "Read the standards"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { Login as component };
