import React, { useState } from 'react';

const instructions = {
  en: ['Choose your evening', 'Free registration for one evening. Add one or two names, check your details and accept the pass terms. Save each pass after confirmation. Keep private download links secure.'],
  gu: ['તમારી સાંજનો કાર્યક્રમ પસંદ કરો', 'એક સાંજ માટે ફ્રી રજિસ્ટ્રેશન છે. એક કે બે લોકોનાં નામ લખો, વિગતો તપાસો અને પાસના નિયમો મંજૂર કરો. કન્ફર્મેશન પછી દરેક પાસ ડાઉનલોડ કરો. પાસની ખાનગી લિંક સાચવી રાખો.'],
  hi: ['अपना शाम का कार्यक्रम चुनें', 'एक शाम के लिए मुफ्त रजिस्ट्रेशन है। एक या दो लोगों के नाम लिखें, जानकारी जाँचें और पास के नियम स्वीकार करें। पुष्टि के बाद हर पास डाउनलोड करें। पास की निजी लिंक सुरक्षित रखें।'],
};

export default function AyambilInstructions() {
  const [language, setLanguage] = useState('gu');
  return <aside className="ay-language-guide" aria-label="Registration instructions">
    <label>Instructions / સૂચના / निर्देश <select value={language} onChange={e => setLanguage(e.target.value)} aria-label="Instruction language"><option value="en">English</option><option value="gu">ગુજરાતી</option><option value="hi">हिन्दी</option></select></label>
    <div lang={language} aria-live="polite"><strong>{instructions[language][0]}</strong><p>{instructions[language][1]}</p></div>
  </aside>;
}
