<<<<<<< HEAD
﻿import React, { useMemo, useState, useEffect } from 'react';
=======
import React, { useEffect, useMemo, useState } from 'react';
>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { MessageCircle, Award, ChevronRight, Menu, X, ShieldCheck, CheckCircle2, Phone, MapPin, Ticket, CalendarDays, Clock, Users } from 'lucide-react';


// --- DATA CONSTANTS ---
const canonicalUrl = 'https://vardhmancreativestudio.com/param-vir-chakra';
<<<<<<< HEAD
const heroImage = 'https://vardhmancreativestudio.com/assets/param-vir-chakra-hero.png';
const registrationFormUrl = 'https://forms.gle/fBaiW3Wq9duDv1sh8'; 

// ... (अपना seoArticleList, faqs, आदि यहाँ रखें) ...
=======
const registrationOpenAt = new Date('2026-07-15T00:00:00+05:30').getTime();
const eventStart = '2026-08-09T09:00:00+05:30';
const heroImage = '/assets/param-vir-chakra-hero.png';
const registrationFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSez6I5hDFqNhnBYlJUcOToLxTcSNkQz7hCpMq8wYfY-qkyy9Q/viewform?usp=sharing&ouid=111203341258450649783';

const navItems = [
  
  { label: 'प्रेरणा', href: '#blessings' },
  { label: 'अतिथि', href: '#guests' },
  { label: 'कार्यक्रम', href: '#about' },
  { label: 'रजिस्ट्रेशन', href: '#registration' },
  { label: 'FAQ', href: '#faq' },
];

const eventCards = [
  {
    icon: CalendarDays,
    title: 'कार्यक्रम तिथि',
    label: '9 अगस्त 2026',
    detail: 'रविवार',
    color: 'saffron',
  },
  {
    icon: Clock,
    title: 'समय',
    label: 'प्रातः 9:00 बजे',
    detail: 'कार्यक्रम प्रारंभ',
    color: 'gold',
  },
  {
    icon: MapPin,
    title: 'स्थान',
    label: 'दीनेश हॉल',
    detail: 'नवरंगपुरा, अहमदाबाद',
    color: 'green',
  },
  {
    icon: Users,
    title: 'आयु सीमा',
    label: '15–50 वर्ष',
    detail: 'पूर्व पंजीकरण आवश्यक',
    color: 'white',
  },
];
function StatCard({ icon: Icon, title, label, detail, color }) {
  const accent = {
    saffron: "bg-[#FF9933]",
    green: "bg-[#138808]",
    gold: "bg-[#D4AF37]",
    white: "bg-white",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/60">
      
      <div className={`absolute top-0 left-0 h-1 w-full ${accent[color]}`} />

      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F1B2D]/80 border border-white/10">
        <Icon className="h-6 w-6 text-[#FFB84D]" />
      </div>

      <p className="text-xs uppercase tracking-[0.18em] text-white/55">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-white">
        {label}
      </h3>

      <p className="mt-1 text-sm text-white/70">
        {detail}
      </p>
    </div>
  );
}
>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2
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
  },
  {
    title: 'प्रेरणा',
    text: 'Param Vir Chakra विजेताओं की सच्ची शौर्यगाथाएँ युवाओं और परिवारों को जीवन मूल्यों से जोड़ती हैं।',
    accent: 'white',
  },
  {
    title: 'इतिहास',
    text: 'India’s Highest Gallantry Award से जुड़े प्रसंगों को सरल, प्रामाणिक और यादगार storytelling में समझने का अवसर।',
    accent: 'green',
  },
  {
    title: 'राष्ट्र गौरव',
    text: 'भारतीय ध्वज, अशोक चक्र और National War Memorial की भावना से प्रेरित एक गरिमामय patriotic experience।',
    accent: 'gold',
  },
  {
    title: 'वीरता',
    text: 'साहस, त्याग और कर्तव्यनिष्ठा के वे उदाहरण जो हर नागरिक को अपने जीवन में मजबूत बनाते हैं।',
    accent: 'saffron',
  },
  {
    title: 'युवा प्रेरणा',
    text: 'Students और young professionals के लिए leadership, discipline और character building की practical सीख।',
    accent: 'white',
  },
  {
    title: 'Leadership',
    text: 'दबाव में निर्णय, जिम्मेदारी और team spirit जैसे गुणों को भारत के वीरों की कहानियों से समझना।',
    accent: 'green',
  },
  {
    title: 'Character Building',
    text: 'कार्यक्रम का उद्देश्य केवल जानकारी देना नहीं, बल्कि संयम, साहस और सेवा भाव को जीवन में उतारना है।',
    accent: 'gold',
  },
];

const timeline = [
  ['15 July', 'Registration Starts'],
  ['Step 2', 'Payment Verification'],
  ['Step 3', 'WhatsApp Confirmation'],
  ['09 August', 'Event'],
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
  'Every registration will be handled with verification because limited seats require responsibility. Registration opens on 15 July 2026. Visitors can review the event details, understand the purpose, read about Param Vir Chakra heroes and return when booking starts. After submission and payment verification, confirmation will be sent on WhatsApp.',
  'The presence of Shri Harshal Pushkarna and Pujya Muni Shri Shramanchandrasagarji Maharaj adds intellectual and spiritual depth. One side brings research, storytelling and public communication; the other brings values, discipline and inner inspiration. Together, they support the larger mission of transforming patriotic remembrance into living character.',
  'Param Vir Chakra – Shaurya Gatha is therefore more than an event page. It is a public-facing knowledge resource, a registration platform and a digital tribute to India’s bravest sons. It honours the past while inspiring the present generation to live with courage, integrity and national responsibility.',
];
const importantInfo = [
  'Limited Seats',
  'Registration Required',
  'Entry subject to verification',
  'Carry WhatsApp confirmation',
  'Organizers reserve the right to approve or reject registrations',
];
const faqs = [
  { question: 'What is Param Vir Chakra Shaurya Gatha?', answer: 'Param Vir Chakra Shaurya Gatha is a premium patriotic Ahmedabad event dedicated to Param Vir Chakra winners, Indian Army heroes, courage, sacrifice and national pride.' },
  { question: 'What is the Param Vir Chakra Award?', answer: 'The Param Vir Chakra Award is India’s highest gallantry award for acts of exceptional bravery in the presence of the enemy.' },
  { question: 'Who are Param Vir Chakra winners?', answer: 'Param Vir Chakra winners are India’s bravest military heroes who received the highest gallantry honour for extraordinary courage and sacrifice.' },
  { question: 'When is Param Vir Chakra Shaurya Gatha in Ahmedabad?', answer: 'The event is scheduled for 9 August 2026, Sunday, at 9:00 AM at Dinesh Hall, Ahmedabad.' },
  { question: 'Where is the event venue?', answer: 'The venue is Dinesh Hall, Ahmedabad, Gujarat.' },
  { question: 'When does registration start?', answer: 'Registration starts on 15 July 2026. The online form remains disabled before that date.' },
  { question: 'Is registration mandatory?', answer: 'Yes. Registration is mandatory because seating is limited and entry is subject to verification.' },
  { question: 'Who can attend this event?', answer: 'The suggested age group is 15 to 50 years for attendees interested in patriotism, leadership, courage and national history.' },
  { question: 'How do I register?', answer: 'After 15 July 2026, fill the registration form, upload the payment screenshot and submit the details for verification.' },
  { question: 'When will I receive my event pass?', answer: 'After payment verification, confirmation and the event pass will be sent on WhatsApp.' },
  { question: 'Can I register multiple passes?', answer: 'Yes, the form includes a number of passes field. Approval remains subject to availability and verification.' },
  { question: 'Is payment verification required?', answer: 'Yes. The organiser team will verify the uploaded payment screenshot before issuing the WhatsApp confirmation.' },
  { question: 'Can my pass be transferred?', answer: 'Pass transfer is subject to organiser approval. Please contact the team before transferring any confirmation.' },
  { question: 'What should I carry at the venue?', answer: 'Please carry your WhatsApp confirmation and any identity detail requested by the organisers.' },
  { question: 'Is this a Desh Bhakti event?', answer: 'Yes. It is a Desh Bhakti event focused on Param Vir Chakra stories, patriotism, sacrifice and national pride.' },
  { question: 'Will Param Vir Chakra stories be covered?', answer: 'Yes. The event highlights inspirational Param Vir Chakra stories and the values behind India’s highest gallantry award.' },
  { question: 'Is this suitable for students?', answer: 'Yes. The event is especially meaningful for youth, students and organisations interested in leadership and character building.' },
  { question: 'Who is Shri Harshal Pushkarna?', answer: 'Shri Harshal Pushkarna is listed as a writer, journalist and keynote speaker for the event.' },
  { question: 'Who is Muni Shri Shramanchandrasagarji Maharaj?', answer: 'Pujya Muni Shri Shramanchandrasagarji Maharaj, also known as Yashonandan, is one of the inspirational personalities associated with the event.' },
  { question: 'Who is organising the event?', answer: 'The event is organised by Shri Vardhman Shwetambar Murtipujak Jain Sangh, Usmanpura, Ahmedabad.' },
  { question: 'Is entry guaranteed after registration?', answer: 'Entry is subject to verification, approval and seating availability.' },
  { question: 'What topics will the event cover?', answer: 'The event covers Param Vir Chakra winners, Indian Army heroes, patriotism, leadership, sacrifice, courage and national pride.' },
  { question: 'Is this an Ahmedabad event?', answer: 'Yes. Param Vir Chakra Shaurya Gatha is an Ahmedabad event at Dinesh Hall.' },
  { question: 'Will I get updates on WhatsApp?', answer: 'Yes. Confirmation and event pass communication will be sent through WhatsApp after verification.' },
  { question: 'Where can I find the official page?', answer: 'The official page is https://vardhmancreativestudio.com/param-vir-chakra.' },
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
  { label: 'Guests', href: '#guests' },
  { label: 'Registration', href: '#registration' },
  { label: 'FAQ', href: '#faq' }
];

const eventCards = [
  { icon: CalendarDays, title: 'कार्यक्रम तिथि', label: '9 अगस्त 2026', detail: 'रविवार' },
  { icon: Clock, title: 'समय', label: 'प्रातः 9:00 बजे', detail: 'कार्यक्रम प्रारंभ' },
  { icon: MapPin, title: 'स्थान', label: 'दीनेश हॉल', detail: 'नवरंगपुरा, अहमदाबाद' },
  { icon: Users, title: 'आयु सीमा', label: '15–50 वर्ष', detail: 'पंजीकरण आवश्यक' },
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

<<<<<<< HEAD
=======
function SectionHeader({ eyebrow, title, children, light = false }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
      <p className={`mb-3 text-xs font-bold uppercase tracking-[0.2em] md:text-sm ${light ? 'text-[#ff9933]' : 'text-[#b57a2a]'}`}>{eyebrow}</p>
      <h2 className={`font-serif text-[2rem] font-semibold leading-tight tracking-normal md:text-5xl ${light ? 'text-white' : 'text-[#1f2937]'}`}>{title}</h2>
      {children ? <p className={`mt-5 text-base leading-8 md:text-lg ${light ? 'text-white/72' : 'text-[#56616f]'}`}>{children}</p> : null}
    </div>
  );
}
function MemorialVisual() {
  return (
    <div className="relative min-h-[360px] overflow-hidden rounded-[8px] border border-white/12 bg-[#07111f] shadow-2xl shadow-black/30 md:min-h-[520px]" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(32,83,169,0.28),transparent_34%),radial-gradient(circle_at_28%_62%,rgba(239,154,58,0.22),transparent_32%),linear-gradient(145deg,#081321,#0c1828_56%,#08111d)]" />
      <div className="absolute -right-24 top-12 h-72 w-72 rounded-full border border-[#d6e6ff]/10 opacity-70 md:h-96 md:w-96">
        {Array.from({ length: 24 }).map((_, index) => (
          <span
            key={index}
            className="absolute left-1/2 top-1/2 h-px w-1/2 origin-left bg-[#d6e6ff]/10"
            style={{ transform: `rotate(${index * 15}deg)` }}
          />
        ))}
      </div>
      <div className="absolute left-8 top-8 flex gap-2 md:left-10 md:top-10">
        <span className="h-1.5 w-20 rounded-full bg-[#ff9933]" />
        <span className="h-1.5 w-20 rounded-full bg-white/85" />
        <span className="h-1.5 w-20 rounded-full bg-[#138808]" />
      </div>
      <div className="absolute bottom-0 left-1/2 h-60 w-[74%] -translate-x-1/2 md:h-72">
        <div className="absolute bottom-0 left-1/2 h-16 w-full -translate-x-1/2 rounded-t-[8px] border border-[#c19b56]/25 bg-[#111d2a]" />
        <div className="absolute bottom-12 left-1/2 h-24 w-[74%] -translate-x-1/2 rounded-t-[8px] border border-[#c19b56]/25 bg-[#172535]" />
        <div className="absolute bottom-32 left-1/2 h-24 w-[46%] -translate-x-1/2 rounded-t-full border border-[#c19b56]/30 bg-[#1c2b3b]" />
        <div className="absolute bottom-44 left-1/2 h-28 w-10 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,#fff4c2,#ffb23f_38%,#e45125_74%,transparent)] blur-[1px]" />
        <div className="absolute bottom-40 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[#f0a33d]/20 blur-2xl" />
      </div>
    </div>
  );
}
function PremiumEmblem({ tone = 'gold' }) {
  const stroke = tone === 'light' ? '#f3c66b' : '#9d6b26';

  return (
    <svg className="mx-auto mb-4 h-9 w-9" viewBox="0 0 48 48" role="img" aria-label="Premium patriotic emblem">
      <circle cx="24" cy="24" r="21" fill="none" stroke={stroke} strokeWidth="1.4" opacity="0.35" />
      <circle cx="24" cy="24" r="12" fill="none" stroke={stroke} strokeWidth="1.3" />
      {Array.from({ length: 12 }).map((_, index) => (
        <line
          key={index}
          x1="24"
          y1="12"
          x2="24"
          y2="17"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinecap="round"
          transform={`rotate(${index * 30} 24 24)`}
        />
      ))}
      <path d="M24 5.5 27.1 17h12L29.4 24.1 33 36 24 28.9 15 36l3.6-11.9L8.9 17h12L24 5.5Z" fill="none" stroke={stroke} strokeWidth="1.2" strokeLinejoin="round" opacity="0.88" />
    </svg>
  );
}
>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2


export default function ParamVirChakraPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [activeHash, setActiveHash] = useState('#hero');
  const [timeLeft, setTimeLeft] = useState({ days: 6, hours: 0, minutes: 0, seconds: 0 });
  const schemas = useMemo(() => {
<<<<<<< HEAD
  
const whyAttend = [
  { title: "देशभक्ति", text: "भारत के वीरों के प्रति सम्मान और राष्ट्र के प्रति जिम्मेदारी की भावना को गहराई से अनुभव करने का अवसर।", accent: "saffron" },
  { title: "प्रेरणा", text: "Param Vir Chakra विजेताओं की सच्ची शौर्यगाथाएँ युवाओं और परिवारों को जीवन मूल्यों से जोड़ती हैं।", accent: "white" },
  { title: "इतिहास", text: "India’s Highest Gallantry Award से जुड़े प्रसंगों को सरल, प्रामाणिक और यादगार storytelling में समझने का अवसर।", accent: "green" },
  { title: "राष्ट्र गौरव", text: "भारतीय ध्वज, अशोक चक्र और National War Memorial की भावना से प्रेरित एक गरिमामय patriotic experience।", accent: "saffron" },
  { title: "वीरता", text: "साहस, त्याग और कर्तव्यनिष्ठा के वे उदाहरण जो हर नागरिक को अपने जीवन में मजबूत बनाते हैं।", accent: "white" },
  { title: "युवा प्रेरणा", text: "Students और young professionals के लिए leadership, discipline और character building की practical सीख।", accent: "green" },
  { title: "Leadership", text: "दबाव में निर्णय, जिम्मेदारी और team spirit जैसे गुणों को भारत के वीरों की कहानियों से समझना।", accent: "saffron" },
  { title: "Character Building", text: "कार्यक्रम का उद्देश्य केवल जानकारी देना नहीं, बल्कि संयम, साहस और सेवा भाव को जीवन में उतारना है।", accent: "white" }
];


    return {
            event: {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': 'Param Vir Chakra - Shaurya Gatha',
        'description': 'A premium patriotic event dedicated to India\'s Param Vir Chakra heroes.',
        'startDate': '2026-08-09T09:00:00+05:30',
        'endDate': '2026-08-09T13:00:00+05:30',
        'image': heroImage,
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'eventStatus': 'https://schema.org/EventScheduled',
        'location': {
          '@type': 'Place',
          'name': 'Dinesh Hall',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'Navrangpura',
            'addressLocality': 'Ahmedabad',
            'addressRegion': 'Gujarat',
            'addressCountry': 'IN'
          }
        },
        'organizer': {
          '@type': 'Organization',
          'name': 'Shri Vardhman Shwetambar Murtipujak Jain Sangh'
        },
        'offers': {
          '@type': 'Offer',
          'url': canonicalUrl,
          'price': '100',
          'priceCurrency': 'INR',
          'availability': 'https://schema.org/InStock',
          'validFrom': '2026-07-15T00:00:00'
        }
      },
      localBusiness: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Shri Vardhman Shwetambar Murtipujak Jain Sangh',
        'address': { '@type': 'PostalAddress', addressLocality: 'Ahmedabad', addressRegion: 'Gujarat' }
      },
      faq: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqs.map(item => ({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': item.answer }
        }))
      },
      breadcrumb: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vardhmancreativestudio.com/' }, { '@type': 'ListItem', position: 2, name: 'Param Vir Chakra Shaurya Gatha', item: canonicalUrl }]
      }
=======
    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Vardhman Creative Studio',
      url: 'https://vardhmancreativestudio.com/',
      email: 'vardhmancreativestudio@gmail.com',
      telephone: '+91-7990106225',
    };

    const event = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Param Vir Chakra - Shaurya Gatha',
      alternateName: 'परमवीर चक्र - शौर्यगाथा',
      description:
        'Param Vir Chakra Shaurya Gatha is an inspirational patriotic event in Ahmedabad dedicated to bravery, sacrifice, courage, leadership and national pride.',
      image: `https://vardhmancreativestudio.com${heroImage}`,\n      startDate: eventStart,\n      endDate: '2026-08-09T13:00:00+05:30',\n      eventStatus: 'https://schema.org/EventScheduled',\n      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',\n      location: {\n        '@type': 'Place',\n        name: 'Dinesh Hall',\n        address: {\n          '@type': 'PostalAddress',\n          addressLocality: 'Ahmedabad',\n          addressRegion: 'Gujarat',\n          addressCountry: 'IN',\n        },\n      },\n      organizer: {\n        '@type': 'Organization',\n        name: 'Shri Vardhman Shwetambar Murtipujak Jain Sangh',\n        address: 'Usmanpura, Ahmedabad',\n        url: canonicalUrl,\n      },\n      offers: {\n        '@type': 'Offer',\n        url: canonicalUrl,\n        price: '100',\n        priceCurrency: 'INR',\n        validFrom: '2026-07-15T00:00:00+05:30',\n        availabilityStarts: '2026-07-15T00:00:00+05:30',\n        availability: 'https://schema.org/InStock',\n      },
      performer: guests.map((guest) => ({ '@type': 'Person', name: guest.name })),
>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Param Vir Chakra Shaurya Gatha Ahmedabad | Official Event</title>
        <meta name="description" content="Join us at Dinesh Hall, Ahmedabad on 9 August 2026 for the Param Vir Chakra Shaurya Gatha." />
        <link rel="canonical" href={canonicalUrl} />
        {/* Structured Data Scripts */}
        <script type="application/ld+json">{JSON.stringify(schemas.event)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.localBusiness)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.faq)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.breadcrumb)}</script>
      </Helmet>

      <main className="min-h-screen bg-[#f7f1e5] text-[#172033] relative">
      {/* HEADER SECTION */}
      <nav className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-2xl transition-all duration-300 ${navSolid ? "border-white/12 bg-[#07111f]/92 shadow-[0_18px_60px_rgba(0,0,0,0.35)]" : "border-white/0 bg-transparent"}`} aria-label="Primary navigation">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#hero" className="flex items-center gap-3 text-white" aria-label="Param Vir Chakra Shaurya Gatha home">
            <span className="flex h-10 w-10 items-center justify-center rounded-3xl border border-[#e4b45f]/40 bg-[#e4b45f]/15">
              <Award className="h-5 w-5 text-[#ff9933]" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-[0.16em]">PARAM VIR CHAKRA</span>
              <span className="block text-xs text-white/65">Shaurya Gatha</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className={`relative text-sm font-semibold tracking-wide text-white/75 hover:text-white transition-colors after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gradient-to-r after:from-[#ff9933] after:via-white/85 after:to-[#138808] after:transition-transform after:duration-300 hover:after:scale-x-100 ${activeHash === item.href ? "text-white after:scale-x-100" : ""}`}>
                {item.label}
              </a>
            ))}
            <a href="#registration" className="inline-flex items-center gap-2 rounded-3xl bg-[#ff9933] px-4 py-2 text-sm font-bold text-[#171009] shadow-lg shadow-[#ff9933]/20 hover:bg-white hover:-translate-y-0.5 transition-all">
              Register <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <button type="button" className="rounded-3xl border border-white/15 p-2 text-white md:hidden" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-white/10 bg-[#061120] px-5 py-4 md:hidden">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="block rounded-3xl px-3 py-3 text-sm font-semibold text-white/80" onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </div>
        ) : null}
      </nav>

      {/* HERO SECTION - ULTIMATE CINEMATIC PREMIUM REDESIGN */}
      <section id="hero" className="relative isolate overflow-hidden bg-[#040b14] pt-24 text-white min-h-[95svh] flex flex-col justify-between">
        
        {/* Absolute Background Master Layers */}
        <div className="absolute inset-0 -z-10 select-none pointer-events-none">
          <img 
            src={heroImage} 
            alt="Param Vir Chakra Shaurya Gatha Luxury Artwork Background" 
            className="h-full w-full object-cover object-right-top md:object-center opacity-[0.45] scale-[1.02]" 
            loading="eager"
            fetchpriority="high"
          />
          {/* Deep Cinematic Ambient Radial Gradients to make text readable on the left */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(255,153,51,0.15),transparent_45%),radial-gradient(circle_at_85%_55%,rgba(19,136,8,0.12),transparent_50%),linear-gradient(90deg,rgba(4,11,20,0.95) 0%,rgba(4,11,20,0.7) 45%,transparent 100%),linear-gradient(180deg,rgba(4,11,20,0.85) 0%,rgba(4,11,20,0) 20%,rgba(4,11,20,0) 80%,rgba(4,11,20,0.95) 100%)]" />
          <div className="absolute inset-0 opacity-[0.025] noise-bg" aria-hidden="true" />
        </div>

<<<<<<< HEAD
        {/* Main Content Layout Container */}
        <div className="mx-auto w-full max-w-7xl px-5 pt-12 pb-6 lg:px-8 flex-1 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          
          {/* Left Column: Typographic Branding & Details */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col justify-center">
            
            {/* Main Luxury Event Typography (Fixed Hindi Matra Clipping Issue) */}
            <h1 className="font-serif text-[3.5rem] font-bold leading-[1.2] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5rem] pb-2">
=======
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImage}
            alt="Param Vir Chakra Shaurya Gatha memorial hero visual"
            className="h-full w-full object-cover opacity-90"
            loading="eager"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#07111f_0%,rgba(7,17,31,0.86)_38%,rgba(7,17,31,0.35)_68%,rgba(7,17,31,0.15)_100%)]" />
        </div>

        <div className="mx-auto grid min-h-[92svh] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr] lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-6 inline-flex items-center gap-2 rounded-[8px] border border-[#ff9933]/35 bg-white/[0.055] px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff9933] backdrop-blur-xl">
              <Flame className="h-4 w-4" aria-hidden="true" />
              Registration Opens 15 July 2026
            </p>
            <h1 className="font-serif text-[3.25rem] font-semibold leading-[1.04] tracking-normal text-white sm:text-6xl md:text-7xl lg:text-8xl">
>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2
              परमवीर चक्र
              <span className="mt-2 block text-[#FF9933] filter drop-shadow-[0_2px_15px_rgba(255,153,51,0.3)]">
                शौर्यगाथा
              </span>
            </h1>

            {/* Event Explainer Hooks */}
            <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-[#FFB854] sm:text-xl md:text-2xl">
              भारत के वीरों को समर्पित एक अद्भुत देशभक्ति अनुभव
            </p>
            
            <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/70 font-light">
              भारत के सर्वोच्च वीरता सम्मान <strong className="font-medium text-white">परमवीर चक्र</strong> से सम्मानित अमर वीरों के अद्भुत साहस, त्याग और राष्ट्रभक्ति की प्रेरणादायी शौर्यगाथाओं पर आधारित एक भव्य कार्यक्रम।
            </p>

            {/* Interactive Call to Action Triggers */}
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <a 
                href="#registration" 
                className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-[#FF9933] px-8 py-3 text-[15px] font-bold text-[#090f19] shadow-[0_12px_40px_rgba(255,153,51,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_50px_rgba(255,153,51,0.35)]"
              >
                Register Now <ChevronRight className="ml-1 h-5 w-5 shrink-0 stroke-[2.5]" />
              </a>
              <a 
                href="#about" 
                className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-white/20 bg-white/[0.03] px-8 py-3 text-[15px] font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:border-white/40"
              >
                Learn More
              </a>
            </div>
<<<<<<< HEAD

            {/* Exact Match Reference Grid Cards (Matched with image_d9b941.jpg) */}
            <div className="mt-12 grid gap-4 grid-cols-2 sm:grid-cols-4 lg:max-w-3xl">
              {eventCards.map((card) => (
                <div key={card.label} className="relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-6 text-center backdrop-blur-md transition-all duration-300 hover:border-[#FF9933]/50 hover:bg-white/[0.06] shadow-lg">
                  <card.icon className="mb-4 h-7 w-7 text-[#FF9933]" strokeWidth={1.5} />
                  <h3 className="text-[17px] font-bold text-white tracking-wide">{card.label}</h3>
                  <p className="mt-1.5 text-[13px] text-white/50 font-medium">{card.detail}</p>
=======
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
              {eventCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#d8c096]/60 bg-[#fffaf0] px-5 py-10 lg:px-8" aria-labelledby="registration-open-heading">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#a35f10]">
              <Ticket className="h-5 w-5" aria-hidden="true" />
              Registration Opens
            </p>
            <h2 id="registration-open-heading" className="font-serif text-3xl font-semibold tracking-normal text-[#172033] md:text-5xl">
              15 July 2026
            </h2>
            <p className="mt-3 text-base font-semibold text-[#56616f]">
              {countdown.isOpen ? 'रजिस्ट्रेशन अब खुले हैं' : 'बुकिंग 15 जुलाई 2026 से प्रारंभ होगी'}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 rounded-[8px] border border-[#d8c096] bg-white p-2 shadow-xl shadow-[#7c4a0b]/10" aria-label="Countdown to registration opening">
            {[
              ['दिन', countdown.days],
              ['घंटे', countdown.hours],
              ['मिनट', countdown.minutes],
              ['सेकंड', countdown.seconds],
            ].map(([label, value]) => (
              <div key={label} className="min-w-16 rounded-[8px] bg-[#101927] px-3 py-4 text-center text-white">
                <span className="block text-2xl font-bold tracking-normal md:text-3xl">{value}</span>
                <span className="text-xs text-white/60">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blessings" className="px-5 py-16 lg:px-8 lg:py-20">
        <SectionHeader eyebrow="Sacred Inspiration" title="पावन प्रेरणा">
          आध्यात्मिक प्रेरणा, सेवा और संस्कारों की गरिमा के साथ यह आयोजन राष्ट्रभक्ति के भाव को और गहरा बनाता है।
        </SectionHeader>
        <article className="mx-auto max-w-7xl rounded-[8px] border border-[#d7c096] bg-white p-5 shadow-2xl shadow-[#60410f]/10 md:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <PremiumEmblem />
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9d6b26]">Blessings & Guidance</p>
          </div>
          <div className="mt-8 rounded-[8px] border border-[#ead9ba] bg-[#fffaf0] p-5 md:p-8">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff9933]">{blessings[0].title}</p>
              <h3 className="mt-3 font-serif text-[1.42rem] font-semibold leading-snug tracking-normal text-[#172033] md:text-3xl">{blessings[0].text}</h3>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {blessings.slice(1).map((item, index) => (
                <div key={item.title} className={`rounded-[8px] border border-[#ead9ba] bg-white p-5 ${index === 0 ? 'text-left' : 'text-right'}`}>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#138808]">{item.title}</p>
                  <h3 className="mt-3 font-serif text-[1.25rem] font-semibold leading-snug tracking-normal text-[#172033] md:text-2xl">{item.text}</h3>
>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2
                </div>
              ))}
            </div>

          </motion.div>

          {/* Right Column: Empty Space Holder to reveal the stunning image asset behind */}
          <div className="hidden lg:block pointer-events-none select-none" aria-hidden="true" />
        </div>

        {/* MIDDLE HIGHLIGHTS: CONTENT-RICH BOXES */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mx-auto mt-12 px-4">
  
  {/* Box 1: वीर गाथा */}
  <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-[#FFB854]/30 bg-gradient-to-b from-[#0a1526] to-[#07111f] hover:border-[#FFB854]/60 transition-all duration-500 group">
    <div className="p-4 rounded-full bg-[#FFB854]/10 mb-6 group-hover:scale-110 transition-transform">
      <ShieldCheck className="h-10 w-10 text-[#FFB854]" />
    </div>
    <h3 className="text-2xl font-serif font-bold text-white mb-3">वीर गाथा</h3>
    <p className="text-white/60 leading-relaxed text-sm">
      भारत के उन जाबांज़ों की अनकही कहानियाँ, जिन्होंने अपने साहस से इतिहास के पन्नों को स्वर्ण अक्षरों में दर्ज किया। 
    </p>
  </div>

  {/* Box 2: विशेष सम्मान */}
  <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-[#FFB854]/30 bg-gradient-to-b from-[#0a1526] to-[#07111f] hover:border-[#FFB854]/60 transition-all duration-500 group">
    <div className="p-4 rounded-full bg-[#FFB854]/10 mb-6 group-hover:scale-110 transition-transform">
      <Award className="h-10 w-10 text-[#FFB854]" />
    </div>
    <h3 className="text-2xl font-serif font-bold text-white mb-3">विशेष सम्मान</h3>
    <p className="text-white/60 leading-relaxed text-sm">
      देश सेवा और अटूट पराक्रम की मिसाल पेश करने वाले असली नायकों का सम्मान, जो हम सभी को गौरवान्वित करते हैं।
    </p>
  </div>

  {/* Box 3: प्रेरणा */}
  <div className="flex flex-col items-center text-center p-8 rounded-3xl border border-[#FFB854]/30 bg-gradient-to-b from-[#0a1526] to-[#07111f] hover:border-[#FFB854]/60 transition-all duration-500 group">
    <div className="p-4 rounded-full bg-[#FFB854]/10 mb-6 group-hover:scale-110 transition-transform">
      <Users className="h-10 w-10 text-[#FFB854]" />
    </div>
    <h3 className="text-2xl font-serif font-bold text-white mb-3">प्रेरणा</h3>
    <p className="text-white/60 leading-relaxed text-sm">
      युवा पीढ़ी में राष्ट्रप्रेम और वीरता की भावना जगाने का एक महा-अभियान, जो आने वाली पीढ़ियों को दिशा दिखाएगा।
    </p>
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
                ? { border: 'group-hover:border-[#FF9933]/50', glow: 'from-transparent via-[#FF9933] to-transparent', icon: 'text-[#FF9933]', bg: 'bg-[#FF9933]/5', pill: 'border-[#FF9933]/30 bg-[#FF9933]/10 text-[#FF9933]' }
                : { border: 'group-hover:border-[#138808]/50', glow: 'from-transparent via-[#138808] to-transparent', icon: 'text-[#138808]', bg: 'bg-[#138808]/5', pill: 'border-[#138808]/30 bg-[#138808]/10 text-[#138808]' };

              return (
                <motion.article 
                  variants={fadeInUp} 
                  key={guest.name} 
                  className={`group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] ${theme.border}`}
                >
                  {/* Subtle top glow line on hover */}
                  <div className={`absolute inset-x-0 top-0 h-1 w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r ${theme.glow}`} />
                  
                  <div className={`mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${theme.bg}`}>
                    <ShieldCheck className={`h-8 w-8 ${theme.icon}`} aria-hidden="true" />
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
                  
                  <p className="mt-6 text-[15px] leading-8 text-white/60 font-light transition-colors duration-300 group-hover:text-white/80">
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
                    { border: 'hover:border-[#FF9933]/50', icon: 'text-[#FF9933]', hoverBg: 'hover:bg-[#FF9933]/5' },
                    { border: 'hover:border-[#000080]/40', icon: 'text-[#000080]', hoverBg: 'hover:bg-[#000080]/5' },
                    { border: 'hover:border-[#138808]/50', icon: 'text-[#138808]', hoverBg: 'hover:bg-[#138808]/5' },
                    { border: 'hover:border-[#FF9933]/50', icon: 'text-[#FF9933]', hoverBg: 'hover:bg-[#FF9933]/5' },
                    { border: 'hover:border-[#138808]/50', icon: 'text-[#138808]', hoverBg: 'hover:bg-[#138808]/5' },
                  ][index];

                  return (
                    <motion.div 
                      variants={fadeInUp}
                      key={item} 
                      className={`group flex items-center justify-between rounded-2xl border border-[#ead9ba] bg-white px-5 py-4 transition-all duration-300 ${valueColors.border} ${valueColors.hoverBg}`}
                    >
                      <span className="font-semibold tracking-wide text-[#172033]">{item}</span>
                      <CheckCircle2 className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${valueColors.icon}`} />
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
            // Tricolor Theme Rotation
            const blockTheme = [
              { border: 'border-[#FF9933]/30 hover:border-[#FF9933]/60', bg: 'bg-[#FF9933]', text: 'text-[#FF9933]' },
              { border: 'border-[#000080]/20 hover:border-[#000080]/50', bg: 'bg-[#000080]', text: 'text-[#000080]' },
              { border: 'border-[#138808]/30 hover:border-[#138808]/60', bg: 'bg-[#138808]', text: 'text-[#138808]' },
              { border: 'border-[#FF9933]/30 hover:border-[#FF9933]/60', bg: 'bg-[#FF9933]', text: 'text-[#FF9933]' },
              { border: 'border-[#138808]/30 hover:border-[#138808]/60', bg: 'bg-[#138808]', text: 'text-[#138808]' },
            ][index];

            return (
              <motion.article 
                variants={fadeInUp}
                key={item} 
                className={`group relative overflow-hidden rounded-[2rem] border bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#60410f]/15 ${blockTheme.border}`}
              >
                {/* Premium Active Top Line */}
                <div className={`absolute inset-x-0 top-0 h-1.5 transition-all duration-300 group-hover:h-2.5 ${blockTheme.bg}`} aria-hidden="true" />
                
                <PremiumEmblem tone="gold" />
                
                <h3 className={`mt-4 font-serif text-[1.25rem] font-bold leading-snug transition-colors duration-300 ${blockTheme.text}`}>
                  {item}
                </h3>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      {/* PVC HEROES SECTION */}
      <section className="px-5 py-20 lg:px-8 bg-[#f7f1e5]">
        <SectionHeader eyebrow="Param Vir Chakra Heroes" title="वीरता की अमर शौर्यगाथाएँ" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pvcHeroes.map((hero, index) => {
            const heroColors = [{ line: 'bg-[#FF9933]' }, { line: 'bg-[#000080]' }, { line: 'bg-[#138808]' }, { line: 'bg-[#FF9933]' }][index % 4];
            return (
              <motion.article key={hero.name} variants={fadeInUp} className="group relative overflow-hidden rounded-3xl border border-[#d7c096] bg-white p-6 shadow-xl transition-all hover:-translate-y-1">
                <div className={`absolute inset-x-0 top-0 h-1.5 ${heroColors.line}`} />
                <h3 className="mt-4 font-serif text-2xl font-semibold text-[#172033]">{hero.name}</h3>
                <p className="mt-2 text-sm text-[#9d6b26]">{hero.year} · {hero.battle}</p>
                <p className="mt-4 text-sm text-[#56616f] leading-7">{hero.story}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      {/* WHY ATTEND SECTION - FULL COMPLIANCE */}
      <section className="relative overflow-hidden bg-[#07111f] px-5 py-20 text-white lg:px-8">
        <div className="absolute left-0 top-0 h-1 w-1/3 bg-[#ff9933]" />
        <div className="absolute left-1/3 top-0 h-1 w-1/3 bg-white/80" />
        <div className="absolute right-0 top-0 h-1 w-1/3 bg-[#138808]" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeader eyebrow="Why Attend" title="क्यों शामिल हों" light>
            यह कार्यक्रम ज्ञान, संवेदना और चरित्र निर्माण को एक साथ जोड़ता है, ताकि हर visitor केवल event attend न करे बल्कि राष्ट्र गौरव को महसूस करे।
          </SectionHeader>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyAttend.map((item, index) => (
              <motion.article key={item.title} variants={fadeInUp} className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-white/12 bg-white/[0.07] p-6 text-center shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1">
                <div className={`absolute inset-x-0 top-0 h-1 ${item.accent === 'saffron' ? 'bg-[#ff9933]' : item.accent === 'green' ? 'bg-[#138808]' : 'bg-white/85'}`} />
                <span className="absolute right-5 top-5 text-xs font-bold text-white/22">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <PremiumEmblem tone="light" />
                  <h3 className="mx-auto max-w-[12rem] font-serif text-2xl font-semibold text-white">{item.title}</h3>
                </div>
                <p className="mt-5 text-sm leading-7 text-white/70">{item.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* EVENT TIMELINE SECTION */}
      <section className="px-5 py-20 lg:px-8 bg-[#f7f1e5]">
        <SectionHeader eyebrow="Event Timeline" title="Registration से Event तक" />
        <div className="mx-auto grid max-w-5xl gap-y-8 md:gap-x-4 md:grid-cols-4">
          {timeline.map(([date, label], index) => {
            const flagTheme = [
              { bg: 'bg-[#FF9933]', text: 'text-[#FF9933]' },
              { bg: 'bg-[#000080]', text: 'text-[#000080]' },
              { bg: 'bg-[#138808]', text: 'text-[#138808]' },
              { bg: 'bg-[#FF9933]', text: 'text-[#FF9933]' },
            ][index];

            return (
              <div key={label} className="relative flex flex-col md:block">
                <article className="group relative z-10 flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-[#d7c096] bg-white p-6 text-center shadow-lg transition-all hover:-translate-y-1">
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${flagTheme.bg}`} />
                  <p className={`text-sm font-bold uppercase tracking-[0.18em] ${flagTheme.text}`}>{date}</p>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-[#172033]">{label}</h3>
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

      {/* REGISTRATION FORM SECTION */}
      <section id="registration" className="relative overflow-hidden bg-[#0a1320] px-5 py-20 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,153,51,0.18),transparent_28%),radial-gradient(circle_at_82%_24%,rgba(19,136,8,0.14),transparent_28%),linear-gradient(180deg,#07111f,#101927)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#ff9933]">Registration</p>
            <h2 className="font-serif text-4xl font-semibold tracking-normal md:text-6xl">Register Now</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">Registration Google Form के माध्यम से होगा. कृपया form में सभी details सही भरें; verification के बाद WhatsApp confirmation भेजा जाएगा.</p>
            <div className="mt-8 rounded-3xl border border-[#138808]/35 bg-[#138808]/10 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff9933]">Organised By</p>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-white">श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ</h3>
              <p className="mt-2 text-white/70">उस्मानपुरा, अहमदाबाद</p>
            </div>
          </div>

          <article className="rounded-3xl border border-white/15 bg-white/[0.08] p-6 text-center shadow-2xl backdrop-blur-2xl md:p-10">
            <PremiumEmblem tone="light" />
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#ff9933]">Official Registration Form</p>
            <h3 className="mt-4 font-serif text-3xl font-semibold text-white md:text-5xl">Google Form से Registration</h3>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/72">नीचे दिए गए button पर click करके official Google Form भरें. Payment और pass confirmation की जानकारी form submission के बाद verify की जाएगी.</p>
            <a href={registrationFormUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-3xl bg-[#ff9933] px-6 py-4 text-base font-extrabold text-[#171009] shadow-xl hover:bg-white hover:-translate-y-0.5 sm:w-auto transition-all">
              Open Google Form <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </a>
            <p className="mt-5 text-sm text-white/55">Registration starts: 15 July 2026</p>
          </article>
        </div>
      </section>

      {/* INFORMATION & CONTACT GRID */}
      <section className="px-5 py-20 lg:px-8 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[#172033] md:text-5xl">Important Information</h2>
            <div className="mt-8 grid gap-3">
              {importantInfo.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-3xl border border-[#dcc395] bg-white px-5 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1f7a4d]" />
                  <p className="font-semibold text-[#172033]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-[#dcc395] bg-[#fffaf0] p-8 shadow-xl">
            <h2 className="font-serif text-3xl font-semibold text-[#172033]">Contact</h2>
            <div className="mt-8 grid gap-4">
<<<<<<< HEAD
              <a href="tel:+916352188150" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#b57a2a]/10"><Phone className="h-5 w-5 text-[#b57a2a]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#9d6b26]">Call Us</span><span className="text-[15px]">+91 63521 88150</span></div>
              </a>
              <a href="https://wa.me/916352188150?text=Jai%20Hind!%20I%20want%20to%20know%20more%20about%20the%20Param%20Vir%20Chakra%20Shaurya%20Gatha%20event." target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1f7a4d]/10"><MessageCircle className="h-5 w-5 text-[#1f7a4d]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#1f7a4d]">WhatsApp</span><span className="text-[15px]">+91 63521 88150</span></div>
              </a>
              <a href="https://maps.app.goo.gl/r76fhgM7NS8AJaBw8" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#b57a2a]/10"><MapPin className="h-5 w-5 text-[#b57a2a]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#9d6b26]">Location</span><span className="text-[15px]">Dinesh Hall, Ahmedabad</span></div>
=======
              <a href="tel:+916352188150" className="flex items-center gap-4 rounded-[8px] bg-white p-4 font-semibold text-[#172033]">
                <Phone className="h-5 w-5 text-[#b57a2a]" aria-hidden="true" /> Phone
              </a>
              <a href="https://wa.me/916352188150" className="flex items-center gap-4 rounded-[8px] bg-white p-4 font-semibold text-[#172033]">
                <MessageCircle className="h-5 w-5 text-[#1f7a4d]" aria-hidden="true" /> WhatsApp
              </a>
                        <a href="https://www.google.com/maps/search/?api=1&query=Dinesh+Hall+Ahmedabad" className="flex items-center gap-4 rounded-[8px] bg-white p-4 font-semibold text-[#172033]">
                <MapPin className="h-5 w-5 text-[#b57a2a]" aria-hidden="true" /> Google Map
>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2
              </a>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ ACCORDION SECTION */}

      <section id="faq" className="bg-white px-5 py-20 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" />
        <div className="mx-auto grid max-w-4xl gap-4">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group rounded-3xl border border-[#d7c096] bg-[#fffaf0] shadow-sm transition-all hover:shadow-md" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 outline-none px-5 py-5 text-left text-lg font-bold text-[#172033] marker:hidden md:px-6">
                <span className="group-hover:text-[#9d6b26] transition-colors">{faq.question}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#d7c096] bg-white text-[#9d6b26] transition-all group-open:rotate-45"><X className="h-4 w-4 rotate-45" /></span>
              </summary>
              <div className="px-5 pb-5 md:px-6">
                <p className="border-t border-[#ead9ba] pt-4 text-[15px] leading-7 text-[#56616f]">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* COMPACT FOOTER OVERLAY */}
      <footer className="relative bg-[#061120] px-5 py-12 text-white lg:px-8">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm text-white/50">Copyright © {new Date().getFullYear()}</p>
            <p className="mt-2 flex items-center gap-2 font-serif text-lg font-semibold text-white/95">Vardhman Creative Studio</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-white/60">
            <a href="#about" className="hover:text-[#ff9933] transition-colors">About</a>
            <a href="#registration" className="hover:text-[#ff9933] transition-colors">Contact</a>
            <a href="/privacy-policy" className="hover:text-[#ff9933] transition-colors">Privacy Policy</a>
          </nav>
        </div>
      </footer>
      </main>
    </>
  );
<<<<<<< HEAD
}
=======
}


>>>>>>> 0819575d685c93f19a5626c9f8ef1d1c38ee05a2
