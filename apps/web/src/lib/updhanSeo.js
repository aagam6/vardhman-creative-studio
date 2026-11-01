export const updhanSeo={
 url:'https://vardhmancreativestudio.com/vijaypataka-updhan-mahotsav',
 title:'विजयपताका उपधान महोत्सव 2027 | अचलगढ़, राजस्थान',
 description:'25 अप्रैल–12 जून 2027 · अचलगढ़, राजस्थान। विजयपताका उपधान महोत्सव की साधना, प्रवेश तारीखें और ऑनलाइन आवेदन। आवास और भोजन निःशुल्क। प्रवेश आयोजक की स्वीकृति से।',
 image:'https://vardhmancreativestudio.com/assets/updhan-video/aerial-03m45s.webp',
 imageAlt:'Vijaypataka Updhan Mahotsav · Achalgarh, Rajasthan · 25 April–12 June 2027',
 organizer:'શ્રી પ્રહલાદ પ્લોટ જૈન યુવક મંડળ, રાજકોટ',
};
export const updhanAnswerFaqs=[
 ['उपधान कहाँ है?','अचलगढ़, राजस्थान में। प्रथम प्रवेश रविवार, 25 अप्रैल 2027 और मालारोपण शनिवार, 12 जून 2027 है।'],
 ['फॉर्म कैसे भरें?','आवेदन फॉर्म खोलें, अपनी जानकारी और फोटो जोड़ें, फिर जानकारी जाँचकर आवेदन भेजें।'],
 ['फॉर्म भरने के बाद क्या होगा?','आपको पंजीकरण नंबर मिलेगा। टीम आवेदन की समीक्षा करेगी और प्रवेश की सूचना अलग से देगी।'],
 ['जानकारी के लिए किससे बात करें?','आशीषभाई उदाणी · +91 97277 14008'],
];
export function updhanSchemas(){return[
 {'@context':'https://schema.org','@type':'Event','@id':updhanSeo.url+'#event',name:'विजयपताका – उपधान महोत्सव 2027',url:updhanSeo.url,description:updhanSeo.description,startDate:'2027-04-25',endDate:'2027-06-12',eventStatus:'https://schema.org/EventScheduled',eventAttendanceMode:'https://schema.org/OfflineEventAttendanceMode',inLanguage:['hi','gu','en'],image:[updhanSeo.image],isAccessibleForFree:true,organizer:{'@type':'Organization',name:updhanSeo.organizer},location:{'@type':'Place',name:'अचलगढ़, राजस्थान',hasMap:'https://maps.app.goo.gl/JGXG1nPSfkm47vMLA',address:{'@type':'PostalAddress',addressLocality:'Achalgarh',addressRegion:'Rajasthan',addressCountry:'IN'}}},
 {'@context':'https://schema.org','@type':'FAQPage',mainEntity:updhanAnswerFaqs.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))},
 {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Vardhman Creative Studio',item:'https://vardhmancreativestudio.com/'},{'@type':'ListItem',position:2,name:'विजयपताका उपधान महोत्सव',item:updhanSeo.url}]},
];}
