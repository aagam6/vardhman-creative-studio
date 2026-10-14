import React from 'react';
import { organisers, invitingOrganisations, sairamBookReference } from '@/lib/ayambilOfficialCredits';

export function OfficialCredits({ beneficiaries = false }) {
  return <div className="ay-official-credits">{[
    ...(beneficiaries ? [['લાભાર્થી', 'Beneficiaries', organisers]] : []),
    ['આયોજકો', 'Organisers', organisers],
    ['નિમંત્રકો', 'Inviting Organisations', invitingOrganisations],
  ].map(([gu, en, names]) => <section key={en}><h3 lang="gu">{gu}</h3><ul>{names.map(name => <li lang="gu" key={name}>{name}</li>)}</ul></section>)}</div>;
}

export default function AyambilBookProgramme() {
  return <section className="ay-book-programme ay-container" aria-labelledby="ay-book-title"><p className="ay-eyebrow">સાંઈરામ દવે · ૩ નવેમ્બર ૨૦૨૬ · સાંજે ૮ વાગ્યે</p><h2 id="ay-book-title" lang="gu">મારી મા... મારો પ્રાણ</h2><p lang="gu">શ્રી સાંઈરામ દવે સાથે વાતો અને હાસ્યની ખાસ સાંજ</p><p lang="gu">“Be Care food” — રાજ ભાસ્કર: ભોજનનો બગાડ કરતી માનવજાતને જગાડતું પુસ્તકનું ભવ્ય વિમોચન.</p><h3 lang="gu">મા, પરિવાર અને આપણા મૂળની વાત</h3>
<p lang="gu">મા પ્રત્યેનો પ્રેમ આપણને પરિવાર, ભાષા અને વતન સાથે જોડે છે. આપણા મૂળ, સંસ્કૃતિ અને પરિવારના સંસ્કાર પ્રત્યે આભાર રાખવો પણ એટલો જ જરૂરી છે. આ ખાસ સાંજમાં માતૃપ્રેમ અને માતૃભૂમિ પ્રત્યેની લાગણીને યાદ કરીએ, અને દેશ માટે સેવા આપતા લોકો પ્રત્યે માન રાખીએ.</p>

<p lang="gu">પુસ્તક આપણને યાદ કરાવે છે કે મા સાથેનો સંબંધ માત્ર પરિવાર પૂરતો નથી. આપણી માતૃભૂમિ, માતૃભાષા અને સંસ્કૃતિ પણ આપણા જીવનનો ભાગ છે. વતનથી દૂર જઈએ તો પણ આપણા મૂળ સાથેનો પ્રેમ જળવાઈ રહે, પોતાની ભાષા અને પરંપરાનું માન રાખીએ અને દેશની સેવા કરતા લોકોના યોગદાનને યાદ કરીએ. આ લાગણીને રોજિંદા જીવનમાં જાળવવી એ પણ આભાર વ્યક્ત કરવાની એક રીત છે.</p>
<p lang="gu">પત્રિકા મુજબ આ કાર્યક્રમનો આધાર: {sairamBookReference}</p><OfficialCredits /></section>;
}
