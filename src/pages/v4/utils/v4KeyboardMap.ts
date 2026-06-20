export type V4Action = (state: any) => void;

export const v4KeyMap: Record<string, V4Action> = {
  F1: () => console.info("Show help overlay"),
  F2: (s) => s.saveDraft(),
  F3: (s) => s.submitReport(),
  F4: (s) => s.toggleDrawer("ai"),
  F5: (s) => s.toggleDrawer("voice"),
  F11: (s) => s.toggleFullscreen(),
  "Ctrl+1": (s) => s.setSection("findings"),
  "Ctrl+2": (s) => s.setSection("impression"),
  "Ctrl+3": (s) => s.setSection("recommendation"),
  "Ctrl+M": (s) => s.toggleDrawer("templates"),
  "Ctrl+H": (s) => s.toggleDrawer("history"),
  "Ctrl+B": (s) => s.format("bold"),
  "Ctrl+I": (s) => s.format("italic"),
  "Ctrl+U": (s) => s.format("underline"),
  "Ctrl+S": (s) => s.saveDraft(),
  Escape: (s) => s.closeDrawer(),
};
