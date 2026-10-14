import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  ExternalLink, 
  Send, 
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhatsAppHubView: React.FC = () => {
  const { currentTech, chatMessages, sendChatMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [selectedTag, setSelectedTag] = useState('#UrgentPart');

  const groups = [
    {
      name: 'Mumbai Electronics Tech Council',
      city: 'Mumbai & MMR',
      members: '512 Members',
      link: 'https://chat.whatsapp.com/demo-mumbai-tech',
      description: 'Lamington Road, Grant Road & suburban workshop technicians daily spare part deals and tool exchange.'
    },
    {
      name: 'Delhi Gaffar Market & Karol Bagh Tech Guild',
      city: 'Delhi NCR',
      members: '840 Members',
      link: 'https://chat.whatsapp.com/demo-delhi-tech',
      description: 'National hub for wholesale screen imports, OCA lamination machinery, and genuine flex cables.'
    },
    {
      name: 'SP Road Bengaluru Chip-Level Association',
      city: 'Bengaluru',
      members: '620 Members',
      link: 'https://chat.whatsapp.com/demo-bengaluru-tech',
      description: 'Micro-soldering, MacBook logic board repairers, and JCID programmer tool sharing.'
    },
    {
      name: 'Ritchie Street Masters Chennai',
      city: 'Chennai & TN',
      members: '410 Members',
      link: 'https://chat.whatsapp.com/demo-chennai-tech',
      description: 'South zone certified electronics technicians mutual help and parts sourcing.'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendChatMessage(`${selectedTag} ${inputText.trim()}`, selectedTag);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Technician WhatsApp Community Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Connect directly with verified peer technicians across regional trade groups in India
          </p>
        </div>
      </div>

      {/* Grid: Groups + Live Peer Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official WhatsApp Groups */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <span>Official Regional Trade Groups</span>
          </h2>

          <div className="space-y-3">
            {groups.map((grp, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading font-bold text-xs text-slate-900">
                    {grp.name}
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {grp.members}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600">
                  {grp.description}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold">{grp.city}</span>
                  <a
                    href={grp.link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>Join Group</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: In-App Live Peer Chat Broadcast */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[560px]">
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-heading font-bold text-xs">All-India Bench Technician Live Wire</span>
            </div>
            <span className="text-[11px] text-slate-400">Encrypted peer channel</span>
          </div>

          {/* Messages scroll */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{msg.senderName}</span>
                    <span className="text-slate-400 text-[11px] font-normal">({msg.senderCity})</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    {msg.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px]">
                        {msg.badge}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-700">{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tag:</span>
              {['#UrgentPart', '#BenchTip', '#ToolAvailable', '#SchematicHelp'].map(tg => (
                <button
                  key={tg}
                  type="button"
                  onClick={() => setSelectedTag(tg)}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                    selectedTag === tg ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tg}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                data-testid="input-peer-broadcast"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Broadcast a message to verified technicians in India..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
              />
              <button
                data-testid="btn-send-peer-broadcast"
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
