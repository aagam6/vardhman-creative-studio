import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { MessageCircle, Award, ChevronRight, Menu, X, ShieldCheck, CheckCircle2, Phone, MapPin, Ticket, CalendarDays, Clock, Users, Flag, Sparkles, BookOpen, Flame, GraduationCap, Compass, Navigation } from 'lucide-react';
import { contactConfig } from '@/lib/contactConfig';
import EventFooter from '@/components/EventFooter.jsx';
import { Play, Share2, Send, Facebook, Twitter, Copy, ExternalLink, Linkedin, Mail } from 'lucide-react';


// --- DATA CONSTANTS ---
const canonicalUrl = 'https://vardhmancreativestudio.com/param-vir-chakra';
const heroImage = 'https://vardhmancreativestudio.com/assets/param-vir-chakra-hero.png';
const registrationFormUrl = 'https://forms.gle/fBaiW3Wq9duDv1sh8'; 

// ... (अपना seoArticleList, faqs, आदि यहाँ रखें) ...
const blessings = [
  {
    title: 'बंधुबेलड़ी',
    text: 'परम पूज्य आचार्यदेव श्री हेमचंद्रसागरसूरिजी महाराजा के शिष्यरत्न',
  },
  {
    title: 'वर्धमान तपोनिधि',
    text: 'परम पूज्य आचार्यदेव श्री सम्यकचंद्रसागरसूरिजी महाराजा',
  },
  {
    title: 'युवा साहित्य सर्जक',
    text: 'परम पूज्य आचार्यदेव श्री तारकचंद्रसागरसूरिजी महाराजा',
  },
];

const guests = [
  {
    name: 'श्री हर्षल पुष्कर्णा',
    roles: ['लेखक,पत्रकार,मुख्य वक्ता'],
    bio: 'श्री हर्षल पुष्कर्णा सुप्रसिद्ध भारतीय पत्रकार, लेखक, प्रकाशक, ट्रैकर और डिजिटल कंटेंट क्रिएटर हैं। वे विज्ञान, रक्षा, इतिहास और यात्रा जैसे विषयों पर ज्ञानवर्धक और प्रामाणिक लेखन के लिए जाने जाते हैं। गुजरात से ताल्लुक रखने वाले हर्षल पुष्कर्णा, प्रसिद्ध गुजराती विज्ञान लेखक नागेंद्र विजय के पुत्र और लेखक विजयगुप्त मौर्य के परिवार से जुड़े हैं। वे लोकप्रिय ज्ञान-विज्ञान पत्रिका सफारी में लंबे समय तक कार्यकारी संपादक और लेखक रहे हैं। वे Gypsy Traveller डिजिटल यात्रा विश्वकोश के संस्थापक-संपादक हैं और Uranus Books के माध्यम से ज्ञानवर्धक साहित्य पाठकों तक पहुँचाते हैं। उनकी पुस्तकों में आ छे सिआचेन, परमवीर चक्र, वडनगर एक अदग नगर, चालो लद्दाख और शौर्य जैसी कृतियाँ शामिल हैं।',
  },
  {
    name: 'पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज',
    roles: ['यशोनंदन'],
    bio: 'पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज जैन धर्म के प्रतिभाशाली, युवा और ओजस्वी संत हैं। वे अद्भुत स्मरण शक्ति, भाषाई पकड़ और विशिष्ट व्याख्यान शैली के लिए जैन समाज में विशेष रूप से प्रसिद्ध हैं। अल्पायु में वैराग्य स्वीकार कर वे संयम, साधना और आत्म-कल्याण के मार्ग पर अग्रसर हुए। उनके व्याख्यान जैन दर्शन के साथ भारत की प्राचीन संस्कृति, गौरवशाली इतिहास और राष्ट्रभावना से ओतप्रोत रहते हैं। भाषा पर उनके असाधारण नियंत्रण का उदाहरण उनके कठिन साहित्यिक प्रयोगों में देखा जाता है, जिनमें ओष्ठ्य वर्णों के बिना दीर्घ प्रवचन जैसी दुर्लभ सिद्धि भी शामिल मानी जाती है। उनका व्यक्तित्व युवाओं को वाणी-संयम, अनुशासन, संस्कृति और चरित्र निर्माण की प्रेरणा देता है।',
  },
];

const attractions = ['देशभक्ति', 'वीरता', 'प्रेरणा', 'इतिहास', 'राष्ट्र गौरव'];

const pvcHeroes = [
  { name: 'मेजर सोमनाथ शर्मा', battle: 'Battle of Badgam', year: '1947', story: 'कश्मीर की रक्षा में अदम्य साहस दिखाते हुए उन्होंने अपने साथियों का मनोबल बनाए रखा और सर्वोच्च बलिदान दिया।' },
  { name: 'नायक जदुनाथ सिंह', battle: 'Naushahra', year: '1948', story: 'अत्यंत कठिन परिस्थिति में उन्होंने दुश्मन का सामना किया और अपने मोर्चे की रक्षा करते हुए अमर हो गए।' },
  { name: 'कंपनी हवलदार मेजर पीरू सिंह', battle: 'Tithwal', year: '1948', story: 'घायल होने के बाद भी वे आगे बढ़ते रहे और असाधारण वीरता का उदाहरण बने।' },
  { name: 'मेजर शैतान सिंह', battle: 'Rezang La', year: '1962', story: 'लद्दाख की बर्फीली ऊंचाइयों पर उन्होंने अपने सैनिकों के साथ अंतिम क्षण तक मोर्चा संभाला।' },
  { name: 'क्वार्टर मास्टर हवलदार अब्दुल हमीद', battle: 'Asal Uttar', year: '1965', story: 'टैंक युद्ध में असाधारण साहस दिखाकर उन्होंने भारत की रक्षा में अविस्मरणीय योगदान दिया।' },
  { name: 'सेकंड लेफ्टिनेंट अरुण खेत्रपाल', battle: 'Battle of Basantar', year: '1971', story: 'कम आयु में अद्भुत नेतृत्व और साहस दिखाते हुए उन्होंने राष्ट्र के लिए सर्वोच्च बलिदान दिया।' },
  { name: 'कैप्टन विक्रम बत्रा', battle: 'Kargil War', year: '1999', story: 'कारगिल की चोटियों पर उनके नेतृत्व, जोश और बलिदान ने पूरे देश को प्रेरित किया।' },
  { name: 'राइफलमैन संजय कुमार', battle: 'Kargil War', year: '1999', story: 'भारी गोलीबारी के बीच आगे बढ़कर उन्होंने असाधारण साहस और कर्तव्यनिष्ठा का परिचय दिया।' },
];

const whyAttend = [
  {
    title: 'देशभक्ति',
    text: 'भारत के वीरों के प्रति सम्मान और राष्ट्र के प्रति जिम्मेदारी की भावना को गहराई से अनुभव करने का अवसर।',
    accent: 'saffron',
    icon: 'Flag',
  },
  {
    title: 'प्रेरणा',
    text: 'Param Vir Chakra विजेताओं की सच्ची शौर्यगाथाएँ युवाओं और परिवारों को जीवन मूल्यों से जोड़ती हैं।',
    accent: 'white',
    icon: 'Sparkles',
  },
  {
    title: 'इतिहास',
    text: 'India’s Highest Gallantry Award से जुड़े प्रसंगों को सरल, प्रामाणिक और यादगार storytelling में समझने का अवसर।',
    accent: 'green',
    icon: 'BookOpen',
  },
  {
    title: 'राष्ट्र गौरव',
    text: 'भारतीय ध्वज, अशोक चक्र और National War Memorial की भावना से प्रेरित एक गरिमामय patriotic experience।',
    accent: 'gold',
    icon: 'Award',
  },
  {
    title: 'वीरता',
    text: 'साहस, त्याग और कर्तव्यनिष्ठा के वे उदाहरण जो हर नागरिक को अपने जीवन में मजबूत बनाते हैं।',
    accent: 'saffron',
    icon: 'Flame',
  },
  {
    title: 'युवा प्रेरणा',
    text: 'Students और young professionals के लिए leadership, discipline और character building की practical सीख।',
    accent: 'white',
    icon: 'GraduationCap',
  },
  {
    title: 'Leadership',
    text: 'दबाव में निर्णय, जिम्मेदारी और team spirit जैसे गुणों को भारत के वीरों की कहानियों से समझना।',
    accent: 'green',
    icon: 'Compass',
  },
  {
    title: 'Character Building',
    text: 'कार्यक्रम का उद्देश्य केवल जानकारी देना नहीं, बल्कि संयम, साहस और सेवा भाव को जीवन में उतारना है।',
    accent: 'gold',
    icon: 'ShieldCheck',
  },
];

const timeline = [
  ['Open Now', 'Register Online'],
  ['WhatsApp', 'Receive Collection Info'],
  ['Pre-Event', 'Collect Physical Pass'],
  ['09 August', 'Event Entry'],
];
const seoArticle = [
  'Param Vir Chakra – Shaurya Gatha is designed as an official patriotic experience that brings together history, emotion, learning and national pride. The Param Vir Chakra is India’s Highest Gallantry Award, and every Param Vir Chakra Award story carries a message of courage that goes far beyond the battlefield. This Ahmedabad Event is created for people who want to understand the values behind sacrifice, discipline, leadership and service to the nation.',
  'The Param Vir Chakra Winners represent the highest ideals of bravery. Their stories are not only military accounts; they are lessons in decision making, responsibility and character. When citizens learn about Indian Army Heroes such as Major Somnath Sharma, Major Shaitan Singh, Abdul Hamid, Arun Khetarpal, Captain Vikram Batra and many others, they discover how ordinary human beings can rise to extraordinary heights when duty calls.',
  'Param Vir Chakra Stories have the power to inspire students, professionals, families and community leaders. In a world filled with distractions, these stories remind us that courage is not loud, sacrifice is not selfish and patriotism is not a slogan. True patriotism is visible in discipline, honesty, responsibility and commitment to the greater good.',
  'The event at Dinesh Hall Ahmedabad is especially meaningful because Ahmedabad has always been a city of enterprise, culture, service and public life. Bringing Param Vir Chakra Shaurya Gatha to Ahmedabad creates an opportunity for young people to connect with National Pride through a refined, respectful and emotionally powerful format.',
  'This programme is not about violence or war imagery. It is about values. It is about the flame of Amar Jawan Jyoti, the dignity of the National War Memorial, the movement of the Indian Flag and the timeless symbolism of the Ashoka Chakra. The design and storytelling direction of this website also follows that same principle: premium, calm, trustworthy and deeply Indian.',
  'For students and youth, Param Vir Chakra Shaurya Gatha can become a character-building experience. Leadership does not begin only in uniform; it begins with keeping promises, respecting time, taking responsibility, protecting truth and standing firm during difficulty. The lives of Param Vir Chakra Winners show these qualities in their purest form.',
  'For parents, teachers and organisations, this patriotic event offers a meaningful way to introduce the next generation to India’s Highest Gallantry Award. Many people know the name Param Vir Chakra, but fewer know the complete stories, the battles, the decisions and the personal courage behind each awardee. This event aims to make those stories memorable and relevant.',
  'The programme naturally includes themes such as Patriotism, Sacrifice, Courage, National Pride, Indian Army Heroes, Veer Gatha, Shaurya Gatha and leadership. These keywords are not added only for search engines; they are the real substance of the event. The goal is to create content useful enough for Google and powerful enough for the heart.',
  'Param Vir Chakra Ahmedabad searches often come from people looking for a serious patriotic event, a Desh Bhakti Event, a youth inspiration programme or a National Pride Event. This official page answers those needs with event details, registration information, guest details, organiser information, FAQs and an accessible mobile-first structure.',
  'Every registration will be handled with verification because limited seats require responsibility. Registration is now open. Visitors can review the event details, understand the purpose, read about Param Vir Chakra heroes and register. After submission, confirmation will be sent on WhatsApp.',
  'The presence of Shri Harshal Pushkarna and Pujya Muni Shri Shramanchandrasagarji Maharaj adds intellectual and spiritual depth. One side brings research, storytelling and public communication; the other brings values, discipline and inner inspiration. Together, they support the larger mission of transforming patriotic remembrance into living character.',
  'Param Vir Chakra – Shaurya Gatha is therefore more than an event page. It is a public-facing knowledge resource, a registration platform and a digital tribute to India’s bravest sons. It honours the past while inspiring the present generation to live with courage, integrity and national responsibility.',
];
const importantInfo = [
  'Entry is completely FREE with a valid Physical Entry Pass.',
  'General seating is allotted on a First-Come, First-Served basis (seats are limited).',
  'Passes can be collected from Shri Vardhaman Jain Sangh, Usmanpura, Ahmedabad.',
  'Only participants carrying a valid Physical Entry Pass will be allowed entry into Dinesh Hall.',
  'For assistance and passes, call our helpline at +91 63521 88150.'
];

const termsAndConditions = [
  "Entry is completely FREE but possessing a valid Physical Entry Pass is mandatory.",
  "Seats at Dinesh Hall are limited and allotted strictly on a first-come, first-served basis.",
  "Online registration is closed. Passes can now be obtained directly from Shri Vardhaman Jain Sangh, Usmanpura, Ahmedabad.",
  "Participants must present their physical pass at the entrance of Dinesh Hall on the day of the event.",
  "Only participants carrying a valid Physical Entry Pass will be allowed entry into Dinesh Hall.",
  "The organisers reserve the right of admission and may approve or deny entry in accordance with hall capacity.",
  "The event schedule, venue, speakers, or programme may be subject to change due to unavoidable circumstances.",
  "Photography and videography may be conducted during the event for documentation purposes.",
  "All attendees are requested to be seated 15 minutes before the programme commences (by 8:45 AM)."
];
const faqs = [
  {
    question: "What is the Param Vir Chakra award?",
    answer: "The Param Vir Chakra (PVC) is India's highest military decoration, awarded for displaying the most conspicuous bravery, daring, or pre-eminent act of valour or self-sacrifice in the presence of the enemy on land, at sea, or in the air."
  },
  {
    question: "Who is organizing the Param Vir Chakra – Shaurya Gatha event?",
    answer: "The event is proudly organized by the Shri Vardhman Shwetambar Murtipujak Jain Sangh, located in Usmanpura, Ahmedabad, Gujarat, India."
  },
  {
    question: "Where is the venue for the Param Vir Chakra – Shaurya Gatha event?",
    answer: "The event will be held at the historic Dinesh Hall, located in Navrangpura, Ahmedabad, Gujarat, India (Postal Code: 380009)."
  },
  {
    question: "Is there an official teaser available?",
    answer: "Yes. Watch the Official Teaser on YouTube before attending the event to experience its vision and inspiration."
  },
  {
    question: "When is the Param Vir Chakra – Shaurya Gatha event scheduled?",
    answer: "The event is scheduled for Sunday, 9 August 2026, starting at 9:00 AM onwards at Dinesh Hall, Ahmedabad."
  },
  {
    question: "Who are the keynote speakers for the Shaurya Gatha event?",
    answer: "The keynote speakers are Shri Harshal Pushkarna, a noted author and military historian, and Pujya Muni Shri Shramanchandrasagarji Maharaj, a revered Jain monk and spiritual leader."
  },
  {
    question: "Under whose spiritual guidance is Pujya Muni Shri Shramanchandrasagarji Maharaj?",
    answer: "Pujya Muni Shri Shramanchandrasagarji Maharaj is a disciple of Acharya Shri Hemchandrasagarsuriji Maharaj, under the spiritual guidance of Acharya Shri Samyakchandrasagarsuriji Maharaj and Acharya Shri Tarakchandrasagarsuriji Maharaj."
  },
  {
    question: "Is entry free for the Param Vir Chakra event?",
    answer: "Yes, entry is completely FREE. However, carrying a valid Physical Entry Pass collected prior to the event is mandatory."
  },
  {
    question: "How and where do I collect my Physical Entry Pass?",
    answer: "Online pass booking is now closed. You can collect your Physical Entry Pass directly from Shri Vardhaman Jain Shwetambar Murtipujak Sangh (Usmanpura Char Rasta, Ashram Road, Ahmedabad – 380014, Gujarat) or contact Support at +91 63521 88150."
  },
  {
    question: "Is the online registration currently open?",
    answer: "Online registration via Google Form has concluded. Passes can now be obtained directly from our collection venue at Shri Vardhaman Jain Sangh, Usmanpura, Ahmedabad or by calling Support at +91 63521 88150."
  },
  {
    question: "Is having an entry pass mandatory to attend this event?",
    answer: "Yes, having a Physical Entry Pass is strictly mandatory. Seating at Dinesh Hall is limited, and entry will be permitted only to pass holders on a first-come, first-served basis."
  },
  {
    question: "What information must I provide to collect passes?",
    answer: "You can visit the collection venue at Usmanpura, Ahmedabad or contact our support team at +91 63521 88150."
  },
  {
    question: "What are the timings for pass collection?",
    answer: "Pass collection is open at Shri Vardhaman Jain Sangh, Usmanpura. You can also call or WhatsApp +91 63521 88150 between 10:00 AM and 6:00 PM for assistance."
  },
  {
    question: "Is there an age limit for attendees of the event?",
    answer: "The recommended age limit for participants is between 15 and 50 years to ensure that the patriotic and historical concepts are well understood."
  },
  {
    question: "Who was the first recipient of the Param Vir Chakra?",
    answer: "Major Somnath Sharma of the 4th Battalion, Kumaon Regiment, was the first recipient of the Param Vir Chakra. He was posthumously awarded for his heroic stand during the Battle of Badgam in 1947."
  },
  {
    question: "Who designed the Param Vir Chakra medal?",
    answer: "The Param Vir Chakra medal was designed by Savitri Khanolkar (born Eve Yvonne Maday de Maros), a Swiss-born woman who married Captain (later Major-General) Vikram Khanolkar of the Indian Army."
  },
  {
    question: "What is the literal meaning of Param Vir Chakra?",
    answer: "Param Vir Chakra literally translates to the 'Wheel of the Ultimate Brave' (परम वीर चक्र) in Sanskrit, symbolizing the highest honor of courage and sacrifice."
  },
  {
    question: "Can I get passes for multiple family members?",
    answer: "Yes, you can collect passes for family members by visiting Shri Vardhaman Jain Sangh, Usmanpura, Ahmedabad or by calling Support at +91 63521 88150."
  },
  {
    question: "What is the entry policy on the day of the event?",
    answer: "Only participants carrying a valid Physical Entry Pass collected from the designated center prior to the event will be allowed entry. Seating is on a first-come, first-served basis, so please arrive early."
  },
  {
    question: "Is general seating reserved at Dinesh Hall?",
    answer: "No, general seating is unreserved and allotted on a First-Come, First-Served basis. A limited number of seats are reserved only for invited guests, dignitaries, and organizers."
  },
  {
    question: "Why should students and youth attend this event?",
    answer: "Students and youth will get unique insights into India's military history, learn real-life values of leadership and courage, and find inspiration for character building."
  },
  {
    question: "What benefits do parents get by bringing their children?",
    answer: "Parents can introduce their children to real-life national heroes, instilling essential moral values, civic responsibility, and national pride in the young generation."
  },
  {
    question: "Will photography or videography be allowed inside the venue?",
    answer: "Official photography and videography will be conducted by the organizers. By registering, participants consent to the use of their photos and videos for documentation purposes."
  },
  {
    question: "Whom can I contact for passes and queries?",
    answer: "You can contact our support helpline at +91 63521 88150 via phone call or WhatsApp message. Support timings are Monday to Saturday, from 10:00 AM to 6:00 PM."
  },
  {
    question: "Is this event only for a specific community?",
    answer: "No, the event is open to all citizens, students, and families who wish to pay tribute to India's highest gallantry heroes and learn about our nation's history."
  },
  {
    question: "How many times has the Param Vir Chakra been awarded?",
    answer: "The Param Vir Chakra has been awarded 21 times to date. Out of these 21 bravehearts, 14 were awarded the medal posthumously for their ultimate sacrifice."
  },
  {
    question: "Can I transfer my event pass to someone else?",
    answer: "No, the pass is registered in the name of the participant. Pass transfer is generally not allowed unless explicitly approved by the organizer team."
  },
  {
    question: "What should I bring to the venue on the event day?",
    answer: "Please carry your Official Physical Entry Pass (collected prior to the event) and a valid photo identity proof for entry at Dinesh Hall."
  },
  {
    question: "What should I do if I cannot attend the event after registering?",
    answer: "Since seating is limited, if you are unable to attend, please inform the support team at +91 63521 88150 so your seat can be allocated to another participant."
  },
  {
    question: "What is the official website URL for the event?",
    answer: "The official event page and registration hub is located at https://vardhmancreativestudio.com/param-vir-chakra."
  },
  {
    question: "What does the 'Shaurya Gatha' event represent?",
    answer: "Param Vir Chakra – Shaurya Gatha is a grand patriotic tribute celebrating the spirit of Honour, Courage, Sacrifice, and National Pride through storytelling and spiritual discourses."
  },
  {
    question: "Who is Shri Harshal Pushkarna?",
    answer: "Shri Harshal Pushkarna is a renowned Gujarati journalist, author, and military historian who has written extensively about the Indian Armed Forces and travelled to remote border frontiers."
  },
  {
    question: "Who is Pujya Muni Shri Shramanchandrasagarji Maharaj?",
    answer: "Pujya Muni Shri Shramanchandrasagarji Maharaj is a respected spiritual speaker and Jain monk who inspires the youth toward ethical living, character building, and patriotism."
  },
  {
    question: "What is the role of Shri Vardhman Sangh in this event?",
    answer: "Shri Vardhman Shwetambar Murtipujak Jain Sangh is the primary organizer, hosting this event to foster national values, moral education, and gratitude toward our soldiers."
  },
  {
    question: "Do I need to pay or upload a screenshot to register?",
    answer: "No. Registration is completely FREE and there is no payment required. You do not need to upload any payment screenshot or UTR."
  },
  {
    question: "By submitting the form, do I agree to all Terms and Conditions?",
    answer: "Yes, submitting the registration form confirms that you have read, understood, and agreed to follow all 10 official Terms & Conditions specified by the organizers."
  }
];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Watch Recording', href: '#teaser' },
  { label: 'Guests', href: '#guests' },
  { label: 'Highlights & Gratitude', href: '#highlights' },
  { label: 'FAQ', href: '#faq' }
];

const eventCards = [
  { icon: CalendarDays, title: 'कार्यक्रम तिथि', label: '9 अगस्त 2026', detail: 'रविवार (संपन्न)' },
  { icon: Clock, title: 'समय', label: 'प्रातः 9:00 बजे', detail: 'सफलतापूर्वक संपन्न' },
  { icon: MapPin, title: 'स्थान', label: 'दीनेश हॉल', detail: 'नवरंगपुरा, अहमदाबाद', link: 'https://maps.app.goo.gl/NC4XSturo5sA2736A' },
  { icon: Award, title: 'आयोजक', label: 'श्री वर्धमान जैन संघ', detail: 'उस्मानपुरा, अहमदाबाद' },
];
const countdown = {
  targetDate: '2026-08-09T09:00:00', // आपके इवेंट की तारीख
  title: 'Shaurya Gatha Begins In'
};
const SectionHeader = ({ eyebrow, title, children, light }) => (
  <div className={`mx-auto mb-16 max-w-3xl text-center ${light ? 'text-white' : 'text-[#172033]'}`}>
    <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#b57a2a]">{eyebrow}</p>
    <h2 className="font-serif text-3xl font-bold md:text-5xl">{title}</h2>
    {children && <p className="mt-6 text-lg opacity-80">{children}</p>}
  </div>
);
const PremiumEmblem = ({ tone }) => (
  <div className={`mx-auto h-12 w-12 border-2 ${tone === 'gold' ? 'border-[#b57a2a]' : 'border-white/30'} flex items-center justify-center rotate-45`}>
    <Award className={`${tone === 'gold' ? 'text-[#b57a2a]' : 'text-white'} -rotate-45 h-6 w-6`} />
  </div>
);



export default function ParamVirChakraPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [activeHash, setActiveHash] = useState('#hero');
  const [copied, setCopied] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

  const downloadIcsFile = () => {
    const calendarData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Vardhman Creative Studio//Param Vir Chakra Event//EN",
      "BEGIN:VEVENT",
      "UID:pvc-shaurya-gatha-2026",
      "DTSTAMP:20260730T120000Z",
      "DTSTART:20260809T033000Z", // 9:00 AM IST in UTC
      "DTEND:20260809T073000Z",   // 1:00 PM IST in UTC
      "SUMMARY:Param Vir Chakra – Shaurya Gatha",
      "DESCRIPTION:A premium patriotic Ahmedabad event dedicated to Param Vir Chakra winners.",
      "LOCATION:Dinesh Hall, Navrangpura, Ahmedabad",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([calendarData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "event-shaurya-gatha.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Google Map Loading State & Ref
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);

  // Reading Progress Bar State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  // Live Countdown State & Logic
  const calculateTimeLeft = () => {
    // Target Event: 9 August 2026 09:00 AM IST (Asia/Kolkata)
    const targetDate = new Date("2026-08-09T09:00:00+05:30");
    const conclusionDate = new Date("2026-08-09T13:00:00+05:30"); // Estimated 4 hours duration
    const difference = +targetDate - +new Date();
    const conclusionDiff = +conclusionDate - +new Date();
    
    if (difference > 0) {
      return {
        status: "upcoming",
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    } else if (conclusionDiff > 0) {
      return { status: "live" };
    } else {
      return { status: "concluded" };
    }
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Map Intersection Observer
  useEffect(() => {
    if (!mapRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMapLoaded(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  // Reading Progress Listener
  useEffect(() => {
    const handleScrollProgress = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(progress);
        
        // Show reading progress only when user is reading main content (e.g. past hero)
        if (window.scrollY > 400 && window.scrollY < totalHeight - 300) {
          setShowProgress(true);
        } else {
          setShowProgress(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScrollProgress);
    return () => window.removeEventListener('scroll', handleScrollProgress);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Web Share API with Manual Fallback Support
  const handleShareEvent = (platform, e) => {
    const shareData = {
      title: "Param Vir Chakra – Shaurya Gatha Event",
      text: "Experience the patriotic grand book launch & event 'Param Vir Chakra – Shauryagatha' on 9 August 2026 at Ahmedabad.",
      url: canonicalUrl
    };

    if (platform !== 'copy' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      e.preventDefault();
      navigator.share(shareData).catch(() => {
        // Silent catch or fallback to manual share
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavSolid(true);
      } else {
        setNavSolid(false);
      }

      const sections = ['hero', 'teaser', 'about', 'guests', 'highlights', 'faq'];
      let currentSection = '#hero';
      
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            currentSection = `#${sectionId}`;
            break;
          }
        }
      }
      setActiveHash(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const schemas = useMemo(() => {
    const schemas = {
      event: {
        "@context": "https://schema.org",
        "@type": "Event",

        name: "Param Vir Chakra – Shaurya Gatha",

        description:
          "A premium patriotic event dedicated to India's Param Vir Chakra heroes.",

        startDate: "2026-08-09T09:00:00+05:30",

        endDate: "2026-08-09T13:00:00+05:30",

        image:
          "https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg",

        eventAttendanceMode:
          "https://schema.org/OfflineEventAttendanceMode",

        eventStatus:
          "https://schema.org/EventScheduled",

        location: {
          "@type": "Place",
          name: "Dinesh Hall",
          image: "https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Navrangpura",
            addressLocality: "Ahmedabad",
            addressRegion: "Gujarat",
            addressCountry: "IN",
            postalCode: "380009"
          },
          telephone: "+91 63521 88150"
        },

        organizer: {
          "@type": "Organization",
          name: "Shri Vardhman Shwetambar Murtipujak Jain Sangh",
          url: "https://vardhmancreativestudio.com",
          logo: "https://vardhmancreativestudio.com/assets/logo.png"
        },

        performer: [
          {
            "@type": "Person",
            name: "Harshal Pushkarna",
            jobTitle: "Author and Editor",
            description: "Prominent writer, editor and public speaker focusing on the patriotic and historical narratives of Indian military heroes.",
            url: "https://vardhmancreativestudio.com/param-vir-chakra"
          },
          {
            "@type": "Person",
            name: "Muni Shri Shramanchandrasagarji Maharaj",
            jobTitle: "Spiritual Leader",
            description: "Respected Jain Muni inspiring national values, spiritual discipline, and character building among modern youth.",
            url: "https://vardhmancreativestudio.com/param-vir-chakra"
          }
        ],

        offers: {
          "@type": "Offer",
          url: canonicalUrl,
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          validFrom: "2026-07-15T00:00:00+05:30"
        }
      },

      image: {
        "@context": "https://schema.org",
        "@type": "ImageObject",

        contentUrl:
          "https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg",

        url:
          "https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg",

        name: "Param Vir Chakra – Shaurya Gatha",

        caption:
          "Official Hero Image of Param Vir Chakra – Shaurya Gatha",

        width: 1200,

        height: 630,

        encodingFormat: "image/jpeg"
      },

      organization: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": contactConfig.orgName,
        "alternateName": "Vardhman CS",
        "description": contactConfig.orgDescription,
        "image": "https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg",
        "telephone": contactConfig.contactPhone,
        "email": contactConfig.supportEmail,
        "url": contactConfig.orgWebsite,
        "logo": contactConfig.orgLogo,
        "sameAs": contactConfig.orgSocials,
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": contactConfig.contactPhone,
          "contactType": "customer service",
          "availableLanguage": ["English", "Hindi", "Gujarati"]
        }
      },

      faq: {
        "@context": "https://schema.org",

        "@type": "FAQPage",

        mainEntity: faqs.map(item => ({
          "@type": "Question",
          name: item.question,

          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      },

      breadcrumb: {
        "@context": "https://schema.org",

        "@type": "BreadcrumbList",

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://vardhmancreativestudio.com/"
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Param Vir Chakra Shaurya Gatha",
            item: canonicalUrl
          }
        ]
      },
      video: {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": "Param Vir Chakra – Shaurya Gatha Official Teaser",
        "description": "Watch the official video teaser of 'Param Vir Chakra – Shauryagatha', a cinematic tribute celebrating the courage, sacrifice and legacy of India's greatest heroes.",
        "thumbnailUrl": [
          "https://img.youtube.com/vi/U2QBAxmlohw/maxresdefault.jpg",
          "https://img.youtube.com/vi/U2QBAxmlohw/sddefault.jpg",
          "https://img.youtube.com/vi/U2QBAxmlohw/hqdefault.jpg"
        ],
        "uploadDate": "2026-07-28T09:00:00Z",
        "embedUrl": "https://www.youtube.com/embed/U2QBAxmlohw?rel=0&modestbranding=1",
        "contentUrl": "https://www.youtube.com/watch?v=U2QBAxmlohw",
        "publisher": {
          "@type": "Organization",
          "name": "Vardhman Creative Studio",
          "logo": {
            "@type": "ImageObject",
            "url": "https://vardhmancreativestudio.com/assets/logo.png"
          }
        }
      },
      place: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Dinesh Hall",
        "description": "Historic community auditorium and event venue in Navrangpura, Ahmedabad.",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Opp. Income Tax Office, Ashram Road, Navrangpura",
          "addressLocality": "Ahmedabad",
          "addressRegion": "Gujarat",
          "postalCode": "380009",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "23.0353816",
          "longitude": "72.5696144"
        },
        "sameAs": "https://maps.app.goo.gl/NC4XSturo5sA2736A"
      },
      aboutPage: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About Param Vir Chakra – Shauryagatha Event",
        "description": "Learn about the Shaurya Gatha event in Ahmedabad, dedicated to honoring India's Param Vir Chakra recipients.",
        "url": `${canonicalUrl}#about`,
        "mainEntity": {
          "@type": "Event",
          "name": "Param Vir Chakra – Shaurya Gatha"
        }
      },
      website: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Vardhman Creative Studio",
        "url": "https://vardhmancreativestudio.com",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://vardhmancreativestudio.com/?s={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      webpage: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Param Vir Chakra – Shaurya Gatha Official Site",
        "description": "Watch the official video teaser of Param Vir Chakra – Shaurya Gatha, a grand patriotic event and book launch dedicated to India's Param Vir Chakra heroes.",
        "url": canonicalUrl,
        "datePublished": "2026-07-28T09:00:00+05:30",
        "dateModified": "2026-07-30T12:00:00+05:30",
        "publisher": {
          "@type": "Organization",
          "name": "Vardhman Creative Studio"
        }
      }
    };

    return {
      event: schemas.event,
      image: schemas.image,
      organization: schemas.organization,
      faq: schemas.faq,
      breadcrumb: schemas.breadcrumb,
      video: schemas.video,
      place: schemas.place,
      aboutPage: schemas.aboutPage,
      website: schemas.website,
      webpage: schemas.webpage
    };
  }, []);

  return (
    <>
             <Helmet>
  {/* ================================
      PRECONNECT & DNS PREFETCH
  ================================= */}
  <link rel="preconnect" href="https://www.youtube.com" />
  <link rel="preconnect" href="https://i.ytimg.com" />
  <link rel="preconnect" href="https://img.youtube.com" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
  <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
  <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
  <link rel="dns-prefetch" href="https://www.youtube.com" />
  <link rel="dns-prefetch" href="https://i.ytimg.com" />

  {/* ================================
      PRELOAD CRITICAL ASSETS
  ================================= */}
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Martel:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&display=swap" as="style" />
  <link rel="preload" href={heroImage} as="image" />
  <link rel="preload" href="/assets/logo.png" as="image" />
  <link rel="preload" href="https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg" as="image" />

  {/* ================================
      BASIC SEO & LAST UPDATED META
  ================================= */}

<script type="application/ld+json">
  {JSON.stringify(schemas.image)}
</script>
  <title>
    Param Vir Chakra – Shaurya Gatha | Official Event & Video Teaser | Ahmedabad
  </title>

  <meta
    name="description"
    content="Watch the official video teaser of Param Vir Chakra – Shaurya Gatha, a grand patriotic event and book launch dedicated to India's Param Vir Chakra heroes. 9 August 2026 | Dinesh Hall | Ahmedabad."
  />

  <meta
    name="keywords"
    content="Param Vir Chakra, Shaurya Gatha, Official Teaser, Watch Trailer, Param Vir Chakra Shauryagatha Teaser, Independence Day Event, Book Launch, Patriotic Event, Ahmedabad Event, Harshal Pushkarna, Indian Army, Jain Event Ahmedabad"
  />
  <meta
    name="author"
    content="Vardhman Creative Studio"
  />
  <meta
    name="publisher"
    content="Vardhman Creative Studio"
  />
  <meta
    name="robots"
    content="index, follow, max-image-preview:large"
  />
  <meta
    name="googlebot"
    content="index,follow,max-image-preview:large"
  />
  <meta
    name="theme-color"
    content="#081320"
  />
  <meta
    name="revised"
    content="Thursday, July 30th, 2026, 12:00 pm"
  />
  <meta
    property="article:modified_time"
    content="2026-07-30T12:00:00+05:30"
  />
  <link
    rel="canonical"
    href={canonicalUrl}
  />
  {/* ================================
      OPEN GRAPH
  ================================= */}

  <meta property="og:type" content="website" />
  <meta
    property="og:site_name"
    content="Vardhman Creative Studio"
  />
  <meta
    property="og:locale"
    content="en_IN"
  />
  <meta
    property="og:url"
    content={canonicalUrl}
  />
  <meta
    property="og:title"
    content="Param Vir Chakra – Shaurya Gatha | Official Event & Video Teaser"
  />
  <meta
    property="og:description"
    content="Watch the official video teaser of Param Vir Chakra – Shaurya Gatha. A Grand Patriotic Experience celebrating India's greatest heroes. 9 August 2026 • Dinesh Hall • Ahmedabad."
  />
  <meta
    property="og:image"
    content="https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg"
  />
  <meta
    property="og:image:secure_url"
    content="https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg"
  />
  <meta
    property="og:image:width"
    content="1200"
  />
  <meta
    property="og:image:height"
    content="630"
  />
  <meta
    property="og:image:type"
    content="image/jpeg"
  />
  <meta
    property="og:image:alt"
    content="Param Vir Chakra Shaurya Gatha Official Event & Teaser"
  />
  {/* ================================
      TWITTER
  ================================= */}

  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="Param Vir Chakra – Shaurya Gatha | Official Event & Video Teaser"
  />

  <meta
    name="twitter:description"
    content="Watch the official video teaser of Param Vir Chakra – Shaurya Gatha. 9 August 2026 • Dinesh Hall • Ahmedabad"
  />

  <meta
    name="twitter:image"
    content="https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg"
  />

  {/* ================================
      EXTRA SEO
  ================================= */}

  <meta
    property="article:publisher"
    content="https://vardhmancreativestudio.com"
  />

  <meta
    property="business:contact_data:locality"
    content="Ahmedabad"
  />

  <meta
    property="business:contact_data:country_name"
    content="India"
  />

  {/* ================================
      JSON-LD
  ================================= */}

  <script type="application/ld+json">
    {JSON.stringify(schemas.event)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.organization)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.faq)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.breadcrumb)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.video)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.place)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.aboutPage)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.website)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.webpage)}
  </script>
</Helmet>

      <main className="min-h-screen bg-[#f7f1e5] text-[#172033] relative">
        {/* Sticky Reading Progress Bar */}
        {showProgress && (
          <div className="fixed top-[74px] left-0 right-0 z-[100] h-[3px] bg-[#d7c096]/20 pointer-events-none">
            <div 
              className="h-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808] transition-all duration-100 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        )}
      {/* HEADER SECTION - PREMIUM TRICOLOR REDESIGN */}
      <nav 
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          navSolid 
            ? "py-3 bg-[#050b14]/85 backdrop-blur-xl border-b border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.4)]" 
            : "py-5 bg-transparent"
        }`} 
        aria-label="Primary navigation"
      >
        {/* Tricolor top indicator line */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-1.5 lg:px-8">
          
          {/* Logo Brand Frame */}
          <a href="#hero" className="flex items-center gap-3 text-white group" aria-label="Param Vir Chakra Shaurya Gatha home">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-all duration-300 group-hover:border-[#ff9933]/50">
              {/* Tricolor glowing ring on hover */}
              <div className="absolute -inset-px -z-10 rounded-xl bg-gradient-to-r from-[#ff9933] via-white to-[#138808] opacity-35 blur-[2px] transition-all duration-300 group-hover:opacity-100 group-hover:blur-[4px]" />
              <Award className="h-5 w-5 text-[#ff9933] transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-extrabold tracking-[0.2em] text-white">PARAM VIR CHAKRA</span>
              <span className="block text-[10px] uppercase font-bold tracking-[0.15em] text-white/50 group-hover:text-white/70 transition-colors">Shaurya Gatha</span>
            </span>
          </a>
 
          {/* Floating Pill Nav Dock */}
          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 backdrop-blur-md px-1.5 py-1.5 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.2)]">
              {navItems.map((item) => (
                <a 
                  key={item.href} 
                  href={item.href} 
                  className={`relative text-[13px] font-bold uppercase tracking-wider transition-all duration-300 py-2 px-5 rounded-full hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none ${
                    activeHash === item.href 
                      ? "text-white bg-gradient-to-r from-white/10 to-white/5 shadow-md shadow-black/20" 
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {activeHash === item.href && (
                    <span className="absolute -bottom-1 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />
                  )}
                  {item.label}
                </a>
              ))}
            </div>

            {/* Custom CTA Outline Button */}
            <a 
              href="#teaser" 
              className="relative inline-flex items-center justify-center gap-2 rounded-full bg-[#050b14] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white border border-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,153,51,0.35)] group overflow-hidden focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none"
            >
              {/* Tricolor glowing outline border */}
              <span className="absolute inset-0 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] p-[1.5px] rounded-full -z-10" />
              <span className="relative z-10 flex items-center gap-1.5 text-white">
                <Play className="h-3.5 w-3.5 fill-[#ff9933] text-[#ff9933]" /> Watch Recording
              </span>
            </a>
          </div>
 
          {/* Mobile Hamburg Trigger */}
          <button 
            type="button" 
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 md:hidden focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none" 
            aria-label={menuOpen ? 'Close menu' : 'Open menu'} 
            aria-expanded={menuOpen} 
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile slide drawer */}
        {menuOpen ? (
          <div className="border-t border-white/5 bg-[#050b14]/95 backdrop-blur-2xl px-5 py-6 md:hidden shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a 
                  key={item.href} 
                  href={item.href} 
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition-all focus-visible:ring-2 focus-visible:ring-[#ff9933] outline-none ${
                    activeHash === item.href 
                      ? "text-white bg-white/10 border-l-2 border-[#ff9933]" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`} 
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a 
                href="#teaser" 
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff9933] to-[#138808] py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#ff9933]/15 outline-none"
                onClick={() => setMenuOpen(false)}
              >
                <Play className="h-4 w-4 fill-white" /> Watch Full Recording / रिकॉर्डिंग देखें
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      {/* HERO SECTION - ULTIMATE CINEMATIC PREMIUM REDESIGN */}
      <section id="hero" className="relative isolate overflow-hidden bg-[#040b14] pt-20 pb-12 text-white min-h-[95svh] flex flex-col justify-between">
        
        {/* Absolute Background Master Layers */}
        <div className="absolute inset-0 -z-10 select-none pointer-events-none">
          <img 
            src={heroImage} 
            alt="Param Vir Chakra Shaurya Gatha Luxury Artwork Background" 
            className="h-full w-full object-cover object-right-top md:object-center opacity-[0.45] scale-[1.02]" 
            loading="eager"
            fetchPriority="high"
          />
          {/* Deep Cinematic Ambient Radial Gradients to make text readable on the left */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(255,153,51,0.12),transparent_45%),radial-gradient(circle_at_85%_55%,rgba(19,136,8,0.1),transparent_50%),linear-gradient(90deg,rgba(4,11,20,0.98) 0%,rgba(4,11,20,0.85) 45%,rgba(4,11,20,0.4) 75%,rgba(4,11,20,0.2) 100%),linear-gradient(180deg,rgba(4,11,20,0.85) 0%,rgba(4,11,20,0) 20%,rgba(4,11,20,0) 80%,rgba(4,11,20,0.98) 100%)]" />
          <div className="absolute inset-0 opacity-[0.025] noise-bg" aria-hidden="true" />
        </div>

        {/* Main Content Layout Container */}
        <div className="mx-auto w-full max-w-7xl px-5 pt-8 pb-6 lg:px-8 flex-1 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          
          {/* Left Column: Typographic Branding & Details */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col justify-center">
            
            {/* Main Luxury Event Typography (Fixed Hindi Matra Clipping Issue) */}
            <h1 className="font-serif text-[3.2rem] font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[4.8rem] pb-1">
              परमवीर चक्र
              <span className="mt-1 block text-[#FF9933] filter drop-shadow-[0_2px_15px_rgba(255,153,51,0.3)]">
                शौर्यगाथा
              </span>
            </h1>

            {/* Event Explainer Hooks */}
            <p className="mt-3 max-w-lg text-lg font-semibold leading-relaxed text-[#FFB854] sm:text-xl">
              भारत के वीरों को समर्पित एक अद्भुत देशभक्ति अनुभव
            </p>
            
            <p className="mt-3 max-w-lg text-[14px] leading-6 text-white/90 font-light">
              भारत के सर्वोच्च वीरता सम्मान <strong className="font-medium text-white">परमवीर चक्र</strong> से सम्मानित अमर वीरों के अद्भुत साहस, त्याग और राष्ट्रभक्ति की प्रेरणादायी शौर्यगाथाओं पर आधारित एक भव्य कार्यक्रम।
            </p>

            {/* Live Event Status Banner */}
            <div className="mt-5 max-w-xl">
              <div className="inline-flex items-center gap-2.5 rounded-2xl border border-[#138808]/40 bg-[#138808]/15 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#138808]/20 backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 text-[#22c55e] shrink-0" />
                <span>कार्यक्रम भव्यता के साथ संपन्न • Event Successfully Concluded</span>
              </div>
            </div>

            {/* Interactive Call to Action Triggers */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <a 
                href="#teaser" 
                className="inline-flex min-h-[46px] h-[46px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#ff5500] px-6 text-[14px] font-bold text-[#090f19] shadow-[0_8px_24px_rgba(255,153,51,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(255,153,51,0.4)] hover:scale-105 active:scale-[0.98] outline-none"
              >
                <Play className="h-4 w-4 fill-[#090f19]" /> Watch Full Recording / रिकॉर्डिंग देखें
              </a>
              <a 
                href="#highlights" 
                className="inline-flex min-h-[46px] h-[46px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.03] px-6 text-[14px] font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-[#FF9933]/10 hover:border-[#FF9933]/50 hover:text-[#FF9933] active:scale-[0.98] outline-none"
              >
                ✨ Event Highlights & Gratitude
              </a>
              <a 
                href="#about" 
                className="inline-flex min-h-[46px] h-[46px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.03] px-6 text-[14px] font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:border-white/40 active:scale-[0.98] outline-none"
              >
                About Event
              </a>
              
              {/* Save the Date Dropdown Calendar */}
              <div className="relative">
                <button 
                  onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                  className="inline-flex min-h-[46px] h-[46px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.03] px-5 text-[14px] font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-[#ff9933]/40 active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[#ff9933]"
                  aria-expanded={showCalendarMenu}
                  aria-haspopup="true"
                >
                  <CalendarDays className="mr-2 h-4 w-4 text-[#ff9933]" /> Save the Date
                </button>
                {showCalendarMenu && (
                  <div className="absolute left-0 mt-2 z-50 w-52 rounded-xl border border-white/10 bg-[#090f19]/95 p-1.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <a 
                      href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Param+Vir+Chakra+–+Shaurya+Gatha&dates=20260809T033000Z/20260809T073000Z&details=A+premium+patriotic+Ahmedabad+event+dedicated+to+Param+Vir+Chakra+winners.&location=Dinesh+Hall,+Navrangpura,+Ahmedabad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setShowCalendarMenu(false)}
                    >
                      Google Calendar
                    </a>
                    <button 
                      onClick={() => { downloadIcsFile(); setShowCalendarMenu(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Apple Calendar (.ics)
                    </button>
                    <button 
                      onClick={() => { downloadIcsFile(); setShowCalendarMenu(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Outlook (.ics)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Exact Match Reference Grid Cards (Matched with image_d9b941.jpg) */}
            <div className="mt-8 grid gap-3 grid-cols-2 sm:grid-cols-4 lg:max-w-3xl">
              {eventCards.map((card) => {
                const CardElement = card.link ? 'a' : 'div';
                return (
                  <CardElement 
                    key={card.label} 
                    href={card.link}
                    target={card.link ? "_blank" : undefined}
                    rel={card.link ? "noopener noreferrer" : undefined}
                    aria-label={card.link ? `View event venue ${card.label} on Google Maps` : undefined}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-2.5 py-4 text-center backdrop-blur-md transition-all duration-300 hover:border-[#FF9933]/50 hover:bg-white/[0.08] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(255,153,51,0.15)] shadow-lg ${card.link ? 'cursor-pointer' : ''}`}
                  >
                    <card.icon className="mb-2.5 h-8.5 w-8.5 text-[#FF9933] transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                    <h3 className="text-[15px] font-bold text-white tracking-wide">{card.label}</h3>
                    <p className="mt-1 text-[11px] text-white/50 font-medium">{card.detail}</p>
                    {card.link && (
                      <span className="absolute bottom-1 right-2 text-[8px] text-[#ff9933]/60 uppercase tracking-widest font-semibold flex items-center gap-0.5">
                        Map <ExternalLink className="h-2 w-2" />
                      </span>
                    )}
                  </CardElement>
                );
              })}
            </div>

          </motion.div>

          {/* Right Column: Empty Space Holder to reveal the stunning image asset behind */}
          <div className="hidden lg:block pointer-events-none select-none" aria-hidden="true" />
        </div>

        {/* MIDDLE HIGHLIGHTS: TRICOLOR THEMED HERO BOXES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mt-12 px-4 pb-12">
          
          {/* Box 1: वीर गाथा (Saffron / केसरिया) */}
          <div className="relative flex flex-col items-center text-center p-8 rounded-3xl border border-[#ff9933]/15 bg-[#0c192d]/40 backdrop-blur-xl hover:border-[#ff9933]/60 hover:shadow-[0_15px_45px_rgba(255,153,51,0.15)] transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#ff9933]/[0.02] to-transparent" />
            <div className="p-4 rounded-2xl bg-[#ff9933]/10 mb-6 group-hover:scale-110 group-hover:bg-[#ff9933]/15 transition-all text-[#ff9933]">
              <ShieldCheck className="h-9 w-9 stroke-[1.8]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-3 transition-colors group-hover:text-[#ff9933]">वीर गाथा</h3>
            <p className="text-white/60 leading-relaxed text-sm">
              भारत के उन जाबांज़ों की अनकही कहानियाँ, जिन्होंने अपने साहस से इतिहास के पन्नों को स्वर्ण अक्षरों में दर्ज किया। 
            </p>
          </div>

          {/* Box 2: विशेष सम्मान (White / Blue - Ashoka Chakra vibe) */}
          <div className="relative flex flex-col items-center text-center p-8 rounded-3xl border border-white/10 bg-[#0c192d]/40 backdrop-blur-xl hover:border-white/30 hover:shadow-[0_15px_45px_rgba(255,255,255,0.08)] transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/[0.01] to-transparent" />
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:scale-110 group-hover:border-[#4d82f3]/50 transition-all text-[#4d82f3]">
              <Award className="h-9 w-9 stroke-[1.8]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-3 transition-colors group-hover:text-[#4d82f3]">विशेष सम्मान</h3>
            <p className="text-white/60 leading-relaxed text-sm">
              देश सेवा और अटूट पराक्रम की मिसाल पेश करने वाले असली नायकों का सम्मान, जो हम सभी को गौरवान्वित करते हैं।
            </p>
          </div>

          {/* Box 3: प्रेरणा (Green / हरा) */}
          <div className="relative flex flex-col items-center text-center p-8 rounded-3xl border border-[#138808]/15 bg-[#0c192d]/40 backdrop-blur-xl hover:border-[#138808]/60 hover:shadow-[0_15px_45px_rgba(19,136,8,0.12)] transition-all duration-500 group overflow-hidden">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#138808]/[0.02] to-transparent" />
            <div className="p-4 rounded-2xl bg-[#138808]/10 mb-6 group-hover:scale-110 group-hover:bg-[#138808]/15 transition-all text-[#138808]">
              <Users className="h-9 w-9 stroke-[1.8]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-3 transition-colors group-hover:text-[#138808]">प्रेरणा</h3>
            <p className="text-white/60 leading-relaxed text-sm">
              युवा पीढ़ी में राष्ट्रप्रेम और वीरता की भावना जगाने का एक महा-अभियान, जो आने वाली पीढ़ियों को दिशा दिखाएगा।
            </p>
          </div>

        </div>

      </section>

      {/* OFFICIAL TEASER SECTION - CINEMATIC YOUTUBE INTEGRATION */}
      <section id="teaser" className="relative px-5 py-20 lg:px-8 lg:py-28 bg-[#050c16] text-white overflow-hidden border-t border-white/5">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-[#ff9933]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-[#138808]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-5xl relative z-10">
          
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-[#ff9933]">Watch Full Recording</p>
            <h2 className="font-serif text-3xl font-bold md:text-5xl text-white">Official Event Recording</h2>
            <p className="mt-4 text-white/60 text-[15px] md:text-lg">9 अगस्त 2026 को आयोजित भव्य कार्यक्रम का संपूर्ण वीडियो प्रसारण</p>
          </div>

          {/* YouTube Video Player with 16:9 ratio and Glassmorphism Container */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: '-50px' }} 
            variants={fadeInUp}
            className="relative aspect-video w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md p-2 md:p-4 shadow-2xl hover:border-[#ff9933]/30 transition-all duration-500 mb-8"
          >
            <iframe
              src="https://www.youtube.com/embed/NjthLLyx964?rel=0&modestbranding=1"
              title="Param Vir Chakra – Shauryagatha Official Event Recording"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              className="h-full w-full rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              aria-label="Param Vir Chakra – Shauryagatha Official Event Recording"
            />
          </motion.div>

          {/* Video Description */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-white/80 text-[15px] leading-relaxed md:text-base font-light">
              दिनेश हॉल, नवरंगपुरा, अहमदाबाद में आयोजित <strong className="font-medium text-[#ff9933]">"परमवीर चक्र – शौर्यगाथा"</strong> के ऐतिहासिक राष्ट्रीय कार्यक्रम का पूरा वीडियो प्रसारण (Full Recording) देखें।
            </p>
          </div>

          {/* Action CTAs & Social Share Wrapper */}
          <div className="flex flex-col items-center gap-8 border-t border-white/5 pt-10">
            
            {/* Primary Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://www.youtube.com/watch?v=NjthLLyx964" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-[#ff9933] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 hover:scale-105 transition-all duration-300"
              >
                🔴 Watch on YouTube / यूट्यूब पर देखें <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
              <a 
                href="#highlights" 
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#ff9933] px-6 py-2.5 text-sm font-bold text-[#090f19] hover:bg-white transition-all duration-300 hover:scale-105"
              >
                ✨ Event Highlights & Gratitude
              </a>
              <a 
                href="#about" 
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                About Event Details
              </a>
            </div>

            {/* Social Share Buttons */}
            <div className="flex flex-col items-center gap-3 w-full max-w-lg mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5"><Share2 className="h-3.5 w-3.5" /> Share Event / इवेंट शेयर करें</span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                
                {/* WhatsApp */}
                <a 
                  href={`https://api.whatsapp.com/send?text=Watch%20the%20Official%20Teaser%20of%20Param%20Vir%20Chakra%20%E2%80%93%20Shauryagatha%20here%3A%20${encodeURIComponent(canonicalUrl)}`}
                  onClick={(e) => handleShareEvent('whatsapp', e)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Share Event on WhatsApp"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 hover:bg-[#138808]/10 hover:border-[#138808]/50 hover:text-[#138808] transition-all duration-300"
                >
                  <MessageCircle className="h-5 w-5" />
                </a>

                {/* Facebook */}
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
                  onClick={(e) => handleShareEvent('facebook', e)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Share Event on Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 hover:bg-[#3b5998]/10 hover:border-[#3b5998]/50 hover:text-[#3b5998] transition-all duration-300"
                >
                  <Facebook className="h-5 w-5" />
                </a>

                {/* X / Twitter */}
                <a 
                  href={`https://twitter.com/intent/tweet?text=Watch%20the%20Official%20Teaser%20of%20Param%20Vir%20Chakra%20%E2%80%93%20Shauryagatha%20here%3A&url=${encodeURIComponent(canonicalUrl)}`}
                  onClick={(e) => handleShareEvent('twitter', e)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Share Event on X"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 hover:bg-white/15 hover:border-white/40 transition-all duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </a>

                {/* Telegram */}
                <a 
                  href={`https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=Watch%20the%20Official%20Teaser%20of%20Param%20Vir%20Chakra%20%E2%80%93%20Shauryagatha`}
                  onClick={(e) => handleShareEvent('telegram', e)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Share Event on Telegram"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 hover:bg-[#0088cc]/10 hover:border-[#0088cc]/50 hover:text-[#0088cc] transition-all duration-300"
                >
                  <Send className="h-5 w-5" />
                </a>

                {/* LinkedIn */}
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`}
                  onClick={(e) => handleShareEvent('linkedin', e)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Share Event on LinkedIn"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 hover:bg-[#0077b5]/10 hover:border-[#0077b5]/50 hover:text-[#0077b5] transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>

                {/* Email */}
                <a 
                  href={`mailto:?subject=Param%20Vir%20Chakra%20%E2%80%93%20Shaurya%20Gatha%20Event&body=Watch%20the%20Official%20Teaser%20of%20Param%20Vir%20Chakra%20%E2%80%93%20Shauryagatha%20event%20here%3A%20${encodeURIComponent(canonicalUrl)}`}
                  onClick={(e) => handleShareEvent('email', e)}
                  aria-label="Share Event via Email"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 hover:bg-[#ea4335]/10 hover:border-[#ea4335]/50 hover:text-[#ea4335] transition-all duration-300"
                >
                  <Mail className="h-5 w-5" />
                </a>

                {/* Copy Link */}
                <button 
                  onClick={handleCopyLink}
                  aria-label="Copy Event link"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/15 hover:bg-[#ff9933]/10 hover:border-[#ff9933]/50 hover:text-[#ff9933] transition-all duration-300"
                >
                  {copied ? <CheckCircle2 className="h-5 w-5 text-[#138808]" /> : <Copy className="h-5 w-5" />}
                </button>
                
              </div>
              {copied && <span className="text-[10px] text-[#138808] font-bold tracking-wider uppercase animate-pulse">Link Copied!</span>}
            </div>

          </div>

        </div>
      </section>

     {/* BLESSINGS SECTION - PREMIUM ROYAL REDESIGN */}
      <section id="blessings" className="relative px-5 py-16 lg:px-8 lg:py-24 bg-gradient-to-b from-[#f7f1e5] to-[#fffaf0]">
        
        <SectionHeader eyebrow="Sacred Inspiration" title="पावन प्रेरणा">
          आध्यात्मिक प्रेरणा, सेवा और संस्कारों की गरिमा के साथ यह आयोजन राष्ट्रभक्ति के भाव को और गहरा बनाता है।
        </SectionHeader>

        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-50px' }} 
          variants={staggerContainer}
          className="mx-auto max-w-7xl relative"
        >
          {/* Ambient Background Glow for 3D Depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF9933]/15 via-transparent to-[#138808]/15 blur-3xl -z-10 rounded-[3rem]" aria-hidden="true" />

          {/* Main Premium Glassmorphic Container */}
          <article className="relative overflow-hidden rounded-[2.5rem] border border-[#d7c096]/60 bg-white/90 p-6 shadow-[0_20px_60px_rgba(96,65,15,0.05)] backdrop-blur-xl md:p-12">
            
            {/* Elegant Tricolor Top Border Gradient */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#000080]/40 to-[#138808]" aria-hidden="true" />

            <motion.div variants={fadeInUp} className="mx-auto max-w-3xl text-center mb-10 md:mb-12">
              <PremiumEmblem tone="gold" />
              <p className="mt-5 text-[13px] font-bold uppercase tracking-[0.25em] text-[#9d6b26]">
                Blessings & Guidance
              </p>
            </motion.div>

            {/* Primary Blessing Block - Saffron Accent */}
            <motion.div 
              variants={fadeInUp} 
              className="relative mx-auto max-w-4xl rounded-3xl border border-[#FF9933]/20 bg-gradient-to-br from-[#FF9933]/[0.04] to-transparent p-8 text-center shadow-sm transition-all duration-300 hover:border-[#FF9933]/40 hover:shadow-md md:p-10"
            >
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#FF9933]">
                {blessings[0].title}
              </p>
              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-[#172033] md:text-[2rem]">
                {blessings[0].text}
              </h3>
            </motion.div>

            {/* Secondary Blessings Grid - Navy Blue & Green Accents */}
            <div className="mt-6 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              {blessings.slice(1).map((item, idx) => {
                // Assigning Navy Blue to left, Green to right for Flag continuity
                const theme = idx === 0 
                  ? { border: 'border-[#000080]/15 hover:border-[#000080]/30', bg: 'from-[#000080]/[0.03]', text: 'text-[#000080]', align: 'text-center md:text-left' } 
                  : { border: 'border-[#138808]/20 hover:border-[#138808]/40', bg: 'from-[#138808]/[0.04]', text: 'text-[#138808]', align: 'text-center md:text-right' };

                return (
                  <motion.div 
                    variants={fadeInUp} 
                    key={item.title} 
                    className={`group relative overflow-hidden rounded-3xl border ${theme.border} bg-gradient-to-br ${theme.bg} to-transparent p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${theme.align}`}
                  >
                    <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${theme.text}`}>
                      {item.title}
                    </p>
                    <h3 className="mt-3 font-serif text-[1.15rem] font-semibold leading-snug text-[#172033] md:text-[1.35rem]">
                      {item.text}
                    </h3>
                  </motion.div>
                );
              })}
            </div>

          </article>
        </motion.div>
      </section>

      {/* FEATURED SPEAKERS - PREMIUM GLASSMORPHIC REDESIGN */}
      <section id="guests" className="relative bg-[#040b14] px-5 py-24 text-white lg:px-8 overflow-hidden">
        {/* Ambient Dark Background Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,153,51,0.06),transparent_50%),radial-gradient(circle_at_80%_100%,rgba(19,136,8,0.06),transparent_50%)]" aria-hidden="true" />
        
        <div className="relative mx-auto max-w-7xl">
          <SectionHeader eyebrow="Featured Speakers" title="दो प्रेरणादायी वक्ता" light>
            <span className="text-white/70">ज्ञान, प्रेरणा और राष्ट्रगौरव के भाव को मंच पर जीवंत करने वाले दो मुख्य वक्ता।</span>
          </SectionHeader>
          
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: '-50px' }} 
            variants={staggerContainer}
            className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2"
          >
            {guests.map((guest, idx) => {
              // Left Card gets Saffron accent, Right Card gets Green accent
              const theme = idx === 0 
                ? { border: 'group-hover:border-[#FF9933]/50', glow: 'from-transparent via-[#FF9933] to-transparent', icon: 'text-[#FF9933]', bg: 'bg-[#FF9933]/5', pill: 'border-[#FF9933]/30 bg-[#FF9933]/10 text-[#FF9933]', Icon: BookOpen }
                : { border: 'group-hover:border-[#138808]/50', glow: 'from-transparent via-[#138808] to-transparent', icon: 'text-[#138808]', bg: 'bg-[#138808]/5', pill: 'border-[#138808]/30 bg-[#138808]/10 text-[#138808]', Icon: Sparkles };

              return (
                <motion.article 
                  variants={fadeInUp} 
                  key={guest.name} 
                  className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${theme.border}`}
                >
                  {/* Subtle top glow line on hover */}
                  <div className={`absolute inset-x-0 top-0 h-1 w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r ${theme.glow}`} />
                  
                  <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${theme.bg}`}>
                    <theme.Icon className={`h-8 w-8 ${theme.icon}`} aria-hidden="true" />
                  </div>
                  
                  <h3 className="font-serif text-[1.75rem] font-bold leading-tight text-white md:text-3xl">
                    {guest.name}
                  </h3>
                  
                  <div className="mt-5 flex flex-wrap gap-2">
                    {guest.roles.map((role) => (
                      <span key={role} className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-wide uppercase ${theme.pill}`}>
                        {role}
                      </span>
                    ))}
                  </div>
                  
                  <p className="mt-6 text-[14px] leading-relaxed text-white/60 font-light transition-colors duration-300 group-hover:text-white/80">
                    {guest.bio}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ABOUT SEO BLOCK CONTAINER - PREMIUM MAGAZINE READABILITY */}
      <section id="about" className="scroll-mt-24 px-5 py-24 lg:px-8 bg-[#f7f1e5]">
        <div className="mx-auto max-w-7xl">
          
          {/* Refined Pure Hindi Section Header */}
          <SectionHeader eyebrow="कार्यक्रम का उद्देश्य" title="परमवीर चक्र – शौर्यगाथा">
            परमवीर चक्र विजेताओं के अदम्य साहस, नेतृत्व, सर्वोच्च बलिदान और राष्ट्र गौरव को समर्पित एक प्रामाणिक एवं प्रेरणादायी प्रस्तुति।
          </SectionHeader>
          
          <div className="grid gap-10 lg:gap-14 lg:grid-cols-[0.35fr_0.65fr]">
            
            {/* Sticky Sidebar - Interactive Core Values */}
            <aside className="h-fit rounded-[2rem] border border-[#d7c096] bg-[#fffaf0] p-7 shadow-xl shadow-[#60410f]/5 lg:sticky lg:top-32">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9d6b26]">Core Values</p>
              
              <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={staggerContainer}
                className="mt-6 grid gap-3"
              >
                {['Patriotism', 'Leadership', 'Sacrifice', 'Courage', 'National Pride'].map((item, index) => {
                  const valueColors = [
                    { border: 'hover:border-[#FF9933]/50', icon: 'text-[#FF9933]', hoverBg: 'hover:bg-[#FF9933]/5', Icon: Flag },
                    { border: 'hover:border-[#000080]/40', icon: 'text-[#000080]', hoverBg: 'hover:bg-[#000080]/5', Icon: Compass },
                    { border: 'hover:border-[#138808]/50', icon: 'text-[#138808]', hoverBg: 'hover:bg-[#138808]/5', Icon: Flame },
                    { border: 'hover:border-[#FF9933]/50', icon: 'text-[#FF9933]', hoverBg: 'hover:bg-[#FF9933]/5', Icon: ShieldCheck },
                    { border: 'hover:border-[#138808]/50', icon: 'text-[#138808]', hoverBg: 'hover:bg-[#138808]/5', Icon: Award },
                  ][index];

                  return (
                    <motion.div 
                      variants={fadeInUp}
                      key={item} 
                      className={`group flex items-center justify-between rounded-2xl border border-[#ead9ba] bg-white px-5 py-4 transition-all duration-300 ${valueColors.border} ${valueColors.hoverBg}`}
                    >
                      <span className="font-semibold tracking-wide text-[#172033]">{item}</span>
                      <valueColors.Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${valueColors.icon}`} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </aside>
            
            {/* Main Article Container */}
            <motion.article 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeInUp} 
              className="relative overflow-hidden rounded-[2rem] border border-[#d7c096] bg-white p-8 shadow-2xl shadow-[#60410f]/10 md:p-12"
            >
              {/* Flowing Tricolor Gradient Bar */}
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
              
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#172033] md:text-5xl">
                भारत के परमवीर वीरों को नमन
              </h2>
              
              <div className="mt-10 space-y-7 text-[1.1rem] leading-[2.1] text-[#4b5563]">
                {seoArticle.map((paragraph, index) => (
                  <p 
                    key={index} 
                    // Adds a premium Magazine-style Drop Cap to the very first paragraph
                    className={index === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:font-serif first-letter:font-bold first-letter:text-[#b57a2a]" : ""}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.article>
            
          </div>
        </div>
      </section>


      {/* SPECIAL ATTRACTION - FIXED, PREMIUM & ANIMATED */}
      <section className="bg-[#fffaf0] px-5 py-24 lg:px-8">
        {/* Adjusted Header for Hindi Text Clarity */}
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.25em] text-[#b57a2a]">
            SPECIAL ATTRACTION
          </p>
          <h2 className="font-serif text-3xl font-bold leading-relaxed text-[#172033] md:text-5xl lg:leading-tight">
            भारत के परमवीर चक्र विजेताओं <br className="hidden md:block" />
            की प्रेरणादायी शौर्यगाथाएँ
          </h2>
        </div>

        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-50px' }} 
          variants={staggerContainer}
          className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-2 lg:grid-cols-5"
        >
          {attractions.map((item, index) => {
            // Tricolor Theme Rotation with unique icons
            const blockTheme = [
              { border: 'border-[#FF9933]/30 hover:border-[#FF9933]/60', bg: 'bg-[#FF9933]', text: 'text-[#FF9933]', Icon: Flag },
              { border: 'border-[#000080]/20 hover:border-[#000080]/50', bg: 'bg-[#000080]', text: 'text-[#000080]', Icon: Flame },
              { border: 'border-[#138808]/30 hover:border-[#138808]/60', bg: 'bg-[#138808]', text: 'text-[#138808]', Icon: Sparkles },
              { border: 'border-[#FF9933]/30 hover:border-[#FF9933]/60', bg: 'bg-[#FF9933]', text: 'text-[#FF9933]', Icon: BookOpen },
              { border: 'border-[#138808]/30 hover:border-[#138808]/60', bg: 'bg-[#138808]', text: 'text-[#138808]', Icon: Award },
            ][index];

            return (
              <motion.article 
                variants={fadeInUp}
                key={item} 
                className={`group relative overflow-hidden rounded-[2rem] border bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#60410f]/15 ${blockTheme.border}`}
              >
                {/* Premium Active Top Line */}
                <div className={`absolute inset-x-0 top-0 h-1.5 transition-all duration-300 group-hover:h-2.5 ${blockTheme.bg}`} aria-hidden="true" />
                
                <div className="flex justify-center mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fffaf0] border border-[#d7c096]/30 text-[#b57a2a] group-hover:scale-110 group-hover:bg-[#ff9933]/5 group-hover:border-[#ff9933]/30 group-hover:text-[#ff9933] transition-all duration-300 shadow-sm">
                    <blockTheme.Icon className="h-6 w-6 stroke-[1.8]" />
                  </span>
                </div>
                
                <h3 className={`mt-4 font-serif text-[1.25rem] font-bold leading-snug transition-colors duration-300 ${blockTheme.text}`}>
                  {item}
                </h3>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      {/* PVC HEROES SECTION - PREMIUM REDESIGN */}
      <section className="px-5 py-24 lg:px-8 bg-gradient-to-b from-[#f7f1e5] via-[#fffaf0] to-[#f7f1e5] relative overflow-hidden">
        
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <SectionHeader eyebrow="Param Vir Chakra Heroes" title="वीरता की अमर शौर्यगाथाएँ" />
        
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, margin: '-50px' }} 
          variants={staggerContainer} 
          className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4 relative"
        >
          {pvcHeroes.map((hero, index) => {
            const heroColors = [
              { border: 'border-[#ff9933]/20 hover:border-[#ff9933]/50', line: 'bg-[#ff9933]', hoverShadow: 'hover:shadow-[0_20px_50px_rgba(255,153,51,0.1)]', text: 'text-[#ff9933]' },
              { border: 'border-[#4d82f3]/25 hover:border-[#4d82f3]/50', line: 'bg-[#4d82f3]', hoverShadow: 'hover:shadow-[0_20px_50px_rgba(77,130,243,0.08)]', text: 'text-[#4d82f3]' },
              { border: 'border-[#138808]/20 hover:border-[#138808]/50', line: 'bg-[#138808]', hoverShadow: 'hover:shadow-[0_20px_50px_rgba(19,136,8,0.08)]', text: 'text-[#138808]' },
              { border: 'border-[#ff9933]/20 hover:border-[#ff9933]/50', line: 'bg-[#ff9933]', hoverShadow: 'hover:shadow-[0_20px_50px_rgba(255,153,51,0.1)]', text: 'text-[#ff9933]' }
            ][index % 4];

            return (
              <motion.article 
                key={hero.name} 
                variants={fadeInUp} 
                className={`group relative overflow-hidden rounded-3xl border bg-white p-7 shadow-lg transition-all duration-500 hover:-translate-y-2 ${heroColors.border} ${heroColors.hoverShadow}`}
              >
                {/* Active top color strip */}
                <div className={`absolute inset-x-0 top-0 h-1.5 transition-all duration-300 group-hover:h-2 ${heroColors.line}`} />
                
                {/* Decorative badge representing military honor */}
                <div className="absolute right-6 top-6 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                  <Award className="h-10 w-10 text-[#000080]" strokeWidth={1.5} />
                </div>
                
                <h3 className="mt-4 font-serif text-2xl font-bold text-[#172033] transition-colors duration-300 group-hover:text-[#000080]">
                  {hero.name}
                </h3>
                <p className={`mt-2 text-xs font-bold uppercase tracking-wider ${heroColors.text}`}>
                  {hero.year} · {hero.battle}
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-[#56616f] font-light">
                  {hero.story}
                </p>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      {/* WHY ATTEND SECTION - PREMIUM MODERN REDESIGN */}
      <section className="relative overflow-hidden bg-[#07111f] px-5 py-24 text-white lg:px-8">
        
        {/* Glow lights in background */}
        <div className="absolute left-1/4 top-1/4 -z-10 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9933]/5 blur-[120px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/4 -z-10 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#138808]/6 blur-[120px] pointer-events-none" />
        
        {/* Subtle grid mesh overlay for high-tech premium feel */}
        <div className="absolute inset-0 -z-10 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Tri-color top layout thin indicator lines */}
        <div className="absolute left-0 top-0 h-1 w-1/3 bg-[#ff9933]" />
        <div className="absolute left-1/3 top-0 h-1 w-1/3 bg-white/70" />
        <div className="absolute right-0 top-0 h-1 w-1/3 bg-[#138808]" />
        
        <div className="relative mx-auto max-w-7xl">
          <SectionHeader eyebrow="Why Attend" title="क्यों शामिल हों" light>
            यह कार्यक्रम ज्ञान, संवेदना और चरित्र निर्माण को एक साथ जोड़ता है, ताकि हर visitor केवल event attend न करे बल्कि राष्ट्र गौरव को महसूस करे।
          </SectionHeader>
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyAttend.map((item, index) => {
              const accentStyles = {
                saffron: {
                  line: 'bg-[#ff9933]',
                  iconBorder: 'border-[#ff9933]/30 bg-[#ff9933]/10 text-[#ff9933] group-hover:border-[#ff9933] group-hover:shadow-[0_0_20px_rgba(255,153,51,0.45)]',
                  glow: 'bg-[#ff9933]/10'
                },
                green: {
                  line: 'bg-[#138808]',
                  iconBorder: 'border-[#138808]/30 bg-[#138808]/10 text-[#138808] group-hover:border-[#138808] group-hover:shadow-[0_0_20px_rgba(19,136,8,0.45)]',
                  glow: 'bg-[#138808]/10'
                },
                gold: {
                  line: 'bg-[#d7c096]',
                  iconBorder: 'border-[#d7c096]/30 bg-[#d7c096]/10 text-[#d7c096] group-hover:border-[#d7c096] group-hover:shadow-[0_0_20px_rgba(215,192,150,0.45)]',
                  glow: 'bg-[#d7c096]/15'
                },
                white: {
                  line: 'bg-white/80',
                  iconBorder: 'border-white/20 bg-white/5 text-white/90 group-hover:border-white group-hover:shadow-[0_0_20px_rgba(255,255,255,0.45)]',
                  glow: 'bg-white/5'
                }
              };

              const accent = accentStyles[item.accent] || accentStyles.white;
              
              const IconComponent = {
                Flag: Flag,
                Sparkles: Sparkles,
                BookOpen: BookOpen,
                Award: Award,
                Flame: Flame,
                GraduationCap: GraduationCap,
                Compass: Compass,
                ShieldCheck: ShieldCheck
              }[item.icon] || Award;

              return (
                <motion.article 
                  key={item.title} 
                  variants={fadeInUp} 
                  className="group relative flex min-h-[290px] flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#0c192d]/50 p-6 text-center shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-white/20"
                >
                  {/* Subtle glass overlay background gradient */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/[0.02] to-transparent" />
                  
                  {/* Glow effect in background of card on hover */}
                  <div className={`absolute -inset-px -z-20 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl ${accent.glow}`} />

                  {/* Top animated bar */}
                  <div className={`absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5 ${accent.line}`} />
                  
                  {/* Index badge at top right */}
                  <span className="absolute right-5 top-5 text-[11px] font-extrabold tracking-wider text-white/20 group-hover:text-white/40 transition-colors duration-300">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  
                  <div className="flex flex-col items-center mt-4">
                    {/* Custom animated Icon Box */}
                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 ${accent.iconBorder}`}>
                      <IconComponent className="h-7 w-7 transition-transform duration-300" />
                    </div>
                    
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-white/95">
                      {item.title}
                    </h3>
                  </div>
                  
                  <p className="mt-4 text-[14px] leading-relaxed text-white/70 group-hover:text-white/80 transition-colors duration-300">
                    {item.text}
                  </p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* EVENT TIMELINE SECTION */}
      <section className="px-5 py-20 lg:px-8 bg-[#f7f1e5]">
        <SectionHeader eyebrow="Event Timeline" title="Registration से Event तक" />
        <div className="mx-auto grid max-w-5xl gap-y-8 md:gap-x-4 md:grid-cols-4">
          {timeline.map(([date, label], index) => {
            const flagTheme = [
              { bg: 'bg-[#FF9933]', text: 'text-[#FF9933]', Icon: CalendarDays },
              { bg: 'bg-[#000080]', text: 'text-[#000080]', Icon: CheckCircle2 },
              { bg: 'bg-[#138808]', text: 'text-[#138808]', Icon: MessageCircle },
              { bg: 'bg-[#FF9933]', text: 'text-[#FF9933]', Icon: Flag },
            ][index];

            return (
              <div key={label} className="relative flex flex-col md:block">
                <article className="group relative z-10 flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#d7c096]/60 bg-white p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#ff9933]/30">
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${flagTheme.bg}`} />
                  
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fffaf0] border border-[#d7c096]/30 ${flagTheme.text} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <flagTheme.Icon className="h-5 w-5 stroke-[1.8]" />
                  </span>

                  <p className={`text-xs font-extrabold uppercase tracking-[0.18em] ${flagTheme.text}`}>{date}</p>
                  <h3 className="mt-2 font-serif text-lg font-bold text-[#172033]">{label}</h3>
                </article>
                {index < timeline.length - 1 && (
                  <>
                    <div className="absolute -right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[#d7c096] bg-[#fffaf0] shadow-sm md:flex h-8 w-8">
                      <ChevronRight className={`h-5 w-5 ${flagTheme.text}`} />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center justify-center rounded-full border border-[#d7c096] bg-[#fffaf0] shadow-sm md:hidden h-8 w-8">
                      <svg className={`h-4 w-4 ${flagTheme.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* EVENT CONCLUDED & GRATITUDE SECTION - PREMIUM TRICOLOR DESIGN */}
      <section id="highlights" className="relative overflow-hidden bg-[#050b13] px-5 py-24 text-white lg:px-8">
        
        {/* Cinematic background light layers */}
        <div className="absolute left-1/4 top-1/3 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9933]/6 blur-[130px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/3 -z-10 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#138808]/5 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 -z-10 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Left Column: Heartfelt Gratitude & Event Success Message */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#138808]/15 border border-[#138808]/30 px-3.5 py-1 text-xs font-bold text-[#138808] uppercase tracking-widest w-fit mb-4">
              <span className="h-2 w-2 rounded-full bg-[#138808]" /> Event Concluded • आभार एवं कृतज्ञता
            </div>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
              भव्य एवं गरिमामयी आयोजन <br />
              <span className="text-[#FF9933]">सफलतापूर्वक संपन्न</span>
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-white/80 font-light">
              9 अगस्त 2026 को दिनेश हॉल, नवरंगपुरा, अहमदाबाद में आयोजित <strong>"परमवीर चक्र – शौर्यगाथा"</strong> का भव्य राष्ट्रीय कार्यक्रम अपार जनसमूह, देशभक्ति और प्रेरणा के साथ सफलतापूर्वक संपन्न हुआ।
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed text-white/70 font-light">
              इस ऐतिहासिक अवसर पर पधारे समस्त देशभक्त नागरिकों, युवाओं, विद्यार्थियों एवं परिवारों का श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ हार्दिक आभार एवं साधुवाद व्यक्त करता है।
            </p>
            
            {/* Plaque-style Sangh info box (Green Accent) */}
            <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#138808]/30 bg-[#138808]/5 p-6 backdrop-blur-sm group hover:border-[#138808]/60 transition-all duration-300 shadow-xl">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-[#138808]" />
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#138808]">Organised By</p>
              <h3 className="mt-3 font-serif text-2xl font-bold text-white transition-colors group-hover:text-[#138808]">श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ</h3>
              <p className="mt-2 text-sm text-white/70 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#138808]" /> उस्मानपुरा, अहमदाबाद
              </p>
            </div>
          </div>

          {/* Right Column: Watch Recording & Contact Card */}
          <article className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c1a2e]/60 p-8 text-center shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-12 group hover:border-white/20 transition-all duration-300">
            {/* Subtle tricolor top bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9933] via-white/50 to-[#138808]" />
            
            <PremiumEmblem tone="light" />
            
            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#ff9933]">Watch Full Recording</p>
            <h3 className="mt-2 font-serif text-2xl font-bold text-white md:text-3xl">सम्पूर्ण कार्यक्रम का वीडियो देखें</h3>
            
            <p className="mt-3 text-sm text-white/70 leading-relaxed font-light">
              यदि आप कार्यक्रम में उपस्थित नहीं हो सके, तो आप यूट्यूब पर संपूर्ण लाइव प्रसारण की रिकॉर्डिंग देख सकते हैं।
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href="/pvclive"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff9933] to-[#ff5500] px-6 py-3.5 text-sm font-bold text-[#040b14] shadow-[0_8px_30px_rgba(255,85,0,0.3)] hover:scale-105 transition-all duration-300"
              >
                <Play className="h-4 w-4 fill-current" /> Watch Full Live Recording / लाइव रिकॉर्डिंग देखें
              </a>
              <a
                href="#teaser"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-6 py-3 text-xs font-semibold text-white/80 hover:text-white transition-all duration-300"
              >
                Watch Recording on Web / वेब पर देखें
              </a>
            </div>

            {/* Support Helpline Box */}
            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between flex-wrap gap-4 text-left">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-white/40">Studio & Sangh Helpline</p>
                <a href="tel:+916352188150" className="text-sm font-bold text-white hover:text-[#ff9933] transition-colors">
                  +91 63521 88150
                </a>
              </div>
              <div className="flex gap-2">
                <a
                  href="tel:+916352188150"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                  title="Call Support"
                >
                  <Phone className="h-4 w-4 text-[#ff9933]" />
                </a>
                <a
                  href="https://wa.me/916352188150"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
                  title="WhatsApp Support"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* INFORMATION & CONTACT GRID - PREMIUM TRICOLOR REDESIGN */}
      <section className="px-5 py-24 lg:px-8 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#172033] md:text-5xl">Important Information</h2>
            <div className="mt-8 grid gap-3">
              {importantInfo.map((item, index) => {
                const InfoIcon = [
                  Users,         // Limited Seats
                  Ticket,        // Registration Required
                  ShieldCheck,   // Entry subject to verification
                  MessageCircle, // Carry WhatsApp confirmation
                  CheckCircle2   // Organizers reserve the right...
                ][index] || CheckCircle2;

                return (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#dcc395]/60 bg-[#fffaf0]/20 px-5 py-4 transition-colors hover:border-[#ff9933]/30 shadow-sm">
                    <InfoIcon className="h-5 w-5 shrink-0 text-[#138808]" />
                    <p className="font-semibold text-sm text-[#172033]">{item}</p>
                  </div>
                );
              })}
            </div>

            {/* Scrollable Terms & Conditions box */}
            <div className="mt-8 rounded-3xl border border-[#dcc395]/40 bg-[#fffaf0]/40 p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#172033] mb-4">Terms & Conditions (नियम और शर्तें)</h3>
              <div className="h-44 overflow-y-auto pr-2 space-y-3 text-xs text-[#56616f] scrollbar-thin scrollbar-thumb-amber-700">
                {termsAndConditions.map((term, index) => (
                  <p key={index} className="leading-relaxed">
                    <strong className="text-[#172033]">{index + 1}.</strong> {term}
                  </p>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-[#dcc395]/60 bg-[#fffaf0]/70 p-8 shadow-xl">
            <h2 className="font-serif text-3xl font-bold text-[#172033]">Contact & Timings</h2>
            <div className="mt-8 grid gap-4">
              <a href={`tel:${contactConfig.contactPhone.replace(/\s+/g, '')}`} className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm hover:border-[#ff9933]/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff9933]/10"><Phone className="h-5 w-5 text-[#ff9933]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#ff9933]">Call Us</span><span className="text-[15px]">{contactConfig.contactPhone}</span></div>
              </a>
              <a href={`https://wa.me/${contactConfig.contactWhatsApp.replace(/[^\d+]/g, '')}?text=Jai%20Hind!%20I%20want%20to%20know%20more%20about%20the%20Param%20Vir%20Chakra%20Shaurya%20Gatha%20event.`} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm hover:border-[#138808]/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#138808]/10"><MessageCircle className="h-5 w-5 text-[#138808]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#138808]">WhatsApp</span><span className="text-[15px]">{contactConfig.contactWhatsApp}</span></div>
              </a>
              <div className="flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff9933]/10"><Clock className="h-5 w-5 text-[#ff9933]" /></span>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-[#ff9933]">Call Timings</span>
                  <span className="text-[15px]">Mon to Sat (10 am to 6 pm)</span>
                </div>
              </div>
              <a href="https://maps.app.goo.gl/r76fhgM7NS8AJaBw8" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm hover:border-[#138808]/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#138808]/10"><MapPin className="h-5 w-5 text-[#138808]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#138808]">Location</span><span className="text-[15px]">Dinesh Hall, Ahmedabad</span></div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED KNOWLEDGE BASE & HISTORICAL GUIDE SECTION */}
      <section id="knowledge" className="scroll-mt-24 px-5 py-24 lg:px-8 bg-[#f7f1e5] relative overflow-hidden">
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <div className="mx-auto max-w-5xl relative">
          <p className="mb-4 text-center text-sm font-bold uppercase tracking-[0.25em] text-[#b57a2a]">
            AUTHORITATIVE KNOWLEDGE BASE & HISTORICAL BASE
          </p>
          <h2 className="text-center font-serif text-3xl font-bold leading-relaxed text-[#172033] md:text-5xl lg:leading-tight mb-16">
            परमवीर चक्र – शौर्यगाथा: <br className="hidden md:block" />
            ज्ञान और इतिहास कोश
          </h2>

          <div className="space-y-16">
            
            {/* SECTION 1: WHAT IS PARAM VIR CHAKRA? */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">1. What is Param Vir Chakra? (परमवीर चक्र क्या है?)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  The Param Vir Chakra (PVC) is India's highest military decoration, awarded for displaying the most conspicuous bravery, daring, or pre-eminent act of valour or self-sacrifice in the presence of the enemy. It is the ultimate medal of honor for our armed forces.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  <strong>संस्कृत मूल और अर्थ:</strong> संस्कृत भाषा में 'परम' का अर्थ है सर्वोच्च, 'वीर' का अर्थ है साहसी या योद्धा, तथा 'चक्र' का अर्थ है पहिया। शाब्दिक रूप से, परमवीर चक्र का अर्थ है <em>"परम वीर का पहिया" (Wheel of the Ultimate Brave)</em>। यह पदक युद्ध क्षेत्र में प्रदर्शित किए गए असाधारण और अतुलनीय साहस को सम्मानित करने का सर्वोच्च भारतीय माध्यम है।
                </p>
                <p>
                  यह पुरस्कार थल सेना, नौसेना और वायु सेना के अधिकारियों और जवानों को शत्रु के सामने अद्भुत वीरता, आत्म-बलिदान और कर्तव्य निष्ठा दिखाने के लिए दिया जाता है। परमवीर चक्र की घोषणा के बाद से आज तक केवल 21 जांबाज भारतीय सैनिकों को इस परम गौरव से अलंकृत किया गया है। इन 21 विजेताओं में से 14 जांबाजों को यह पुरस्कार मरणोपरांत दिया गया है, जो इनके राष्ट्र के प्रति अंतिम और सर्वोच्च बलिदान को दर्शाता है।
                </p>
                <p>
                  <strong>महत्व और प्रभाव:</strong> सैन्य इतिहास में परमवीर चक्र का स्थान अत्यंत गरिमामयी है। यह केवल एक धातु का पदक नहीं है, बल्कि यह देश के उन बेटों की अमर कहानी है जिन्होंने भारत की संप्रभुता और सीमाओं की रक्षा के लिए अपने प्राणों की आहुति दे दी। युद्ध के समय जब परिस्थितियाँ पूरी तरह से प्रतिकूल हों, और शत्रु संख्या और संसाधनों में भारी हो, तब भी देश के लिए सीना तानकर लड़ना और विजय पताका फहराना ही इस पदक की असली कसौटी है।
                </p>
              </div>
            </article>

            {/* SECTION 2: HISTORY OF PARAM VIR CHAKRA */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">2. History of Param Vir Chakra (परमवीर चक्र का इतिहास)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  Established on 26 January 1950 by the President of India, the Param Vir Chakra was backdated to 15 August 1947 to honor early post-independence heroes. The award was designed by Savitri Khanolkar, inspired by the mythical sacrifice of Sage Dadhichi.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  <strong>ऐतिहासिक पृष्ठभूमि:</strong> भारत के गणतंत्र बनने के ऐतिहासिक दिन, यानी 26 जनवरी 1950 को तत्कालीन राष्ट्रपति डॉ. राजेंद्र प्रसाद द्वारा इस पदक की स्थापना की गई थी। इसे 15 अगस्त 1947 (भारत की स्वतंत्रता की तिथि) से प्रभावी माना गया ताकि स्वतंत्रता के तुरंत बाद जम्मू-कश्मीर में पाकिस्तानी घुसपैठियों के खिलाफ लड़ते हुए सर्वोच्च बलिदान देने वाले सैनिकों को भी सम्मानित किया जा सके।
                </p>
                <p>
                  <strong>पदक का अनोखा डिजाइन:</strong> परमवीर चक्र के पदक का डिजाइन भारत की प्राचीन संस्कृति और अध्यात्म का अद्भुत मिश्रण है। इस पदक को डिजाइन करने का श्रेय <strong>सावित्री खानोलकर (Savitri Khanolkar)</strong> को जाता है। उनका जन्म स्विट्जरलैंड में हुआ था और उनका मूल नाम इवोन मैडे डी मारोस था। उन्होंने भारतीय सेना के अधिकारी कैप्टन विक्रम खानोलकर से विवाह किया, जिसके बाद वे भारत आईं और यहां के इतिहास और संस्कृति में रच-बस गईं।
                </p>
                <p>
                  सावित्री जी ने पदक के डिजाइन में <strong>महर्षि दधीचि (Sage Dadhichi)</strong> के वज्र को शामिल किया। हिंदू पौराणिक कथाओं के अनुसार, महर्षि दधीचि ने देवताओं की रक्षा के लिए और राक्षस वृत्रासुर का संहार करने के लिए अपनी हड्डियों का दान कर दिया था ताकि देवराज इंद्र उनके वज्र का निर्माण कर सकें। यह सर्वोच्च और निःस्वार्थ बलिदान का प्रतीक है। पदक पर इंद्र के वज्र के चार चित्र अंकित हैं, और केंद्र में भारत का राष्ट्रीय चिन्ह अशोक स्तंभ बना हुआ है।
                </p>
                <p>
                  <strong>प्रथम विजेता:</strong> भारत का सबसे पहला परमवीर चक्र <strong>मेजर सोमनाथ शर्मा (Major Somnath Sharma)</strong> को मरणोपरांत प्रदान किया गया था। 3 नवंबर 1947 को श्रीनगर हवाई अड्डे की रक्षा करते हुए उन्होंने अपनी टुकड़ी का नेतृत्व किया और घायल होने के बावजूद अंतिम सांस तक दुश्मनों का डटकर मुकाबला किया।
                </p>
              </div>
            </article>

            {/* SECTION 3: WHY THIS EVENT MATTERS */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">3. Why This Event Matters (यह कार्यक्रम क्यों महत्वपूर्ण है?)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  The 'Param Vir Chakra - Shaurya Gatha' event in Ahmedabad bridges the gap between our military heroes and civil society. It aims to instill deep values of patriotism, character development, and civic responsibility among the youth.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  <strong>युवाओं के लिए प्रेरणा (Youth Inspiration):</strong> आधुनिक युग में जहां युवाओं के सामने सोशल मीडिया और अन्य भटकाव के अनेक साधन हैं, वहीं यह इवेंट उन्हें वास्तविक जीवन के नायकों से परिचित कराता है। यह उन्हें सिखाता है कि वीरता केवल युद्ध के मैदान तक सीमित नहीं है, बल्कि अपने दैनिक जीवन में अनुशासन, सच्चाई और राष्ट्र के प्रति वफादारी दिखाना भी देशभक्ति का एक रूप है।
                </p>
                <p>
                  <strong>राष्ट्र निर्माण (Nation Building):</strong> एक मजबूत राष्ट्र का निर्माण केवल आर्थिक या औद्योगिक उन्नति से नहीं होता, बल्कि उसके नागरिकों के चरित्र और नैतिक मूल्यों से होता है। हमारे वीर सैनिकों की कहानियां समाज में त्याग और एकता की भावना को मजबूत करती हैं, जो राष्ट्र निर्माण की बुनियादी नींव है।
                </p>
                <p>
                  <strong>चरित्र निर्माण (Character Development):</strong> सैनिकों का जीवन हमें अनुशासन, समय की पाबंदी, टीम वर्क और विषम परिस्थितियों में भी शांत रहकर निर्णय लेने की क्षमता सिखाता है। इस कार्यक्रम के माध्यम से छात्र और युवा इन गुणों को सीखकर अपने निजी और व्यावसायिक जीवन में उत्कृष्ट प्रदर्शन कर सकते हैं।
                </p>
              </div>
            </article>

            {/* SECTION 4: ABOUT PARAM VIR CHAKRA WINNERS */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">4. About Param Vir Chakra Winners (परमवीर चक्र विजेताओं के बारे में)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  The 21 Param Vir Chakra recipients represent the epitome of military selflessness. Their heroic acts across the wars of 1947, 1962, 1965, 1971, and 1999 saved the sovereignty of India under critical conditions.
                </p>
              </div>

              <div className="space-y-6 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  परमवीर चक्र विजेताओं की वीरगाथाएँ किसी भी देशप्रेमी के रोंगटे खड़े करने के लिए काफी हैं। इन 21 वीरों में से कुछ प्रमुख नाम और उनकी संक्षेप गाथाएँ इस प्रकार हैं:
                </p>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="p-5 rounded-2xl bg-[#fffaf0] border border-[#dcc395]/30">
                    <h4 className="font-serif text-lg font-bold text-[#172033] mb-2">मेजर सोमनाथ शर्मा (1947)</h4>
                    <p className="text-xs text-[#56616f] leading-relaxed">
                      श्रीनगर हवाई अड्डे की रक्षा करते हुए उन्होंने एक हाथ से काम न करने के बावजूद स्वयं मशीन गन में गोलियां भरीं और अंतिम सांस तक लड़े। उनके इसी बलिदान के कारण कश्मीर भारत का अटूट अंग बना रहा।
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#fffaf0] border border-[#dcc395]/30">
                    <h4 className="font-serif text-lg font-bold text-[#172033] mb-2">हवलदार अब्दुल हमीद (1965)</h4>
                    <p className="text-xs text-[#56616f] leading-relaxed">
                      1965 के युद्ध में उन्होंने अपनी साधारण जीप-माउंटेड गन से पाकिस्तान के अभेद्य माने जाने वाले 'पैटन टैंकों' को एक-एक कर नष्ट कर दिया और असल उत्तर की लड़ाई में दुश्मन के इरादों को ध्वस्त कर दिया।
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#fffaf0] border border-[#dcc395]/30">
                    <h4 className="font-serif text-lg font-bold text-[#172033] mb-2">फ्लाइंग ऑफिसर निर्मलजीत सिंह सेखों (1971)</h4>
                    <p className="text-xs text-[#56616f] leading-relaxed">
                      1971 के युद्ध में श्रीनगर हवाई अड्डे पर जब दुश्मन के छह विमानों ने हमला किया, तब सेखों जी ने अकेले अपने नैट विमान से उड़ान भरी और दुश्मन के दो विमानों को मार गिराया तथा अंततः वीरगति प्राप्त की।
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#fffaf0] border border-[#dcc395]/30">
                    <h4 className="font-serif text-lg font-bold text-[#172033] mb-2">कैप्टन विक्रम बत्रा (1999)</h4>
                    <p className="text-xs text-[#56616f] leading-relaxed">
                      कारगिल युद्ध के दौरान उन्होंने पॉइंट 5140 और पॉइंट 4875 पर विजय प्राप्त की। उनका विजय घोष "ये दिल मांगे मोर" आज भी देश के करोड़ों युवाओं के दिलों में देशभक्ति का संचार करता है।
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* SECTION 5: ABOUT THE EVENT */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">5. About the Event (कार्यक्रम के विषय में)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  'Param Vir Chakra – Shaurya Gatha' is a grand patriotic tribute happening in Ahmedabad to celebrate military heroism, values, and national character. It combines historical multimedia narration with spiritual ethics.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  यह भव्य आयोजन केवल एक व्याख्यान नहीं है, बल्कि हमारे देश के जांबाजों को समर्पित एक अद्भुत दृश्य-श्रव्य और संवेगात्मक अनुभव है। इस कार्यक्रम का मुख्य उद्देश्य अहमदाबाद और पूरे गुजरात के नागरिकों, विशेषकर युवा पीढ़ी, के मन में भारतीय सेना और देश के सर्वोच्च वीर नायकों के प्रति कृतज्ञता की भावना पैदा करना है।
                </p>
                <p>
                  कार्यक्रम के दौरान परमवीर चक्र विजेताओं के जीवन से जुड़े अनसुने पहलुओं, उनके अदम्य साहस की ऐतिहासिक लड़ाइयों और उनके अंतिम संदेशों को बहुत ही संवेदनशील और प्रेरक रूप में प्रस्तुत किया जाएगा। यह एक ऐसा मंच है जहाँ अध्यात्म, राष्ट्रभक्ति और इतिहास का त्रिवेणी संगम देखने को मिलेगा।
                </p>
              </div>
            </article>

            {/* SECTION 6: ABOUT THE SPEAKERS */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">6. About the Keynote Speaker (मुख्य वक्ता - श्री हर्षल पुष्कर्णा)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  Shri Harshal Pushkarna is a distinguished editor, author, and military historian who has spent years documenting border defense and armed forces narratives.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  <strong>अनुभव और विशेषज्ञता (Experience & Expertise):</strong> श्री हर्षल पुष्कर्णा गुजरात के एक अत्यंत सम्मानित लेखक और सैन्य इतिहासकार हैं। उन्होंने देश की सीमाओं, जैसे सियाचिन ग्लेशियर, कारगिल, लद्दाख और वाघा बॉर्डर, का व्यक्तिगत रूप से दौरा किया है। वे वहां तैनात सैनिकों के जीवन, उनकी कठिनाइयों और उनके अटूट हौसलों को बहुत करीब से देख चुके हैं।
                </p>
                <p>
                  हर्षल जी ने कई वर्षों तक लोकप्रिय ज्ञानवर्धक पत्रिकाओं का संपादन किया है और उनकी पुस्तकों ने गुजरात के पाठकों में राष्ट्रीय चेतना जागृत करने का काम किया है। उनकी शैली केवल तथ्यों को पेश करना नहीं है, बल्कि वे इतिहास को इस तरह जीवंत कर देते हैं कि सुनने वाला स्वयं को युद्ध के उस पल में खड़ा महसूस करता है।
                </p>
              </div>
            </article>

            {/* SECTION 7: ABOUT GURUJI */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">7. About Guruji (पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  Pujya Muni Shri Shramanchandrasagarji Maharaj is a highly revered Jain monk who guides the youth toward character building, moral ethics, and active patriotism.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  <strong>आध्यात्मिक वंश और मार्गदर्शन (Spiritual Lineage):</strong> पूज्य मुनि श्री श्रमणचंद्रसागरजी महाराज राष्ट्रसंत <strong>आचार्य श्री हेमचंद्रासागरसूरीजी महाराज (Acharya Shri Hemchandrasagarsuriji Maharaj)</strong> के आज्ञानुवर्ती शिष्य हैं। उन्हें <strong>आचार्य श्री सम्यकचंद्रासागरसूरीजी महाराज (Acharya Shri Samyakchandrasagarsuriji Maharaj)</strong> और <strong>आचार्य श्री तारकचंद्रासागरसूरीजी महाराज (Acharya Shri Tarakchandrasagarsuriji Maharaj)</strong> जैसे महान संतों का आध्यात्मिक संरक्षण व मार्गदर्शन प्राप्त है।
                </p>
                <p>
                  मुनि श्री का मुख्य उद्देश्य केवल धार्मिक क्रियाएँ कराना नहीं है, बल्कि वे मानते हैं कि सच्ची अध्यात्मिकता और राष्ट्रभक्ति एक ही सिक्के के दो पहलू हैं। वे अपने ओजस्वी वचनों से युवाओं को व्यसनों से दूर रहने, माता-पिता का आदर करने और मातृभूमि की रक्षा के लिए हमेशा तत्पर रहने की प्रेरणा देते हैं।
                </p>
              </div>
            </article>

            {/* SECTION 8: WHY ATTEND */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">8. Why Attend (इवेंट में क्यों शामिल हों?)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  This event offers life-changing perspectives on discipline, leadership, and moral strength for students, parents, teachers, and citizens alike.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <ul className="list-disc list-inside space-y-3">
                  <li><strong>छात्रों के लिए (Students):</strong> इतिहास की किताबों से परे जाकर भारत की वास्तविक वीरता और भूगोल को समझने का अवसर। साथ ही करियर में आगे बढ़ने के लिए नेतृत्व क्षमता (Leadership) और एकाग्रता के गुर सीखने को मिलेंगे।</li>
                  <li><strong>अभिभावकों के लिए (Parents):</strong> अपने बच्चों को मोबाइल और इंटरनेट की वर्चुअल दुनिया से बाहर निकालकर वास्तविक नायकों और भारतीय संस्कारों से जोड़ने का एक आदर्श माध्यम।</li>
                  <li><strong>शिक्षकों के लिए (Teachers):</strong> अपने छात्रों में नैतिक मूल्यों और देशभक्ति की भावना को गहराई से बोने के लिए नए दृष्टिकोण और शैक्षिक रिसोर्सेज प्राप्त करना।</li>
                  <li><strong>आम नागरिकों के लिए (Families & Citizens):</strong> हमारे देश की सीमाओं पर तैनात वीर जवानों के प्रति सामूहिक रूप से सम्मान और कृतज्ञता प्रकट करने का एक अनूठा अवसर।</li>
                </ul>
              </div>
            </article>

            {/* SECTION 9: PASS COLLECTION PROCESS */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">9. Pass Collection Process (पास प्राप्ति की सरल प्रक्रिया)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  Online registration has concluded. Physical Entry Passes can now be collected directly from Shri Vardhaman Jain Shwetambar Murtipujak Sangh (Usmanpura Char Rasta, Ashram Road, Ahmedabad – 380014) or via Call Support at +91 63521 88150.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  पास प्राप्त करने की प्रक्रिया बहुत सरल है:
                </p>
                <ol className="list-decimal list-inside space-y-3 ml-2">
                  <li><strong>कलेक्शन सेंटर:</strong> श्री वर्धमान जैन श्वेतांबर मूर्तिपूजक संघ, उस्मानपुरा चार रास्ता, आश्रम रोड, अहमदाबाद – 380014 से पास प्राप्त करें।</li>
                  <li><strong>हेल्पलाइन सपोर्ट:</strong> किसी भी सहायता अथवा पास की जानकारी हेतु <strong>+91 63521 88150</strong> पर कॉल या व्हाट्सऐप करें।</li>
                  <li><strong>भौतिक पास (Physical Pass):</strong> दिनेश हॉल, अहमदाबाद में प्रवेश केवल वैध फिजिकल पास धारकों को ही दिया जाएगा।</li>
                  <li><strong>समय पर प्रवेश:</strong> सीटें सीमित हैं, इसलिए कार्यक्रम के दिन सुबह 8:45 बजे तक स्थान ग्रहण कर लें।</li>
                </ol>
              </div>
            </article>

            {/* SECTION 10: EVENT EXPERIENCE */}
            <article className="rounded-3xl border border-[#dcc395]/40 bg-white p-8 md:p-10 shadow-lg">
              <h3 className="font-serif text-2xl font-bold text-[#172033] mb-6">10. Event Experience (कार्यक्रम का जीवंत अनुभव)</h3>
              
              {/* AEO Direct Answer Box */}
              <div className="bg-[#ff9933]/5 border-l-4 border-[#ff9933] p-5 rounded-r-2xl mb-6">
                <p className="text-xs uppercase font-extrabold text-[#ff9933] mb-1">Direct Answer / मुख्य उत्तर</p>
                <p className="font-semibold text-sm text-[#172033] leading-relaxed">
                  Attendees will experience an emotionally moving, professionally narrated, and spiritually deep environment containing soundscapes, stories, and a national pledge.
                </p>
              </div>

              <div className="space-y-4 text-sm text-[#56616f] leading-relaxed font-light">
                <p>
                  दिनेश हॉल, अहमदाबाद में प्रवेश करते ही आपको एक अत्यंत ही अनुशासित और गरिमामयी वातावरण प्राप्त होगा। कार्यक्रम के आरंभ में राष्ट्रध्वज को सलामी और राष्ट्रगान होगा, जिसके बाद श्री हर्षल पुष्कर्णा बहुत ही शानदार ऑडियो-विजुअल स्लाइड्स के माध्यम से भारत की दुर्गम सीमाओं की यात्रा और परमवीर चक्र विजेताओं की गाथाओं का सजीव चित्रण करेंगे।
                </p>
                <p>
                  इसके बाद, पूज्य मुनि श्री का ओजस्वी उद्बोधन होगा जो आपके भीतर छिपी राष्ट्र चेतना और आत्मिक शक्ति को जगा देगा। कार्यक्रम के अंत में सभी प्रतिभागी एक सामूहिक देश-संकल्प लेंगे, जो उन्हें दैनिक जीवन में अधिक जिम्मेदार नागरिक बनने की दिशा प्रदान करेगा।
                </p>
              </div>
            </article>

          </div>
        </div>
      </section>

      {/* VENUE & DIRECTIONS SECTION */}
      <section id="venue" ref={mapRef} className="scroll-mt-24 px-5 py-24 lg:px-8 bg-[#fffaf0] border-t border-[#d7c096]/30 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#ff9933]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[#138808]/3 rounded-full blur-[100px] pointer-events-none" />

        <div className="mx-auto max-w-7xl relative z-10">
          <SectionHeader eyebrow="Location" title="Venue & Directions">
            Find your way to the historic venue in Navrangpura, Ahmedabad.
          </SectionHeader>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] items-stretch">
            
            {/* Left Column: Venue Info Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-[#d7c096]/40 bg-white p-8 shadow-md">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff9933]/10 text-[#ff9933] mb-6">
                  <MapPin className="h-6 w-6 stroke-[1.8]" />
                </div>
                
                <h3 className="font-serif text-3xl font-bold text-[#172033] tracking-tight">Dinesh Hall</h3>
                <p className="mt-2 text-xs uppercase font-extrabold tracking-widest text-[#b57a2a]">Official Event Venue</p>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 text-base" role="img" aria-label="pin">📍</span>
                    <div>
                      <p className="font-semibold text-sm text-[#172033]">Dinesh Hall</p>
                      <p className="text-xs text-[#56616f] mt-0.5 leading-relaxed">
                        Opp. Income Tax Office, Ashram Road,<br />
                        Navrangpura, Ahmedabad, Gujarat, India<br />
                        Pin Code: 380009
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 text-base" role="img" aria-label="clock">⏰</span>
                    <div>
                      <p className="font-semibold text-sm text-[#172033]">Event Time</p>
                      <p className="text-xs text-[#56616f] mt-0.5">
                        Sunday, 9 August 2026<br />
                        Gates open at 08:30 AM | Starts at 09:00 AM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#d7c096]/20 flex flex-col sm:flex-row gap-3">
                <a 
                  href="https://maps.app.goo.gl/NC4XSturo5sA2736A" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Get Directions to Dinesh Hall on Google Maps"
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#ff9933] px-5 py-2.5 text-sm font-bold text-[#090f19] hover:bg-[#172033] hover:text-white transition-all duration-300"
                >
                  <Compass className="h-4 w-4" /> Get Directions
                </a>
                <a 
                  href="https://maps.google.com/?q=Dinesh+Hall+Navrangpura+Ahmedabad" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Open Dinesh Hall Location in Google Maps"
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl border border-[#d7c096]/60 bg-[#fffaf0] px-5 py-2.5 text-sm font-semibold text-[#172033] hover:bg-white hover:border-[#ff9933]/50 transition-all duration-300"
                >
                  <ExternalLink className="h-4 w-4 text-[#ff9933]" /> Open in Google Maps
                </a>
              </div>
            </div>

            {/* Right Column: Google Maps Iframe */}
            <div className="relative rounded-3xl overflow-hidden border border-[#d7c096]/40 bg-white p-2.5 shadow-md min-h-[350px]">
              {mapLoaded ? (
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.6841285226107!2d72.5696144!3d23.0353816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e846064f2fb9f%3A0xc0497ca1a587d60f!2sDinesh%20Hall!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Location for Dinesh Hall, Ahmedabad"
                  className="w-full h-full min-h-[350px] rounded-2xl"
                  aria-label="Google Maps Location for Dinesh Hall, Ahmedabad"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#fffaf0] text-[#56616f]/60 text-sm font-medium gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff9933] animate-ping" />
                  Loading Venue Map...
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}

      {/* FAQ ACCORDION SECTION - PREMIUM REDESIGN */}
      <section id="faq" className="bg-white px-5 py-24 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" />
        <div className="mx-auto grid max-w-4xl gap-4">
          {faqs.map((faq, index) => (
            <details 
              key={faq.question} 
              className="group rounded-3xl border border-[#d7c096]/50 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#ff9933]/40 overflow-hidden" 
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 outline-none px-6 py-5 text-left text-lg font-bold text-[#172033] marker:hidden">
                <span className="group-hover:text-[#ff9933] transition-colors duration-300">{faq.question}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#d7c096]/50 bg-[#fffaf0] text-[#9d6b26] transition-all duration-300 group-open:rotate-45 group-open:bg-[#ff9933]/10 group-open:text-[#ff9933] group-open:border-[#ff9933]/40">
                  <X className="h-4 w-4 rotate-45" />
                </span>
              </summary>
              <div className="px-6 pb-6">
                <div className="border-t border-[#ead9ba] pt-4 text-[15px] leading-relaxed text-[#56616f]">
                  {faq.answer}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <EventFooter />
      </main>
    </>
  );
}
