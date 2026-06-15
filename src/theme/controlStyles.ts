import type { CSSProperties } from "react";

/** Shared 40px toolbar control height — keeps text vertically centered. */
export const TOOLBAR_CONTROL_HEIGHT = 40;

export const toolbarInputRootStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: TOOLBAR_CONTROL_HEIGHT,
  paddingBlock: 0,
};

export const toolbarInputInnerStyle: CSSProperties = {
  lineHeight: `${TOOLBAR_CONTROL_HEIGHT}px`,
};

export const toolbarSelectRootStyle: CSSProperties = {
  alignItems: "center",
  height: TOOLBAR_CONTROL_HEIGHT,
};

export const toolbarSelectContentStyle: CSSProperties = {
  alignSelf: "center",
  lineHeight: `${TOOLBAR_CONTROL_HEIGHT}px`,
};

export const toolbarSelectPlaceholderStyle: CSSProperties = {
  lineHeight: `${TOOLBAR_CONTROL_HEIGHT}px`,
};

export const toolbarButtonRootStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: TOOLBAR_CONTROL_HEIGHT,
  paddingBlock: 0,
  lineHeight: `${TOOLBAR_CONTROL_HEIGHT}px`,
};
