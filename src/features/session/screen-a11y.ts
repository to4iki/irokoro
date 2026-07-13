import type { SessionState } from "./session-reducer";

export const SCREEN_HEADING_ID = "screen-heading";

const DOCUMENT_TITLE_BY_STATUS = {
  setup: "いろころ｜親子で色あそび",
  playing: "再生中｜いろころ",
  paused: "一時停止｜いろころ",
  finished: "おしまい｜いろころ",
} as const satisfies Record<SessionState["status"], string>;

export function documentTitleForStatus(status: SessionState["status"]): string {
  return DOCUMENT_TITLE_BY_STATUS[status];
}

export function focusScreenHeading(root: ParentNode = document): void {
  const heading = root.querySelector<HTMLElement>(`#${SCREEN_HEADING_ID}`);
  heading?.focus();
}
