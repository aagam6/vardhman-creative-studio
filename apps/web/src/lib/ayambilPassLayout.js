export const passPage = Object.freeze({ width: 90, height: 200, margin: 4, captureWidth: 340 });
export function passImagePlacement(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) throw new Error('Invalid pass layout');
  const availableWidth = passPage.width - 2 * passPage.margin;
  const availableHeight = passPage.height - 2 * passPage.margin;
  const width = Math.min(availableWidth, availableHeight / ratio);
  // Reject excessively long content rather than silently shrinking names and
  // bilingual rules into unreadable print. The browser preview stays available.
  if (width < availableWidth * 0.85) throw new Error('Pass content exceeds readable print size');
  return { x: (passPage.width - width) / 2, y: passPage.margin, width, height: width * ratio };
}
