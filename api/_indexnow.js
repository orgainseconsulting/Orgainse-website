/**
 * IndexNow: tells Bing, Yandex, Seznam, Naver and other participating engines
 * that URLs changed. The key is public by design (served at /<key>.txt).
 */
export const INDEXNOW_KEY = '4324d2865ab2078180dee7056a86f13a';
const HOST = 'www.orgainse.com';
const SITE = `https://${HOST}`;

export async function pingIndexNow(paths) {
  if (process.env.VERCEL_ENV !== 'production') return { skipped: true };
  const urlList = [...new Set(paths.filter(Boolean).map((p) => (p.startsWith('http') ? p : SITE + p)))];
  if (!urlList.length) return { skipped: true };
  try {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList }),
      signal: AbortSignal.timeout(4000),
    });
    return { status: r.status, count: urlList.length };
  } catch (e) {
    console.error('IndexNow ping failed:', e?.message);
    return { error: e?.message };
  }
}
