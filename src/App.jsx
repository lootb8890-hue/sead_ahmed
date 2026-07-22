import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  RotateCcw,
  Users,
  Wallet,
  Calendar,
  TrendingUp,
  UserPlus,
  FileText,
  Check,
  Building2,
  Sparkles,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  X,
  Edit3,
  LayoutGrid,
  ListFilter,
  Clock
} from 'lucide-react';
import { INITIAL_FAMILIES, INITIAL_MEMBERS, DEFAULT_EVENT } from './data/initialData';

export default function App() {
  // --- Persistent States ---
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('saed_events');
    return saved ? JSON.parse(saved) : [DEFAULT_EVENT];
  });

  const [activeEventId, setActiveEventId] = useState(() => {
    const saved = localStorage.getItem('saed_active_event_id');
    return saved || DEFAULT_EVENT.id;
  });

  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('saed_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [families, setFamilies] = useState(() => {
    const saved = localStorage.getItem('saed_families');
    return saved ? JSON.parse(saved) : INITIAL_FAMILIES;
  });

  // Map structure: { [eventId]: { [memberId]: { paid: boolean, date: string, note: string } } }
  const [paymentsMap, setPaymentsMap] = useState(() => {
    const saved = localStorage.getItem('saed_payments_map');
    if (saved) return JSON.parse(saved);
    // Initialize default event payments if available
    return {
      [DEFAULT_EVENT.id]: {}
    };
  });

  // --- UI States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL'); // 'ALL' | 'PAID' | 'UNPAID'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [noteModalMember, setNoteModalMember] = useState(null);
  const [noteText, setNoteText] = useState('');

  // Forms
  const [newEvent, setNewEvent] = useState({
    name: '',
    amountPerMember: 25000,
    notes: ''
  });

  const [newMember, setNewMember] = useState({
    name: '',
    family: INITIAL_FAMILIES[0] || ''
  });

  // --- Save to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('saed_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('saed_active_event_id', activeEventId);
  }, [activeEventId]);

  useEffect(() => {
    localStorage.setItem('saed_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('saed_families', JSON.stringify(families));
  }, [families]);

  useEffect(() => {
    localStorage.setItem('saed_payments_map', JSON.stringify(paymentsMap));
  }, [paymentsMap]);

  // Current active event
  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === activeEventId) || events[0] || DEFAULT_EVENT;
  }, [events, activeEventId]);

  // Current event payments
  const currentPayments = useMemo(() => {
    return paymentsMap[currentEvent.id] || {};
  }, [paymentsMap, currentEvent.id]);

  // --- Confetti helper ---
  const triggerConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  // --- Toggle Payment Handler ---
  const togglePayment = (memberId) => {
    const isCurrentlyPaid = !!currentPayments[memberId]?.paid;
    const newPaidStatus = !isCurrentlyPaid;

    if (newPaidStatus) {
      triggerConfetti();
    }

    setPaymentsMap((prev) => {
      const eventMap = prev[currentEvent.id] || {};
      const updatedEventMap = {
        ...eventMap,
        [memberId]: {
          paid: newPaidStatus,
          date: newPaidStatus ? new Date().toLocaleDateString('ar-IQ') : '',
          note: eventMap[memberId]?.note || ''
        }
      };

      return {
        ...prev,
        [currentEvent.id]: updatedEventMap
      };
    });
  };

  // --- Mark entire family as paid ---
  const markFamilyPaid = (familyName) => {
    const familyMemberIds = members
      .filter((m) => m.family === familyName)
      .map((m) => m.id);

    triggerConfetti();

    setPaymentsMap((prev) => {
      const eventMap = { ...(prev[currentEvent.id] || {}) };
      familyMemberIds.forEach((id) => {
        eventMap[id] = {
          paid: true,
          date: new Date().toLocaleDateString('ar-IQ'),
          note: eventMap[id]?.note || 'تأشير عائلي'
        };
      });
      return { ...prev, [currentEvent.id]: eventMap };
    });
  };

  // --- Add Note Handler ---
  const saveMemberNote = () => {
    if (!noteModalMember) return;
    setPaymentsMap((prev) => {
      const eventMap = prev[currentEvent.id] || {};
      return {
        ...prev,
        [currentEvent.id]: {
          ...eventMap,
          [noteModalMember.id]: {
            ...eventMap[noteModalMember.id],
            note: noteText
          }
        }
      };
    });
    setNoteModalMember(null);
    setNoteText('');
  };

  // --- Add New Event Handler ---
  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.name.trim()) return;

    const created = {
      id: `evt_${Date.now()}`,
      name: newEvent.name.trim(),
      date: new Date().toISOString().split('T')[0],
      amountPerMember: Number(newEvent.amountPerMember) || 0,
      notes: newEvent.notes.trim()
    };

    setEvents((prev) => [created, ...prev]);
    setActiveEventId(created.id);
    setPaymentsMap((prev) => ({ ...prev, [created.id]: {} }));
    setIsAddEventModalOpen(false);
    setNewEvent({ name: '', amountPerMember: 25000, notes: '' });
  };

  // --- Add New Member Handler ---
  const handleCreateMember = (e) => {
    e.preventDefault();
    if (!newMember.name.trim()) return;

    const newId = String(Date.now());
    const nextSeq = members.length + 1;

    const created = {
      id: newId,
      seq: nextSeq,
      name: newMember.name.trim(),
      family: newMember.family
    };

    setMembers((prev) => [...prev, created]);
    setIsAddMemberModalOpen(false);
    setNewMember({ name: '', family: families[0] || '' });
  };

  // --- Reset All Data ---
  const handleResetData = () => {
    if (window.confirm('هل أنت تأكيد من إعادة ضبط جميع البيانات إلى الحالة الافتراضية؟')) {
      localStorage.clear();
      setEvents([DEFAULT_EVENT]);
      setActiveEventId(DEFAULT_EVENT.id);
      setMembers(INITIAL_MEMBERS);
      setFamilies(INITIAL_FAMILIES);
      setPaymentsMap({ [DEFAULT_EVENT.id]: {} });
    }
  };

  // --- Filtered Members ---
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Family filter
      if (selectedFamily !== 'ALL' && m.family !== selectedFamily) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(query);
        const matchSeq = String(m.seq) === query;
        const matchFamily = m.family.toLowerCase().includes(query);
        if (!matchName && !matchSeq && !matchFamily) return false;
      }

      // Payment Status filter
      const isPaid = !!currentPayments[m.id]?.paid;
      if (paymentFilter === 'PAID' && !isPaid) return false;
      if (paymentFilter === 'UNPAID' && isPaid) return false;

      return true;
    });
  }, [members, selectedFamily, searchTerm, paymentFilter, currentPayments]);

  // --- Summary Computations ---
  const stats = useMemo(() => {
    const totalMembersCount = members.length;
    let paidCount = 0;

    members.forEach((m) => {
      if (currentPayments[m.id]?.paid) {
        paidCount += 1;
      }
    });

    const unpaidCount = totalMembersCount - paidCount;
    const amountPerHead = currentEvent.amountPerMember || 0;
    const totalCollected = paidCount * amountPerHead;
    const totalTarget = totalMembersCount * amountPerHead;
    const totalRemaining = unpaidCount * amountPerHead;
    const paidPercentage = totalMembersCount > 0 ? Math.round((paidCount / totalMembersCount) * 100) : 0;

    return {
      totalMembersCount,
      paidCount,
      unpaidCount,
      amountPerHead,
      totalCollected,
      totalTarget,
      totalRemaining,
      paidPercentage
    };
  }, [members, currentPayments, currentEvent]);

  // Format Iraqi Dinar
  const formatIQD = (val) => {
    return new Intl.NumberFormat('ar-IQ').format(val) + ' د.ع';
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 font-tajawal pb-16 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">
                  تطبيق تحصيل وتأشير دفع العشيرة
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  نظام السداد والفراض والمناسبات الاجتماعية العامة
                </p>
              </div>
            </div>

            {/* Event Selector & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <select
                  value={activeEventId}
                  onChange={(e) => setActiveEventId(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id} className="bg-slate-900 text-slate-200">
                      {evt.name} ({formatIQD(evt.amountPerMember)})
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setIsAddEventModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                مناسبة جديدة
              </button>

              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                إضافة فرد
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-xl hover:bg-emerald-600/30 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                طباعة الكشف
              </button>

              <button
                onClick={handleResetData}
                title="إعادة ضبط البيانات"
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 no-print">

        {/* Event Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 mb-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                المناسبة النشطة حالياً
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-1">{currentEvent.name}</h2>
              <p className="text-sm text-slate-400">
                المبلغ المستحق لكل فرد: <span className="font-bold text-amber-400">{formatIQD(currentEvent.amountPerMember)}</span>
                {currentEvent.notes && <span className="mr-3 text-slate-400">({currentEvent.notes})</span>}
              </p>
            </div>

            {/* Quick Progress Indicator */}
            <div className="w-full md:w-64 bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-400">نسبة الاستيفاء الحالية</span>
                <span className="text-amber-400">{stats.paidPercentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${stats.paidPercentage}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-medium">
                <span>المحصل: {formatIQD(stats.totalCollected)}</span>
                <span>المستهدف: {formatIQD(stats.totalTarget)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          {/* Card 1: Total Members */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">إجمالي الأفراد</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-white">{stats.totalMembersCount}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">موزعون على {families.length} عوائل</div>
          </div>

          {/* Card 2: Paid Members */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400">الواصلون (تم التأشير)</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-300">{stats.paidCount}</div>
            <div className="text-[11px] text-emerald-400/80 mt-1 font-medium">
              نسبة {stats.paidPercentage}% من المجموع
            </div>
          </div>

          {/* Card 3: Unpaid Members */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400">المتبقون (لم يدفعوا)</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-300">{stats.unpaidCount}</div>
            <div className="text-[11px] text-rose-400/80 mt-1 font-medium">
              المتبقي: {formatIQD(stats.totalRemaining)}
            </div>
          </div>

          {/* Card 4: Total Money Collected */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-400">المجموع المحصل</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-300">{formatIQD(stats.totalCollected)}</div>
            <div className="text-[11px] text-amber-400/80 mt-1 font-medium">
              من أصل {formatIQD(stats.totalTarget)}
            </div>
          </div>

        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث بالاسم، التسلسل، أو اسم العائلة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/60 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns & Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Family Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <select
                  value={selectedFamily}
                  onChange={(e) => setSelectedFamily(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL" className="bg-slate-900">كل العوائل ({families.length})</option>
                  {families.map((fam) => (
                    <option key={fam} value={fam} className="bg-slate-900">
                      {fam}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setPaymentFilter('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    paymentFilter === 'ALL'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  الكل ({members.length})
                </button>
                <button
                  onClick={() => setPaymentFilter('PAID')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    paymentFilter === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  واصل ({stats.paidCount})
                </button>
                <button
                  onClick={() => setPaymentFilter('UNPAID')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    paymentFilter === 'UNPAID'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  غير واصل ({stats.unpaidCount})
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  title="عرض بطاقات"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="عرض جدول"
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table' ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ListFilter className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>

          {/* Quick Family Batch Action */}
          {selectedFamily !== 'ALL' && (
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                تصفية عائلة: <span className="font-bold text-amber-400">{selectedFamily}</span> ({filteredMembers.length} أفراد)
              </span>
              <button
                onClick={() => markFamilyPaid(selectedFamily)}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 font-bold transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                تأشير كافة عائلة ({selectedFamily}) كواصل
              </button>
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-xs font-semibold text-slate-400">
            عرض <span className="font-bold text-amber-400">{filteredMembers.length}</span> فرد من أصل <span className="font-bold text-slate-200">{members.length}</span>
          </p>
        </div>

        {/* GRID VIEW */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => {
              const paymentInfo = currentPayments[member.id];
              const isPaid = !!paymentInfo?.paid;

              return (
                <div
                  key={member.id}
                  className={`relative group rounded-2xl border p-4 transition-all duration-200 ${
                    isPaid
                      ? 'bg-emerald-950/20 border-emerald-800/60 shadow-lg shadow-emerald-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300">
                        {member.seq}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-100 text-base leading-tight">
                          {member.name}
                        </h3>
                        <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800/80 text-amber-300 border border-slate-700/60">
                          {member.family}
                        </span>
                      </div>
                    </div>

                    {/* Paid/Unpaid Badge */}
                    <button
                      onClick={() => togglePayment(member.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-md ${
                        isPaid
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-500" />
                          واصل
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-rose-400" />
                          تأشير واصل
                        </>
                      )}
                    </button>
                  </div>

                  {/* Payment Metadata & Note */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-2">
                      {isPaid && paymentInfo?.date && (
                        <span className="flex items-center gap-1 text-emerald-400/90 font-medium">
                          <Clock className="w-3 h-3" />
                          {paymentInfo.date}
                        </span>
                      )}
                      {paymentInfo?.note && (
                        <span className="truncate max-w-[140px] text-amber-300/90 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                          ملاحظة: {paymentInfo.note}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setNoteModalMember(member);
                        setNoteText(paymentInfo?.note || '');
                      }}
                      className="text-slate-400 hover:text-amber-400 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      {paymentInfo?.note ? 'تعديل' : 'ملاحظة'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-950 text-slate-400 text-xs font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-center">التسلسل</th>
                    <th className="px-4 py-3">الاسم الكامل</th>
                    <th className="px-4 py-3">العائلة</th>
                    <th className="px-4 py-3 text-center">حالة السداد</th>
                    <th className="px-4 py-3">تاريخ الدفع</th>
                    <th className="px-4 py-3">ملاحظات</th>
                    <th className="px-4 py-3 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredMembers.map((member) => {
                    const paymentInfo = currentPayments[member.id];
                    const isPaid = !!paymentInfo?.paid;

                    return (
                      <tr
                        key={member.id}
                        className={`hover:bg-slate-850/50 transition-colors ${
                          isPaid ? 'bg-emerald-950/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-center font-bold text-slate-400">{member.seq}</td>
                        <td className="px-4 py-3 font-bold text-slate-100">{member.name}</td>
                        <td className="px-4 py-3 text-amber-300 font-semibold">{member.family}</td>
                        <td className="px-4 py-3 text-center">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                              <Check className="w-3.5 h-3.5" /> واصل
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold">
                              لم يدفع
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{paymentInfo?.date || '-'}</td>
                        <td className="px-4 py-3 text-slate-300 text-xs">{paymentInfo?.note || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => togglePayment(member.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              isPaid
                                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400'
                            }`}
                          >
                            {isPaid ? 'إلغاء التأشير' : 'تأشير واصل'}
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

        {filteredMembers.length === 0 && (
          <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300 mb-1">لا يوجد أفراد يطابقون خيارات البحث</h3>
            <p className="text-xs text-slate-500">جرب تغيير شريط البحث أو الفلاتر المحددة</p>
          </div>
        )}
      </main>

      {/* MODAL 1: CREATE NEW EVENT */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddEventModalOpen(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-amber-400 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              إنشاء مناسبة أو فريضة جديدة
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم المناسبة / الفريضة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فريضة زواج ابن السيد ناصح..."
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">المبلغ المطلوب لكل فرد (بالدينار العراقي)</label>
                <input
                  type="number"
                  required
                  step="1000"
                  value={newEvent.amountPerMember}
                  onChange={(e) => setNewEvent({ ...newEvent, amountPerMember: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات إضافية</label>
                <textarea
                  rows="3"
                  placeholder="ملاحظات أو تفاصيل حول الاستيفاء..."
                  value={newEvent.notes}
                  onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400"
                >
                  حفظ وإنشاء المناسبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW MEMBER */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddMemberModalOpen(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-emerald-400 mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              إضافة فرد جديد للعشيرة
            </h3>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">الاسم الثلاثي أو الرباعي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: علي حسن سعيد مغيطي..."
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">العائلة</label>
                <select
                  value={newMember.family}
                  onChange={(e) => setNewMember({ ...newMember, family: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  {families.map((fam) => (
                    <option key={fam} value={fam}>
                      {fam}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-black bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400"
                >
                  إضافة الفرد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MEMBER NOTE */}
      {noteModalMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setNoteModalMember(null)}
              className="absolute left-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-amber-400 mb-2">
              إضافة ملاحظة سداد: {noteModalMember.name}
            </h3>

            <div className="space-y-4">
              <textarea
                rows="3"
                placeholder="أدخل ملاحظة السداد (مثال: دُفع تحويل زين كاش، دُفع عن طريق فلان)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              ></textarea>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setNoteModalMember(null)}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveMemberNote}
                  className="px-4 py-2 text-xs font-black bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400"
                >
                  حفظ الملاحظة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: OFFICIAL PRINTABLE REPORT MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md overflow-y-auto p-4 sm:p-8 flex flex-col items-center">
          
          {/* Controls Bar for Printing */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-6 no-print">
            <h3 className="text-lg font-bold text-slate-200">معاينة الكشف الرسمي للطباعة</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:bg-emerald-400 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                طباعة الآن
              </button>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-700 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>

          {/* Printable Sheet (White Document Style) */}
          <div className="print-container w-full max-w-4xl bg-white text-slate-950 rounded-2xl p-8 sm:p-12 shadow-2xl border border-slate-200 text-right">
            
            {/* Header Document */}
            <div className="border-b-2 border-slate-950 pb-6 mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-950 mb-1">كشف تحصيل وسداد العشيرة الرسمي</h1>
                <p className="text-sm font-bold text-slate-700">المناسبة / الفريضة: {currentEvent.name}</p>
                <p className="text-xs text-slate-600 font-semibold mt-1">تاريخ الكشف: {new Date().toLocaleDateString('ar-IQ')}</p>
              </div>
              <div className="text-left border-r-2 border-slate-300 pr-4">
                <p className="text-xs font-bold text-slate-600">المبلغ المستحق / الفرد:</p>
                <p className="text-lg font-black text-slate-950">{formatIQD(currentEvent.amountPerMember)}</p>
              </div>
            </div>

            {/* Print Summary Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6 bg-slate-100 p-4 rounded-xl text-center border border-slate-300">
              <div>
                <p className="text-xs font-bold text-slate-600">عدد الأفراد</p>
                <p className="text-lg font-black text-slate-950">{stats.totalMembersCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600">الواصلون</p>
                <p className="text-lg font-black text-emerald-700">{stats.paidCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600">المتأخرون</p>
                <p className="text-lg font-black text-rose-700">{stats.unpaidCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600">إجمالي المحصل</p>
                <p className="text-lg font-black text-amber-700">{formatIQD(stats.totalCollected)}</p>
              </div>
            </div>

            {/* Print Table */}
            <table className="w-full text-right text-xs border border-slate-400 mb-8">
              <thead>
                <tr className="bg-slate-200 text-slate-950 font-bold border-b border-slate-400">
                  <th className="p-2 border-l border-slate-400 text-center w-12">ت</th>
                  <th className="p-2 border-l border-slate-400">الاسم الكامل</th>
                  <th className="p-2 border-l border-slate-400">العائلة</th>
                  <th className="p-2 border-l border-slate-400 text-center w-24">حالة السداد</th>
                  <th className="p-2">ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, idx) => {
                  const paymentInfo = currentPayments[m.id];
                  const isPaid = !!paymentInfo?.paid;

                  return (
                    <tr key={m.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-2 border-l border-t border-slate-300 text-center font-bold">{m.seq}</td>
                      <td className="p-2 border-l border-t border-slate-300 font-bold">{m.name}</td>
                      <td className="p-2 border-l border-t border-slate-300 font-semibold">{m.family}</td>
                      <td className="p-2 border-l border-t border-slate-300 text-center font-bold">
                        {isPaid ? (
                          <span className="text-emerald-700">واصل</span>
                        ) : (
                          <span className="text-rose-700">لم يدفع</span>
                        )}
                      </td>
                      <td className="p-2 border-t border-slate-300 text-slate-700">
                        {paymentInfo?.note || paymentInfo?.date || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-8 mt-8 border-t border-slate-300">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-600 mb-8">توقيع مسؤول التحصيل</p>
                <p className="text-xs text-slate-400">..............................</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-slate-600 mb-8">ختم وتوقيع إدارة العشيرة</p>
                <p className="text-xs text-slate-400">..............................</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
