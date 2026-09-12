import { cn } from "@/lib/utils";

export function BomMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="#111015" />
      <circle cx="12.5" cy="16" r="6.2" fill="#ff3d8a" />
      <circle cx="19.5" cy="16" r="6.2" fill="#5ce1ff" fillOpacity="0.92" />
    </svg>
  );
}

export function BomWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <BomMark className="size-8" />
      <span className="font-display text-[17px] font-semibold tracking-tight text-fg lowercase">
        bombom
      </span>
      {!compact ? (
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.18em] text-subtle sm:inline">
          edits
        </span>
      ) : null}
    </span>
  );
}
