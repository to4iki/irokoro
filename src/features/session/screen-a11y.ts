import type { SessionState } from "./session-reducer";

export const SCREEN_HEADING_ID = "screen-heading";

export const DEFAULT_DOCUMENT_TITLE = "いろころ｜親子で色あそび";

const DOCUMENT_TITLE_BY_STATUS = {
  setup: DEFAULT_DOCUMENT_TITLE,
  playing: "再生中｜いろころ",
  paused: "一時停止｜いろころ",
  finished: "おしまい｜いろころ",
} as const satisfies Record<SessionState["status"], string>;

export function documentTitleForStatus(status: SessionState["status"]): string {
  return DOCUMENT_TITLE_BY_STATUS[status];
}

export function isPlayerStatus(status: SessionState["status"]): boolean {
  return status === "playing" || status === "paused";
}

/** Major screen hops need focus routing; pause/resume must keep button focus. */
export function shouldMoveFocusOnStatusChange(
  previous: SessionState["status"] | null,
  next: SessionState["status"],
): boolean {
  if (previous === null || previous === next) {
    return false;
  }
  if (isPlayerStatus(previous) && isPlayerStatus(next)) {
    return false;
  }
  return true;
}

export function focusScreenHeading(root: ParentNode = document): void {
  const heading = root.querySelector<HTMLElement>(`#${SCREEN_HEADING_ID}`);
  heading?.focus();
}
