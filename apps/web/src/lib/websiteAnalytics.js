// Based on the current production controller; existing Ayambil vocabulary is retained.
import {updhanConfig} from './updhanConfig.js';
import {UPDHAN_PATH,UPDHAN_FORM_PATH,isUpdhanPath,sanitizeCampaign} from './updhanMarketing.js';
const controllers=new WeakMap();
export const MEASUREMENT_ID = 'G-2P4BBDPN6J';

const pages = {
  '/': 'Vardhman Creative Studio',
  [UPDHAN_PATH]: 'Vijaypataka Updhan Mahotsav | Achalgarh 2027',
  [UPDHAN_FORM_PATH]: 'Application | Vijaypataka Updhan Mahotsav 2027',
  '/about': 'About | Vardhman Creative Studio',
  '/services': 'Services | Vardhman Creative Studio',
  '/param-vir-chakra': 'Param Vir Chakra',
  '/pvclive': 'PVC Live',
  '/500-akhand-ayambil-vijayollas': '500 Akhand Ayambil Vijayollas',
  '/500-akhand-ayambil-vijayollas/manan-sanghvi': 'Manan Sanghvi | 2 November 2026',
  '/500-akhand-ayambil-vijayollas/sairam-dave': 'Sairam Dave | 3 November 2026',
  '/privacy': 'Privacy | Vardhman Creative Studio',
  '/privacy-policy': 'Privacy policy | Vardhman Creative Studio',
  '/terms': 'Terms | Vardhman Creative Studio',
};

export function publicAnalyticsPage(href) {
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (url.protocol !== 'https:' || !['vardhmancreativestudio.com', 'www.vardhmancreativestudio.com'].includes(url.host) || !Object.hasOwn(pages, path)) return null;
    // Only our public campaign vocabulary may reach GA. Never forward arbitrary
    // query strings (names, phone numbers, booking IDs or pass capabilities).
    const campaign = new URLSearchParams();
    const allowed = {
      utm_source: ['instagram', 'whatsapp'],
      utm_medium: ['social', 'messaging'],
      utm_campaign: ['ayambil_2026'],
      utm_content: ['bio', 'manan_reel', 'sairam_reel', 'manan_booking', 'sairam_booking', 'event_info'],
    };
    if (path.startsWith('/500-akhand-ayambil-vijayollas')) {
      for (const [key, values] of Object.entries(allowed)) {
        const value = url.searchParams.get(key);
        if (url.searchParams.getAll(key).length === 1 && values.includes(value)) campaign.set(key, value);
      }
    }
    if(isUpdhanPath(path))for(const [key,value] of Object.entries(sanitizeCampaign(url.searchParams)))campaign.set(key,value);
    const query = campaign.toString();
    return { page_location: `${url.origin}${path}${query ? `?${query}` : ''}`, page_title: pages[path] };
  } catch {
    return null;
  }
}

// A single controller survives React StrictMode effect replay. Private routes
// disable collection before any queued Google tag commands can run.
export function createWebsiteAnalytics(win, doc, {updhanEnabled=updhanConfig.analyticsEnabled}={}) {
  if(controllers.has(win))return controllers.get(win);
  let initialized = false;
  const receipts=new Set();
  let previousLocation = '';
  let lastLocation = '';
  const track = function(href) {
    let page = publicAnalyticsPage(href);
    if(page && isUpdhanPath(new URL(page.page_location).pathname) && (!updhanEnabled || win.__updhanAnalyticsConsent!==true))page=null;
    win[`ga-disable-${MEASUREMENT_ID}`] = !page;
    if (!page) {
      lastLocation = '';
      if (initialized) win.gtag('set', { page_location: 'https://vardhmancreativestudio.com/', page_referrer: '', page_title: 'Private page' });
      return;
    }
    if (lastLocation === page.page_location) return;
    const referrer = previousLocation || publicAnalyticsPage(doc.referrer)?.page_location || '';
    win.dataLayer = win.dataLayer || [];
    win.gtag = win.gtag || function () { win.dataLayer.push(arguments); };
    win.gtag('set', { ...page, page_referrer: referrer });
    if (!initialized) {
      initialized = true;
      win.gtag('js', new Date());
      win.gtag('config', MEASUREMENT_ID, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        ...page,
        page_referrer: referrer,
      });
      const existing=doc.querySelector?.(`script[src="https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`);
      const script = doc.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
      if(!existing)doc.head.appendChild(script);
    }
    win.gtag('event', 'page_view', { ...page, page_referrer: referrer });
    previousLocation = lastLocation = page.page_location;
  };
  track.setUpdhanConsent=granted=>{win.__updhanAnalyticsConsent=granted===true;track(win.location.href);};
  track.event=(name,values={})=>{
    const page=publicAnalyticsPage(win.location.href);
    if(!updhanEnabled||win.__updhanAnalyticsConsent!==true||!page||!isUpdhanPath(new URL(page.page_location).pathname))return false;
    if(!['updhan_registration_start','updhan_step_view','updhan_application_received','updhan_button_click','updhan_form_review','updhan_submit_attempt'].includes(name))return false;
    if(name==='updhan_step_view'&&(!Number.isInteger(values.step)||values.step<1||values.step>5))return false;
    if(name==='updhan_button_click'&&!['hero_apply','section_apply','mobile_apply','form_anchor','calendar','share','map','darshan','nav_section','menu_toggle','language_hi','language_gu','language_en','back_programme','gallery_open','faq_open','contact_call'].includes(values.button_id))return false;
    if(name==='updhan_application_received'){if(typeof values.dedupeKey!=='string'||!values.dedupeKey||receipts.has(values.dedupeKey))return false;receipts.add(values.dedupeKey);}
    track(win.location.href);
    win.gtag('event',name,{send_to:MEASUREMENT_ID,...page,page_referrer:'',event_scope:'updhan_2027',...(name==='updhan_step_view'?{step:values.step}:name==='updhan_button_click'?{button_id:values.button_id}:{})});return true;
  };
  controllers.set(win,track);return track;
}
