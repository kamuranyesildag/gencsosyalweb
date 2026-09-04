const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

const oldShare = `<button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(e as any);
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-emerald-500/20 transition-colors backdrop-blur-md">
                      <Share2 className="w-6 h-6 text-white/80 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">Paylaş</span>
                  </button>`;

const newShare = `<button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(e as any);
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-emerald-500/20 transition-colors backdrop-blur-md">
                      <Share2 className="w-6 h-6 text-white/80 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">Paylaş</span>
                  </button>
                  
                  <div className="flex flex-col items-center gap-1.5 group">
                    <div className="p-3 rounded-full bg-white/5 transition-colors backdrop-blur-md">
                      <Eye className="w-6 h-6 text-white/50" />
                    </div>
                    <span className="text-[13px] font-medium text-white/50">{post.viewCount || 0}</span>
                  </div>`;

// Add view count to the main actions (desktop/inline)
const oldInlineActions = `</motion.button>

          {/* Bookmark & Share (Grouped) */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>`;

const newInlineActions = `</motion.button>

          {/* View Count */}
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 ml-1">
            <Eye className="w-[18px] h-[18px] stroke-[1.8]" />
            <span className="text-[13px] font-medium min-w-[20px]">{post.viewCount || 0}</span>
          </div>

          <div className="flex-1" />

          {/* Bookmark & Share (Grouped) */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>`;

content = content.replace(oldShare, newShare);
content = content.replace(oldInlineActions, newInlineActions);

fs.writeFileSync('src/components/PostCard.tsx', content);
console.log('Patched view count in PostCard.tsx');
