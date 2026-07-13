import { useEffect } from "react";
import { documentTitleForStatus } from "./screen-a11y";
import type { SessionState } from "./session-reducer";

/** Keep the tab title aligned with the active session screen. */
export function useSessionDocumentTitle(status: SessionState["status"]): void {
  useEffect(() => {
    document.title = documentTitleForStatus(status);
  }, [status]);
}
