import React from 'react';
import { ayambilWhatsAppLink, ayambilWhatsAppNumber } from '@/lib/ayambilWhatsAppContact';
import './AyambilHelp.css';
import { trackAyambilEvent } from '@/lib/ayambilAnalytics.js';

export default function AyambilHelp({ eventDate, placement }) {
  return <aside className="ay-booking-help" aria-label="રજિસ્ટ્રેશન અને પાસ માટે મદદ">
    <div><strong>બુકિંગ કે પાસમાં મુશ્કેલી છે?</strong><p>રજિસ્ટ્રેશન ન થાય અથવા પાસ ન મળે તો આ નંબર પર WhatsApp મેસેજ કરો.</p></div>
    <a href={ayambilWhatsAppLink()} onClick={() => trackAyambilEvent('help_whatsapp_click', { eventDate, placement })} target="_blank" rel="noopener noreferrer"><span>WhatsApp પર મદદ મેળવો</span><strong>+{ayambilWhatsAppNumber.slice(0, 2)} {ayambilWhatsAppNumber.slice(2, 7)} {ayambilWhatsAppNumber.slice(7)}</strong></a>
  </aside>;
}
