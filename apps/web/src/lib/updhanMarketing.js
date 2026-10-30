export const UPDHAN_PATH='/vijaypataka-updhan-mahotsav';
export const UPDHAN_FORM_PATH=`${UPDHAN_PATH}/registration`;
export const isUpdhanPath=path=>[UPDHAN_PATH,UPDHAN_FORM_PATH].includes(path);
export const UPDHAN_URL=`https://vardhmancreativestudio.com${UPDHAN_PATH}`;
export const campaignVocabulary={
 utm_source:['instagram','facebook','google','whatsapp'],
 utm_medium:['social','paid_social','cpc','messaging'],
 utm_campaign:['vijaypataka_updhan_2027'],
 utm_content:['bio','reel_01','reel_02','story_01','poster_01','event_info','registration','registration_received'],
};
export function sanitizeCampaign(input){
 const params=input instanceof URLSearchParams?input:new URLSearchParams(Object.entries(input||{}).filter(([,v])=>typeof v==='string'));
 // Approved receipt button uses the older exact UTM tuple. Normalize only that tuple.
 if(params.get('utm_source')==='whatsapp'&&params.get('utm_medium')==='utility_message'&&params.get('utm_campaign')==='updhan_2027'&&params.get('utm_content')==='registration_received'&&['utm_source','utm_medium','utm_campaign','utm_content'].every(k=>params.getAll(k).length===1))return {utm_source:'whatsapp',utm_medium:'messaging',utm_campaign:'vijaypataka_updhan_2027',utm_content:'registration_received'};
 const result={};
 for(const [key,values] of Object.entries(campaignVocabulary))if(params.getAll(key).length===1&&values.includes(params.get(key)))result[key]=params.get(key);
 // Do not attribute unknown campaigns to this event or persist partial data.
 return result.utm_campaign==='vijaypataka_updhan_2027'&&result.utm_source&&result.utm_medium?result:{};
}
export function campaignFromUrl(href){try{const url=new URL(href);return isUpdhanPath(url.pathname.replace(/\/$/,''))?sanitizeCampaign(url.searchParams):{};}catch{return {};}}
export function updhanApplicationPath(href){const query=new URLSearchParams(campaignFromUrl(href)).toString();return UPDHAN_FORM_PATH+(query?`?${query}`:'');}
export function sanitizeAttribution(input){
 if(input?.consent!==true)return null;
 const firstTouch=sanitizeCampaign(input.firstTouch),lastTouch=sanitizeCampaign(input.lastTouch);
 return Object.keys(firstTouch).length&&Object.keys(lastTouch).length?{consent:true,firstTouch,lastTouch}:null;
}
export function createCampaignMemory({now=()=>Date.now(),ttlMs=30*60000}={}){
 let first=null,last=null,expires=0,consent=false;
 return {setConsent(value){consent=value===true;if(!consent){first=last=null;expires=0;}},capture(href){if(!consent)return;const campaign=campaignFromUrl(href);if(!Object.keys(campaign).length)return;if(now()>=expires)first=null;first ||= campaign;last=campaign;expires=now()+ttlMs;},get(){return consent&&now()<expires&&first?structuredClone({consent:true,firstTouch:first,lastTouch:last}):null;}};
}
export const updhanCampaignMemory=createCampaignMemory();
export function campaignUrl(values){const campaign=sanitizeCampaign(values);if(!Object.keys(campaign).length)throw new Error('Approved Updhan campaign vocabulary required');return `${UPDHAN_URL}?${new URLSearchParams(campaign)}#registration`;}
export const updhanFaqs=[
 ['મહોત્સવ ક્યારે અને ક્યાં છે?','હાલની કાર્યક્રમ માહિતી મુજબ વિજયપતાકા ઉપધાન મહોત્સવ ૨૬ એપ્રિલથી ૧૪ જૂન ૨૦૨૭ દરમિયાન અચલગઢ, રાજસ્થાનમાં છે. સંપૂર્ણ સ્થળનું સરનામું આયોજકની પુષ્ટિ પછી ઉમેરાશે.'],
 ['पंजीकरण कैसे करें?','आवेदन फॉर्म अलग पेज पर है। पाँच चरणों में जानकारी भरें और भेजने से पहले जाँच लें।'],
 ['અરજી એટલે પ્રવેશની મંજૂરી?','ના. અરજી પ્રાપ્ત થવી અને પ્રવેશની સ્વીકૃતિ અલગ છે. આયોજકનો સ્વીકૃતિ સંદેશ મળ્યા પછી જ આવવાનું આયોજન કરો.'],
 ['ઉપધાનના વિકલ્પોની તારીખો શું છે?','છ સાધના વિકલ્પોના નામ, ચોક્કસ તારીખો, પાત્રતા અને નિયમોની આયોજક પાસેથી પુષ્ટિ બાકી છે. જૂના સંદર્ભની ડિસેમ્બર–જાન્યુઆરી તારીખો આ કાર્યક્રમને લાગુ પડતી નથી.'],
 ['ફી, રહેવા અને સંપર્કની માહિતી ક્યાં મળશે?','નિવાસ અને ભોજન નિઃશુલ્ક છે; કાર્યક્રમની કોઈ ફી નથી. ચોક્કસ સ્થળ, મુસાફરી અને સહાય સંપર્કની પુષ્ટિ બાકી છે.'],
];
export const updhanPublicSummary={name:'વિજયપતાકા ઉપધાન મહોત્સવ | Vijaypataka Updhan Mahotsav 2027',startDate:'2027-04-26',endDate:'2027-06-14',place:'Achalgarh, Rajasthan, India',registration:'Complete the five-step application form; admission requires organizer acceptance',categories:'Names, eligibility and dates pending organizer approval',admission:'An application is not approved admission'};
