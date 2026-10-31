import {updhanReference} from './updhanReference.js';
export const categories = ['માળ', 'પાંત્રીશુ', 'અઠ્ઠાવિશું', 'પ્રથમ અઢારિયું', 'બીજું અઢારિયું', 'છકિયું-ચોકીયું'];
export const steps = ['વ્યક્તિગત માહિતી', 'સરનામું અને સંપર્ક', 'સાધના', 'સાથી અને સંમતિ', 'સમીક્ષા'];
export const fields = [
  ['name', 'પૂરું નામ / Full name', 0, true, 180], ['age', 'ઉંમર / Age', 0, true, 3],
  ['address1', 'સરનામું / Address line 1', 1, true, 255], ['address2', 'સરનામું — બીજી લાઇન', 1, false, 255],
  ['nativePlace', 'મૂળ વતન / Hometown', 1, false, 180], ['city', 'શહેર / City', 1, true, 180], ['state', 'રાજ્ય / State', 1, true, 180],
  ['country', 'દેશ / Country (IN for India)', 1, true, 80], ['pin', 'પિન / Postal code', 1, true, 20],
  ['whatsapp', 'WhatsApp નંબર (દેશ કોડ વગર)', 1, true, 15], ['mobile', 'અલગ મોબાઇલ નંબર / Mobile', 1, true, 10],
  ['tapasya', 'અગાઉ કરેલી વિશેષ તપસ્યા', 2, false, 255], ['sanyam', 'પરિવારમાં સંયમ લીધેલ સભ્ય', 2, false, 255],
  ['sanyamCommunity', 'સંયમ લીધેલ સભ્યનો સમુદાય (વૈકલ્પિક)', 2, false, 180],
  ['health', 'આરોગ્યની માહિતી (વૈકલ્પિક / Optional)', 2, false, 255], ['referredBy', 'પરિચય આપનાર / Referred by', 2, false, 180],
];
export function emptyApplication() { return Object.fromEntries([...fields.map(([key]) => [key, key === 'country' ? 'IN' : '']), ['gender', ''], ['code', '+91'], ['customCode', ''], ['category', ''], ['companions', []], ['rules', false], ['privacy', false], ['whatsappConsent', false]]); }
export function normalizeApplication(data) {
  if(!data||fields.some(([key])=>typeof data[key]!=='string')||!Array.isArray(data.companions)||data.companions.some(c=>!c||typeof c.name!=='string'||typeof c.number!=='string'))return data;
  const normalized=Object.fromEntries(Object.keys(emptyApplication()).map(key=>[key,typeof data[key]==='string'?data[key].normalize('NFC').trim():data[key]]));
  normalized.country=normalized.country.toUpperCase();
  normalized.companions=data.companions.map(c=>({name:c.name.normalize('NFC').trim(),number:c.number.normalize('NFC').trim()}));
  if(normalized.code!=='other')normalized.customCode='';
  return normalized;
}
export function validateApplication(data, photo, step) {
  const errors = {};
  if (!data || typeof data !== 'object' || !Array.isArray(data.companions)) return {application:'અમાન્ય અરજી.'};
  if (fields.some(([key]) => typeof data[key] !== 'string') || ['gender','code','customCode','category'].some(key => typeof data[key] !== 'string') || ['rules','privacy','whatsappConsent'].some(key => typeof data[key] !== 'boolean') || data.companions.some(c => !c || typeof c.name !== 'string' || typeof c.number !== 'string')) return {application:'અમાન્ય માહિતી.'};
  for (const [key,, section, required, max] of fields) {
    if (step !== undefined && section !== step) continue;
    const value = String(data[key] ?? '').trim();
    if (required && !value) errors[key] = 'આ માહિતી જરૂરી છે.';
    else if ([...value].length > max) errors[key] = `મહત્તમ ${max} અક્ષર.`;
    else if (/[\u0000-\u001f\u007f]/.test(value)) errors[key] = 'અમાન્ય અક્ષર દૂર કરો.';
  }
  const at = n => step === undefined || step === n;
  if (at(0)) {
    if (!/^\d+$/.test(data.age) || +data.age < 1 || +data.age > 100) errors.age = '૧ થી ૧૦૦ વચ્ચે ઉંમર લખો. પાત્રતા આયોજક નક્કી કરશે.';
    if (!['male', 'female'].includes(data.gender)) errors.gender = 'એક વિકલ્પ પસંદ કરો.';
    if (!photo) errors.photo = 'ફોટો પસંદ કરો.';
  }
  if (at(1)) {
    if(!/^[A-Za-z]{2}$/.test(data.country.trim()))errors.country='બે અક્ષરનો દેશ કોડ લખો, જેમ કે IN અથવા GB.';
    if (data.country.trim().toUpperCase() === 'IN' && !/^\d{6}$/.test(data.pin.trim())) errors.pin = '૬ અંકનો પિન લખો.';
    const code = data.code === 'other' ? data.customCode : data.code;
    if (!/^\+[1-9]\d{0,2}$/.test(code)) errors[data.code==='other'?'customCode':'code'] = 'માન્ય દેશ કોડ લખો, જેમ કે +91.';
    if (!/^\d{6,15}$/.test(data.whatsapp) || (code + data.whatsapp).replace('+', '').length > 15) errors.whatsapp = 'માન્ય WhatsApp નંબર લખો (કુલ વધુમાં વધુ ૧૫ અંક).';
    if (!/^\d{10}$/.test(data.mobile)) errors.mobile = '૧૦ અંકનો મોબાઇલ નંબર લખો.';
  }
  if (at(2) && !categories.includes(data.category)) errors.category = 'સાધનાનો વિકલ્પ પસંદ કરો.';
  if (at(3)) {
    if (!data.privacy) errors.privacy = 'માહિતીના ઉપયોગની નોંધ વાંચો.';
    if (data.companions.length > 10 || data.companions.some(c => !c.name.trim() || [...c.name].length > 180 || [...c.number].length > 40)) errors.companions = 'સાથીનું નામ જરૂરી છે; નામ ૧૮૦ અને ફોર્મ નંબર ૪૦ અક્ષર સુધી.';
  }
  return errors;
}
export async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) throw new Error('JPG, PNG અથવા WEBP ફોટો, વધુમાં વધુ 2 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const valid = file.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : file.type === 'image/png' ? [137,80,78,71,13,10,26,10].every((b,i) => bytes[i] === b) : String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (!valid) throw new Error('ફાઇલનો પ્રકાર અને ફોટો મેળ ખાતા નથી.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width < 100 || bitmap.height < 100 || bitmap.width * bitmap.height > 24000000) throw new Error('ફોટો 100 × 100 થી ઓછો અથવા 24 MP થી મોટો ન હોવો જોઈએ.');
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('ફોટો વાંચી શકાયો નથી.')), 'image/jpeg', .88));
  } finally { bitmap.close(); }
}
