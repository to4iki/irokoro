import { useEffect } from "react";
import { focusScreenHeading } from "./screen-a11y";

/** Route keyboard/AT focus to the screen heading after it mounts. */
export function useFocusScreenHeadingOnMount(enabled = true): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    focusScreenHeading();
  }, [enabled]);
}
