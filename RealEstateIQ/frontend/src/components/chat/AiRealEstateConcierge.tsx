import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight,
  ShieldCheck, Calculator, Landmark, ChevronDown, RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionLink?: {
    label: string;
    href: string;
  };
}

const QUICK_PROMPTS = [
  'What is the property stamp duty & tax in Sri Lanka?',
  'Can foreigners or expats buy property in Sri Lanka?',
  'Which districts offer the highest rental yield?',
  'How do I calculate home loan EMI for 20M LKR?',
  'How does the RealEstateIQ AI Valuation work?',
];

function getAiResponse(userText: string): { text: string; actionLink?: { label: string; href: string } } {
  const query = userText.toLowerCase();

  // 1. Taxes, Stamp Duty, Transfer Fees
  if (query.includes('tax') || query.includes('stamp duty') || query.includes('fee') || query.includes('legal')) {
    return {
      text: `In Sri Lanka, property transfers involve:
• **Stamp Duty**: 3% on the first LKR 100,000 of market value, and 4% on the balance.
• **Local Council Tax**: 1% for municipal council areas.
• **Legal / Notary Fee**: Typically 1% to 2% of the purchase deed value.
• **Capital Gains Tax (CGT)**: 10% on realized capital gains when the seller disposes of an investment property.`,
      actionLink: { label: 'Explore Sri Lanka Market Analytics', href: '/market' },
    };
  }

  // 2. Foreigners / Expats
  if (query.includes('foreign') || query.includes('expat') || query.includes('nri') || query.includes('citizenship') || query.includes('overseas') || query.includes('diaspora')) {
    return {
      text: `Under the Sri Lankan Land Restrictions on Alienation Act:
• **Apartments / Condos**: Foreign citizens and Sri Lankan diaspora can purchase freehold condominium residential units with 100% ownership (starting from ground floor upwards in approved developments).
• **Landed Property**: Direct freehold land purchases by foreign passport holders have restrictions, but 99-year long-term leases are fully legal.
• **Colombo Port City (SEZ)**: Offers 100% foreign ownership and unique tax incentives under Special Economic Zone regulations.`,
      actionLink: { label: 'Browse Verified Condos & Villas', href: '/properties' },
    };
  }

  // 3. Investment Yields / High ROI Districts
  if (query.includes('yield') || query.includes('roi') || query.includes('invest') || query.includes('best district') || query.includes('where to buy')) {
    return {
      text: `Based on RealEstateIQ's 25-District Sri Lanka Market Analysis:
• **Southern Province (Galle, Matara, Weligama)**: Highest short-term rental / Airbnb yield (~7.5% – 9.2% annual ROI) driven by luxury tourism.
• **Colombo Suburbs (Rajagiriya, Battaramulla, Dehiwala)**: Best long-term residential rental stability (~5.5% – 6.8% yield) with high tenant demand from diplomatic & IT hubs.
• **Colombo 03 / 07 Prime**: Premium capital appreciation and wealth preservation benchmark.`,
      actionLink: { label: 'View 25-District Investment Heatmap', href: '/market' },
    };
  }

  // 4. Mortgage / Loan EMI
  if (query.includes('emi') || query.includes('loan') || query.includes('mortgage') || query.includes('bank') || query.includes('interest rate')) {
    return {
      text: `Current Sri Lanka housing loan benchmark rates (2026):
• **Bank of Ceylon (BOC)**: ~11.5% p.a.
• **Commercial Bank**: ~12.0% p.a.
• **HNB & Sampath Bank**: ~12.25% – 12.5% p.a.

💡 **Example calculation for a Rs. 20,000,000 property**:
With a 20% down payment (Rs. 4M), a 20-year loan of Rs. 16M at 12% interest has an estimated monthly EMI of **Rs. 176,170 / month**.`,
      actionLink: { label: 'Open Interactive Mortgage Calculator', href: '/properties' },
    };
  }

  // 5. Valuation Engine / How it Works
  if (query.includes('valuation') || query.includes('predict') || query.includes('ai') || query.includes('how it works') || query.includes('model') || query.includes('accuracy')) {
    return {
      text: `RealEstateIQ uses an advanced **Gradient Boosting Regressor Machine Learning Pipeline** trained on 14,800+ authentic Sri Lankan real estate market listings.
• Accounts for floor area, district benchmarks, bedroom/bathroom ratios, house age depreciation, and parking.
• Generates a 95% Confidence Interval and downloadable **Official Valuation Certificate with scannable QR verification**.`,
      actionLink: { label: 'Get Instant AI Property Valuation', href: '/predict' },
    };
  }

  // 6. Pricing / Boost / Monetization
  if (query.includes('price') || query.includes('pricing') || query.includes('boost') || query.includes('feature') || query.includes('package') || query.includes('cost') || query.includes('payhere')) {
    return {
      text: `RealEstateIQ offers official PayHere monetization packages for sellers and brokers:
• 🌟 **Gold Boost (7 Days)**: Rs. 2,500 — Top search ranking + Gold badge.
• 👑 **Platinum Boost (30 Days)**: Rs. 7,500 — Homepage spotlight + 1-click WhatsApp direct buyer leads.
• 🏢 **Agent Pro Monthly**: Rs. 15,000/mo — Verified Agent Blue Badge + unlimited property inventory.`,
      actionLink: { label: 'View Pricing & Packages', href: '/pricing' },
    };
  }

  // Fallback greeting / general assistance
  return {
    text: `Hello! I am your **RealEstateIQ AI Concierge** 🇱🇰🏡.
I can help you with:
1. Instant property valuation & price benchmarks.
2. Sri Lanka real estate law, stamp duty, and taxes.
3. Bank mortgage rates (BOC, Commercial, HNB, Sampath).
4. Finding high-ROI properties across 25 Sri Lankan districts.

What would you like to explore today?`,
    actionLink: { label: 'Search Property Inventory', href: '/properties' },
  };
}

export function AiRealEstateConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Ayubowan! 🇱🇰 Welcome to RealEstateIQ. I am your 24/7 AI Real Estate Advisor. How can I assist with your property search, valuation, or Sri Lankan market regulations today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAiResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionLink: response.actionLink,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'ai',
        text: 'Chat history reset. How else can I assist your real estate journey across Sri Lanka?',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#DFBA73] to-[#B38F46] text-[#080A0E] font-bold text-xs shadow-2xl shadow-[#DFBA73]/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-[#FFF0C2]/50"
            aria-label="Open AI Real Estate Concierge"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#080A0E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#080A0E]"></span>
            </span>
            <Sparkles size={16} className="text-[#080A0E] animate-pulse" />
            <span className="tracking-wide">AI Concierge 🇱🇰</span>
          </button>
        ) : null}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[420px] max-w-[94vw] h-[550px] max-h-[85vh] rounded-3xl bg-[#090D15]/95 border border-[#DFBA73]/40 shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden animate-fade-in text-white">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.08] bg-gradient-to-r from-[#121926] to-[#0A0E17] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#DFBA73]/15 border border-[#DFBA73]/40 flex items-center justify-center text-[#DFBA73]">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm text-white">RealEstateIQ AI</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400">Sri Lanka Market Intelligence Concierge</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-[#DFBA73]/15 border border-[#DFBA73]/30 flex items-center justify-center text-[#DFBA73] shrink-0 mt-0.5">
                    <Sparkles size={12} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-[#DFBA73] to-[#B38F46] text-[#080A0E] font-medium shadow-md'
                      : 'bg-[#121824] border border-white/[0.08] text-neutral-200'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.text}</div>

                  {m.actionLink && (
                    <div className="pt-1.5">
                      <Link
                        href={m.actionLink.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#DFBA73]/15 hover:bg-[#DFBA73]/25 border border-[#DFBA73]/30 text-[#DFBA73] text-[11px] font-bold transition-all"
                      >
                        <span>{m.actionLink.label}</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] ${
                      m.sender === 'user' ? 'text-[#080A0E]/70 text-right' : 'text-neutral-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-neutral-400 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#DFBA73]/10 border border-[#DFBA73]/30 flex items-center justify-center text-[#DFBA73]">
                  <Sparkles size={11} className="animate-spin" />
                </div>
                <span className="italic">AI Concierge is analyzing Sri Lanka property data...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 border-t border-white/[0.06] bg-[#0C121D] overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 hover:bg-[#DFBA73]/15 hover:text-[#DFBA73] hover:border-[#DFBA73]/30 border border-white/10 text-neutral-300 transition-all shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-white/[0.08] bg-[#0A0E17] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything about Sri Lankan real estate..."
              className="flex-1 bg-[#121926] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#DFBA73]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-[#DFBA73] hover:bg-[#C9A23F] text-[#080A0E] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
