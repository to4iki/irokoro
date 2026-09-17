import { useEffect } from "react";
import type { SessionState } from "./session-reducer";

export const SCREEN_HEADING_ID = "screen-heading";

const DOCUMENT_TITLE_BY_STATUS = {
  setup: "いろころ｜親子で色あそび",
  playing: "再生中｜いろころ",
  paused: "一時停止｜いろころ",
  finished: "おしまい｜いろころ",
} as const satisfies Record<SessionState["status"], string>;

function documentTitleForStatus(status: SessionState["status"]): string {
  return DOCUMENT_TITLE_BY_STATUS[status];
}

function focusScreenHeading(): void {
  const heading = document.querySelector<HTMLElement>(`#${SCREEN_HEADING_ID}`);
  heading?.focus();
}

/** Route keyboard/AT focus to the screen heading after it mounts. */
export function useFocusScreenHeadingOnMount(enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    focusScreenHeading();
  }, [enabled]);
}

/** Keep the tab title aligned with the active session screen. */
export function useSessionDocumentTitle(status: SessionState["status"]): void {
  useEffect(() => {
    document.title = documentTitleForStatus(status);
  }, [status]);
}
