import { useState, useEffect, useRef } from '@teact';
import type { FormEvent, ChangeEvent, CSSProperties } from 'react';

// Interfaces for component states
interface Message {
  id: string;
  sender: 'user' | 'peer';
  senderName: string;
  avatar: string;
  text: string;
  translatedText: string;
  timestamp: string;
  sourceLang: string;
  targetLang: string;
  detectedLang?: string;
  engine: string;
  responseTime: number;
}

interface LogEntry {
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'system';
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', hello: 'Hello' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', hello: 'नमस्ते' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', hello: 'Hola' },
  { code: 'fr', name: 'French', flag: '🇫🇷', hello: 'Bonjour' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', hello: 'Привет' }
];

// Dictionary for realistic mock translations
const TRANSLATION_DICTIONARY: Record<string, Record<string, string>> = {
  "hello, how are you?": {
    en: "Hello, how are you?",
    hi: "नमस्ते, आप कैसे हैं?",
    es: "Hola, ¿cómo estás?",
    fr: "Bonjour, comment allez-vous?",
    ru: "Привет, как дела?"
  },
  "where is the library?": {
    en: "Where is the library?",
    hi: "पुस्तकालय कहाँ है?",
    es: "¿Dónde está la biblioteca?",
    fr: "Où est la bibliothèque?",
    ru: "Где библиотека?"
  },
  "i love coding": {
    en: "I love coding",
    hi: "मुझे कोडिंग पसंद है",
    es: "Me encanta programar",
    fr: "J'adore coder",
    ru: "Я люблю программировать"
  },
  "this client is awesome": {
    en: "This client is awesome",
    hi: "यह क्लाइंट बहुत बढ़िया है",
    es: "Este cliente es increíble",
    fr: "Ce client est génial",
    ru: "Этот клиент потрясающий"
  },
  "stealth mode activated": {
    en: "Stealth mode activated",
    hi: "गुप्त मोड सक्रिय हो गया है",
    es: "Modo sigilo activado",
    fr: "Mode furtif activé",
    ru: "Режим невидимки активирован"
  },
  "have a good day": {
    en: "Have a good day",
    hi: "आपका दिन शुभ हो",
    es: "Que tengas un buen día",
    fr: "Passez une bonne journée",
    ru: "Хорошего дня"
  },
  "secret message incoming": {
    en: "Secret message incoming",
    hi: "गुप्त संदेश आ रहा है",
    es: "Mensaje secreto entrante",
    fr: "Message secret entrant",
    ru: "Входящее секретное сообщение"
  }
};

// Word-by-word fallback translator dictionary to handle arbitrary inputs
const WORD_DICT: Record<string, Record<string, string>> = {
  "hello": { en: "hello", hi: "नमस्ते", es: "hola", fr: "bonjour", ru: "привет" },
  "how": { en: "how", hi: "कैसे", es: "cómo", fr: "comment", ru: "как" },
  "are": { en: "are", hi: "हैं", es: "están", fr: "êtes", ru: "дела" },
  "you": { en: "you", hi: "आप", es: "tú", fr: "vous", ru: "вы" },
  "the": { en: "the", hi: "वह", es: "el", fr: "le", ru: "это" },
  "is": { en: "is", hi: "है", es: "es", fr: "est", ru: "есть" },
  "good": { en: "good", hi: "अच्छा", es: "bueno", fr: "bon", ru: "хорошо" },
  "bad": { en: "bad", hi: "खराब", es: "malo", fr: "mauvais", ru: "плохо" },
  "coding": { en: "coding", hi: "कोडिंग", es: "programación", fr: "codage", ru: "программирование" },
  "client": { en: "client", hi: "क्लाइंट", es: "cliente", fr: "client", ru: "клиент" },
  "stealth": { en: "stealth", hi: "गुप्त", es: "sigilo", fr: "furtif", ru: "скрытый" },
  "mode": { en: "mode", hi: "मोड", es: "modo", fr: "mode", ru: "режим" },
  "awesome": { en: "awesome", hi: "शानदार", es: "increíble", fr: "génial", ru: "потрясающе" },
  "yes": { en: "yes", hi: "हाँ", es: "sí", fr: "oui", ru: "да" },
  "no": { en: "no", hi: "नहीं", es: "no", fr: "non", ru: "нет" },
  "what": { en: "what", hi: "क्या", es: "qué", fr: "quoi", ru: "что" },
  "who": { en: "who", hi: "कौन", es: "quién", fr: "qui", ru: "кто" },
  "why": { en: "why", hi: "क्यों", es: "por qué", fr: "pourquoi", ru: "почему" },
  "please": { en: "please", hi: "कृपया", es: "por favor", fr: "s'il vous plaît", ru: "пожалуйста" },
  "thanks": { en: "thanks", hi: "धन्यवाद", es: "gracias", fr: "merci", ru: "спасибо" }
};

export default function TranslationDashboard() {
  // --- Core Configuration States ---
  const [engine, setEngine] = useState<'Google Parallel Web API' | 'Native Telegram MTProto Translator'>('Google Parallel Web API');
  const [inputLang, setInputLang] = useState<string>('en');
  const [targetLang, setTargetLang] = useState<string>('fr');
  const [autoDetect, setAutoDetect] = useState<boolean>(true);
  const [parallelWorkers, setParallelWorkers] = useState<number>(5);

  // --- Chat States ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial-1',
      sender: 'peer',
      senderName: 'Alexander Z.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'Hello, how are you? Stealth mode is active on this Telegram node.',
      translatedText: 'Bonjour, comment allez-vous? Le mode furtif est actif sur ce nœud Telegram.',
      timestamp: '22:15',
      sourceLang: 'en',
      targetLang: 'fr',
      detectedLang: 'en',
      engine: 'Native Telegram MTProto Translator',
      responseTime: 180
    },
    {
      id: 'initial-2',
      sender: 'user',
      senderName: 'You (Clashgram Mod)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      text: 'I love coding with real-time translations!',
      translatedText: "J'adore coder avec des traductions en temps réel !",
      timestamp: '22:16',
      sourceLang: 'en',
      targetLang: 'fr',
      detectedLang: 'en',
      engine: 'Google Parallel Web API',
      responseTime: 240
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string>('');

  // --- Performance Metrics states ---
  const [responseTimeHistory, setResponseTimeHistory] = useState<number[]>([180, 240, 220, 310, 190, 280, 240]);
  const [activeTranslationsCount, setActiveTranslationsCount] = useState<number>(0);
  const [cpuLoad, setCpuLoad] = useState<number>(12);
  const [translatedCharsCount, setTranslatedCharsCount] = useState<number>(315);

  // --- System Logs state ---
  const [logs, setLogs] = useState<LogEntry[]>([
    { time: '22:12:05', message: 'Clashgram Translation Module initialized.', type: 'system' },
    { time: '22:12:06', message: 'Secure sandbox storage activated.', type: 'info' },
    { time: '22:15:20', message: 'Translation matched via MTProto Cache.', type: 'success' },
    { time: '22:16:10', message: 'Parallel workers allocated successfully.', type: 'info' }
  ]);

  // --- Refs ---
  const chatEndRef = useRef<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>();

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Dynamic system stats simulator
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate slight fluctuations in CPU load
      setCpuLoad(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return Math.max(4, Math.min(45, next));
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Update canvas chart whenever history shifts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const width = canvas.width;
    const height = canvas.height;

    // Draw background grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 3; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw data path
    if (responseTimeHistory.length === 0) return;
    const maxVal = Math.max(...responseTimeHistory, 450);
    const minVal = Math.min(...responseTimeHistory, 80);
    const range = maxVal - minVal || 1;

    const points = responseTimeHistory.map((val, idx) => {
      const x = (width / (responseTimeHistory.length - 1)) * idx;
      // Invert Y because canvas 0,0 is top-left
      const y = height - 10 - ((val - minVal) / range) * (height - 20);
      return { x, y };
    });

    // Create glowing gradient under the line
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.25)'); // Cyan glow
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');   // Indigo fade

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fill();

    // Draw the main line
    ctx.strokeStyle = 'url(#cyan-indigo-grad)';
    const lineGrad = ctx.createLinearGradient(0, 0, width, 0);
    lineGrad.addColorStop(0, '#06b6d4'); // Cyan
    lineGrad.addColorStop(1, '#6366f1'); // Indigo
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // Draw points with glowing outer circle
    points.forEach((p, idx) => {
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    });

  }, [responseTimeHistory]);

  const addLog = (message: string, type: 'info' | 'success' | 'warn' | 'system' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [...prev.slice(-35), { time, message, type }]);
  };

  // Logic to simulate real-time translation with accurate target outputs
  const translateMock = (text: string, target: string, source: string): { translated: string, detected: string, delay: number } => {
    const cleanText = text.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
    const detected = autoDetect ? 'en' : source;

    // Simulate response delay based on translation engine and workers count
    // Native MTProto is faster, more workers speed up Parallel Web API
    const baseDelay = engine === 'Native Telegram MTProto Translator' ? 120 : 250;
    const workerBonus = Math.max(10, (12 - parallelWorkers) * 15);
    const delay = Math.round(baseDelay + workerBonus + Math.random() * 40);

    // Check direct dictionary matches
    if (TRANSLATION_DICTIONARY[cleanText] && TRANSLATION_DICTIONARY[cleanText][target]) {
      return {
        translated: TRANSLATION_DICTIONARY[cleanText][target],
        detected,
        delay
      };
    }

    // fallback word-by-word translation
    const words = text.split(/\s+/);
    const translatedWords = words.map(word => {
      const cleanWord = word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
      const punct = word.slice(cleanWord.length);
      const startPunct = word.slice(0, word.length - cleanWord.length - punct.length);
      
      if (WORD_DICT[cleanWord] && WORD_DICT[cleanWord][target]) {
        let trans = WORD_DICT[cleanWord][target];
        // Match capitalization
        if (word[0] === word[0].toUpperCase()) {
          trans = trans.charAt(0).toUpperCase() + trans.slice(1);
        }
        return startPunct + trans + punct;
      }
      // Simple custom suffix simulator for target language flavor
      if (target === 'fr') return word + 'e';
      if (target === 'es') return word + 'o';
      if (target === 'ru') return word + 'ов';
      if (target === 'hi') return word + 'ा';
      return word;
    });

    return {
      translated: translatedWords.join(' '),
      detected,
      delay
    };
  };

  // Triggered when user submits a message
  const handleSendMessage = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const source = autoDetect ? 'en' : inputLang;
    const currentText = inputText;
    setInputText('');

    setActiveTranslationsCount(prev => prev + 1);
    addLog(`Translating text block via ${engine}...`, 'info');

    // Run simulated translation progress
    setTimeout(() => {
      const { translated, detected, delay } = translateMock(currentText, targetLang, source);

      const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const newMsg: Message = {
        id: 'msg-' + Date.now(),
        sender: 'user',
        senderName: 'You (Clashgram Mod)',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        text: currentText,
        translatedText: translated,
        timestamp,
        sourceLang: detected,
        targetLang,
        detectedLang: detected,
        engine,
        responseTime: delay
      };

      setMessages(prev => [...prev, newMsg]);
      setResponseTimeHistory(prev => [...prev.slice(-15), delay]);
      setTranslatedCharsCount(prev => prev + currentText.length);
      setActiveTranslationsCount(prev => Math.max(0, prev - 1));
      
      addLog(`Translation completed in ${delay}ms. Output: "${translated.slice(0, 20)}..."`, 'success');

      // Trigger automatic simulated peer response after 2.5 seconds
      triggerSimulatedResponse(translated, targetLang);
    }, 600);
  };

  // Simulated typing and response from a peer
  const triggerSimulatedResponse = (userMsgTranslated: string, lastTargetLang: string) => {
    setIsTyping(true);
    setTypingUser('Alexander Z.');
    
    setTimeout(() => {
      setIsTyping(false);
      setTypingUser('');

      const responseText = "Thanks for sending that! The MTProto client is completely stealthy. Secret keys verified.";
      const targetForPeer = autoDetect ? 'en' : inputLang; // reply in user's source language
      const sourceForPeer = lastTargetLang;

      setActiveTranslationsCount(prev => prev + 1);

      setTimeout(() => {
        const { translated, delay } = translateMock(responseText, targetForPeer, sourceForPeer);
        
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
        const peerMsg: Message = {
          id: 'msg-peer-' + Date.now(),
          sender: 'peer',
          senderName: 'Alexander Z.',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          text: responseText,
          translatedText: translated,
          timestamp,
          sourceLang: sourceForPeer,
          targetLang: targetForPeer,
          detectedLang: sourceForPeer,
          engine,
          responseTime: delay
        };

        setMessages(prev => [...prev, peerMsg]);
        setResponseTimeHistory(prev => [...prev.slice(-15), delay]);
        setTranslatedCharsCount(prev => prev + responseText.length);
        setActiveTranslationsCount(prev => Math.max(0, prev - 1));
        
        addLog(`Incoming message translated via ${engine} in ${delay}ms.`, 'success');
      }, 300);

    }, 3000);
  };

  const handleSimulateIncoming = () => {
    if (isTyping) return;
    setIsTyping(true);
    setTypingUser('Stealth Node #09');
    
    addLog('Simulating incoming peer MTProto payload...', 'info');

    setTimeout(() => {
      setIsTyping(false);
      setTypingUser('');

      const originalText = "Secret message incoming! Code sequence 0x7F9B completed successfully.";
      const target = autoDetect ? 'en' : inputLang;
      
      const { translated, delay } = translateMock(originalText, target, 'en');
      const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      const newMsg: Message = {
        id: 'msg-incoming-' + Date.now(),
        sender: 'peer',
        senderName: 'Stealth Node #09',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
        text: originalText,
        translatedText: translated,
        timestamp,
        sourceLang: 'en',
        targetLang: target,
        detectedLang: 'en',
        engine,
        responseTime: delay
      };

      setMessages(prev => [...prev, newMsg]);
      setResponseTimeHistory(prev => [...prev.slice(-15), delay]);
      setTranslatedCharsCount(prev => prev + originalText.length);
      addLog(`Incoming simulation translated successfully.`, 'success');
    }, 2000);
  };

  const handleClearChat = () => {
    setMessages([]);
    addLog('Chat history cleared by administrator.', 'warn');
  };

  // Change of engine log
  const handleEngineToggle = (newEngine: 'Google Parallel Web API' | 'Native Telegram MTProto Translator') => {
    setEngine(newEngine);
    addLog(`Translation Engine switched to: ${newEngine}`, 'system');
  };

  // Change of worker count
  const handleWorkerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setParallelWorkers(val);
    addLog(`Parallel translation threads set to: ${val} workers.`, 'info');
  };

  // Dynamic calculated response time stats
  const averageResponseTime = Math.round(
    responseTimeHistory.reduce((acc, curr) => acc + curr, 0) / (responseTimeHistory.length || 1)
  );

  return (
    <div className="min-h-screen bg-[#090d16] font-['Inter'] text-slate-100 antialiased overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-300">
      
      {/* Sleek Neon Background Accents */}
      <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] rounded-full bg-indigo-900/15 blur-[150px] pointer-events-none"></div>

      {/* Header Container */}
      <header className="border-b border-[#1f293d]/60 bg-[#0c1222]/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Pulsing Glowing Logo */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 relative group">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 animate-pulse blur-md opacity-40 group-hover:opacity-85 transition-opacity duration-300"></div>
              <svg className="w-5 h-5 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Outfit'] font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  CLASHGRAM
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold font-mono bg-cyan-950 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] uppercase">
                  Stealth MOD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono tracking-tight">V3.5.0-BETA // SECURE SANDBOX CLIENT</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicator board */}
            <div className="hidden sm:flex items-center gap-5 bg-[#121829] border border-slate-800/80 px-4 py-2 rounded-xl font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-300 font-semibold uppercase">STEALTH LINKED</span>
              </div>
              <div className="w-px h-4 bg-slate-800"></div>
              <div className="text-slate-400">
                LATENCY: <span className="text-cyan-400 font-bold">{averageResponseTime}ms</span>
              </div>
              <div className="w-px h-4 bg-slate-800"></div>
              <div className="text-slate-400">
                ACTIVE WORKERS: <span className="text-indigo-400 font-bold">{parallelWorkers}</span>
              </div>
            </div>
            
            <a 
              href="#"
              className="text-[12px] bg-slate-800 hover:bg-slate-700 font-semibold px-4 py-2 rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all duration-200"
            >
              View Docs
            </a>
          </div>
        </div>
      </header>

      {/* Main Dual-Pane layout container */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANE: Chat Client & Simulator (7 cols) */}
        <section className="lg:col-span-7 flex flex-col h-[750px] bg-[#0c111e]/90 border border-slate-800/70 rounded-2xl shadow-2xl relative overflow-hidden backdrop-blur-sm">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800/80 bg-[#0e1425]/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/30"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#090d16] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-['Outfit'] font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  Alexander Z.
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                </h3>
                <p className="text-[11px] text-cyan-400 font-mono">Stealth Node // @alexzinchuk</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleSimulateIncoming} 
                className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-cyan-950/80 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-900/50 transition-all duration-200"
                title="Simulate peer message typing and automatic translations"
              >
                <svg className="w-3.5 h-3.5 text-cyan-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                </svg>
                Incoming Sim
              </button>
              <button 
                onClick={handleClearChat} 
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/30 transition-all"
                title="Clear Chat History"
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages Frame */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-dashed border-slate-700/80 flex items-center justify-center text-slate-500 mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-['Outfit'] font-semibold text-slate-400">No active stealth logs</h4>
                <p className="text-[12px] text-slate-500 max-w-sm mt-1">Type in the message box below or click "Incoming Sim" to trigger mock encrypted MTProto chat data payloads.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <img 
                      src={msg.avatar} 
                      alt={msg.senderName} 
                      className="w-9 h-9 rounded-full object-cover border border-slate-800 flex-shrink-0"
                    />

                    {/* Chat Bubble Core */}
                    <div className="max-w-[75%] space-y-1.5">
                      <div className={`flex items-center gap-2 text-[11px] ${isUser ? 'flex-row-reverse' : ''}`}>
                        <span className="font-semibold text-slate-300">{msg.senderName}</span>
                        <span className="text-slate-500 font-mono">{msg.timestamp}</span>
                      </div>

                      {/* Main Message container */}
                      <div className={`p-3.5 rounded-2xl border text-sm leading-relaxed transition-all duration-300 ${
                        isUser 
                          ? 'bg-[#121624] border-indigo-500/20 text-slate-100 rounded-tr-none' 
                          : 'bg-[#151c2d] border-cyan-500/20 text-slate-100 rounded-tl-none'
                      }`}>
                        
                        {/* Original Text */}
                        <div className="relative group">
                          <p className="text-slate-200">{msg.text}</p>
                          <span className="absolute right-0 top-0 text-[10px] text-slate-500 group-hover:text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity cursor-default">
                            Original
                          </span>
                        </div>

                        {/* Real-time Translation Card: Glowing accents (Cyan/Indigo) */}
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] bg-slate-900 border border-slate-800 text-cyan-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-tight">
                                {msg.sourceLang} → {msg.targetLang}
                              </span>
                              {msg.detectedLang && (
                                <span className="text-[10px] text-slate-400 italic">
                                  (auto-detected)
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono">
                              {msg.engine === 'Google Parallel Web API' ? 'Google API' : 'MTProto Node'}
                            </span>
                          </div>

                          <p className="text-[13px] font-medium text-slate-100 bg-cyan-950/15 border border-cyan-500/10 p-2.5 rounded-lg shadow-inner shadow-cyan-950/20 leading-relaxed">
                            {msg.translatedText || (
                              <span className="text-slate-500 flex items-center gap-1.5 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                                Translating payload...
                              </span>
                            )}
                          </p>

                          {/* Debug translation metadata */}
                          <div className={`mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 ${isUser ? 'flex-row-reverse' : ''}`}>
                            <span>Speed: <span className="text-emerald-400 font-bold">{msg.responseTime}ms</span></span>
                            <span>Integrity: <span className="text-cyan-400 font-bold">100% OK</span></span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Simulated typing status */}
            {isTyping && (
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" 
                  alt="Typing..." 
                  className="w-9 h-9 rounded-full object-cover border border-slate-800 animate-pulse"
                />
                <div className="bg-[#151c2d] border border-cyan-500/10 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                  <span className="text-[11px] text-cyan-400 font-mono">{typingUser} is translating & typing</span>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' } as CSSProperties}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' } as CSSProperties}></span>
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' } as CSSProperties}></span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Interactive Chat Form Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-[#0c1223] flex items-center gap-3">
            <div className="flex-1 relative flex items-center bg-[#131a2e] rounded-xl border border-slate-800 focus-within:border-cyan-500/40 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-200 px-3">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isTyping ? "Alexander Z. is typing..." : "Type text payload in English (e.g. hello, how are you?)..."}
                disabled={isTyping}
                className="w-full bg-transparent border-none text-slate-100 text-sm py-3.5 focus:outline-none focus:ring-0 disabled:text-slate-500 disabled:cursor-not-allowed placeholder-slate-500"
              />
              <span className="text-[10px] text-slate-500 font-mono pr-2">
                {inputText.length} chars
              </span>
            </div>

            <button 
              type="submit" 
              disabled={isTyping || !inputText.trim()}
              className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/10 transition-all active:scale-95 flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          
        </section>

        {/* RIGHT PANE: Mod Configuration Panel (5 cols) */}
        <section className="lg:col-span-5 space-y-6">

          {/* Engine Toggler Box */}
          <div className="bg-[#0c111e]/90 border border-slate-800/70 p-5 rounded-2xl shadow-xl backdrop-blur-sm relative">
            <h3 className="font-['Outfit'] font-bold text-sm tracking-wider uppercase text-slate-300 mb-3.5 flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
              Translation Engine Selection
            </h3>

            {/* Functional engine dual selection tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#121829] p-1.5 rounded-xl border border-slate-800/80">
              <button
                onClick={() => handleEngineToggle('Google Parallel Web API')}
                className={`py-3 px-2 text-center rounded-lg text-xs font-semibold font-mono tracking-tight transition-all duration-300 relative ${
                  engine === 'Google Parallel Web API'
                    ? 'bg-[#1b253b] border border-cyan-500/30 text-cyan-400 shadow-md shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Google Parallel Web API
                {engine === 'Google Parallel Web API' && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                )}
              </button>
              
              <button
                onClick={() => handleEngineToggle('Native Telegram MTProto Translator')}
                className={`py-3 px-2 text-center rounded-lg text-xs font-semibold font-mono tracking-tight transition-all duration-300 relative ${
                  engine === 'Native Telegram MTProto Translator'
                    ? 'bg-[#1b253b] border border-indigo-500/30 text-indigo-300 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                Telegram MTProto Node
                {engine === 'Native Telegram MTProto Translator' && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 font-mono mt-3 leading-relaxed">
              * <span className="text-cyan-400">Google API</span> handles dynamic batch queries via proxy pools. <span className="text-indigo-400">MTProto Node</span> utilizes telegram native encryption tunnels.
            </p>
          </div>

          {/* Dual-Selector Language Picker Box */}
          <div className="bg-[#0c111e]/90 border border-slate-800/70 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
            <h3 className="font-['Outfit'] font-bold text-sm tracking-wider uppercase text-slate-300 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-indigo-400 shadow-[0_0_10px_#818cf8]"></span>
              Language Routing System
            </h3>

            <div className="space-y-4">
              
              {/* Input Language Block */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-400 font-mono uppercase">Input Language (Source)</label>
                  
                  {/* Auto-detect selector state */}
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={autoDetect}
                      onChange={(e) => {
                        setAutoDetect(e.target.checked);
                        addLog(`Auto-Detect Language set to: ${e.target.checked}`, 'info');
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-400 hover:text-slate-300">Auto-Detect</span>
                  </label>
                </div>

                <div className="relative">
                  <select
                    value={inputLang}
                    onChange={(e) => {
                      setInputLang(e.target.value);
                      addLog(`Manual source language routed: ${e.target.value.toUpperCase()}`, 'info');
                    }}
                    disabled={autoDetect}
                    className="w-full bg-[#121829] border border-slate-800 focus:border-cyan-500/40 text-slate-100 rounded-xl px-3.5 py-3 text-xs focus:outline-none transition-all font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} &nbsp; {lang.name} ({lang.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Language Block */}
              <div>
                <label className="block text-xs text-slate-400 font-mono uppercase mb-1.5">Target Output Language</label>
                <div className="relative">
                  <select
                    value={targetLang}
                    onChange={(e) => {
                      setTargetLang(e.target.value);
                      addLog(`Target language changed: ${e.target.value.toUpperCase()}`, 'info');
                    }}
                    className="w-full bg-[#121829] border border-slate-800 focus:border-indigo-500/40 text-slate-100 rounded-xl px-3.5 py-3 text-xs focus:outline-none transition-all font-semibold cursor-pointer"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} &nbsp; {lang.name} ({lang.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick swap language helper */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (autoDetect) {
                      addLog('Please disable Auto-Detect to swap languages.', 'warn');
                      return;
                    }
                    const temp = inputLang;
                    setInputLang(targetLang);
                    setTargetLang(temp);
                    addLog(`Swapped input and output configurations.`, 'info');
                  }}
                  className={`text-[10px] font-mono flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 transition-all ${
                    autoDetect 
                      ? 'text-slate-600 border-slate-900/50 cursor-not-allowed' 
                      : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-900/60 hover:border-cyan-500/20'
                  }`}
                  disabled={autoDetect}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Swap Routing
                </button>
              </div>

            </div>
          </div>

          {/* Performance Metrics Monitor Board */}
          <div className="bg-[#0c111e]/90 border border-slate-800/70 p-5 rounded-2xl shadow-xl backdrop-blur-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-['Outfit'] font-bold text-sm tracking-wider uppercase text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded bg-emerald-400 shadow-[0_0_10px_#34d399]"></span>
                System Performance Metrics
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            {/* Grid of indicators */}
            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="bg-[#121829] border border-slate-800/80 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-mono uppercase">Avg Speed latency</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-['Outfit'] font-extrabold text-cyan-400 tracking-tight">
                    {averageResponseTime}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">ms</span>
                </div>
              </div>

              <div className="bg-[#121829] border border-slate-800/80 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-mono uppercase">Parallel workers</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-['Outfit'] font-extrabold text-indigo-400 tracking-tight">
                    {parallelWorkers}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Active Nodes</span>
                </div>
              </div>

              <div className="bg-[#121829] border border-slate-800/80 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-mono uppercase">Chars Transferred</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-['Outfit'] font-extrabold text-slate-200 tracking-tight">
                    {translatedCharsCount}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">bytes</span>
                </div>
              </div>

              <div className="bg-[#121829] border border-slate-800/80 p-3 rounded-xl">
                <p className="text-[10px] text-slate-500 font-mono uppercase">Mod CPU Load</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-['Outfit'] font-extrabold text-emerald-400 tracking-tight">
                    {cpuLoad}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">%</span>
                </div>
              </div>

            </div>

            {/* Interactive workers slider */}
            <div className="bg-[#121829] border border-slate-800/80 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">CONCURRENT PARALLEL WORKERS</span>
                <span className="text-indigo-400 font-bold">{parallelWorkers} / 12 Nodes</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={parallelWorkers} 
                onChange={handleWorkerChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
              <div className="flex justify-between text-[9px] font-mono text-slate-600">
                <span>1 Worker (Low CPU)</span>
                <span>12 Workers (Extreme Speed)</span>
              </div>
            </div>

            {/* Sparkline Canvas Chart */}
            <div className="bg-[#121829] border border-slate-800/80 p-3 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>LATENCY HISTORY GRAPH</span>
                <span>Real-time Sparkline</span>
              </div>
              <div className="h-24 w-full bg-slate-950/60 rounded-lg overflow-hidden border border-slate-800 relative">
                <canvas 
                  ref={canvasRef as any} 
                  width={380} 
                  height={96}
                  className="w-full h-full block"
                />
              </div>
            </div>

          </div>

          {/* Diagnostics Live system Logs Terminal */}
          <div className="bg-[#0c111e]/90 border border-slate-800/70 p-5 rounded-2xl shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
              <h3 className="font-['Outfit'] font-bold text-sm tracking-wider uppercase text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-amber-400 animate-pulse shadow-[0_0_10px_#fbbf24]"></span>
                Diagnostics Logs Terminal
              </h3>
              <button 
                onClick={() => {
                  setLogs([]);
                  addLog('Diagnostics buffer cleared.', 'info');
                }}
                className="text-[9px] text-slate-500 hover:text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                Clear Logs
              </button>
            </div>

            {/* Console output frame */}
            <div className="bg-slate-950/95 font-mono text-[10px] p-3 rounded-xl border border-slate-900 h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {logs.map((log, idx) => {
                let colorClass = 'text-slate-400';
                if (log.type === 'success') colorClass = 'text-emerald-400';
                if (log.type === 'warn') colorClass = 'text-rose-400';
                if (log.type === 'system') colorClass = 'text-cyan-400';
                
                return (
                  <div key={idx} className="flex gap-2 leading-relaxed">
                    <span className="text-slate-600 flex-shrink-0">[{log.time}]</span>
                    <span className={colorClass}>{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </section>

      </main>

      {/* SVG Definitions for gradients used in canvas */}
      <svg className="hidden">
        <defs>
          <linearGradient id="cyan-indigo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>
      </svg>
      
    </div>
  );
}
