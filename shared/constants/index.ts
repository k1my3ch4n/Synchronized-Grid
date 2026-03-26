import type { WorkspaceRole } from "@shared/types";

// ─── 캔버스 ───
export const CANVAS_SCALE = 0.45;
export const GRID_SIZE = 20;

// ─── 워크스페이스 역할 ───
export const WORKSPACE_ROLES = {
  OWNER: "OWNER" as const,
  EDITOR: "EDITOR" as const,
  VIEWER: "VIEWER" as const,
};

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  OWNER: "소유자",
  EDITOR: "편집자",
  VIEWER: "뷰어",
};

export const EDIT_ROLES: WorkspaceRole[] = ["OWNER", "EDITOR"];
export const ALL_ROLES: WorkspaceRole[] = ["OWNER", "EDITOR", "VIEWER"];
export const ASSIGNABLE_ROLES: WorkspaceRole[] = ["OWNER", "EDITOR", "VIEWER"];

// ─── 타이밍 ───
export const DEBOUNCE_SAVE_MS = 500;
export const THROTTLE_CURSOR_MS = 50;
export const DND_ACTIVATION_DISTANCE = 5;

// ─── 유효성 검사 ───
export const WORKSPACE_NAME_MAX_LENGTH = 50;
export const URL_MAX_LENGTH = 2048;

// ─── 뷰포트 제한 ───
export const VIEWPORT_MIN_SIZE = 100;
export const VIEWPORT_MAX_SIZE = 2000;
export const VIEWPORT_MAX_POSITION = 10000;
export const VIEWPORT_MAX_ZINDEX = 10000;
export const VIEWPORT_LABEL_MAX_LENGTH = 100;

// ─── z-index 레이어 ───
export const Z_INDEX = {
  HEADER_DROPDOWN: "z-40",
  HEADER_POPOVER: "z-[60]",
} as const;

// ─── 외부 링크 ───
export const GITHUB_URL =
  "https://github.com/k1my3ch4n/Synchronized-Grid";
export const NOTION_URL = "https://notion.so";

// ─── 유저 색상 ───
export const USER_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
];
