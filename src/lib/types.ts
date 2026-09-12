export type Profile = {
  userId: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  isSeed: boolean;
  postingLocked: boolean;
  banned: boolean;
  banReason: string | null;
  banCategory: string | null;
  strikeCount: number;
  createdAt: string;
  followerCount: number;
  videoCount: number;
};

export type VideoItem = {
  id: string;
  userId: string;
  title: string;
  description: string;
  tags: string;
  srcUrl: string;
  posterUrl: string | null;
  durationSec: number;
  isShort: boolean;
  status: "published" | "taken_down";
  takedownReason: string | null;
  takedownCategory: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
};

export type CommentItem = {
  id: string;
  videoId: string;
  userId: string;
  body: string;
  createdAt: string;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
};

export type ModerationEvent = {
  id: string;
  userId: string | null;
  videoId: string | null;
  action: string;
  category: string;
  severity: string;
  details: string;
  createdAt: string;
};

export type GuardDecision =
  | { ok: true }
  | {
      ok: false;
      banned: boolean;
      action: "takedown" | "ban";
      category: string;
      reason: string;
    };
