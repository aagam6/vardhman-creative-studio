export const updhanAcknowledgementBody=`जय जिनेन्द्र, *{{1}} जी।*
Jai Jinendra.

*विजयपताका – उपधान महोत्सव*
*Vijaypataka – Updhan Mahotsav*
अचलगढ़, राजस्थान | Achalgarh, Rajasthan

आपका पंजीकरण आवेदन प्राप्त हो गया है।
Your registration application has been received.

*पंजीकरण क्रमांक | Registration No.: {{2}}*

प्रवेश की स्वीकृति और आगे की जानकारी इसी WhatsApp नंबर पर अलग से दी जाएगी।
Admission approval and further details will be shared separately on this WhatsApp number.

धन्यवाद। | Thank you.`;
export function acknowledgementName(name){
 if(typeof name!=='string'||!name.trim()||[...name.trim()].length>180||/[\u0000-\u001f\u007f]/.test(name))throw Error('Valid applicant name required');
 const clean=name.trim().normalize('NFC').replace(/[*_~`{}]/g,'');if(!clean.trim())throw Error('Valid applicant name required');return clean;
}
export function updhanAcknowledgement(reference,language='hi',name='आराधक'){
 if(!/^UPD-2027-\d{4,}$/.test(reference||''))throw Error('Invalid registration number');
 return updhanAcknowledgementBody.replace('{{1}}',()=>acknowledgementName(name)).replace('{{2}}',()=>reference);
}
