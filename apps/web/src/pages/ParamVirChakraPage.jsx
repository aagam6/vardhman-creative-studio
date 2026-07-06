import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Landmark,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  X,
} from 'lucide-react';

const canonicalUrl = 'https://vardhmancreativestudio.com/param-vir-chakra';
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
    roles: ['लेखक', 'पत्रकार', 'मुख्य वक्ता'],
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

function getCountdown() {
  const distance = registrationOpenAt - Date.now();

  if (distance <= 0) {
    return { isOpen: true, days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  return {
    isOpen: false,
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

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

function StatCard({ icon: Icon, label, detail }) {
  return (
    <div className="rounded-[8px] border border-white/15 bg-white/[0.08] p-4 text-left shadow-2xl shadow-black/20 backdrop-blur-xl">
      <Icon className="mb-4 h-6 w-6 text-[#f3b34c]" aria-hidden="true" />
      <p className="text-lg font-semibold tracking-normal text-white">{label}</p>
      <p className="text-sm text-white/68">{detail}</p>
    </div>
  );
}


export default function ParamVirChakraPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const schemas = useMemo(() => {
    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Vardhman Creative Studio',
      url: 'https://vardhmancreativestudio.com/',
      email: 'vardhmancreativestudio@gmail.com',
      telephone: '+91-00000-00000',
    };

    const event = {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Param Vir Chakra - Shaurya Gatha',
      alternateName: 'परमवीर चक्र - शौर्यगाथा',
      description:
        'Param Vir Chakra Shaurya Gatha is an inspirational patriotic event in Ahmedabad dedicated to bravery, sacrifice, courage, leadership and national pride.',
      image: `https://vardhmancreativestudio.com${heroImage}`,
      startDate: eventStart,
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'Place',
        name: 'Dinesh Hall',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Ahmedabad',
          addressRegion: 'Gujarat',
          addressCountry: 'IN',
        },
      },
      organizer: {
        '@type': 'Organization',
        name: 'Shri Vardhman Shwetambar Murtipujak Jain Sangh',
        address: 'Usmanpura, Ahmedabad',
      },
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        availabilityStarts: '2026-07-15T00:00:00+05:30',
        availability: 'https://schema.org/InStock',
      },
      performer: guests.map((guest) => ({ '@type': 'Person', name: guest.name })),
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://vardhmancreativestudio.com/' },
        { '@type': 'ListItem', position: 2, name: 'Param Vir Chakra Shaurya Gatha', item: canonicalUrl },
      ],
    };

    const faq = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    };

    const website = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Vardhman Creative Studio',
      url: 'https://vardhmancreativestudio.com/',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://vardhmancreativestudio.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    };

    const persons = guests.map((guest) => ({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: guest.name,
      description: guest.bio,
    }));

    const localBusiness = {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Shri Vardhman Shwetambar Murtipujak Jain Sangh',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Usmanpura',
        addressLocality: 'Ahmedabad',
        addressRegion: 'Gujarat',
        addressCountry: 'IN',
      },
    };

    const image = {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      url: `https://vardhmancreativestudio.com${heroImage}`,
      caption: 'Param Vir Chakra Shaurya Gatha official event visual',
    };

    return { organization, event, breadcrumb, faq, website, persons, localBusiness, image };
  }, []);

  const formDisabled = !countdown.isOpen;


  return (
    <main className="min-h-screen bg-[#f7f1e5] text-[#172033]">
      <Helmet>
        <title>Param Vir Chakra Shaurya Gatha Ahmedabad</title>
        <meta
          name="description"
          content="Param Vir Chakra Shaurya Gatha Ahmedabad event on 9 August 2026 at Dinesh Hall. Register for a patriotic tribute to India's brave heroes and national pride."
        />
        <meta
          name="keywords"
          content="Param Vir Chakra, Param Vir Chakra Event, Param Vir Chakra Shaurya Gatha, Param Vir Chakra Ahmedabad, Param Vir Chakra Registration, Patriotic Event Ahmedabad, India Heroes Event, Shaurya Gatha, Veer Gatha, National Pride Event, Desh Bhakti Event, Ahmedabad Events, 9 August Event, Dinesh Hall Ahmedabad, Vardhman Creative Studio, Shri Harshal Pushkarna, Muni Shri Shramanchandrasagarji Maharaj, Hemchandrasagar Suri Maharaj, Samyakchandrasagar Suri Maharaj, Tarakchandrasagar Suri Maharaj, Shri Vardhman Shwetambar Murtipujak Jain Sangh, Usmanpura Ahmedabad"
        />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="event" />
        <meta property="og:title" content="Param Vir Chakra - Shaurya Gatha Ahmedabad" />
        <meta
          property="og:description"
          content="भारत के वीरों को समर्पित एक अद्भुत देशभक्ति अनुभव. 9 August 2026, Dinesh Hall, Ahmedabad."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={`https://vardhmancreativestudio.com${heroImage}`} />
        <meta property="og:locale" content="hi_IN" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Param Vir Chakra - Shaurya Gatha Ahmedabad" />
        <meta
          name="twitter:description"
          content="Register for a premium patriotic event dedicated to India's Param Vir Chakra heroes."
        />
        <meta name="twitter:image" content={`https://vardhmancreativestudio.com${heroImage}`} />
        <script type="application/ld+json">{JSON.stringify(schemas.event)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.organization)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.breadcrumb)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.faq)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.website)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.persons)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.localBusiness)}</script>
        <script type="application/ld+json">{JSON.stringify(schemas.image)}</script>
      </Helmet>

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#061120]/70 backdrop-blur-2xl" aria-label="Primary navigation">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#hero" className="flex items-center gap-3 text-white" aria-label="Param Vir Chakra Shaurya Gatha home">
            <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#e4b45f]/40 bg-[#e4b45f]/15">
              <Award className="h-5 w-5 text-[#ff9933]" aria-hidden="true" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-[0.16em]">PARAM VIR CHAKRA</span>
              <span className="block text-xs text-white/65">Shaurya Gatha</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-white/75 hover:text-[#ff9933]">
                {item.label}
              </a>
            ))}
            <a
              href="#registration"
              className="inline-flex items-center gap-2 rounded-[8px] bg-[#ff9933] px-4 py-2 text-sm font-bold text-[#171009] shadow-lg shadow-[#ff9933]/20 hover:bg-white"
            >
              Register <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <button
            type="button"
            className="rounded-[8px] border border-white/15 p-2 text-white md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
        {menuOpen ? (
          <div className="border-t border-white/10 bg-[#061120] px-5 py-4 md:hidden">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block rounded-[8px] px-3 py-3 text-sm font-semibold text-white/80"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        ) : null}
      </nav>

      <section id="hero" className="relative isolate overflow-hidden bg-[#07111f] pt-24 text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(255,153,51,0.16),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(27,78,161,0.18),transparent_30%),linear-gradient(180deg,#07111f,#0d1828_58%,#111a27)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-[#f7f1e5] to-transparent" />

        <div className="mx-auto grid min-h-[92svh] max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-[8px] border border-[#ff9933]/35 bg-white/[0.055] px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff9933] backdrop-blur-xl">
              <Flame className="h-4 w-4" aria-hidden="true" />
              Registration Opens 15 July 2026
            </p>
            <h1 className="font-serif text-[3.25rem] font-semibold leading-[1.04] tracking-normal text-white sm:text-6xl md:text-7xl lg:text-8xl">
              परमवीर चक्र
              <span className="block text-[#ff9933]">शौर्यगाथा</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-white/86 sm:text-xl md:text-2xl">
              भारत के वीरों को समर्पित एक अद्भुत देशभक्ति अनुभव
            </p>
            <p className="mt-5 max-w-3xl text-[15px] leading-7 text-white/70 md:text-lg md:leading-8">
              भारत के सर्वोच्च वीरता सम्मान <strong className="font-semibold text-white">परमवीर चक्र</strong> से सम्मानित अमर वीरों के अद्भुत साहस, त्याग और राष्ट्रभक्ति की प्रेरणादायी शौर्यगाथाओं पर आधारित एक भव्य कार्यक्रम।
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#registration" className="inline-flex min-h-12 items-center justify-center rounded-[8px] bg-[#ff9933] px-6 py-3 font-bold text-[#171009] shadow-xl shadow-[#ff9933]/20 hover:bg-white">
                Register Now <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </a>
              <a href="#about" className="inline-flex min-h-12 items-center justify-center rounded-[8px] border border-white/18 bg-white/[0.055] px-6 py-3 font-bold text-white backdrop-blur-xl hover:border-[#ff9933]/50 hover:text-[#ff9933]">
                Learn More
              </a>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {eventCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </div>
          </div>
          <MemorialVisual />
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
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section id="guests" className="bg-[#111a27] px-5 py-20 text-white lg:px-8">
        <SectionHeader eyebrow="Featured Speakers" title="दो प्रेरणादायी वक्ता" light>
          <span className="text-white/70">ज्ञान, प्रेरणा और राष्ट्रगौरव के भाव को मंच पर जीवंत करने वाले दो मुख्य वक्ता।</span>
        </SectionHeader>
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          {guests.map((guest) => (
            <article key={guest.name} className="rounded-[8px] border border-white/12 bg-white/[0.06] p-5 backdrop-blur-xl md:p-8">
              <ShieldCheck className="mb-8 h-8 w-8 text-[#ff9933]" aria-hidden="true" />
              <h3 className="font-serif text-[1.65rem] font-semibold leading-tight tracking-normal text-white md:text-3xl">{guest.name}</h3>
              <div className="mt-6 flex flex-wrap gap-2">
                {guest.roles.map((role) => (
                  <span key={role} className="rounded-[8px] border border-[#ff9933]/25 bg-[#ff9933]/10 px-3 py-2 text-sm font-semibold text-[#ff9933]">
                    {role}
                  </span>
                ))}
              </div>
              <p className="mt-6 text-[15px] leading-8 text-white/72 md:text-base">{guest.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="scroll-mt-24 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Official Event Resource" title="Param Vir Chakra – Shaurya Gatha">
            परमवीर चक्र विजेताओं की शौर्यगाथाओं, नेतृत्व, बलिदान और राष्ट्र गौरव को समर्पित एक गहन, उपयोगी और SEO-rich आधिकारिक जानकारी।
          </SectionHeader>
          <div className="grid gap-10 lg:grid-cols-[0.34fr_0.66fr]">
            <aside className="h-fit rounded-[8px] border border-[#d7c096] bg-[#fffaf0] p-6 shadow-xl shadow-[#60410f]/8 lg:sticky lg:top-28">
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#9d6b26]">Core Values</p>
              <div className="mt-6 grid gap-3">
                {['Patriotism', 'Leadership', 'Sacrifice', 'Courage', 'National Pride'].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-[8px] border border-[#ead9ba] bg-white px-4 py-4">
                    <span className="font-semibold text-[#172033]">{item}</span>
                    <CheckCircle2 className="h-5 w-5 text-[#1f7a4d]" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </aside>
            <article className="rounded-[8px] border border-[#d7c096] bg-white p-6 shadow-2xl shadow-[#60410f]/8 md:p-10" aria-label="SEO article about Param Vir Chakra Shaurya Gatha">
              <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#172033] md:text-5xl">भारत के परमवीर वीरों को नमन</h2>
              <div className="mt-8 space-y-6 text-lg leading-9 text-[#4b5563]">
                {seoArticle.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className="bg-[#fffaf0] px-5 py-20 lg:px-8">
        <SectionHeader eyebrow="Special Attraction" title="भारत के परमवीर चक्र विजेताओं की प्रेरणादायी शौर्यगाथाएँ" />
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {attractions.map((item) => (
            <article key={item} className="rounded-[8px] border border-[#dcc395] bg-white p-6 text-center shadow-lg shadow-[#60410f]/8">
              <PremiumEmblem />
              <h3 className="font-serif text-xl font-semibold tracking-normal text-[#172033]">{item}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <SectionHeader eyebrow="Param Vir Chakra Heroes" title="वीरता की अमर शौर्यगाथाएँ">
          कुछ प्रमुख Param Vir Chakra awardees और उनकी प्रेरणादायी कहानियों का संक्षिप्त परिचय।
        </SectionHeader>
        <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pvcHeroes.map((hero) => (
            <article key={hero.name} className="rounded-[8px] border border-[#d7c096] bg-white p-6 shadow-xl shadow-[#60410f]/8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#9d6b26]">{hero.year} · {hero.battle}</p>
              <h3 className="mt-4 font-serif text-2xl font-semibold tracking-normal text-[#172033]">{hero.name}</h3>
              <p className="mt-4 leading-7 text-[#56616f]">{hero.story}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#07111f] px-5 py-20 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,153,51,0.18),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(19,136,8,0.14),transparent_30%),linear-gradient(180deg,#07111f,#111a27_54%,#07111f)]" />
        <div className="absolute left-0 top-0 h-1 w-1/3 bg-[#ff9933]" aria-hidden="true" />
        <div className="absolute left-1/3 top-0 h-1 w-1/3 bg-white/80" aria-hidden="true" />
        <div className="absolute right-0 top-0 h-1 w-1/3 bg-[#138808]" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <SectionHeader eyebrow="Why Attend" title="क्यों शामिल हों" light>
            यह कार्यक्रम ज्ञान, संवेदना और चरित्र निर्माण को एक साथ जोड़ता है, ताकि हर visitor केवल event attend न करे बल्कि राष्ट्र गौरव को महसूस करे।
          </SectionHeader>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {whyAttend.map((item, index) => (
              <article
                key={item.title}
                className="group relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[8px] border border-white/12 bg-white/[0.07] p-6 text-center shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#f3c66b]/45 hover:bg-white/[0.1]"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 ${
                    item.accent === 'saffron'
                      ? 'bg-[#ff9933]'
                      : item.accent === 'green'
                        ? 'bg-[#138808]'
                        : item.accent === 'white'
                          ? 'bg-white/85'
                          : 'bg-[#f3c66b]'
                  }`}
                  aria-hidden="true"
                />
                <span className="absolute right-5 top-5 text-xs font-bold tracking-[0.22em] text-white/22" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <PremiumEmblem tone="light" />
                  <h3 className="mx-auto max-w-[12rem] font-serif text-2xl font-semibold leading-tight tracking-normal text-white">{item.title}</h3>
                </div>
                <p className="mt-5 text-sm leading-7 text-white/70">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <SectionHeader eyebrow="Event Timeline" title="Registration से Event तक" />
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-4">
          {timeline.map(([date, label], index) => (
            <article key={label} className="rounded-[8px] border border-[#d7c096] bg-white p-6 text-center shadow-xl shadow-[#60410f]/8">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#9d6b26]">{date}</p>
              <h3 className="mt-3 font-serif text-2xl font-semibold tracking-normal text-[#172033]">{label}</h3>
              {index < timeline.length - 1 ? <p className="mt-4 text-2xl text-[#9d6b26]" aria-hidden="true">↓</p> : null}
            </article>
          ))}
        </div>
      </section>
      <section id="registration" className="relative overflow-hidden bg-[#0a1320] px-5 py-20 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,153,51,0.18),transparent_28%),radial-gradient(circle_at_82%_24%,rgba(19,136,8,0.14),transparent_28%),linear-gradient(180deg,#07111f,#101927)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-[#ff9933]">Registration</p>
            <h2 className="font-serif text-4xl font-semibold tracking-normal md:text-6xl">Register Now</h2>
            <p className="mt-5 text-lg leading-8 text-white/72">
              Registration Google Form के माध्यम से होगा. कृपया form में सभी details सही भरें; verification के बाद WhatsApp confirmation भेजा जाएगा.
            </p>
            <div className="mt-8 rounded-[8px] border border-[#138808]/35 bg-[#138808]/10 p-5">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff9933]">Organised By</p>
              <h3 className="mt-3 font-serif text-2xl font-semibold tracking-normal">श्री वर्धमान श्वेतांबर मूर्तिपूजक जैन संघ</h3>
              <p className="mt-2 text-white/70">उस्मानपुरा, अहमदाबाद</p>
            </div>
          </div>

          <article className="rounded-[8px] border border-white/15 bg-white/[0.08] p-6 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl md:p-10">
            <PremiumEmblem tone="light" />
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#ff9933]">Official Registration Form</p>
            <h3 className="mt-4 font-serif text-3xl font-semibold leading-tight tracking-normal text-white md:text-5xl">Google Form से Registration</h3>
            <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/72">
              नीचे दिए गए button पर click करके official Google Form भरें. Payment और pass confirmation की जानकारी form submission के बाद verify की जाएगी.
            </p>
            <a
              href={registrationFormUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex min-h-14 w-full items-center justify-center rounded-[8px] bg-[#ff9933] px-6 py-4 text-base font-extrabold text-[#171009] shadow-xl shadow-[#ff9933]/20 hover:bg-white sm:w-auto"
            >
              Open Google Form <ChevronRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </a>
            <p className="mt-5 text-sm text-white/55">Registration starts: 15 July 2026</p>
          </article>
        </div>
      </section>
      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#172033] md:text-5xl">Important Information</h2>
            <div className="mt-8 grid gap-3">
              {importantInfo.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[8px] border border-[#dcc395] bg-white px-4 py-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#1f7a4d]" aria-hidden="true" />
                  <p className="font-semibold text-[#172033]">{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[8px] border border-[#dcc395] bg-[#fffaf0] p-8">
            <h2 className="font-serif text-3xl font-semibold tracking-normal text-[#172033]">Contact</h2>
            <div className="mt-8 grid gap-4">
              <a href="tel:+916352188150" className="flex items-center gap-4 rounded-[8px] bg-white p-4 font-semibold text-[#172033]">
                <Phone className="h-5 w-5 text-[#b57a2a]" aria-hidden="true" /> Phone
              </a>
              <a href="https://wa.me/916352188150" className="flex items-center gap-4 rounded-[8px] bg-white p-4 font-semibold text-[#172033]">
                <MessageCircle className="h-5 w-5 text-[#1f7a4d]" aria-hidden="true" /> WhatsApp
              </a>
                           </a>
              <a href="https://www.google.com/maps/search/?api=1&query=Dinesh+Hall+Ahmedabad" className="flex items-center gap-4 rounded-[8px] bg-white p-4 font-semibold text-[#172033]">
                <MapPin className="h-5 w-5 text-[#b57a2a]" aria-hidden="true" /> Google Map
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white px-5 py-20 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Frequently Asked Questions" />
        <div className="mx-auto grid max-w-4xl gap-3">
          {faqs.map((faq, index) => (
            <details key={faq.question} className="group rounded-[8px] border border-[#d7c096] bg-[#fffaf0] shadow-lg shadow-[#60410f]/6" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left text-lg font-bold tracking-normal text-[#172033] marker:hidden md:px-6">
                <span>{faq.question}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border border-[#d7c096] bg-white text-[#9d6b26] transition-transform group-open:rotate-45" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 md:px-6">
                <p className="border-t border-[#ead9ba] pt-4 leading-7 text-[#56616f]">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <footer className="bg-[#061120] px-5 py-10 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
          <div>
            <p className="text-sm text-white/60">Copyright © 2026</p>
            <p className="mt-2 font-semibold tracking-[0.12em]">Vardhman Creative Studio</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-5 text-sm font-semibold text-white/70" aria-label="Footer navigation">
            <a href="#about" className="hover:text-[#ff9933]">About</a>
            <a href="#registration" className="hover:text-[#ff9933]">Contact</a>
            <a href="/privacy-policy" className="hover:text-[#ff9933]">Privacy Policy</a>
            <a href="/terms" className="hover:text-[#ff9933]">Terms</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

































