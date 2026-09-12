import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as require_jsx_runtime, x as useNavigate, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as formatDuration, l as timeAgo, n as cn, r as compactNumber } from "./utils-B7wQydhJ.mjs";
import { t as REPORT_REASONS } from "./moderation-Bq8v8ftU.mjs";
import { d as Pause, h as Flag, m as Heart, n as Volume2, o as ShieldOff, t as VolumeX, u as Play } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as useCurrentUserState, _ as myLikedIds, b as toggleFollow, d as Button, f as addComment, g as myFollowedIds, l as Input, m as incrementView, n as Route$1, x as toggleLike, y as reportVideo } from "./router-BOwyOPdB.mjs";
import { n as VideoCard } from "./video-card-DRNykNRu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch._videoId-Crma1OoS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Player({ src, poster, autoPlay = false, className, onEnded }) {
	const ref = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(autoPlay);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [duration, setDuration] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		if (autoPlay) el.play().catch(() => setPlaying(false));
	}, [src, autoPlay]);
	function togglePlay() {
		const el = ref.current;
		if (!el) return;
		if (el.paused) {
			el.play();
			setPlaying(true);
		} else {
			el.pause();
			setPlaying(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative overflow-hidden rounded-lg bg-black", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref,
				src,
				poster: poster ?? void 0,
				playsInline: true,
				className: "aspect-video w-full bg-black object-contain",
				onClick: togglePlay,
				onTimeUpdate: () => {
					const el = ref.current;
					if (!el || !el.duration) return;
					setProgress(el.currentTime / el.duration);
					setDuration(el.duration);
				},
				onPlay: () => setPlaying(true),
				onPause: () => setPlaying(false),
				onEnded,
				onLoadedMetadata: () => setDuration(ref.current?.duration ?? 0)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 flex items-center justify-center",
				children: !playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-16 place-items-center rounded-full bg-bg/55 text-fg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-7 fill-fg" })
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-bg/80 to-transparent px-3 pt-8 pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: togglePlay,
						className: "grid size-9 place-items-center rounded-md text-fg",
						"aria-label": playing ? "Pause" : "Play",
						children: playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4 fill-fg" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-fg" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative h-1 flex-1 overflow-hidden rounded-full bg-fg/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-fg",
							style: { width: `${Math.round(progress * 100)}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "min-w-10 text-right font-mono text-[11px] tabular-nums text-muted",
						children: formatDuration(duration)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							const el = ref.current;
							if (!el) return;
							el.muted = !el.muted;
							setMuted(el.muted);
						},
						className: "grid size-9 place-items-center rounded-md text-fg",
						"aria-label": muted ? "Unmute" : "Mute",
						children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-4" })
					})
				]
			})
		]
	});
}
function WatchPage() {
	const { video, comments: initialComments, related } = Route$1.useLoaderData();
	const { user, isPending } = useCurrentUserState();
	const navigate = useNavigate();
	const [liked, setLiked] = (0, import_react.useState)(false);
	const [likeCount, setLikeCount] = (0, import_react.useState)(video?.likeCount ?? 0);
	const [following, setFollowing] = (0, import_react.useState)(false);
	const [comments, setComments] = (0, import_react.useState)(initialComments);
	const [body, setBody] = (0, import_react.useState)("");
	const [reportOpen, setReportOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!video || video.status !== "published") return;
		incrementView({ data: video.id });
	}, [video]);
	(0, import_react.useEffect)(() => {
		if (!user || !video) return;
		myLikedIds().then((ids) => setLiked(ids.includes(video.id))).catch(() => {});
		myFollowedIds().then((ids) => setFollowing(ids.includes(video.userId))).catch(() => {});
	}, [user, video]);
	function needAuth() {
		if (isPending) return true;
		if (!user) {
			navigate({ to: "/login" });
			return true;
		}
		return false;
	}
	if (!video) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-5 py-20 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-2xl font-semibold",
				children: "This video is gone"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: "It may have been removed by Pulse Guard."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: "Back to Pulse"
				})
			})
		]
	});
	if (video.status === "taken_down") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto max-w-xl px-5 py-20",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-border bg-surface p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-8 text-danger" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-2xl font-semibold",
					children: "Removed by Pulse Guard"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: video.takedownReason || "This video violated Pulse standards and was taken down."
				}),
				video.takedownCategory ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs uppercase tracking-wide text-subtle",
					children: video.takedownCategory
				}) : null
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "px-3 py-5 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Player, {
					src: video.srcUrl,
					poster: video.posterUrl,
					autoPlay: true
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-xl font-semibold tracking-tight sm:text-2xl",
					children: video.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/c/$handle",
							params: { handle: video.handle },
							className: "flex items-center gap-3",
							children: [video.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: video.avatarUrl,
								alt: "",
								className: "size-10 rounded-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-10 place-items-center rounded-full bg-raised text-sm",
								children: video.displayName.charAt(0)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: video.displayName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-subtle",
								children: ["@", video.handle]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: following ? "outline" : "default",
							onClick: () => {
								if (needAuth()) return;
								setFollowing((v) => !v);
								toggleFollow({ data: video.userId }).catch(() => toast.error("Could not follow."));
							},
							children: following ? "Following" : "Follow"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								variant: liked ? "subtle" : "outline",
								onClick: () => {
									if (needAuth()) return;
									setLiked((v) => !v);
									setLikeCount((c) => c + (liked ? -1 : 1));
									toggleLike({ data: video.id }).catch(() => toast.error("Could not like."));
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: liked ? "size-4 fill-danger text-danger" : "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: compactNumber(likeCount)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "outline",
								onClick: () => needAuth() ? null : setReportOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" })
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-lg bg-raised px-4 py-3 text-sm leading-relaxed text-muted",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-subtle tabular-nums",
						children: [
							compactNumber(video.viewCount),
							" views · ",
							timeAgo(video.createdAt)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 whitespace-pre-wrap text-fg",
						children: video.description
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-base font-semibold",
							children: ["Comments", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-2 text-sm font-normal text-subtle tabular-nums",
								children: comments.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								if (needAuth()) return;
								const text = body.trim();
								if (!text) return;
								setBody("");
								addComment({ data: {
									videoId: video.id,
									body: text
								} }).then((res) => {
									if (!res.guard.ok) {
										toast.error(res.guard.reason);
										window.location.reload();
										return;
									}
									if (res.comment) setComments((c) => [res.comment, ...c]);
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: body,
								onChange: (e) => setBody(e.target.value),
								placeholder: "Add a comment",
								maxLength: 500
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "sm",
								children: "Post"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-5 space-y-4",
							children: comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3",
								children: [c.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: c.avatarUrl,
									alt: "",
									className: "size-8 rounded-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-8 place-items-center rounded-full bg-raised text-xs",
									children: c.displayName.charAt(0)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-subtle",
									children: [
										"@",
										c.handle,
										" · ",
										timeAgo(c.createdAt)
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-0.5 text-sm",
									children: c.body
								})] })]
							}, c.id))
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "mt-10 space-y-5 lg:mt-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-sm font-semibold text-muted",
					children: "Up next"
				}), related.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VideoCard, {
					video: v,
					compact: true
				}, v.id))]
			}),
			reportOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-end bg-bg/60 sm:place-items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-md rounded-t-xl border border-border bg-surface p-5 sm:rounded-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg font-semibold",
							children: "Report this video"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-col gap-1",
							children: REPORT_REASONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "h-11 rounded-md px-3 text-left text-sm hover:bg-raised",
								onClick: () => {
									reportVideo({ data: {
										videoId: video.id,
										reason: r.id
									} }).then((res) => {
										if (!res.guard.ok) toast.message("Pulse Guard took this down.");
										else toast.success("Report received.");
										setReportOpen(false);
									});
								},
								children: r.label
							}, r.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "mt-3 h-10 w-full text-sm text-muted",
							onClick: () => setReportOpen(false),
							children: "Cancel"
						})
					]
				})
			}) : null
		]
	});
}
//#endregion
export { WatchPage as component };
