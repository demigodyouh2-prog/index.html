/**
 * Bombom Guard — zero-tolerance text + thumbnail scan.
 * Blocklist is fail-closed and always runs. Grok is used when available
 * to catch paraphrases the list misses. User-initiated only (upload, comment, report).
 */

export type Severity = "none" | "low" | "high" | "severe";

export type ScanResult = {
  action: "allow" | "takedown" | "ban";
  severity: Severity;
  categories: string[];
  reason: string;
  source: "blocklist" | "model" | "combined";
};

const SEVERE_PHRASES = [
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
  "how to make a bomb",
];

const HIGH_PHRASES = [
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
  "swat them",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[0]/g, "o")
    .replace(/[1!]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[$$]/g, "s")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findHits(haystack: string, phrases: string[]): string[] {
  return phrases.filter((p) => haystack.includes(p));
}

export function scanBlocklist(text: string): ScanResult {
  const n = normalize(text);
  if (!n) {
    return { action: "allow", severity: "none", categories: [], reason: "", source: "blocklist" };
  }
  const severe = findHits(n, SEVERE_PHRASES);
  if (severe.length) {
    return {
      action: "ban",
      severity: "severe",
      categories: ["policy-severe"],
      reason: "Bombom Guard blocked this for a severe policy violation.",
      source: "blocklist",
    };
  }
  const high = findHits(n, HIGH_PHRASES);
  if (high.length) {
    return {
      action: "ban",
      severity: "high",
      categories: ["policy-violation"],
      reason: "Bombom Guard does not allow sexual, violent, hateful, or dangerous content.",
      source: "blocklist",
    };
  }
  return { action: "allow", severity: "none", categories: [], reason: "", source: "blocklist" };
}

type GrokJson = {
  violate?: boolean;
  action?: "allow" | "takedown" | "ban";
  severity?: Severity;
  categories?: string[];
  reason?: string;
};

async function scanWithGrok(input: {
  title: string;
  description: string;
  tags?: string;
  kind: "video" | "comment";
  posterDataUrl?: string | null;
}): Promise<ScanResult | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const textPrompt =
    input.kind === "comment"
      ? `Comment: ${input.description.slice(0, 800)}`
      : `Title: ${input.title.slice(0, 200)}\nDescription: ${input.description.slice(0, 1200)}\nTags: ${(input.tags ?? "").slice(0, 200)}`;

  const instruction = `You are Bombom Guard, a zero-tolerance moderator for a video platform.
Flag ANY sexual content, nudity, pornography, graphic violence, gore, hate speech, harassment, self-harm, child exploitation (always severe + ban), illegal activity, scams, or dangerous acts.
Even mild sexualization, suggestive posing, or jokes about violence is a violation (action=ban).
Educational history/news without graphic depiction may be allowed.
Respond with JSON only:
{"violate":boolean,"action":"allow"|"takedown"|"ban","severity":"none"|"low"|"high"|"severe","categories":[string],"reason":"short public reason"}`;

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: `${instruction}\n\n${textPrompt}` }];

  if (input.posterDataUrl && input.posterDataUrl.startsWith("data:image/") && input.posterDataUrl.length < 400_000) {
    userContent.push({ type: "image_url", image_url: { url: input.posterDataUrl } });
  }

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0,
        max_tokens: 220,
        messages: [{ role: "user", content: userContent }],
      }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as GrokJson;
    const violate = Boolean(parsed.violate) || parsed.action === "ban" || parsed.action === "takedown";
    if (!violate) {
      return {
        action: "allow",
        severity: "none",
        categories: [],
        reason: "",
        source: "model",
      };
    }
    const severity: Severity =
      parsed.severity === "severe" || parsed.severity === "high" || parsed.severity === "low"
        ? parsed.severity
        : "high";
    return {
      action: "ban",
      severity,
      categories: parsed.categories?.length ? parsed.categories.slice(0, 4) : ["policy-violation"],
      reason:
        (parsed.reason || "Bombom Guard does not allow this content.").slice(0, 240),
      source: "model",
    };
  } catch {
    return null;
  }
}

export async function scanContent(input: {
  title: string;
  description: string;
  tags?: string;
  kind: "video" | "comment";
  posterDataUrl?: string | null;
}): Promise<ScanResult> {
  const blob = `${input.title}\n${input.description}\n${input.tags ?? ""}`;
  const list = scanBlocklist(blob);
  if (list.action !== "allow") return list;

  const model = await scanWithGrok(input);
  if (model && model.action !== "allow") {
    return { ...model, source: "combined" };
  }
  return list;
}

export const REPORT_REASONS = [
  { id: "sexual", label: "Sexual or nude content" },
  { id: "violence", label: "Violent or graphic content" },
  { id: "hate", label: "Hate or harassment" },
  { id: "self-harm", label: "Self-harm or suicide" },
  { id: "child-safety", label: "Child safety" },
  { id: "illegal", label: "Illegal activity or scam" },
  { id: "other", label: "Other" },
] as const;
