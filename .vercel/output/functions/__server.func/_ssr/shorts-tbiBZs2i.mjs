import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as compactNumber } from "./utils-B7wQydhJ.mjs";
import { t as REPORT_REASONS } from "./moderation-Bq8v8ftU.mjs";
import { _ as ChevronUp, f as MessageCircle, h as Flag, m as Heart, n as Volume2, t as VolumeX, y as ChevronDown } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as useCurrentUserState, _ as myLikedIds, b as toggleFollow, g as myFollowedIds, i as Route$5, x as toggleLike, y as reportVideo } from "./router-BOwyOPdB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shorts-tbiBZs2i.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function DropFeed({ videos, startId, liked, following, onLike, onFollow, onReport }) {
	const scroller = (0, import_react.useRef)(null);
	const [active, setActive] = (0, import_react.useState)(startId ?? videos[0]?.id);
	const [muted, setMuted] = (0, import_react.useState)(true);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!startId) return;
		(scroller.current?.querySelector(`[data-drop-id="${startId}"]`))?.scrollIntoView({ block: "start" });
	}, [startId]);
	(0, import_react.useEffect)(() => {
		const root = scroller.current;
		if (!root) return;
		const obs = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				const slide = entry.target;
				const video = slide.querySelector("video");
				if (!video) continue;
				if (entry.isIntersecting && entry.intersectionRatio >= .65) {
					const id = slide.dataset.dropId;
					if (id) setActive(id);
					video.muted = muted;
					video.play().catch(() => {});
				} else video.pause();
			}
		}, {
			root,
			threshold: [.65]
		});
		root.querySelectorAll("[data-drop-id]").forEach((el) => obs.observe(el));
		return () => obs.disconnect();
	}, [videos, muted]);
	(0, import_react.useEffect)(() => {
		function onKey(e) {
			if (e.key === "ArrowDown" || e.key === "j") {
				e.preventDefault();
				step(1);
			} else if (e.key === "ArrowUp" || e.key === "k") {
				e.preventDefault();
				step(-1);
			} else if (e.key === "m") setMuted((v) => !v);
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});
	function step(dir) {
		const next = videos[videos.findIndex((v) => v.id === active) + dir];
		if (!next) return;
		(scroller.current?.querySelector(`[data-drop-id="${next.id}"]`))?.scrollIntoView({
			block: "start",
			behavior: "smooth"
		});
	}
	if (!videos.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-[100dvh] place-items-center bg-bg text-muted",
		children: "Nothing in Drop yet."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-[100dvh] bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto flex h-full max-w-[520px] items-stretch lg:max-w-[720px]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: scroller,
				className: "drop-scroller h-full w-full snap-y snap-mandatory overflow-y-auto",
				children: videos.map((video) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"data-drop-id": video.id,
					className: "relative flex h-[100dvh] snap-start snap-always items-stretch",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative h-full flex-1 overflow-hidden bg-black md:mx-auto md:max-w-[420px] md:rounded-none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								src: video.srcUrl,
								poster: video.posterUrl ?? void 0,
								loop: true,
								playsInline: true,
								muted,
								className: "absolute inset-0 size-full object-cover",
								onClick: () => setMuted((v) => !v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "absolute inset-x-0 bottom-0 bg-linear-to-t from-bg/90 via-bg/40 to-transparent px-4 pt-24 pb-24 md:pb-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/c/$handle",
										params: { handle: video.handle },
										className: "flex items-center gap-2",
										children: [video.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: video.avatarUrl,
											alt: "",
											className: "size-8 rounded-full object-cover"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid size-8 place-items-center rounded-full bg-raised text-xs",
											children: video.displayName.charAt(0)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-medium",
											children: ["@", video.handle]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 max-w-[34ch] text-[15px] font-medium leading-snug",
										children: video.title
									}),
									video.description ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 line-clamp-2 max-w-[36ch] text-sm text-muted",
										children: video.description
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setMuted((v) => !v),
								className: "absolute top-4 right-4 grid size-10 place-items-center rounded-full bg-bg/45 text-fg",
								"aria-label": muted ? "Unmute" : "Mute",
								children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "absolute right-3 bottom-28 z-10 flex flex-col items-center gap-4 md:static md:justify-end md:px-4 md:pb-16",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailButton, {
								label: compactNumber(video.likeCount),
								active: liked.has(video.id),
								onClick: () => onLike(video.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: liked.has(video.id) ? "size-6 fill-danger text-danger" : "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailButton, {
								label: "Watch",
								onClick: () => navigate({
									to: "/watch/$videoId",
									params: { videoId: video.id }
								}),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailButton, {
								label: "Report",
								onClick: () => onReport(video.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onFollow(video.userId),
								className: "relative mt-1",
								"aria-label": "Follow",
								children: [video.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: video.avatarUrl,
									alt: "",
									className: "size-12 rounded-full object-cover ring-2 ring-fg"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-12 place-items-center rounded-full bg-raised ring-2 ring-fg",
									children: video.displayName.charAt(0)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute -bottom-2 left-1/2 grid size-5 -translate-x-1/2 place-items-center rounded-full bg-fg text-[11px] font-semibold text-bg",
									children: following.has(video.userId) ? "✓" : "+"
								})]
							})
						]
					})]
				}, video.id))
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-2 lg:flex",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "pointer-events-auto grid size-10 place-items-center rounded-full border border-border bg-surface text-fg",
				onClick: () => step(-1),
				"aria-label": "Previous",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "pointer-events-auto grid size-10 place-items-center rounded-full border border-border bg-surface text-fg",
				onClick: () => step(1),
				"aria-label": "Next",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4" })
			})]
		})]
	});
}
function RailButton({ children, label, onClick, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "flex flex-col items-center gap-1 text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: active ? "grid size-12 place-items-center rounded-full bg-fg/15" : "grid size-12 place-items-center rounded-full bg-bg/40",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-[11px] font-medium tabular-nums",
			children: label
		})]
	});
}
function ShortsPage() {
	const videos = Route$5.useLoaderData();
	const { start } = Route$5.useSearch();
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [liked, setLiked] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [following, setFollowing] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [reportFor, setReportFor] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		myLikedIds().then((ids) => setLiked(new Set(ids))).catch(() => {});
		myFollowedIds().then((ids) => setFollowing(new Set(ids))).catch(() => {});
	}, [user]);
	function needAuth() {
		if (isPending) return true;
		if (!user) {
			navigate({ to: "/login" });
			return true;
		}
		return false;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropFeed, {
		videos,
		startId: start,
		liked,
		following,
		onLike: (id) => {
			if (needAuth()) return;
			setLiked((prev) => {
				const next = new Set(prev);
				if (next.has(id)) next.delete(id);
				else next.add(id);
				return next;
			});
			toggleLike({ data: id }).catch(() => toast.error("Could not like this."));
		},
		onFollow: (creatorId) => {
			if (needAuth()) return;
			setFollowing((prev) => {
				const next = new Set(prev);
				if (next.has(creatorId)) next.delete(creatorId);
				else next.add(creatorId);
				return next;
			});
			toggleFollow({ data: creatorId }).catch(() => toast.error("Could not follow."));
		},
		onReport: (id) => {
			if (needAuth()) return;
			setReportFor(id);
		}
	}), reportFor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportSheet, {
		onClose: () => setReportFor(null),
		onPick: (reason) => {
			reportVideo({ data: {
				videoId: reportFor,
				reason
			} }).then((r) => {
				if (!r.guard.ok) toast.message("Pulse Guard took this down.");
				else toast.success("Report received. Guard reviewed it.");
			}).catch(() => toast.error("Report failed.")).finally(() => setReportFor(null));
		}
	}) : null] });
}
function ReportSheet({ onClose, onPick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-end bg-bg/60 sm:place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-t-xl border border-border bg-surface p-5 sm:rounded-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-semibold",
					children: "Report this Drop"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Pulse Guard reviews every report. Child-safety reports take the video down immediately."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex flex-col gap-1",
					children: REPORT_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onPick(r.id),
						className: "h-11 rounded-md px-3 text-left text-sm hover:bg-raised",
						children: r.label
					}, r.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "mt-3 h-10 w-full text-sm text-muted",
					children: "Cancel"
				})
			]
		})
	});
}
//#endregion
export { ShortsPage as component };
