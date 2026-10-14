export function passLocationUrl(value) { try { const url=new URL(value); return url.protocol==='https:' && ['maps.app.goo.gl','www.google.com','maps.google.com'].includes(url.hostname) ? url.href : null; } catch { return null; } }
export const passPage = Object.freeze({ width: 205, height: 120, margin: 0, captureWidth: 1000 });
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

// DOM overflow checks run on the fixed-width clone, never on the mobile preview.
export function assertPassContentFits(side) {
  const bounds = side.getBoundingClientRect();
  if (side.scrollHeight > side.clientHeight + 2 || side.scrollWidth > side.clientWidth + 2) {
    throw new Error('Pass content exceeds readable print size');
  }
  for (const block of side.querySelectorAll('.ay-pass-attendee, .ay-pass-programme, .ay-pass-visit, .ay-pass-credits, .ay-pass-rules')) {
    const box = block.getBoundingClientRect();
    if (block.scrollHeight > block.clientHeight + 2 || block.scrollWidth > block.clientWidth + 2 || box.bottom > bounds.bottom - 12 || box.right > bounds.right - 12) {
      throw new Error('Pass content exceeds readable print size');
    }
  }
}

export function assemblePassPdf(Pdf, images) {
  if (images.length !== 2) throw new Error('Invalid pass layout');
  const pdf = new Pdf({ unit: 'mm', orientation: 'landscape', format: [passPage.width, passPage.height] });
  images.forEach(({image, ratio, links=[]}, index) => {
    if (index) pdf.addPage([passPage.width, passPage.height], 'landscape');
    const placement = passImagePlacement(ratio);
    pdf.addImage(image, 'PNG', placement.x, placement.y, placement.width, placement.height, undefined, 'FAST');
    for(const link of links) { const url=passLocationUrl(link.url); if(url) pdf.link(placement.x+link.x*placement.width,placement.y+link.y*placement.height,link.width*placement.width,link.height*placement.height,{url}); }
  });
  return pdf;
}
