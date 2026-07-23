import { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2, XCircle, Search, Plus, Printer,
  RotateCcw, Users, Wallet, Calendar, UserPlus,
  Check, Sparkles, ShieldCheck, X, Edit3,
  LayoutGrid, ListFilter, Clock, ChevronDown,
  AlertCircle, CircleDollarSign, Home, UserCheck,
  Filter, ArrowUpDown, Eye, Banknote, TrendingUp,
  Download, ChevronLeft, Trash2, Share, PlusSquare
} from 'lucide-react';
import { INITIAL_FAMILIES, INITIAL_MEMBERS } from './data/initialData';
import './index.css';

/* ═══════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════ */
const formatIQD = (v) => new Intl.NumberFormat('ar-IQ').format(v) + ' د.ع';

/* ═══════════════════════════════════════════
   CUSTOM DROPDOWN (replaces native <select>)
   ═══════════════════════════════════════════ */
function CustomSelect({ value, onChange, options, placeholder, icon: Icon, iconColor }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 glass-input rounded-xl px-3.5 py-3 text-sm text-slate-200 font-bold transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconColor || 'text-amber-400'}`} />}
          <span className="truncate">{selected?.label || placeholder}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Overlay for mobile */}
          <div className="fixed inset-0 z-40 bg-slate-950/60 md:hidden dropdown-overlay" onClick={() => setOpen(false)} />

          {/* Dropdown Menu */}
          <div className="
            /* Mobile: bottom sheet */
            fixed md:absolute bottom-0 md:bottom-auto left-0 md:left-auto right-0 md:right-0
            md:top-full md:mt-2 z-50
            bg-slate-900 md:bg-slate-900/95 md:backdrop-blur-xl
            border-t md:border border-slate-700/50 md:border-slate-700/40
            rounded-t-3xl md:rounded-2xl
            w-full md:w-full md:min-w-[200px]
            max-h-[70vh] md:max-h-64 overflow-y-auto
            shadow-2xl dropdown-menu
            p-2 pt-3 md:p-1.5
          ">
            {/* Mobile handle */}
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-3 md:hidden"></div>

            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-right px-4 py-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                  value === opt.value
                    ? 'bg-amber-500/15 text-amber-300'
                    : 'text-slate-300 hover:bg-slate-800 active:bg-slate-800'
                }`}
              >
                <span>{opt.label}</span>
                {value === opt.value && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */
function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, glowClass }) {
  return (
    <div className={`glass-card rounded-2xl p-4 card-hover ${glowClass || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
        </div>
      </div>
      <div className="text-2xl sm:text-3xl font-black text-white font-cairo leading-none">{value}</div>
      {sub && <div className="text-[10px] text-slate-500 mt-1.5 font-semibold">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MEMBER CARD
   ═══════════════════════════════════════════ */
function MemberCard({ member, paymentInfo, onToggle, onNote }) {
  const isPaid = !!paymentInfo?.paid;
  return (
    <div className={`relative rounded-2xl card-hover transition-all duration-300 overflow-hidden ${
      isPaid ? 'glass-card border-emerald-500/25 glow-emerald' : 'glass-card'
    }`}>
      {isPaid && <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-l from-emerald-400 to-teal-400"></div>}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-black ${
              isPaid ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/50'
            }`}>{member.seq}</div>
            <div className="min-w-0">
              <h3 className="font-bold text-[14px] text-white leading-tight truncate">{member.name}</h3>
              <span className="inline-flex mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/8 text-amber-400/80 border border-amber-500/10">
                {member.family}
              </span>
            </div>
          </div>
          <button
            onClick={() => onToggle(member.id)}
            className={`shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl font-extrabold text-[11px] transition-all active:scale-95 ${
              isPaid
                ? 'bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/20'
                : 'glass-input text-slate-300 hover:border-amber-500/30'
            }`}
          >
            {isPaid ? <><CheckCircle2 className="w-3.5 h-3.5" /> واصل</> : <><CircleDollarSign className="w-3.5 h-3.5 text-amber-400" /> تأشير</>}
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-700/20">
          <div className="flex items-center gap-1.5 text-slate-500">
            {isPaid && paymentInfo?.date && <span className="flex items-center gap-0.5 text-emerald-400/70"><Clock className="w-2.5 h-2.5" />{paymentInfo.date}</span>}
            {paymentInfo?.note && <span className="truncate max-w-[100px] text-amber-300/70">{paymentInfo.note}</span>}
          </div>
          <button onClick={() => onNote(member, paymentInfo?.note || '')} className="text-slate-500 hover:text-amber-400 flex items-center gap-0.5 font-semibold transition-colors">
            <Edit3 className="w-2.5 h-2.5" />{paymentInfo?.note ? 'تعديل' : 'ملاحظة'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MODAL
   ═══════════════════════════════════════════ */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-end sm:items-center justify-center modal-overlay" onClick={onClose}>
      <div className="glass w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6 pt-4 shadow-2xl modal-content max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4 sm:hidden"></div>
        <button onClick={onClose} className="absolute left-4 top-4 text-slate-500 hover:text-white transition-colors hidden sm:block"><X className="w-5 h-5" /></button>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, color, title }) {
  return <h3 className={`text-lg font-black ${color} flex items-center gap-2 font-cairo mb-4`}>{icon} {title}</h3>;
}

function Field({ label, children }) {
  return <div className="mb-4"><label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>{children}</div>;
}

function ModalBtns({ onCancel, submitLabel, submitClass, onSubmit }) {
  return (
    <div className="flex gap-2 pt-2">
      <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 text-xs font-bold glass-input rounded-xl text-slate-300 active:bg-slate-800 transition-all">إلغاء</button>
      {onSubmit
        ? <button type="button" onClick={onSubmit} className={`flex-1 px-4 py-3 text-xs font-black rounded-xl shadow-lg transition-all active:scale-95 ${submitClass}`}>{submitLabel}</button>
        : <button type="submit" className={`flex-1 px-4 py-3 text-xs font-black rounded-xl shadow-lg transition-all active:scale-95 ${submitClass}`}>{submitLabel}</button>
      }
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {

  /* ── State ── */
  const [events, setEvents] = useState(() => { try { return JSON.parse(localStorage.getItem('saed_events')) || []; } catch { return []; } });
  const [activeEventId, setActiveEventId] = useState(() => localStorage.getItem('saed_active_event_id') || '');
  const [members, setMembers] = useState(() => { try { return JSON.parse(localStorage.getItem('saed_members')) || INITIAL_MEMBERS; } catch { return INITIAL_MEMBERS; } });
  const [families] = useState(() => { try { return JSON.parse(localStorage.getItem('saed_families')) || INITIAL_FAMILIES; } catch { return INITIAL_FAMILIES; } });
  const [paymentsMap, setPaymentsMap] = useState(() => { try { return JSON.parse(localStorage.getItem('saed_payments_map')) || {}; } catch { return {}; } });

  /* ── UI State ── */
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [noteModal, setNoteModal] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [newEvent, setNewEvent] = useState({ name: '', amountPerMember: 25000, notes: '' });
  const [newMember, setNewMember] = useState({ name: '', family: INITIAL_FAMILIES[0] || '' });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSInstall, setShowIOSInstall] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  /* ── Sync & PWA ── */
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstall(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };


  useEffect(() => { localStorage.setItem('saed_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('saed_active_event_id', activeEventId); }, [activeEventId]);
  useEffect(() => { localStorage.setItem('saed_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('saed_families', JSON.stringify(families)); }, [families]);
  useEffect(() => { localStorage.setItem('saed_payments_map', JSON.stringify(paymentsMap)); }, [paymentsMap]);

  /* ── Derived ── */
  const currentEvent = useMemo(() => events.find(e => e.id === activeEventId) || null, [events, activeEventId]);
  const currentPayments = useMemo(() => currentEvent ? (paymentsMap[currentEvent.id] || {}) : {}, [paymentsMap, currentEvent]);
  const hasEvents = events.length > 0;

  /* ── Confetti ── */
  const pop = () => confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 }, colors: ['#fbbf24', '#10b981', '#f59e0b', '#34d399'] });

  /* ── Actions ── */
  const togglePayment = (id) => {
    if (!currentEvent) return;
    const wasPaid = !!currentPayments[id]?.paid;
    if (!wasPaid) pop();
    setPaymentsMap(prev => ({ ...prev, [currentEvent.id]: { ...prev[currentEvent.id], [id]: { paid: !wasPaid, date: !wasPaid ? new Date().toLocaleDateString('ar-IQ') : '', note: currentPayments[id]?.note || '' } } }));
  };

  const markFamilyPaid = (fam) => {
    if (!currentEvent) return;
    pop();
    const ids = members.filter(m => m.family === fam).map(m => m.id);
    setPaymentsMap(prev => {
      const em = { ...(prev[currentEvent.id] || {}) };
      ids.forEach(id => { em[id] = { paid: true, date: new Date().toLocaleDateString('ar-IQ'), note: em[id]?.note || '' }; });
      return { ...prev, [currentEvent.id]: em };
    });
  };

  const saveNote = () => {
    if (!noteModal || !currentEvent) return;
    setPaymentsMap(prev => ({ ...prev, [currentEvent.id]: { ...(prev[currentEvent.id] || {}), [noteModal.id]: { ...(prev[currentEvent.id]?.[noteModal.id] || {}), note: noteText } } }));
    setNoteModal(null); setNoteText('');
  };

  const createEvent = (e) => {
    e.preventDefault();
    if (!newEvent.name.trim()) return;
    const evt = { id: `evt_${Date.now()}`, name: newEvent.name.trim(), date: new Date().toISOString().split('T')[0], amountPerMember: Number(newEvent.amountPerMember) || 0, notes: newEvent.notes.trim() };
    setEvents(prev => [evt, ...prev]);
    setActiveEventId(evt.id);
    setPaymentsMap(prev => ({ ...prev, [evt.id]: {} }));
    setIsAddEventOpen(false);
    setNewEvent({ name: '', amountPerMember: 25000, notes: '' });
  };

  const createMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    setMembers(prev => [...prev, { id: String(Date.now()), seq: prev.length + 1, name: newMember.name.trim(), family: newMember.family }]);
    setIsAddMemberOpen(false);
    setNewMember({ name: '', family: families[0] || '' });
  };

  const deleteMember = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفرد؟')) return;
    setMembers(prev => {
      const filtered = prev.filter(m => m.id !== id);
      return filtered.map((m, idx) => ({ ...m, seq: idx + 1 }));
    });
    setPaymentsMap(prev => {
      const newMap = { ...prev };
      Object.keys(newMap).forEach(evtId => {
        if (newMap[evtId][id]) {
          const evtPayments = { ...newMap[evtId] };
          delete evtPayments[id];
          newMap[evtId] = evtPayments;
        }
      });
      return newMap;
    });
  };

  const handleReset = () => {
    if (!window.confirm('هل أنت متأكد من إعادة ضبط جميع البيانات؟')) return;
    localStorage.clear();
    setEvents([]); setActiveEventId(''); setMembers(INITIAL_MEMBERS); setPaymentsMap({});
  };

  /* ── Filtered ── */
  const filtered = useMemo(() => {
    return members.filter(m => {
      if (selectedFamily !== 'ALL' && m.family !== selectedFamily) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        if (!m.name.toLowerCase().includes(q) && String(m.seq) !== q && !m.family.toLowerCase().includes(q)) return false;
      }
      if (currentEvent) {
        const isPaid = !!currentPayments[m.id]?.paid;
        if (paymentFilter === 'PAID' && !isPaid) return false;
        if (paymentFilter === 'UNPAID' && isPaid) return false;
      }
      return true;
    });
  }, [members, selectedFamily, searchTerm, paymentFilter, currentPayments, currentEvent]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const total = members.length;
    if (!currentEvent) return { total, paid: 0, unpaid: 0, amt: 0, collected: 0, target: 0, remaining: 0, pct: 0 };
    let paid = 0;
    members.forEach(m => { if (currentPayments[m.id]?.paid) paid++; });
    const unpaid = total - paid;
    const amt = currentEvent.amountPerMember || 0;
    return { total, paid, unpaid, amt, collected: paid * amt, target: total * amt, remaining: unpaid * amt, pct: total > 0 ? Math.round((paid / total) * 100) : 0 };
  }, [members, currentPayments, currentEvent]);

  /* ── Family options for custom dropdown ── */
  const familyOptions = useMemo(() => [
    { value: 'ALL', label: `كل العوائل (${families.length})` },
    ...families.map(f => {
      const count = members.filter(m => m.family === f).length;
      return { value: f, label: `${f}  (${count})` };
    })
  ], [families, members]);

  /* ── Event options for custom dropdown ── */
  const eventOptions = useMemo(() =>
    events.map(evt => ({ value: evt.id, label: `${evt.name} — ${formatIQD(evt.amountPerMember)}` }))
  , [events]);

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */
  return (
    <div dir="rtl" className="min-h-screen min-h-dvh pb-24">

      {/* BG Decorations */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-200px] right-[-150px] w-[500px] h-[500px] rounded-full bg-amber-600/[0.035] blur-[120px]"></div>
        <div className="absolute bottom-[-200px] left-[-150px] w-[400px] h-[400px] rounded-full bg-blue-600/[0.025] blur-[120px]"></div>
      </div>

      {/* ═════ TOP HEADER ═════ */}
      <header className="sticky top-0 z-30 glass no-print" style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}>
        <div className="max-w-3xl mx-auto px-4 pb-3 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl animated-gradient p-[2px]">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950 pulse-ring"></div>
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-gradient-gold font-cairo leading-tight">السادة الزوامل</h1>
                <p className="text-[9px] text-slate-500 font-semibold">نظام السداد والفراض والمناسبات</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button onClick={() => setIsAddEventOpen(true)} title="مناسبة جديدة" className="p-2.5 rounded-xl glass-input text-amber-400 hover:text-amber-300 active:scale-90 transition-all">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setIsAddMemberOpen(true)} title="إضافة فرد" className="p-2.5 rounded-xl glass-input text-emerald-400 hover:text-emerald-300 active:scale-90 transition-all">
                <UserPlus className="w-4 h-4" />
              </button>
              {hasEvents && (
                <button onClick={() => setIsPrintOpen(true)} title="طباعة" className="p-2.5 rounded-xl glass-input text-sky-400 hover:text-sky-300 active:scale-90 transition-all">
                  <Printer className="w-4 h-4" />
                </button>
              )}
              {(deferredPrompt || (isIOS && !isStandalone)) && (
                <button onClick={handleInstallClick} title="تثبيت التطبيق" className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 active:scale-90 transition-all flex items-center gap-1.5 px-3">
                  <Download className="w-4 h-4" />
                  <span className="text-[10px] font-bold hidden sm:inline">تثبيت</span>
                </button>
              )}
              <button onClick={handleReset} title="إعادة ضبط" className="p-2.5 rounded-xl glass-input text-slate-500 hover:text-rose-400 active:scale-90 transition-all">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ═════ CONTENT ═════ */}
      <main className="max-w-3xl mx-auto px-4 pt-4 no-print">

        {/* ═════════ TAB: DASHBOARD ═════════ */}
        {activeTab === 'dashboard' && (
          <div>

            {/* No events empty state */}
            {!hasEvents && (
              <div className="text-center py-16 glass-card rounded-3xl mt-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-xl font-black text-white font-cairo mb-2">لا توجد مناسبات بعد</h2>
                <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">أنشئ أول مناسبة أو فريضة لبدء تسجيل المدفوعات وتتبع الأفراد</p>
                <button
                  onClick={() => setIsAddEventOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-amber-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" /> إنشاء مناسبة جديدة
                </button>
              </div>
            )}

            {hasEvents && (
              <>
                {/* Event Selector */}
                <div className="mb-5">
                  <CustomSelect
                    value={activeEventId}
                    onChange={setActiveEventId}
                    options={eventOptions}
                    placeholder="اختر مناسبة..."
                    icon={Calendar}
                    iconColor="text-amber-400"
                  />
                </div>

                {currentEvent && (
                  <>
                    {/* Event Banner */}
                    <div className="glass-card rounded-2xl p-5 mb-5 glow-amber relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-28 h-28 bg-amber-500/[0.06] rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="relative z-10">
                        <h2 className="text-xl sm:text-2xl font-black text-white font-cairo mb-1.5">{currentEvent.name}</h2>
                        <p className="text-xs text-slate-400">
                          المبلغ: <strong className="text-amber-400 font-cairo">{formatIQD(stats.amt)}</strong> لكل فرد
                          {currentEvent.notes && <span className="text-slate-500"> • {currentEvent.notes}</span>}
                        </p>

                        {/* Progress */}
                        <div className="mt-4 bg-slate-900/60 rounded-xl p-3">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                            <span className="text-slate-400">نسبة الاستيفاء</span>
                            <span className="text-amber-400 font-cairo text-sm">{stats.pct}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full progress-bar" style={{ width: `${stats.pct}%` }}></div>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-500 mt-1.5 font-semibold">
                            <span>المحصّل: {formatIQD(stats.collected)}</span>
                            <span>المستهدف: {formatIQD(stats.target)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <StatCard icon={Users} iconColor="text-sky-400" iconBg="bg-sky-500/10" label="الأفراد" value={stats.total} sub={`${families.length} عائلة`} />
                      <StatCard icon={CheckCircle2} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" label="الواصلون" value={stats.paid} sub={`${stats.pct}%`} glowClass="glow-emerald" />
                      <StatCard icon={XCircle} iconColor="text-rose-400" iconBg="bg-rose-500/10" label="المتبقون" value={stats.unpaid} sub={formatIQD(stats.remaining)} glowClass="glow-rose" />
                      <StatCard icon={Wallet} iconColor="text-amber-400" iconBg="bg-amber-500/10" label="المحصّل" value={formatIQD(stats.collected)} glowClass="glow-amber" />
                    </div>

                    {/* Filter & Search */}
                    <div className="glass-card rounded-2xl p-4 mb-5">
                      {/* Search */}
                      <div className="relative mb-3">
                        <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="بحث بالاسم أو التسلسل..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="w-full glass-input rounded-xl pr-10 pl-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/40 transition-all"
                        />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><X className="w-4 h-4" /></button>}
                      </div>

                      {/* Family Dropdown */}
                      <div className="mb-3">
                        <CustomSelect
                          value={selectedFamily}
                          onChange={setSelectedFamily}
                          options={familyOptions}
                          placeholder="كل العوائل"
                          icon={Users}
                          iconColor="text-sky-400"
                        />
                      </div>

                      {/* Status Tabs */}
                      <div className="flex items-center bg-slate-900/50 rounded-xl p-1 gap-0.5">
                        {[
                          { key: 'ALL', label: `الكل`, count: members.length, activeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
                          { key: 'PAID', label: `واصل`, count: stats.paid, activeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
                          { key: 'UNPAID', label: `متبقي`, count: stats.unpaid, activeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
                        ].map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setPaymentFilter(tab.key)}
                            className={`flex-1 px-2 py-2 text-[11px] font-bold rounded-lg transition-all active:scale-95 ${
                              paymentFilter === tab.key ? `${tab.activeClass} border` : 'text-slate-500 border border-transparent'
                            }`}
                          >
                            {tab.label} ({tab.count})
                          </button>
                        ))}
                      </div>

                      {/* Family batch */}
                      {selectedFamily !== 'ALL' && (
                        <div className="mt-3 pt-3 border-t border-slate-700/20 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500 font-medium">{selectedFamily} — {filtered.length} فرد</span>
                          <button onClick={() => markFamilyPaid(selectedFamily)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-[10px] font-bold active:scale-95 transition-all">
                            <CheckCircle2 className="w-3 h-3" /> تأشير الكل واصل
                          </button>
                        </div>
                      )}
                    </div>

                    {/* View Mode + Count */}
                    <div className="flex items-center justify-between mb-3 px-0.5">
                      <p className="text-[10px] font-semibold text-slate-500">
                        <span className="text-amber-400 font-cairo">{filtered.length}</span> فرد
                      </p>
                      <div className="flex bg-slate-900/50 border border-slate-700/30 rounded-lg p-0.5">
                        <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'}`}>
                          <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-slate-800 text-amber-400' : 'text-slate-500'}`}>
                          <ListFilter className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Grid */}
                    {viewMode === 'grid' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {filtered.map(m => (
                          <MemberCard key={m.id} member={m} paymentInfo={currentPayments[m.id]} onToggle={togglePayment} onNote={(member, note) => { setNoteModal(member); setNoteText(note); }} />
                        ))}
                      </div>
                    )}

                    {/* Table */}
                    {viewMode === 'table' && (
                      <div className="glass-card rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-right text-xs">
                            <thead>
                              <tr className="bg-slate-900/80 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-700/30">
                                <th className="px-3 py-3 text-center w-10">ت</th>
                                <th className="px-3 py-3">الاسم</th>
                                <th className="px-3 py-3">العائلة</th>
                                <th className="px-3 py-3 text-center">الحالة</th>
                                <th className="px-3 py-3 text-center w-20">إجراء</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                              {filtered.map(m => {
                                const pi = currentPayments[m.id];
                                const isPaid = !!pi?.paid;
                                return (
                                  <tr key={m.id} className={`transition-colors ${isPaid ? 'bg-emerald-950/10' : ''}`}>
                                    <td className="px-3 py-2.5 text-center font-bold text-slate-500 font-cairo">{m.seq}</td>
                                    <td className="px-3 py-2.5 font-bold text-white text-[11px]">{m.name}</td>
                                    <td className="px-3 py-2.5 text-amber-400/70 font-semibold text-[10px]">{m.family}</td>
                                    <td className="px-3 py-2.5 text-center">
                                      {isPaid
                                        ? <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[9px] font-bold"><Check className="w-2.5 h-2.5" />واصل</span>
                                        : <span className="inline-flex px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[9px] font-bold">متبقي</span>
                                      }
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      <button onClick={() => togglePayment(m.id)} className={`px-2 py-1 rounded-lg text-[10px] font-bold active:scale-90 transition-all ${isPaid ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-emerald-500 text-emerald-950 font-extrabold'}`}>
                                        {isPaid ? 'إلغاء' : 'تأشير'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {filtered.length === 0 && (
                      <div className="text-center py-14 glass-card rounded-2xl">
                        <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-300 font-cairo">لا يوجد نتائج</h3>
                        <p className="text-xs text-slate-500 mt-1">جرّب تعديل البحث أو الفلاتر</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ═════════ TAB: MEMBERS ═════════ */}
        {activeTab === 'members' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-white font-cairo flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-400" />
                سجل أفراد السادة الزوامل
              </h2>
              <button onClick={() => setIsAddMemberOpen(true)} className="flex items-center gap-1 px-3 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-[11px] font-bold active:scale-95 transition-all">
                <UserPlus className="w-3.5 h-3.5" /> إضافة
              </button>
            </div>

            {/* Search in members */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث عن فرد..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full glass-input rounded-xl pr-10 pl-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/40 transition-all"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><X className="w-4 h-4" /></button>}
            </div>

            {/* Family filter */}
            <div className="mb-4">
              <CustomSelect
                value={selectedFamily}
                onChange={setSelectedFamily}
                options={familyOptions}
                placeholder="كل العوائل"
                icon={Users}
                iconColor="text-sky-400"
              />
            </div>

            {/* Members Count */}
            <p className="text-[10px] font-semibold text-slate-500 mb-3 px-0.5">
              <span className="text-sky-400 font-cairo">{filtered.length}</span> فرد من أصل <span className="text-slate-300">{members.length}</span>
            </p>

            {/* Members List */}
            <div className="space-y-2">
              {filtered.map((m, idx) => (
                <div key={m.id} className="glass-card rounded-xl p-3.5 flex items-center gap-3 card-hover">
                  <div className="w-8 h-8 shrink-0 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-xs font-black border border-sky-500/15">
                    {m.seq}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[13px] text-white truncate">{m.name}</h3>
                    <span className="text-[10px] font-bold text-amber-400/70">{m.family}</span>
                  </div>
                  {currentEvent && (
                    <div>
                      {currentPayments[m.id]?.paid
                        ? <span className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/15"><Check className="w-3 h-3" /> واصل</span>
                        : <span className="px-2 py-1 rounded-lg bg-slate-800 text-slate-500 text-[10px] font-bold border border-slate-700/40">—</span>
                      }
                    </div>
                  )}
                  <button onClick={() => deleteMember(m.id)} className="p-2 shrink-0 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-rose-950 transition-colors" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-14 glass-card rounded-2xl">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400 font-cairo">لا يوجد أفراد مطابقين</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═════ BOTTOM NAV BAR ═════ */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bottom-nav no-print" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="max-w-3xl mx-auto flex items-stretch">
          {[
            { key: 'dashboard', label: 'الرئيسية', icon: Home, activeColor: 'text-amber-400' },
            { key: 'members', label: 'الأفراد', icon: Users, activeColor: 'text-sky-400' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all active:scale-90 ${
                activeTab === tab.key ? tab.activeColor : 'text-slate-500'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{tab.label}</span>
              {activeTab === tab.key && <div className="w-5 h-0.5 rounded-full bg-current mt-0.5"></div>}
            </button>
          ))}
        </div>
      </nav>

      {/* ═════ MODALS ═════ */}

      {showIOSInstall && (
        <Modal onClose={() => setShowIOSInstall(false)}>
          <ModalHeader icon={<Download className="w-5 h-5" />} color="text-sky-400" title="تثبيت التطبيق على آيفون" />
          <div className="p-4 text-center space-y-5 my-2">
            <p className="text-sm font-bold text-slate-300 font-cairo">
              لتثبيت التطبيق على شاشتك الرئيسية، يرجى اتباع الخطوات التالية:
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">1</span>
                <span className="text-sm font-bold font-cairo text-right flex-1">اضغط على زر المشاركة أسفل الشاشة</span>
                <Share className="w-5 h-5 text-sky-400 shrink-0" />
              </div>
              <div className="flex items-center gap-3 text-slate-300 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <span className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs shrink-0">2</span>
                <span className="text-sm font-bold font-cairo text-right flex-1">اختر (إضافة إلى الصفحة الرئيسية)</span>
                <PlusSquare className="w-5 h-5 text-sky-400 shrink-0" />
              </div>
            </div>
          </div>
          <ModalBtns onCancel={() => setShowIOSInstall(false)} submitLabel="حسناً، فهمت" submitClass="bg-sky-500 hover:bg-sky-400 text-slate-950" />
        </Modal>
      )}

      {isAddEventOpen && (
        <Modal onClose={() => setIsAddEventOpen(false)}>
          <ModalHeader icon={<Plus className="w-5 h-5" />} color="text-amber-400" title="مناسبة جديدة" />
          <form onSubmit={createEvent}>
            <Field label="اسم المناسبة"><input required placeholder="مثال: فريضة زواج ..." value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} className="input-field" /></Field>
            <Field label="المبلغ لكل فرد (د.ع)"><input type="number" required step="1000" value={newEvent.amountPerMember} onChange={e => setNewEvent({ ...newEvent, amountPerMember: e.target.value })} className="input-field" /></Field>
            <Field label="ملاحظات"><textarea rows="2" placeholder="تفاصيل..." value={newEvent.notes} onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })} className="input-field resize-none"></textarea></Field>
            <ModalBtns onCancel={() => setIsAddEventOpen(false)} submitLabel="إنشاء المناسبة" submitClass="bg-amber-500 hover:bg-amber-400 text-slate-950" />
          </form>
        </Modal>
      )}

      {isAddMemberOpen && (
        <Modal onClose={() => setIsAddMemberOpen(false)}>
          <ModalHeader icon={<UserPlus className="w-5 h-5" />} color="text-emerald-400" title="إضافة فرد جديد" />
          <form onSubmit={createMember}>
            <Field label="الاسم الثلاثي أو الرباعي"><input required placeholder="علي حسن سعيد ..." value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="input-field" /></Field>
            <Field label="العائلة">
              <CustomSelect value={newMember.family} onChange={v => setNewMember({ ...newMember, family: v })} options={families.map(f => ({ value: f, label: f }))} placeholder="اختر العائلة" icon={Users} iconColor="text-amber-400" />
            </Field>
            <ModalBtns onCancel={() => setIsAddMemberOpen(false)} submitLabel="إضافة الفرد" submitClass="bg-emerald-500 hover:bg-emerald-400 text-emerald-950" />
          </form>
        </Modal>
      )}

      {noteModal && (
        <Modal onClose={() => setNoteModal(null)}>
          <ModalHeader icon={<Edit3 className="w-5 h-5" />} color="text-amber-400" title={`ملاحظة: ${noteModal.name}`} />
          <textarea rows="3" placeholder="أدخل ملاحظة السداد..." value={noteText} onChange={e => setNoteText(e.target.value)} className="input-field resize-none mb-4"></textarea>
          <ModalBtns onCancel={() => setNoteModal(null)} submitLabel="حفظ" submitClass="bg-amber-500 hover:bg-amber-400 text-slate-950" onSubmit={saveNote} />
        </Modal>
      )}

      {isPrintOpen && currentEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 flex flex-col items-center modal-overlay" style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}>
          <div className="w-full max-w-4xl flex items-center justify-between mb-4 no-print">
            <h3 className="text-base font-bold text-slate-200 font-cairo">كشف رسمي</h3>
            <div className="flex gap-2">
              <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-emerald-950 font-black text-xs rounded-xl active:scale-95"><Printer className="w-4 h-4" />طباعة</button>
              <button onClick={() => setIsPrintOpen(false)} className="px-4 py-2 glass-input text-slate-200 font-bold text-xs rounded-xl">إغلاق</button>
            </div>
          </div>
          <div className="print-container w-full max-w-4xl bg-white text-slate-950 rounded-2xl p-6 sm:p-10 shadow-2xl text-right">
            <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-start justify-between">
              <div><h1 className="text-xl font-black text-slate-950 font-cairo mb-1">كشف تحصيل السادة الزوامل</h1><p className="text-xs font-bold text-slate-600">{currentEvent.name}</p><p className="text-[10px] text-slate-400 mt-0.5">{new Date().toLocaleDateString('ar-IQ')}</p></div>
              <div className="text-left border-r-2 border-slate-300 pr-3"><p className="text-[10px] font-bold text-slate-500">المبلغ/فرد</p><p className="text-base font-black font-cairo">{formatIQD(stats.amt)}</p></div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-100 p-3 rounded-lg text-center border border-slate-300 text-xs">
              <div><p className="font-bold text-slate-500 text-[9px]">الأفراد</p><p className="font-black text-sm">{stats.total}</p></div>
              <div><p className="font-bold text-slate-500 text-[9px]">الواصلون</p><p className="font-black text-sm text-emerald-700">{stats.paid}</p></div>
              <div><p className="font-bold text-slate-500 text-[9px]">المتبقون</p><p className="font-black text-sm text-rose-700">{stats.unpaid}</p></div>
              <div><p className="font-bold text-slate-500 text-[9px]">المحصّل</p><p className="font-black text-xs text-amber-700">{formatIQD(stats.collected)}</p></div>
            </div>
            {families.filter(f => members.some(m => m.family === f)).map((family, idx, arr) => {
              const familyMembers = members.filter(m => m.family === family);
              return (
                <div key={family} className={`mb-8 ${idx !== arr.length - 1 ? 'print-page-break' : ''}`}>
                  <h2 className="text-sm font-black bg-slate-200 border border-slate-400 p-2 mb-2 text-slate-900 font-cairo">عائلة: {family}</h2>
                  <table className="w-full text-right text-[10px] border border-slate-400">
                    <thead><tr className="bg-slate-100 font-bold border-b border-slate-400"><th className="p-1.5 border-l border-slate-400 text-center w-8">ت</th><th className="p-1.5 border-l border-slate-400">الاسم</th><th className="p-1.5 border-l border-slate-400 text-center w-16">الحالة</th><th className="p-1.5">ملاحظات</th></tr></thead>
                    <tbody>
                      {familyMembers.map((m, i) => {
                        const pi = currentPayments[m.id]; const isPaid = !!pi?.paid;
                        return <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}><td className="p-1.5 border-l border-t border-slate-300 text-center font-bold">{m.seq}</td><td className="p-1.5 border-l border-t border-slate-300 font-bold">{m.name}</td><td className="p-1.5 border-l border-t border-slate-300 text-center font-bold">{isPaid ? <span className="text-emerald-700">✓</span> : <span className="text-rose-700">✗</span>}</td><td className="p-1.5 border-t border-slate-300 text-slate-500">{pi?.note || pi?.date || '—'}</td></tr>;
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
            <div className="flex justify-between items-end pt-6 mt-6 border-t border-slate-300">
              <div className="text-center"><p className="text-[10px] font-bold text-slate-500 mb-8">توقيع مسؤول التحصيل</p><p className="text-[10px] text-slate-400">..............................</p></div>
              <div className="text-center"><p className="text-[10px] font-bold text-slate-500 mb-8">ختم الإدارة</p><p className="text-[10px] text-slate-400">..............................</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
