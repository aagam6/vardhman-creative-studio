import React,{useEffect,useState} from 'react';
import {createWebsiteAnalytics} from '@/lib/websiteAnalytics';
import {updhanCampaignMemory} from '@/lib/updhanMarketing';
import {updhanConfig} from '@/lib/updhanConfig';
import {useUpdhanLanguage} from './UpdhanLanguage';
export function trackUpdhan(name,values){return createWebsiteAnalytics(window,document).event(name,values);}
export function trackUpdhanClick(event){const button=event.target?.closest?.('[data-updhan-track]');if(button)trackUpdhan('updhan_button_click',{button_id:button.dataset.updhanTrack});}
const preferenceKey='updhan-measurement-consent-v1';
export default function UpdhanMeasurement(){
 const {language}=useUpdhanLanguage();
 const [consent,setConsent]=useState(false);
 useEffect(()=>{let saved;try{saved=sessionStorage.getItem(preferenceKey);}catch{}const granted=saved==='yes';setConsent(granted);updhanCampaignMemory.setConsent(granted);if(granted)updhanCampaignMemory.capture(window.location.href);const tracker=createWebsiteAnalytics(window,document);tracker.setUpdhanConsent(granted);if(granted)window.dispatchEvent(new Event('updhan-measurement-enabled'));return()=>{tracker('');window.__updhanAnalyticsConsent=false;};},[]);
 function choose(granted){setConsent(granted);try{sessionStorage.setItem(preferenceKey,granted?'yes':'no');}catch{}updhanCampaignMemory.setConsent(granted);if(granted)updhanCampaignMemory.capture(window.location.href);createWebsiteAnalytics(window,document).setUpdhanConsent(granted);if(granted)window.dispatchEvent(new Event('updhan-measurement-enabled'));}
 const copy={hi:{title:'Analytics की पसंद',body:'पेज और बटन का उपयोग समझने के लिए वैकल्पिक Analytics। फॉर्म की निजी जानकारी इसमें नहीं जाती।',yes:'अनुमति दें',no:'बंद रखें',on:'चालू',off:'बंद'},en:{title:'Analytics preferences',body:'Optional analytics measures page and button use. Application details are excluded.',yes:'Allow',no:'Keep off',on:'On',off:'Off'},gu:{title:'Analytics પસંદગી',body:'પેજ અને બટનનો ઉપયોગ સમજવા વૈકલ્પિક Analytics. ફોર્મની ખાનગી માહિતી સામેલ નથી.',yes:'મંજૂરી આપો',no:'બંધ રાખો',on:'ચાલુ',off:'બંધ'}}[language];
 return <aside className="vp-section vp-measurement" aria-label={copy.title}><details><summary>{copy.title}</summary><p>{copy.body}</p><p>{consent?copy.on:copy.off}</p>{updhanConfig.analyticsEnabled&&<div className="vp-actions"><button type="button" className="vp-btn vp-btn-outline" aria-pressed={consent} onClick={()=>choose(true)}>{copy.yes}</button><button type="button" className="vp-btn vp-btn-outline" aria-pressed={!consent} onClick={()=>choose(false)}>{copy.no}</button></div>}</details></aside>;
}
