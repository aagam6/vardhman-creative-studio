export function canSharePdf(navigatorApi, file) {
  if (!file || typeof navigatorApi?.share !== 'function' || typeof navigatorApi?.canShare !== 'function') return false;
  try { return navigatorApi.canShare({ files: [file] }) === true; } catch { return false; }
}

export function passSummary(pass) {
  return `${pass.eventName}\n${pass.attendeeName}\nPass / પાસ: ${pass.number}\n${pass.sessions.map(s => `${s.label}, ${s.time} — ${s.performer}\n${s.venue.replace('Chandramauleshwar', 'Chandramaulishwar')}, ${s.address}`).join('\n')}\nPlease attach the downloaded digital pass. / ડાઉનલોડ કરેલો પાસ જોડો.`;
}

export function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}

export async function copyPassDetails(navigatorApi, summary) {
  try { await navigatorApi.clipboard.writeText(summary); return true; } catch { return false; }
}
