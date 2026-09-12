//#region node_modules/.nitro/vite/services/ssr/assets/moderation-Bq8v8ftU.js
var SEVERE_PHRASES = [
	"child porn",
	"child pornography",
	"child sexual",
	"sexualize child",
	"csam",
	"loli",
	"shota",
	"preteen",
	"underage sex",
	"beheading",
	"gore compilation",
	"graphic gore",
	"torture porn",
	"snuff film",
	"how to kill yourself",
	"suicide method",
	"kill myself tutorial",
	"rape video",
	"nazi gas",
	"kill all",
	"bomb instructions",
	"how to make a bomb"
];
var HIGH_PHRASES = [
	"porn",
	"porno",
	"xxx video",
	"onlyfans",
	"hentai",
	"nsfw",
	"nude",
	"nudes",
	"naked girl",
	"naked boy",
	"sex tape",
	"explicit sex",
	"blowjob",
	"handjob",
	"cumshot",
	"masturbat",
	"dildo",
	"only fans",
	"hot girl",
	"thot",
	"boobs",
	"breasts video",
	"deepfake nudes",
	"gore",
	"dismember",
	"mass shooting",
	"school shooting",
	"slit throat",
	"self harm",
	"self-harm",
	"cut myself",
	"thinspo",
	"pro ana",
	"cocaine for sale",
	"buy fentanyl",
	"doxx",
	"doxxing",
	"swat them"
];
function normalize(text) {
	return text.toLowerCase().replace(/[@4]/g, "a").replace(/[0]/g, "o").replace(/[1!]/g, "i").replace(/[3]/g, "e").replace(/[$$]/g, "s").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
function findHits(haystack, phrases) {
	return phrases.filter((p) => haystack.includes(p));
}
function scanBlocklist(text) {
	const n = normalize(text);
	if (!n) return {
		action: "allow",
		severity: "none",
		categories: [],
		reason: "",
		source: "blocklist"
	};
	if (findHits(n, SEVERE_PHRASES).length) return {
		action: "ban",
		severity: "severe",
		categories: ["policy-severe"],
		reason: "Pulse Guard blocked this for a severe policy violation.",
		source: "blocklist"
	};
	if (findHits(n, HIGH_PHRASES).length) return {
		action: "ban",
		severity: "high",
		categories: ["policy-violation"],
		reason: "Pulse Guard does not allow sexual, violent, hateful, or dangerous content.",
		source: "blocklist"
	};
	return {
		action: "allow",
		severity: "none",
		categories: [],
		reason: "",
		source: "blocklist"
	};
}
async function scanWithGrok(input) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return null;
	const userContent = [{
		type: "text",
		text: `You are Pulse Guard, a zero-tolerance moderator for a video platform.
Flag ANY sexual content, nudity, pornography, graphic violence, gore, hate speech, harassment, self-harm, child exploitation (always severe + ban), illegal activity, scams, or dangerous acts.
Even mild sexualization, suggestive posing, or jokes about violence is a violation (action=ban).
Educational history/news without graphic depiction may be allowed.
Respond with JSON only:
{"violate":boolean,"action":"allow"|"takedown"|"ban","severity":"none"|"low"|"high"|"severe","categories":[string],"reason":"short public reason"}\n\n${input.kind === "comment" ? `Comment: ${input.description.slice(0, 800)}` : `Title: ${input.title.slice(0, 200)}\nDescription: ${input.description.slice(0, 1200)}\nTags: ${(input.tags ?? "").slice(0, 200)}`}`
	}];
	if (input.posterDataUrl && input.posterDataUrl.startsWith("data:image/") && input.posterDataUrl.length < 4e5) userContent.push({
		type: "image_url",
		image_url: { url: input.posterDataUrl }
	});
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: "grok-4.5",
				temperature: 0,
				max_tokens: 220,
				messages: [{
					role: "user",
					content: userContent
				}]
			})
		});
		if (!res.ok) return null;
		const match = ((await res.json()).choices?.[0]?.message?.content ?? "").match(/\{[\s\S]*\}/);
		if (!match) return null;
		const parsed = JSON.parse(match[0]);
		if (!(Boolean(parsed.violate) || parsed.action === "ban" || parsed.action === "takedown")) return {
			action: "allow",
			severity: "none",
			categories: [],
			reason: "",
			source: "model"
		};
		return {
			action: "ban",
			severity: parsed.severity === "severe" || parsed.severity === "high" || parsed.severity === "low" ? parsed.severity : "high",
			categories: parsed.categories?.length ? parsed.categories.slice(0, 4) : ["policy-violation"],
			reason: (parsed.reason || "Pulse Guard does not allow this content.").slice(0, 240),
			source: "model"
		};
	} catch {
		return null;
	}
}
async function scanContent(input) {
	const list = scanBlocklist(`${input.title}\n${input.description}\n${input.tags ?? ""}`);
	if (list.action !== "allow") return list;
	const model = await scanWithGrok(input);
	if (model && model.action !== "allow") return {
		...model,
		source: "combined"
	};
	return list;
}
var REPORT_REASONS = [
	{
		id: "sexual",
		label: "Sexual or nude content"
	},
	{
		id: "violence",
		label: "Violent or graphic content"
	},
	{
		id: "hate",
		label: "Hate or harassment"
	},
	{
		id: "self-harm",
		label: "Self-harm or suicide"
	},
	{
		id: "child-safety",
		label: "Child safety"
	},
	{
		id: "illegal",
		label: "Illegal activity or scam"
	},
	{
		id: "other",
		label: "Other"
	}
];
//#endregion
export { scanContent as n, REPORT_REASONS as t };
