import React, { useState } from 'react';
import { 
  HelpCircle, 
  MessageSquare, 
  ThumbsUp, 
  CheckCircle2, 
  Plus, 
  Search, 
  Smartphone, 
  Cpu
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HelpPost } from '../../types';

export const TechHelpView: React.FC = () => {
  const { helpPosts, addHelpPost, addHelpReply, currentTech } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<HelpPost | null>(null);

  // Form states
  const [deviceBrand, setDeviceBrand] = useState('Apple');
  const [deviceModel, setDeviceModel] = useState('iPhone 14 Pro');
  const [title, setTitle] = useState('');
  const [problemDetails, setProblemDetails] = useState('');
  const [replyText, setReplyText] = useState('');

  const sampleSchematic = 'https://images.pexels.com/photos/9242280/pexels-photo-9242280.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940';

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problemDetails.trim()) return;

    addHelpPost(
      title,
      problemDetails,
      deviceBrand,
      deviceModel,
      ['Schematic', 'Micro-Soldering', deviceModel],
      sampleSchematic
    );

    setShowPostModal(false);
    setTitle('');
    setProblemDetails('');
  };

  const handleSendReply = () => {
    if (!selectedPost || !replyText.trim()) return;
    addHelpReply(selectedPost.id, replyText);
    
    // update local modal view
    setSelectedPost({
      ...selectedPost,
      replies: [
        ...selectedPost.replies,
        {
          id: `REP-${Date.now()}`,
          authorTechId: currentTech.id,
          authorName: currentTech.fullName,
          authorCity: currentTech.city,
          isVerified: currentTech.verificationStatus === 'verified',
          replyText: replyText,
          timestamp: 'Just now',
          upvotes: 0,
          isSolution: false
        }
      ]
    });
    setReplyText('');
  };

  const filtered = helpPosts.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.deviceModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.problemDetails.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <h1 className="font-heading font-bold text-xl text-slate-900">
              Technical Help & Schematic Board
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Ask peer technicians for board schematic line traces, jumper bypasses & PMIC power sequences
          </p>
        </div>

        <button
          data-testid="btn-ask-question"
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-heading rounded-xl shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Diagnostic Query</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            data-testid="input-search-questions"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries (e.g. PP_VDD_MAIN short, CPU reballing, backlight jumper)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-sky-500 outline-none"
          />
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        {filtered.map(post => (
          <div
            key={post.id}
            data-testid={`card-question-${post.id}`}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-sky-100 text-sky-800">
                    {post.deviceBrand} {post.deviceModel}
                  </span>
                  <span className="text-[11px] text-slate-400">{post.createdAt}</span>
                </div>
                <h3 
                  onClick={() => setSelectedPost(post)}
                  className="font-heading font-bold text-base text-slate-900 hover:text-sky-600 cursor-pointer"
                >
                  {post.title}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2">
              {post.problemDetails}
            </p>

            {post.schematicOrPhotoUrl && (
              <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200">
                <img src={post.schematicOrPhotoUrl} alt="Schematic" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Asked by <strong>{post.authorName}</strong> ({post.authorCity})</span>
              <button
                onClick={() => setSelectedPost(post)}
                className="text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{post.replies.length} Solutions & Answers</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Question Details & Answer Drawer Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                  {selectedPost.deviceBrand} {selectedPost.deviceModel}
                </span>
                <h3 className="font-heading font-bold text-sm text-white line-clamp-1">
                  {selectedPost.title}
                </h3>
              </div>
              <button onClick={() => setSelectedPost(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="space-y-2">
                <p className="text-slate-700 leading-relaxed">{selectedPost.problemDetails}</p>
                {selectedPost.schematicOrPhotoUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200">
                    <img src={selectedPost.schematicOrPhotoUrl} alt="Board" className="w-full max-h-60 object-cover" />
                  </div>
                )}
                <div className="text-[11px] text-slate-400">
                  Posted by {selectedPost.authorName} • {selectedPost.authorCity}
                </div>
              </div>

              {/* Answers List */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="font-heading font-bold text-sm text-slate-900">
                  Technician Solutions ({selectedPost.replies.length})
                </h4>

                {selectedPost.replies.map(ans => (
                  <div
                    key={ans.id}
                    className={`p-3.5 rounded-xl border space-y-1.5 ${
                      ans.isSolution 
                        ? 'bg-emerald-50/70 border-emerald-200' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <span>{ans.authorName}</span>
                        <span className="text-slate-400 font-normal">({ans.authorCity})</span>
                      </div>
                      {ans.isSolution && (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Solution
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700">{ans.replyText}</p>
                  </div>
                ))}
              </div>

              {/* Answer Input */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Post Your Technical Jumper / Schematic Solution
                </label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Explain voltage test points, capacitor short removal, or IC reballing profile..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
                <button
                  data-testid="btn-submit-answer"
                  onClick={handleSendReply}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Submit Workbench Solution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm">Ask Peer Technicians</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePost} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={deviceBrand}
                    onChange={(e) => setDeviceBrand(e.target.value)}
                    placeholder="Apple / Samsung / Poco"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Device Model *
                  </label>
                  <input
                    type="text"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    placeholder="e.g. iPhone 14 Pro"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Title / Problem Summary *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. PP_VDD_MAIN showing 0.02V short after screen replacement"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Bench Observation & Multimeter Readings *
                </label>
                <textarea
                  rows={3}
                  value={problemDetails}
                  onChange={(e) => setProblemDetails(e.target.value)}
                  placeholder="Mention thermal camera hotspot, diode readings, or coil ohm resistance..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  data-testid="btn-confirm-post-question"
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  Publish Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
