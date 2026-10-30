import {updhanAcknowledgementBody,acknowledgementName} from '../../web/src/lib/updhanAcknowledgement.js';
export const updhanWhatsappTemplate=Object.freeze({name:'updhan_registration_received_v1',metaId:'1858961825552892',language:'hi',category:'UTILITY',fields:Object.freeze(['name','reference']),body:updhanAcknowledgementBody,header:'विजयपताका – उपधान महोत्सव',footer:'Vardhman Creative Studio',button:Object.freeze({type:'URL',text:'कार्यक्रम की जानकारी',url:'https://vardhmancreativestudio.com/vijaypataka-updhan-mahotsav?utm_source=whatsapp&utm_medium=utility_message&utm_campaign=updhan_2027&utm_content=registration_received'})});
export function acknowledgementPayload({reference,to,name}){
 if(!/^UPD-2027-[0-9]{4,}$/.test(reference||''))throw Error('Valid Updhan registration number required');
 const number=String(to||'').replace(/^\+/,'');if(!/^[1-9][0-9]{7,14}$/.test(number))throw Error('Valid international recipient required');
 return {to:number,templateName:updhanWhatsappTemplate.name,language:'hi',components:[{type:'body',parameters:[{type:'text',text:acknowledgementName(name)},{type:'text',text:reference}]}]};
}
export function verifyAcknowledgementTemplate(template){
 const t=updhanWhatsappTemplate,c=template?.components;if(template?.name!==t.name||template.language!=='hi'||template.status!=='APPROVED'||template.category!=='UTILITY'||String(template.metaTemplateId??template.id)!==t.metaId||!Array.isArray(c)||c.length!==4)return false;
 const get=type=>c.filter(v=>v.type?.toUpperCase()===type),h=get('HEADER'),b=get('BODY'),f=get('FOOTER'),buttons=get('BUTTONS');
 return h.length===1&&h[0].format==='TEXT'&&h[0].text===t.header&&b.length===1&&b[0].text===t.body&&f.length===1&&f[0].text===t.footer&&buttons.length===1&&buttons[0].buttons?.length===1&&Object.entries(t.button).every(([k,v])=>buttons[0].buttons[0][k]===v);
}
