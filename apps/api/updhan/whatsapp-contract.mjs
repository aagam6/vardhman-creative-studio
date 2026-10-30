import {updhanAcknowledgementBody,acknowledgementName} from '../../web/src/lib/updhanAcknowledgement.js';
export const updhanWhatsappTemplate=Object.freeze({name:'updhan_registration_received_v1',metaId:'1858961825552892',language:'hi',category:'UTILITY',fields:Object.freeze(['name','reference']),body:updhanAcknowledgementBody,header:'विजयपताका – उपधान महोत्सव',footer:'Vardhman Creative Studio',button:Object.freeze({type:'URL',text:'कार्यक्रम की जानकारी',url:'https://vardhmancreativestudio.com/vijaypataka-updhan-mahotsav?utm_source=whatsapp&utm_medium=utility_message&utm_campaign=updhan_2027&utm_content=registration_received'})});
export function acknowledgementPayload({reference,to,name}){
 if(!/^UPD-2027-[0-9]{4,}$/.test(reference||''))throw Error('Valid Updhan registration number required');
 const number=String(to||'').replace(/^\+/,'');if(!/^[1-9][0-9]{7,14}$/.test(number))throw Error('Valid international recipient required');
 return {to:number,templateName:updhanWhatsappTemplate.name,language:'hi',components:[{type:'body',parameters:[{type:'text',text:acknowledgementName(name)},{type:'text',text:reference}]}]};
}
export function verifyAcknowledgementTemplate(template){
 // Current authenticated Vardhman Flow response uses flat content fields and
 // whatsappTemplateId for Meta identity. Never confuse its UUID with Meta ID.
 if(template?.whatsappTemplateId!==undefined){const t=updhanWhatsappTemplate;return template.id==='49bffc8a-734f-423b-85c8-0a1883732e08'&&template.channelId==='aa40827e-8239-49b0-bee4-3045bb3d95d7'&&String(template.whatsappTemplateId)===t.metaId&&template.name===t.name&&template.language===t.language&&template.category===t.category&&template.status==='APPROVED'&&template.mediaType==='text'&&!template.mediaUrl&&!template.mediaHandle&&(!template.carouselCards||template.carouselCards.length===0)&&template.header===t.header&&template.body===t.body&&template.footer===t.footer&&Array.isArray(template.buttons)&&template.buttons.length===1&&Object.entries(t.button).every(([k,v])=>template.buttons[0][k]===v);}
 const t=updhanWhatsappTemplate,c=template?.components;if(template?.name!==t.name||template.language!=='hi'||template.status!=='APPROVED'||template.category!=='UTILITY'||String(template.metaTemplateId??template.id)!==t.metaId||!Array.isArray(c)||c.length!==4)return false;
 const get=type=>c.filter(v=>v.type?.toUpperCase()===type),h=get('HEADER'),b=get('BODY'),f=get('FOOTER'),buttons=get('BUTTONS');
 return h.length===1&&h[0].format==='TEXT'&&h[0].text===t.header&&b.length===1&&b[0].text===t.body&&f.length===1&&f[0].text===t.footer&&buttons.length===1&&buttons[0].buttons?.length===1&&Object.entries(t.button).every(([k,v])=>buttons[0].buttons[0][k]===v);
}
