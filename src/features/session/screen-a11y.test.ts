import { describe, expect, it } from "vitest";
import {
  DEFAULT_DOCUMENT_TITLE,
  documentTitleForStatus,
  focusScreenHeading,
  shouldMoveFocusOnStatusChange,
} from "./screen-a11y";

describe("screen-a11y", () => {
  it("maps session status to document titles", () => {
    expect(documentTitleForStatus("setup")).toBe(DEFAULT_DOCUMENT_TITLE);
    expect(documentTitleForStatus("playing")).toBe("再生中｜いろころ");
    expect(documentTitleForStatus("paused")).toBe("一時停止｜いろころ");
    expect(documentTitleForStatus("finished")).toBe("おしまい｜いろころ");
  });

  it("moves focus only across major screen hops", () => {
    expect(shouldMoveFocusOnStatusChange(null, "setup")).toBe(false);
    expect(shouldMoveFocusOnStatusChange("setup", "playing")).toBe(true);
    expect(shouldMoveFocusOnStatusChange("playing", "paused")).toBe(false);
    expect(shouldMoveFocusOnStatusChange("paused", "playing")).toBe(false);
    expect(shouldMoveFocusOnStatusChange("playing", "finished")).toBe(true);
    expect(shouldMoveFocusOnStatusChange("finished", "setup")).toBe(true);
  });

  it("focuses the shared screen heading when present", () => {
    const root = document.createElement("div");
    const heading = document.createElement("h1");
    heading.id = "screen-heading";
    heading.tabIndex = -1;
    root.append(heading);
    document.body.append(root);

    focusScreenHeading(root);
    expect(heading).toHaveFocus();

    root.remove();
  });
});
