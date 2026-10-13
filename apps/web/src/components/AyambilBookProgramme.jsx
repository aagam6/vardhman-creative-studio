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
  return <section className="ay-book-programme ay-container" aria-labelledby="ay-book-title"><p className="ay-eyebrow">Sairam Dave · 3 November 2026 · 8:00 PM IST</p><h2 id="ay-book-title" lang="gu">મારી મા... મારો પ્રાણ</h2><p lang="gu">પ્રસ્તુતિ: શ્રી સાંઈરામ દવે (લોકસાહિત્યકાર, હાસ્ય કલાકાર)</p><p lang="gu">“Be Care food” — રાજ ભાસ્કર: ભોજનનો બગાડ કરતી માનવજાતને જગાડતું પુસ્તકનું ભવ્ય વિમોચન (10 મિનિટ).</p><p lang="gu">પત્રિકામાં આપેલો આધાર: {sairamBookReference}</p><OfficialCredits beneficiaries /></section>;
}
