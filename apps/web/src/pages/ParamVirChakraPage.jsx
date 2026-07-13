import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { MessageCircle, Award, ChevronRight, Menu, X, ShieldCheck, CheckCircle2, Phone, MapPin, Ticket, CalendarDays, Clock, Users, Flag, Sparkles, BookOpen, Flame, GraduationCap, Compass } from 'lucide-react';


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
  '₹100 registration fee is fully refundable for those present at the venue before 9:00 AM.',
  'General seating is allotted on a First-Come, First-Served basis (seats are limited).',
  'Participants are requested to arrive before 9:00 AM for smooth entry and seating.',
  'Official confirmation and event pass will be shared via WhatsApp after successful verification.',
  'Uploading a valid payment screenshot & bank transaction UTR ID is mandatory.',
  'The organisers reserve the right to approve, reject, or cancel any registration.'
];

const termsAndConditions = [
  "Registration Fee: ₹100 per participant.",
  "Registration is mandatory for attending the event.",
  "Registration will be confirmed only after successful payment verification and approval by the organisers.",
  "The ₹100 registration fee is refundable only to participants who are physically present at the venue and report before 9:00 AM on the day of the event.",
  "No refund will be provided to participants arriving after 9:00 AM or those who remain absent from the event.",
  "Refunds, where applicable, will be processed only as per the organisers' instructions.",
  "Seats are limited and registrations will be confirmed on a first verified basis.",
  "Participants must provide accurate information. Incorrect or misleading information may result in cancellation of registration.",
  "Uploading a valid payment screenshot and providing the correct UPI/Bank Transaction ID (UTR) is mandatory.",
  "Every participant must carry their WhatsApp Confirmation/Event Pass for entry.",
  "The organisers reserve the right to approve, reject, or cancel any registration without assigning any reason.",
  "The event schedule, venue, speakers, or programme may change due to unavoidable circumstances.",
  "Photography and videography may be conducted during the event. By registering, participants consent to the use of their photographs and videos for promotional and documentation purposes.",
  "By submitting this form, you confirm that you have read, understood, and agreed to all the above Terms & Conditions."
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



export default function ParamVirChakraPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navSolid, setNavSolid] = useState(false);
  const [activeHash, setActiveHash] = useState('#hero');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-07-15T00:00:00+05:30").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setNavSolid(true);
      } else {
        setNavSolid(false);
      }

      const sections = ['hero', 'about', 'guests', 'registration', 'faq'];
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
            name: "Harshal Pushkarna"
          },
          {
            "@type": "Person",
            name: "Muni Shri Shramanchandrasagarji Maharaj"
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

      localBusiness: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",

        name: "Shri Vardhman Shwetambar Murtipujak Jain Sangh",
        image: "https://vardhmancreativestudio.com/assets/param-vir-chakra-og.jpg",
        telephone: "+91 63521 88150",
        url: "https://vardhmancreativestudio.com",
        logo: "https://vardhmancreativestudio.com/assets/logo.png",
        priceRange: "₹₹",

        address: {
          "@type": "PostalAddress",
          streetAddress: "Navrangpura",
          addressLocality: "Ahmedabad",
          addressRegion: "Gujarat",
          addressCountry: "IN",
          postalCode: "380009"
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
      }
    };

    return {
      event: schemas.event,
      image: schemas.image,
      localBusiness: schemas.localBusiness,
      faq: schemas.faq,
      breadcrumb: schemas.breadcrumb
    };
  }, []);

  return (
    <>
             <Helmet>
  {/* ================================
      BASIC SEO
  ================================= */}

<script type="application/ld+json">
  {JSON.stringify(schemas.image)}
</script>
  <title>
    Param Vir Chakra – Shaurya Gatha | Official Event | Ahmedabad
  </title>

  <meta
    name="description"
    content="Join Param Vir Chakra – Shaurya Gatha, a grand patriotic event dedicated to India's Param Vir Chakra awardees. 9 August 2026 | Dinesh Hall | Ahmedabad."
  />

  <meta
    name="keywords"
    content="Param Vir Chakra, Shaurya Gatha, Param Vir Chakra Event, Ahmedabad Event, Harshal Pushkarna, Patriotic Event, Indian Army, Military History, Jain Event Ahmedabad"
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
    content="Param Vir Chakra – Shaurya Gatha | Official Event"
  />
  <meta
    property="og:description"
    content="A Grand Patriotic Experience dedicated to India's Param Vir Chakra Heroes. 9 August 2026 • Dinesh Hall • Ahmedabad."
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
    content="Param Vir Chakra Shaurya Gatha Official Event"
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
    content="Param Vir Chakra – Shaurya Gatha"
  />

  <meta
    name="twitter:description"
    content="Official Event • 9 August 2026 • Dinesh Hall • Ahmedabad"
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
    {JSON.stringify(schemas.localBusiness)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.faq)}
  </script>

  <script type="application/ld+json">
    {JSON.stringify(schemas.breadcrumb)}
  </script>
</Helmet>

      <main className="min-h-screen bg-[#f7f1e5] text-[#172033] relative">
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
                  className={`relative text-[13px] font-bold uppercase tracking-wider transition-all duration-300 py-2 px-5 rounded-full hover:bg-white/5 ${
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
              href="#registration" 
              className="relative inline-flex items-center justify-center gap-2 rounded-full bg-[#050b14] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white border border-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,153,51,0.35)] group overflow-hidden"
            >
              {/* Tricolor glowing outline border */}
              <span className="absolute inset-0 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] p-[1.5px] rounded-full -z-10 [mask-image:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor]" />
              <span className="relative z-10 flex items-center gap-1.5">
                Register <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
              </span>
            </a>
          </div>
 
          {/* Mobile Hamburg Trigger */}
          <button 
            type="button" 
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:bg-white/10 md:hidden" 
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
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition-all ${
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
                href="#registration" 
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff9933] to-[#138808] py-3.5 text-sm font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#ff9933]/15"
                onClick={() => setMenuOpen(false)}
              >
                Register Now <ChevronRight className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
              </a>
            </div>
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
            fetchPriority="high"
          />
          {/* Deep Cinematic Ambient Radial Gradients to make text readable on the left */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_40%,rgba(255,153,51,0.15),transparent_45%),radial-gradient(circle_at_85%_55%,rgba(19,136,8,0.12),transparent_50%),linear-gradient(90deg,rgba(4,11,20,0.95) 0%,rgba(4,11,20,0.7) 45%,transparent 100%),linear-gradient(180deg,rgba(4,11,20,0.85) 0%,rgba(4,11,20,0) 20%,rgba(4,11,20,0) 80%,rgba(4,11,20,0.95) 100%)]" />
          <div className="absolute inset-0 opacity-[0.025] noise-bg" aria-hidden="true" />
        </div>

        {/* Main Content Layout Container */}
        <div className="mx-auto w-full max-w-7xl px-5 pt-12 pb-6 lg:px-8 flex-1 grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          
          {/* Left Column: Typographic Branding & Details */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex flex-col justify-center">
            
            {/* Main Luxury Event Typography (Fixed Hindi Matra Clipping Issue) */}
            <h1 className="font-serif text-[3.5rem] font-bold leading-[1.2] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5rem] pb-2">
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
              <a 
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Param+Vir+Chakra+–+Shaurya+Gatha&dates=20260809T033000Z/20260809T073000Z&details=A+premium+patriotic+Ahmedabad+event+dedicated+to+Param+Vir+Chakra+winners.&location=Dinesh+Hall,+Navrangpura,+Ahmedabad"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[50px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-[14px] font-medium text-white/80 hover:text-white transition-all duration-300 hover:bg-white/10 hover:border-[#ff9933]/40"
              >
                <CalendarDays className="mr-2 h-4.5 w-4.5 text-[#ff9933]" /> Save the Date
              </a>
            </div>

            {/* Exact Match Reference Grid Cards (Matched with image_d9b941.jpg) */}
            <div className="mt-12 grid gap-4 grid-cols-2 sm:grid-cols-4 lg:max-w-3xl">
              {eventCards.map((card) => (
                <div key={card.label} className="relative flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-6 text-center backdrop-blur-md transition-all duration-300 hover:border-[#FF9933]/50 hover:bg-white/[0.06] shadow-lg">
                  <card.icon className="mb-4 h-7 w-7 text-[#FF9933]" strokeWidth={1.5} />
                  <h3 className="text-[17px] font-bold text-white tracking-wide">{card.label}</h3>
                  <p className="mt-1.5 text-[13px] text-white/50 font-medium">{card.detail}</p>
                </div>
              ))}
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

      {/* REGISTRATION FORM SECTION - PREMIUM TRICOLOR REDESIGN */}
      <section id="registration" className="relative overflow-hidden bg-[#050b13] px-5 py-24 text-white lg:px-8">
        
        {/* Cinematic background light layers */}
        <div className="absolute left-1/4 top-1/3 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9933]/6 blur-[130px] pointer-events-none" />
        <div className="absolute right-1/4 bottom-1/3 -z-10 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#138808]/5 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 -z-10 opacity-[0.015] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          
          {/* Left Column: Branding details */}
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.3em] text-[#ff9933]">Registration</p>
            <h2 className="font-serif text-4xl font-bold tracking-tight text-white md:text-6xl">Register Now</h2>
            <p className="mt-6 text-[15px] leading-relaxed text-white/70 font-light">
              Registration Google Form के माध्यम से होगा। कृपया form में सभी details सही भरें; verification के बाद WhatsApp पर confirmation और event pass भेजा जाएगा।
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

          {/* Right Column: Interactive card with live countdown */}
          <article className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0c1a2e]/60 p-8 text-center shadow-[0_30px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:p-12 group hover:border-white/20 transition-all duration-300">
            {/* Subtle tricolor top bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff9933] via-white/50 to-[#138808]" />
            
            <PremiumEmblem tone="light" />
            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#ff9933]">Official Registration Form</p>
            <h3 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">Google Form से Registration</h3>
            
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-white/70 font-light">
              नीचे दिए गए button पर click करके official Google Form भरें। Payment UTR और screenshot अपलोड करना अनिवार्य है।
            </p>

            {/* Registration Fee Block */}
            <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/[0.04] max-w-md mx-auto text-left">
              <p className="text-[15px] font-extrabold text-[#ff9933]">Registration Fee: ₹100 per participant</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-white/60 font-light">
                *The registration fee is fully refundable to participants who are physically present at the venue before 9:00 AM on the event day, in accordance with the organisers' refund process.
              </p>
            </div>

            {/* LIVE COUNTDOWN TIMER DESIGN */}
            {(timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) ? (
              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-wider text-white/40 mb-3">Registration opens in:</p>
                <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl py-3 px-1 backdrop-blur-md hover:border-[#ff9933]/30 transition-colors">
                    <span className="text-2xl font-extrabold text-[#ff9933]">{timeLeft.days}</span>
                    <span className="text-[9px] uppercase font-bold text-white/50 tracking-wider">Days</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl py-3 px-1 backdrop-blur-md hover:border-white/20 transition-colors">
                    <span className="text-2xl font-extrabold text-white">{timeLeft.hours}</span>
                    <span className="text-[9px] uppercase font-bold text-white/50 tracking-wider">Hours</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl py-3 px-1 backdrop-blur-md hover:border-white/20 transition-colors">
                    <span className="text-2xl font-extrabold text-white">{timeLeft.minutes}</span>
                    <span className="text-[9px] uppercase font-bold text-white/50 tracking-wider">Mins</span>
                  </div>
                  <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-2xl py-3 px-1 backdrop-blur-md hover:border-[#138808]/30 transition-colors">
                    <span className="text-2xl font-extrabold text-[#138808]">{timeLeft.seconds}</span>
                    <span className="text-[9px] uppercase font-bold text-white/50 tracking-wider">Secs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#138808]/15 border border-[#138808]/40 px-3.5 py-1 text-xs font-bold text-[#138808] uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#138808] animate-ping" /> Registration Open
                </span>
              </div>
            )}

            <div className="mt-8">
              <a 
                href={registrationFormUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex min-h-[50px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff9933] to-[#ffb854] px-8 py-3.5 text-[15px] font-bold text-[#050b14] shadow-[0_12px_40px_rgba(255,153,51,0.3)] transition-all duration-300 hover:from-white hover:to-white hover:text-[#050b14] hover:shadow-[0_15px_45px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 sm:w-auto"
              >
                Open Google Form <ChevronRight className="ml-2 h-5 w-5 shrink-0 stroke-[2.5]" aria-hidden="true" />
              </a>
            </div>
            <p className="mt-4 text-[12px] text-white/50">Registration opens on 15 July 2026</p>
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
              <a href="tel:+916352188150" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm hover:border-[#ff9933]/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff9933]/10"><Phone className="h-5 w-5 text-[#ff9933]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#ff9933]">Call Us</span><span className="text-[15px]">+91 63521 88150</span></div>
              </a>
              <a href="https://wa.me/916352188150?text=Jai%20Hind!%20I%20want%20to%20know%20more%20about%20the%20Param%20Vir%20Chakra%20Shaurya%20Gatha%20event." target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm hover:border-[#138808]/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#138808]/10"><MessageCircle className="h-5 w-5 text-[#138808]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#138808]">WhatsApp</span><span className="text-[15px]">+91 63521 88150</span></div>
              </a>
              <div className="flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] shadow-sm">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#000080]/5"><Clock className="h-5 w-5 text-[#000080]" /></span>
                <div className="flex flex-col">
                  <span className="text-xs uppercase text-white/40 bg-[#000080]/80 rounded px-1.5 py-0.5 w-fit text-[9px] tracking-wide font-extrabold mb-0.5">TIMINGS</span>
                  <span className="text-[14px]">Mon to Sat (10 am to 6 pm)</span>
                </div>
              </div>
              <a href="https://maps.app.goo.gl/r76fhgM7NS8AJaBw8" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-3xl border border-[#ead9ba] bg-white p-4 font-semibold text-[#172033] transition-all hover:-translate-y-1 shadow-sm hover:border-[#ff9933]/30">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ff9933]/10"><MapPin className="h-5 w-5 text-[#ff9933]" /></span>
                <div className="flex flex-col"><span className="text-xs uppercase text-[#ff9933]">Location</span><span className="text-[15px]">Dinesh Hall, Ahmedabad</span></div>
              </a>
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
}
