// Registration is idempotent on the server. Reuse the exact payload and key;
// never retry admin changes or message delivery through this helper.
export async function submitRegistration(request, payload, onRecover = () => {}) {
  const attempt = async () => {
    const saved = await request('register', { method: 'POST', body: payload });
    if (!saved?.number || !Array.isArray(saved.attendees) || saved.attendees.length !== payload.attendees.length || saved.attendees.some(a => !Array.isArray(a.passes) || !a.passes.length)) throw new Error('Incomplete registration response');
    return saved;
  };
  try { return await attempt(); }
  catch (error) {
    if (error.status >= 400 && error.status < 500) throw error;
    onRecover();
    return attempt();
  }
}
