import React from 'react';
import { organisers, invitingOrganisations, sairamBookReference } from '@/lib/ayambilOfficialCredits';

export function OfficialCredits({ beneficiaries = false }) {
  return <div className="ay-official-credits">{[
    ...(beneficiaries ? [['લાભાર્થી', 'Beneficiaries', organisers]] : []),
    ['આયોજકો', 'Organisers', organisers],
    ['નિમંત્રકો', 'Inviting Organisations', invitingOrganisations],
  ].map(([gu, en, names]) => <section key={en}><h3 lang="gu">{gu}{en !== 'Beneficiaries' && <small>{en}</small>}</h3><ul>{names.map(name => <li lang="gu" key={name}>{name}</li>)}</ul></section>)}</div>;
}

export default function AyambilBookProgramme() {
  return <section className="ay-book-programme ay-container" aria-labelledby="ay-book-title"><p className="ay-eyebrow">Sairam Dave · 3 November 2026 · 8:00 PM IST</p><h2 id="ay-book-title" lang="gu">મારી મા... મારો પ્રાણ</h2><h3>A Tribute to Motherhood, Values and Our Roots</h3><p lang="gu">મા પ્રત્યેનો પ્રેમ આપણને પરિવાર, ભાષા અને વતન સાથે જોડે છે. આપણા મૂળ, સંસ્કૃતિ અને પરિવારના સંસ્કાર પ્રત્યે આભાર રાખવો પણ એટલો જ જરૂરી છે. આ ખાસ સાંજમાં માતૃપ્રેમ અને માતૃભૂમિ પ્રત્યેની લાગણીને યાદ કરીએ, અને દેશ માટે સેવા આપતા લોકો પ્રત્યે માન રાખીએ.</p><p>A mother's love connects us with family, language and our homeland. This evening invites us to reflect on gratitude for our roots, the values we grow up with, and respect for those who serve our country.</p><p lang="gu">પુસ્તક આપણને યાદ કરાવે છે કે મા સાથેનો સંબંધ માત્ર પરિવાર પૂરતો નથી. આપણી માતૃભૂમિ, માતૃભાષા અને સંસ્કૃતિ પણ આપણા જીવનનો ભાગ છે. વતનથી દૂર જઈએ તો પણ આપણા મૂળ સાથેનો પ્રેમ જળવાઈ રહે, પોતાની ભાષા અને પરંપરાનું માન રાખીએ અને દેશની સેવા કરતા લોકોના યોગદાનને યાદ કરીએ. આ લાગણીને રોજિંદા જીવનમાં જાળવવી એ પણ આભાર વ્યક્ત કરવાની એક રીત છે.</p><p>The book encourages a wider sense of care: for our mother, our mother tongue, our homeland and the culture that shapes us. Its themes invite us to stay connected to our roots wherever we live, value our language and traditions, and remember the contribution of those who serve the nation.</p><p lang="gu">પત્રિકામાં આપેલો આધાર: {sairamBookReference}</p><OfficialCredits beneficiaries /></section>;
}
