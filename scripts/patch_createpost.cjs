const fs = require('fs');
let content = fs.readFileSync('src/components/CreatePost.tsx', 'utf8');

const importTarget = `import { Image as ImageIcon, Smile, MapPin, Loader2, X } from "lucide-react";`;
const importReplacement = `import { Image as ImageIcon, Smile, MapPin, Loader2, X, ChevronDown, List, ShieldAlert, FileText, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";`;

content = content.replace(importTarget, importReplacement);

const stateTarget = `  const [mediaFiles, setMediaFiles] = useState<File[]>([]);`;
const stateReplacement = `  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [postType, setPostType] = useState<"NORMAL" | "POLL" | "SENSITIVE">("NORMAL");
  const [contentWarning, setContentWarning] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [showTypeMenu, setShowTypeMenu] = useState(false);`;

content = content.replace(stateTarget, stateReplacement);

const submitTarget = `      const res = await fetchApi("/posts", {
        method: "POST",
        data: { content, media: mediaUrls, communityId }
      });`;
const submitReplacement = `      const filteredOptions = pollOptions.filter(o => o.trim());
      const res = await fetchApi("/posts", {
        method: "POST",
        data: { 
          content, 
          media: mediaUrls, 
          communityId,
          postType,
          contentWarning: postType === "SENSITIVE" ? contentWarning : undefined,
          pollOptions: postType === "POLL" ? filteredOptions : undefined
        }
      });`;

content = content.replace(submitTarget, submitReplacement);

const resetTarget = `        setContent("");
        setMediaFiles([]);`;
const resetReplacement = `        setContent("");
        setMediaFiles([]);
        setPostType("NORMAL");
        setContentWarning("");
        setPollOptions(["", ""]);`;

content = content.replace(resetTarget, resetReplacement);

const validateTarget = `disabled={loading || (!content.trim() && mediaFiles.length === 0)}`;
const validateReplacement = `disabled={loading || 
                (postType === "NORMAL" && !content.trim() && mediaFiles.length === 0) ||
                (postType === "POLL" && pollOptions.filter(o => o.trim()).length < 2) ||
                (postType === "SENSITIVE" && !contentWarning.trim())
              }`;

content = content.replace(validateTarget, validateReplacement);

const typeMenu = `
          {/* Post Type Selector */}
          <div className="relative mb-3">
            <button 
              onClick={() => { if (!isAuthenticated) openModal(); else setShowTypeMenu(!showTypeMenu); }}
              className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            >
              {postType === "NORMAL" && <><FileText className="w-4 h-4"/> Standart Gönderi</>}
              {postType === "POLL" && <><List className="w-4 h-4"/> Anket</>}
              {postType === "SENSITIVE" && <><ShieldAlert className="w-4 h-4"/> İçerik Uyarısı</>}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showTypeMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden"
                >
                  <button onClick={() => { setPostType("NORMAL"); setShowTypeMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4"/> Standart Gönderi
                  </button>
                  <button onClick={() => { setPostType("POLL"); setShowTypeMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t border-gray-50">
                    <List className="w-4 h-4"/> Anket
                  </button>
                  <button onClick={() => { setPostType("SENSITIVE"); setShowTypeMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700 border-t border-gray-50">
                    <ShieldAlert className="w-4 h-4"/> İçerik Uyarısı
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
`;

const extraFields = `
          {/* Post Type Specific Fields */}
          <AnimatePresence>
            {postType === "SENSITIVE" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="İçerik hakkında kısa bir uyarı yazın..." 
                      className="w-full bg-transparent border-none outline-none text-sm font-medium text-orange-900 placeholder-orange-400"
                      value={contentWarning}
                      onChange={e => setContentWarning(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {postType === "POLL" && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100"
              >
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input 
                      type="text"
                      placeholder={\`Seçenek \${idx + 1}\`}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[idx] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                      maxLength={100}
                    />
                    {pollOptions.length > 2 && (
                      <button 
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                {pollOptions.length < 10 && (
                  <button 
                    onClick={() => setPollOptions([...pollOptions, ""])}
                    className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 py-2 px-1 mt-1"
                  >
                    <Plus className="w-4 h-4" /> Seçenek ekle
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
`;

content = content.replace(
  '<div className="relative w-full">',
  typeMenu + '\n<div className="relative w-full">'
);

content = content.replace(
  '            <MentionAutocomplete text={content} onSelect={setContent} inputRef={inputRef as any} />\n          </div>',
  '            <MentionAutocomplete text={content} onSelect={setContent} inputRef={inputRef as any} />\n          </div>\n' + extraFields
);

fs.writeFileSync('src/components/CreatePost.tsx', content);
