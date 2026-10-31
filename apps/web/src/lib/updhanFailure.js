const messages={
 401:'एडमिन session समाप्त है। फिर login करें। / Please sign in again.',
 403:'इस कार्रवाई की अनुमति नहीं मिली। पेज refresh करें और फिर जाँचें। / Permission or session check failed.',
 409:'जानकारी बदल चुकी है। नया status देखकर ही अगली कार्रवाई करें। / Refresh the current status before continuing.',
 413:'फोटो या आवेदन बहुत बड़ा है। छोटी फोटो चुनें। / Choose a smaller photo.',
 429:'बहुत अधिक प्रयास हुए हैं। एक मिनट बाद फिर जाँचें। / Please wait a minute before retrying.',
 400:'दी गई जानकारी या फोटो सही नहीं है। आवश्यक fields जाँचें। / Check the form and photo.',
 422:'दी गई जानकारी स्वीकार नहीं हुई। आवश्यक fields जाँचें। / Check the required fields.',
};
export function updhanFailureMessage(error,{uncertain=false}={}){
 let text=error.code==='registration_closed'?'अभी नए आवेदन बंद हैं। / Registration is currently closed.':error.code==='option_unavailable'?'यह साधना विकल्प अभी उपलब्ध नहीं है। / This option is not available.':error.code==='privacy_not_configured'?'आवेदन की व्यवस्था अभी तैयार नहीं है। आयोजक से संपर्क करें। / Registration setup is incomplete.':messages[error.status]||'सिस्टम से संपर्क नहीं हो पाया। कुछ समय बाद status जाँचें। / Service unavailable; check again shortly.';
 if(uncertain)text+=' आवेदन या कार्रवाई सुरक्षित हुई हो सकती है। दोबारा नया आवेदन न बनाएँ; इसी प्रयास से स्थिति जाँचें। / The result is unconfirmed; check the same attempt before repeating.';
 if(/^[a-f0-9-]{36}$/i.test(error.requestId||''))text+=' सहायता कोड / Support ID: '+error.requestId;
 return text;
}
