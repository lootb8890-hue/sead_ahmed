import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2, XCircle, Search, Plus, Printer,
  RotateCcw, Users, Wallet, Calendar, UserPlus,
  Check, Sparkles, ShieldCheck, X, Edit3,
  LayoutGrid, ListFilter, Clock, ChevronDown,
  AlertCircle, CircleDollarSign, TrendingUp
} from 'lucide-react';
import { INITIAL_FAMILIES, INITIAL_MEMBERS, DEFAULT_EVENT } from './data/initialData';
import './index.css';

/* ===== HELPER: Format Iraqi Dinar ===== */
const formatIQD = (val) => new Intl.NumberFormat('ar-IQ').format(val) + ' د.ع';

/* ===== STAT CARD COMPONENT ===== */
function StatCard({ icon: Icon, iconColor, iconBg, label, value, sub, glowClass }) {
  return (
    <div className={`glass rounded-2xl p-5 card-hover ${glowClass || ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold text-slate-400 tracking-wide uppercase">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="text-3xl font-black text-white font-cairo leading-none">{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-2 font-semibold">{sub}</div>}
    </div>
  );
}

/* ===== MEMBER CARD COMPONENT ===== */
function MemberCard({ member, paymentInfo, onToggle, onNote }) {
  const isPaid = !!paymentInfo?.paid;

  return (
    <div
      className={`relative rounded-2xl p-4 card-hover transition-all duration-300 ${
        isPaid
          ? 'glass border-emerald-500/30 glow-emerald'
          : 'glass'
      }`}
    >
      {/* Paid indicator stripe */}
      {isPaid && (
        <div className="absolute top-0 right-0 left-0 h-[3px] rounded-t-2xl bg-gradient-to-l from-emerald-400 via-emerald-500 to-teal-400"></div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Sequence Badge */}
          <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-black ${
            isPaid
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
              : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
          }`}>
            {member.seq}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-[15px] text-white leading-snug truncate">{member.name}</h3>
            <span className="inline-flex items-center mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300/90 border border-amber-500/15">
              {member.family}
            </span>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => onToggle(member.id)}
          className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all duration-200 cursor-pointer ${
            isPaid
              ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-600/50 hover:border-amber-500/40'
          }`}
        >
          {isPaid ? (
            <><CheckCircle2 className="w-4 h-4" /> واصل</>
          ) : (
            <><CircleDollarSign className="w-4 h-4 text-amber-400" /> تأشير</>
          )}
        </button>
      </div>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-slate-700/30">
        <div className="flex items-center gap-2 text-slate-400">
          {isPaid && paymentInfo?.date && (
            <span className="flex items-center gap-1 text-emerald-400/80 font-medium">
              <Clock className="w-3 h-3" /> {paymentInfo.date}
            </span>
          )}
          {paymentInfo?.note && (
            <span className="truncate max-w-[120px] text-amber-300/80 font-medium bg-amber-500/8 px-2 py-0.5 rounded-md">
              {paymentInfo.note}
            </span>
          )}
        </div>
        <button
          onClick={() => onNote(member, paymentInfo?.note || '')}
          className="text-slate-500 hover:text-amber-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
        >
          <Edit3 className="w-3 h-3" />
          {paymentInfo?.note ? 'تعديل' : 'ملاحظة'}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */
export default function App() {

  /* ---- Persistent State ---- */
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saed_events')) || [DEFAULT_EVENT]; }
    catch { return [DEFAULT_EVENT]; }
  });

  const [activeEventId, setActiveEventId] = useState(() =>
    localStorage.getItem('saed_active_event_id') || DEFAULT_EVENT.id
  );

  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saed_members')) || INITIAL_MEMBERS; }
    catch { return INITIAL_MEMBERS; }
  });

  const [families] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saed_families')) || INITIAL_FAMILIES; }
    catch { return INITIAL_FAMILIES; }
  });

  const [paymentsMap, setPaymentsMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saed_payments_map')) || { [DEFAULT_EVENT.id]: {} }; }
    catch { return { [DEFAULT_EVENT.id]: {} }; }
  });

  /* ---- UI State ---- */
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

  /* ---- LocalStorage Sync ---- */
  useEffect(() => { localStorage.setItem('saed_events', JSON.stringify(events)); }, [events]);
  useEffect(() => { localStorage.setItem('saed_active_event_id', activeEventId); }, [activeEventId]);
  useEffect(() => { localStorage.setItem('saed_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('saed_families', JSON.stringify(families)); }, [families]);
  useEffect(() => { localStorage.setItem('saed_payments_map', JSON.stringify(paymentsMap)); }, [paymentsMap]);

  /* ---- Derived ---- */
  const currentEvent = useMemo(() => events.find(e => e.id === activeEventId) || events[0] || DEFAULT_EVENT, [events, activeEventId]);
  const currentPayments = useMemo(() => paymentsMap[currentEvent.id] || {}, [paymentsMap, currentEvent.id]);

  /* ---- Confetti ---- */
  const pop = () => confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 }, colors: ['#fbbf24', '#10b981', '#f59e0b', '#34d399'] });

  /* ---- Toggle Payment ---- */
  const togglePayment = (id) => {
    const wasPaid = !!currentPayments[id]?.paid;
    if (!wasPaid) pop();
    setPaymentsMap(prev => ({
      ...prev,
      [currentEvent.id]: {
        ...prev[currentEvent.id],
        [id]: { paid: !wasPaid, date: !wasPaid ? new Date().toLocaleDateString('ar-IQ') : '', note: currentPayments[id]?.note || '' }
      }
    }));
  };

  /* ---- Mark Family Paid ---- */
  const markFamilyPaid = (fam) => {
    pop();
    const ids = members.filter(m => m.family === fam).map(m => m.id);
    setPaymentsMap(prev => {
      const evtMap = { ...(prev[currentEvent.id] || {}) };
      ids.forEach(id => { evtMap[id] = { paid: true, date: new Date().toLocaleDateString('ar-IQ'), note: evtMap[id]?.note || '' }; });
      return { ...prev, [currentEvent.id]: evtMap };
    });
  };

  /* ---- Save Note ---- */
  const saveNote = () => {
    if (!noteModal) return;
    setPaymentsMap(prev => ({
      ...prev,
      [currentEvent.id]: {
        ...(prev[currentEvent.id] || {}),
        [noteModal.id]: { ...(prev[currentEvent.id]?.[noteModal.id] || {}), note: noteText }
      }
    }));
    setNoteModal(null);
    setNoteText('');
  };

  /* ---- Create Event ---- */
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

  /* ---- Create Member ---- */
  const createMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;
    setMembers(prev => [...prev, { id: String(Date.now()), seq: prev.length + 1, name: newMember.name.trim(), family: newMember.family }]);
    setIsAddMemberOpen(false);
    setNewMember({ name: '', family: families[0] || '' });
  };

  /* ---- Reset ---- */
  const handleReset = () => {
    if (!window.confirm('هل أنت متأكد من إعادة ضبط جميع البيانات؟')) return;
    localStorage.clear();
    setEvents([DEFAULT_EVENT]);
    setActiveEventId(DEFAULT_EVENT.id);
    setMembers(INITIAL_MEMBERS);
    setPaymentsMap({ [DEFAULT_EVENT.id]: {} });
  };

  /* ---- Filtered Members ---- */
  const filtered = useMemo(() => {
    return members.filter(m => {
      if (selectedFamily !== 'ALL' && m.family !== selectedFamily) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        if (!m.name.toLowerCase().includes(q) && String(m.seq) !== q && !m.family.toLowerCase().includes(q)) return false;
      }
      const isPaid = !!currentPayments[m.id]?.paid;
      if (paymentFilter === 'PAID' && !isPaid) return false;
      if (paymentFilter === 'UNPAID' && isPaid) return false;
      return true;
    });
  }, [members, selectedFamily, searchTerm, paymentFilter, currentPayments]);

  /* ---- Stats ---- */
  const stats = useMemo(() => {
    const total = members.length;
    let paid = 0;
    members.forEach(m => { if (currentPayments[m.id]?.paid) paid++; });
    const unpaid = total - paid;
    const amt = currentEvent.amountPerMember || 0;
    return {
      total, paid, unpaid,
      amt,
      collected: paid * amt,
      target: total * amt,
      remaining: unpaid * amt,
      pct: total > 0 ? Math.round((paid / total) * 100) : 0
    };
  }, [members, currentPayments, currentEvent]);

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div dir="rtl" className="min-h-screen pb-20">

      {/* ===== BACKGROUND DECORATIONS ===== */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full bg-amber-600/[0.04] blur-[120px]"></div>
        <div className="absolute bottom-[-300px] left-[-200px] w-[500px] h-[500px] rounded-full bg-blue-600/[0.03] blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-600/[0.02] blur-[160px]"></div>
      </div>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 glass no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">

            {/* Brand */}
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl animated-gradient p-[2px]">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 pulse-ring"></div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gradient-gold font-cairo">
                  تطبيق تحصيل وتأشير دفع العشيرة
                </h1>
                <p className="text-[11px] text-slate-400 font-semibold tracking-wide">
                  نظام السداد والفراض والمناسبات الاجتماعية العامة
                </p>
              </div>
            </div>

            {/* Actions Row */}
            <div className="flex flex-wrap items-center gap-2">

              {/* Event Selector */}
              <div className="flex items-center gap-2 glass-light rounded-xl px-3 py-2">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <select
                  value={activeEventId}
                  onChange={e => setActiveEventId(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-200 focus:outline-none cursor-pointer max-w-[200px]"
                >
                  {events.map(evt => (
                    <option key={evt.id} value={evt.id} className="bg-slate-900">{evt.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </div>

              <button onClick={() => setIsAddEventOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold glass-light rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all cursor-pointer">
                <Plus className="w-4 h-4" /> مناسبة جديدة
              </button>

              <button onClick={() => setIsAddMemberOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold glass-light rounded-xl text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 transition-all cursor-pointer">
                <UserPlus className="w-4 h-4" /> إضافة فرد
              </button>

              <button onClick={() => setIsPrintOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold glass-light rounded-xl text-sky-300 hover:text-sky-200 hover:bg-sky-500/10 transition-all cursor-pointer">
                <Printer className="w-4 h-4" /> طباعة
              </button>

              <button onClick={handleReset} title="إعادة ضبط" className="p-2 text-slate-500 hover:text-rose-400 glass-light rounded-xl transition-all">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 no-print">

        {/* ---- Event Banner ---- */}
        <div className="relative glass rounded-3xl p-6 mb-8 overflow-hidden glow-amber">
          {/* Decorative corner */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/[0.06] rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-500/[0.04] rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold mb-3 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> المناسبة النشطة
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-cairo mb-2">{currentEvent.name}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span>المبلغ المستحق: <strong className="text-amber-400 font-cairo">{formatIQD(stats.amt)}</strong></span>
                {currentEvent.notes && <span className="text-slate-500">• {currentEvent.notes}</span>}
              </div>
            </div>

            {/* Progress Ring */}
            <div className="glass-light rounded-2xl p-4 min-w-[250px]">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">نسبة الاستيفاء</span>
                <span className="text-amber-400 font-cairo text-base">{stats.pct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${stats.pct}%`,
                    background: 'linear-gradient(90deg, #d97706, #f59e0b, #10b981)'
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-semibold">
                <span>المحصّل: {formatIQD(stats.collected)}</span>
                <span>المستهدف: {formatIQD(stats.target)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---- Stats Grid ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} iconColor="text-sky-400" iconBg="bg-sky-500/10" label="إجمالي الأفراد" value={stats.total} sub={`في ${families.length} عائلة`} />
          <StatCard icon={CheckCircle2} iconColor="text-emerald-400" iconBg="bg-emerald-500/10" label="الواصلون" value={stats.paid} sub={`${stats.pct}% من المجموع`} glowClass="glow-emerald" />
          <StatCard icon={XCircle} iconColor="text-rose-400" iconBg="bg-rose-500/10" label="المتبقون" value={stats.unpaid} sub={`المتبقي: ${formatIQD(stats.remaining)}`} glowClass="glow-rose" />
          <StatCard icon={Wallet} iconColor="text-amber-400" iconBg="bg-amber-500/10" label="المحصّل" value={formatIQD(stats.collected)} sub={`من ${formatIQD(stats.target)}`} glowClass="glow-amber" />
        </div>

        {/* ---- Filter Bar ---- */}
        <div className="glass rounded-2xl p-4 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">

            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو التسلسل أو العائلة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl pr-10 pl-10 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:bg-slate-900/80 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">

              {/* Family */}
              <select
                value={selectedFamily}
                onChange={e => setSelectedFamily(e.target.value)}
                className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900">كل العوائل ({families.length})</option>
                {families.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
              </select>

              {/* Status Tabs */}
              <div className="flex items-center bg-slate-900/60 border border-slate-700/50 rounded-xl p-1">
                {[
                  { key: 'ALL', label: `الكل (${members.length})`, active: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
                  { key: 'PAID', label: `واصل (${stats.paid})`, active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
                  { key: 'UNPAID', label: `متبقي (${stats.unpaid})`, active: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setPaymentFilter(tab.key)}
                    className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      paymentFilter === tab.key ? `${tab.active} border` : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-900/60 border border-slate-700/50 rounded-xl p-1">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-800 text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Family Batch Action */}
          {selectedFamily !== 'ALL' && (
            <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                عائلة <strong className="text-amber-400">{selectedFamily}</strong> — {filtered.length} فرد
              </span>
              <button
                onClick={() => markFamilyPaid(selectedFamily)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 rounded-lg hover:bg-emerald-500/20 text-xs font-bold transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> تأشير الكل واصل
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-semibold text-slate-500">
            عرض <span className="text-amber-400 font-cairo">{filtered.length}</span> فرد من أصل <span className="text-slate-300">{members.length}</span>
          </p>
        </div>

        {/* ---- GRID VIEW ---- */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                paymentInfo={currentPayments[m.id]}
                onToggle={togglePayment}
                onNote={(member, note) => { setNoteModal(member); setNoteText(note); }}
              />
            ))}
          </div>
        )}

        {/* ---- TABLE VIEW ---- */}
        {viewMode === 'table' && (
          <div className="glass rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-700/40">
                    <th className="px-4 py-3.5 text-center w-14">ت</th>
                    <th className="px-4 py-3.5">الاسم</th>
                    <th className="px-4 py-3.5">العائلة</th>
                    <th className="px-4 py-3.5 text-center">الحالة</th>
                    <th className="px-4 py-3.5">التاريخ</th>
                    <th className="px-4 py-3.5">ملاحظات</th>
                    <th className="px-4 py-3.5 text-center w-28">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filtered.map(m => {
                    const pi = currentPayments[m.id];
                    const isPaid = !!pi?.paid;
                    return (
                      <tr key={m.id} className={`hover:bg-slate-800/30 transition-colors ${isPaid ? 'bg-emerald-950/10' : ''}`}>
                        <td className="px-4 py-3 text-center font-bold text-slate-500 font-cairo">{m.seq}</td>
                        <td className="px-4 py-3 font-bold text-white">{m.name}</td>
                        <td className="px-4 py-3 text-amber-300/80 font-semibold text-xs">{m.family}</td>
                        <td className="px-4 py-3 text-center">
                          {isPaid
                            ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold"><Check className="w-3 h-3" /> واصل</span>
                            : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-bold">لم يدفع</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{pi?.date || '—'}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{pi?.note || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePayment(m.id)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                              isPaid
                                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/25 hover:bg-rose-500/20'
                                : 'bg-emerald-500 text-emerald-950 font-extrabold hover:bg-emerald-400'
                            }`}
                          >
                            {isPaid ? 'إلغاء' : 'تأشير واصل'}
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

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-20 glass rounded-2xl">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300 mb-1 font-cairo">لا يوجد نتائج</h3>
            <p className="text-sm text-slate-500">جرّب تعديل خيارات البحث أو الفلاتر</p>
          </div>
        )}
      </main>

      {/* =============== MODALS =============== */}

      {/* Modal: New Event */}
      {isAddEventOpen && (
        <Modal onClose={() => setIsAddEventOpen(false)}>
          <ModalHeader icon={<Plus className="w-5 h-5" />} color="text-amber-400" title="مناسبة أو فريضة جديدة" />
          <form onSubmit={createEvent} className="space-y-4 mt-5">
            <Field label="اسم المناسبة / الفريضة">
              <input required placeholder="مثال: فريضة زواج ..." value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} className="input-field" />
            </Field>
            <Field label="المبلغ لكل فرد (د.ع)">
              <input type="number" required step="1000" value={newEvent.amountPerMember} onChange={e => setNewEvent({ ...newEvent, amountPerMember: e.target.value })} className="input-field" />
            </Field>
            <Field label="ملاحظات">
              <textarea rows="2" placeholder="تفاصيل إضافية..." value={newEvent.notes} onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })} className="input-field resize-none"></textarea>
            </Field>
            <ModalActions onCancel={() => setIsAddEventOpen(false)} submitLabel="إنشاء المناسبة" submitClass="bg-amber-500 hover:bg-amber-400 text-slate-950" />
          </form>
        </Modal>
      )}

      {/* Modal: New Member */}
      {isAddMemberOpen && (
        <Modal onClose={() => setIsAddMemberOpen(false)}>
          <ModalHeader icon={<UserPlus className="w-5 h-5" />} color="text-emerald-400" title="إضافة فرد جديد" />
          <form onSubmit={createMember} className="space-y-4 mt-5">
            <Field label="الاسم الثلاثي أو الرباعي">
              <input required placeholder="مثال: علي حسن سعيد ..." value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="input-field" />
            </Field>
            <Field label="العائلة">
              <select value={newMember.family} onChange={e => setNewMember({ ...newMember, family: e.target.value })} className="input-field cursor-pointer">
                {families.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <ModalActions onCancel={() => setIsAddMemberOpen(false)} submitLabel="إضافة الفرد" submitClass="bg-emerald-500 hover:bg-emerald-400 text-emerald-950" />
          </form>
        </Modal>
      )}

      {/* Modal: Note */}
      {noteModal && (
        <Modal onClose={() => setNoteModal(null)}>
          <ModalHeader icon={<Edit3 className="w-5 h-5" />} color="text-amber-400" title={`ملاحظة: ${noteModal.name}`} />
          <div className="mt-5 space-y-4">
            <textarea rows="3" placeholder="أدخل ملاحظة السداد..." value={noteText} onChange={e => setNoteText(e.target.value)} className="input-field resize-none"></textarea>
            <ModalActions onCancel={() => setNoteModal(null)} submitLabel="حفظ" submitClass="bg-amber-500 hover:bg-amber-400 text-slate-950" onSubmit={saveNote} />
          </div>
        </Modal>
      )}

      {/* Modal: Print Preview */}
      {isPrintOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl flex items-center justify-between mb-6 no-print">
            <h3 className="text-lg font-bold text-slate-200 font-cairo">معاينة الكشف الرسمي</h3>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-emerald-950 font-black text-xs rounded-xl shadow-lg hover:bg-emerald-400 transition-all cursor-pointer">
                <Printer className="w-4 h-4" /> طباعة
              </button>
              <button onClick={() => setIsPrintOpen(false)} className="px-4 py-2 glass-light text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-800 transition-all">
                إغلاق
              </button>
            </div>
          </div>

          {/* Printable Sheet */}
          <div className="print-container w-full max-w-4xl bg-white text-slate-950 rounded-2xl p-8 sm:p-12 shadow-2xl text-right">
            <div className="border-b-2 border-slate-900 pb-6 mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-950 mb-1 font-cairo">كشف تحصيل وسداد العشيرة</h1>
                <p className="text-sm font-bold text-slate-700">المناسبة: {currentEvent.name}</p>
                <p className="text-xs text-slate-500 mt-1">تاريخ الكشف: {new Date().toLocaleDateString('ar-IQ')}</p>
              </div>
              <div className="text-left border-r-2 border-slate-300 pr-4">
                <p className="text-xs font-bold text-slate-500">المبلغ / الفرد:</p>
                <p className="text-lg font-black text-slate-950 font-cairo">{formatIQD(stats.amt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6 bg-slate-100 p-4 rounded-xl text-center border border-slate-300">
              <div><p className="text-[10px] font-bold text-slate-500">الأفراد</p><p className="text-lg font-black">{stats.total}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500">الواصلون</p><p className="text-lg font-black text-emerald-700">{stats.paid}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500">المتبقون</p><p className="text-lg font-black text-rose-700">{stats.unpaid}</p></div>
              <div><p className="text-[10px] font-bold text-slate-500">المحصّل</p><p className="text-base font-black text-amber-700">{formatIQD(stats.collected)}</p></div>
            </div>

            <table className="w-full text-right text-xs border border-slate-400 mb-8">
              <thead>
                <tr className="bg-slate-200 text-slate-950 font-bold border-b border-slate-400">
                  <th className="p-2 border-l border-slate-400 text-center w-10">ت</th>
                  <th className="p-2 border-l border-slate-400">الاسم</th>
                  <th className="p-2 border-l border-slate-400">العائلة</th>
                  <th className="p-2 border-l border-slate-400 text-center w-20">الحالة</th>
                  <th className="p-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const pi = currentPayments[m.id];
                  const isPaid = !!pi?.paid;
                  return (
                    <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-2 border-l border-t border-slate-300 text-center font-bold">{m.seq}</td>
                      <td className="p-2 border-l border-t border-slate-300 font-bold">{m.name}</td>
                      <td className="p-2 border-l border-t border-slate-300">{m.family}</td>
                      <td className="p-2 border-l border-t border-slate-300 text-center font-bold">
                        {isPaid ? <span className="text-emerald-700">✓ واصل</span> : <span className="text-rose-700">✗</span>}
                      </td>
                      <td className="p-2 border-t border-slate-300 text-slate-600">{pi?.note || pi?.date || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex justify-between items-end pt-8 mt-8 border-t border-slate-300">
              <div className="text-center"><p className="text-xs font-bold text-slate-500 mb-10">توقيع مسؤول التحصيل</p><p className="text-xs text-slate-400">..............................</p></div>
              <div className="text-center"><p className="text-xs font-bold text-slate-500 mb-10">ختم وتوقيع الإدارة</p><p className="text-xs text-slate-400">..............................</p></div>
            </div>
          </div>
        </div>
      )}

      {/* Global style for input-field class */}
      <style>{`
        .input-field {
          width: 100%;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(51, 65, 85, 0.5);
          border-radius: 12px;
          padding: 10px 14px;
          font-size: 14px;
          color: #e2e8f0;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Tajawal', sans-serif;
        }
        .input-field:focus {
          border-color: rgba(245, 158, 11, 0.5);
        }
        .input-field::placeholder {
          color: #475569;
        }
      `}</style>
    </div>
  );
}

/* ===== REUSABLE MODAL SHELL ===== */
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-2xl w-full max-w-md p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute left-4 top-4 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ icon, color, title }) {
  return (
    <h3 className={`text-lg font-black ${color} flex items-center gap-2 font-cairo`}>
      {icon} {title}
    </h3>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, submitLabel, submitClass, onSubmit }) {
  return (
    <div className="flex justify-end gap-2 pt-3">
      <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-bold glass-light text-slate-300 rounded-xl hover:bg-slate-800 transition-all">إلغاء</button>
      {onSubmit ? (
        <button type="button" onClick={onSubmit} className={`px-5 py-2 text-xs font-black rounded-xl shadow-lg transition-all ${submitClass}`}>{submitLabel}</button>
      ) : (
        <button type="submit" className={`px-5 py-2 text-xs font-black rounded-xl shadow-lg transition-all ${submitClass}`}>{submitLabel}</button>
      )}
    </div>
  );
}
