import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as cn } from "./utils-B7wQydhJ.mjs";
import { s as ShieldAlert } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as useCurrentUserState, c as RedirectToSignIn, d as Button, l as Input, v as publishVideo } from "./router-BOwyOPdB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/upload-DV687Pjj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg placeholder:text-subtle", "transition-[border-color,box-shadow] duration-150 ease-out", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg/35", className),
		...props
	});
}
var STOCK_CLIPS = [
	{
		id: "cliff",
		title: "Cliff swell",
		src: "/shorts/cliff-swell.mp4",
		poster: "/posters/cliff-swell.jpg",
		isShort: true,
		duration: 6
	},
	{
		id: "blazes",
		title: "High desert firelight",
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
		poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
		isShort: true,
		duration: 15
	},
	{
		id: "joyrides",
		title: "Late light joyride",
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
		poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg",
		isShort: false,
		duration: 15
	},
	{
		id: "escapes",
		title: "Escapes",
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
		poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
		isShort: false,
		duration: 15
	},
	{
		id: "bunny",
		title: "Open movie clip",
		src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
		poster: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
		isShort: false,
		duration: 596
	}
];
function UploadPage() {
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [tags, setTags] = (0, import_react.useState)("");
	const [isShort, setIsShort] = (0, import_react.useState)(true);
	const [stockId, setStockId] = (0, import_react.useState)(STOCK_CLIPS[0].id);
	const [fileUrl, setFileUrl] = (0, import_react.useState)(null);
	const [posterUrl, setPosterUrl] = (0, import_react.useState)(null);
	const [durationSec, setDurationSec] = (0, import_react.useState)(0);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [fileName, setFileName] = (0, import_react.useState)(null);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "px-5 py-16 text-sm text-muted",
		children: "Checking session…"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	async function onFile(file) {
		if (file.size > 18e5) {
			toast.error("Keep uploads under 1.8 MB, or pick a Pulse clip.");
			return;
		}
		const dataUrl = await readFile(file);
		setFileUrl(dataUrl);
		setFileName(file.name);
		const poster = await capturePoster(file);
		setPosterUrl(poster);
		const duration = await readDuration(file);
		setDurationSec(duration);
		setIsShort(duration > 0 && duration <= 60);
	}
	async function submit(e) {
		e.preventDefault();
		const stock = STOCK_CLIPS.find((c) => c.id === stockId);
		const srcUrl = fileUrl ?? stock?.src;
		if (!srcUrl || !title.trim()) {
			toast.error("Add a title and a clip.");
			return;
		}
		setBusy(true);
		try {
			const result = await publishVideo({ data: {
				title,
				description,
				tags,
				srcUrl,
				posterUrl: posterUrl ?? stock?.poster ?? null,
				durationSec: fileUrl ? durationSec : stock?.duration ?? 0,
				isShort: fileUrl ? isShort : Boolean(stock?.isShort || isShort)
			} });
			if (!result.guard.ok) {
				toast.error(result.guard.reason);
				window.location.assign("/");
				return;
			}
			toast.success("Published.");
			if (result.video?.isShort) navigate({
				to: "/shorts",
				search: { start: result.video.id }
			});
			else if (result.video) navigate({
				to: "/watch/$videoId",
				params: { videoId: result.video.id }
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Publish failed.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-2xl px-4 py-8 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] font-medium uppercase tracking-[0.18em] text-subtle",
				children: "Studio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-1 font-display text-3xl font-semibold tracking-tight",
				children: "Post a video"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm leading-relaxed text-muted",
				children: "Pulse Guard reads the title, description, tags, and thumbnail before anything goes live. Sexual content, violence, hate, self-harm, and illegal activity get the video taken down and the account banned."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-start gap-3 rounded-lg border border-border bg-surface p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "mt-0.5 size-4 shrink-0 text-danger" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm leading-relaxed text-muted",
					children: [
						"Zero tolerance. If you want to see Guard work, use",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "font-medium text-fg underline underline-offset-4",
							onClick: () => {
								setTitle("uncensored graphic gore compilation");
								setDescription("A test of Pulse Guard. This should never publish.");
								setTags("nsfw, gore");
							},
							children: "this banned title"
						}),
						"— do not actually post harm."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-8 space-y-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "Title"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: title,
							onChange: (e) => setTitle(e.target.value),
							maxLength: 120,
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "Description"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: description,
							onChange: (e) => setDescription(e.target.value),
							maxLength: 2e3
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1.5 block text-sm font-medium",
							children: "Tags"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: tags,
							onChange: (e) => setTags(e.target.value),
							placeholder: "travel, food, film",
							maxLength: 200
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "mb-2 text-sm font-medium",
						children: "Format"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: isShort,
							onClick: () => setIsShort(true),
							children: "Drop (vertical)"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							pressed: !isShort,
							onClick: () => setIsShort(false),
							children: "Watch (landscape)"
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "mb-2 text-sm font-medium",
						children: "Pulse clip"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-3",
						children: STOCK_CLIPS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								setStockId(c.id);
								setFileUrl(null);
								setFileName(null);
								setPosterUrl(c.poster);
								setIsShort(c.isShort);
							},
							className: cn("overflow-hidden rounded-md border text-left", stockId === c.id && !fileUrl ? "border-fg" : "border-border"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: c.poster,
								alt: "",
								className: "aspect-video w-full object-cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block px-2 py-1.5 text-xs text-muted",
								children: c.title
							})]
						}, c.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1.5 block text-sm font-medium",
								children: "Or upload your own (under 1.8 MB)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "file",
								accept: "video/mp4,video/webm,video/quicktime",
								onChange: (e) => {
									const file = e.target.files?.[0];
									if (file) onFile(file);
								}
							}),
							fileName ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: fileName
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							children: busy ? "Scanning with Guard…" : "Publish"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "ghost",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/safety",
								children: "Standards"
							})
						})]
					})
				]
			})
		]
	});
}
function Toggle({ pressed, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: cn("h-10 rounded-full px-4 text-sm font-medium", pressed ? "bg-fg text-bg" : "bg-raised text-muted"),
		children
	});
}
function readFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onerror = () => reject(/* @__PURE__ */ new Error("Could not read file"));
		reader.onload = () => resolve(String(reader.result));
		reader.readAsDataURL(file);
	});
}
function capturePoster(file) {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const video = document.createElement("video");
		video.src = url;
		video.muted = true;
		video.playsInline = true;
		video.onloadeddata = () => {
			video.currentTime = Math.min(.4, (video.duration || 1) * .1);
		};
		video.onseeked = () => {
			const canvas = document.createElement("canvas");
			const w = 480;
			const h = Math.max(1, Math.round(video.videoHeight / (video.videoWidth || 1) * w));
			canvas.width = w;
			canvas.height = h;
			canvas.getContext("2d")?.drawImage(video, 0, 0, w, h);
			URL.revokeObjectURL(url);
			resolve(canvas.toDataURL("image/jpeg", .7));
		};
		video.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(null);
		};
	});
}
function readDuration(file) {
	return new Promise((resolve) => {
		const url = URL.createObjectURL(file);
		const video = document.createElement("video");
		video.src = url;
		video.onloadedmetadata = () => {
			const d = Number.isFinite(video.duration) ? video.duration : 0;
			URL.revokeObjectURL(url);
			resolve(d);
		};
		video.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(0);
		};
	});
}
//#endregion
export { UploadPage as component };
