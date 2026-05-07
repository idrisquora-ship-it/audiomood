/** Layout tokens shared by Screen and future premium components */
export const spacing = {
  screenHorizontal: 20,
  /** Extra padding below OS status bar / notch (added to safe-area top inset). */
  screenTopGap: 12,
  /**
   * Artist tab screens: extra breathing room under the status bar so titles never feel tight.
   * (Safe-area top inset is always applied first; this value is added on top.)
   */
  artistScreenTopGap: 20,
  /** Use in ScrollView `contentContainerStyle.paddingBottom` so last items clear the tab bar comfortably. */
  artistScrollBottomPadding: 100,
  screenBottomGap: 12,
  sectionGap: 16,
  itemGap: 12
};
