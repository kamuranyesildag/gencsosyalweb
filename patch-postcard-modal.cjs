const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add imports X, ChevronLeft, ChevronRight if not present
if (!content.includes('ChevronLeft')) {
  content = content.replace(
    /\} from "lucide-react";/,
    '  X,\n  ChevronLeft,\n  ChevronRight,\n} from "lucide-react";'
  );
}

// 2. Add selectedMediaIndex state
if (!content.includes('const [selectedMediaIndex, setSelectedMediaIndex] = useState')) {
  content = content.replace(
    /const \[liked, setLiked\] = useState\(post\.isLiked \|\| false\);/,
    'const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);\n  const [liked, setLiked] = useState(post.isLiked || false);'
  );
}

// 3. Make the image/video clickable
content = content.replace(
  /className="w-full h-full object-cover"/,
  'className="w-full h-full object-cover cursor-pointer"\n                              onClick={(e) => {\n                                e.preventDefault();\n                                e.stopPropagation();\n                                setSelectedMediaIndex(i);\n                              }}'
);
content = content.replace(
  /className="w-full h-full object-cover hover:opacity-95 transition-opacity"/,
  'className="w-full h-full object-cover hover:opacity-95 transition-opacity cursor-pointer"\n                              onClick={(e) => {\n                                e.preventDefault();\n                                e.stopPropagation();\n                                setSelectedMediaIndex(i);\n                              }}'
);

// 4. Append the MediaLightbox before the closing tag of PostCard
const lightboxHtml = `
      {/* Media Viewer Lightbox */}
      <AnimatePresence>
        {selectedMediaIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] flex flex-col bg-black/95 backdrop-blur-xl"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMediaIndex(null);
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 w-full absolute top-0 left-0 z-50 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
              <div className="flex items-center gap-3 pointer-events-auto">
                <Avatar url={post.user?.avatarUrl} size="md" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-base sm:text-lg drop-shadow-md">
                      {post.user?.displayName || post.user?.username}
                    </span>
                    {post.user?.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <span className="text-sm text-white/70 drop-shadow-sm">@{post.user?.username}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMediaIndex(null);
                }}
                className="p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-colors pointer-events-auto"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Media Content */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden w-full h-full pointer-events-none">
              {post.media.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMediaIndex((prev) => (prev !== null ? (prev === 0 ? post.media.length - 1 : prev - 1) : 0));
                    }}
                    className="absolute left-4 p-3 bg-black/40 hover:bg-black/70 rounded-full text-white backdrop-blur-md z-50 transition-all pointer-events-auto"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMediaIndex((prev) => (prev !== null ? (prev === post.media.length - 1 ? 0 : prev + 1) : 0));
                    }}
                    className="absolute right-4 p-3 bg-black/40 hover:bg-black/70 rounded-full text-white backdrop-blur-md z-50 transition-all pointer-events-auto"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {(() => {
                const mItem = post.media[selectedMediaIndex];
                const mUrl = typeof mItem === 'string' ? mItem : (mItem.url || mItem.mediaUrl || '');
                const mType = typeof mItem === 'string' ? '' : (mItem.type || mItem.mediaType || '');
                const isVideo = mType.includes('video') || mUrl.match(/\\.(mp4|webm|ogg)$/i) || mUrl.includes('video');

                return isVideo ? (
                  <video
                    src={mUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <img
                    src={mUrl}
                    alt="Büyütülmüş Görsel"
                    className="max-w-full max-h-full object-contain pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  />
                );
              })()}
            </div>

            {/* Footer Actions */}
            <div className="w-full absolute bottom-0 left-0 z-50 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-10 pb-6 px-4 pointer-events-none">
              <div className="max-w-3xl mx-auto w-full pointer-events-auto flex flex-col gap-4">
                {post.content && (
                  <p className="text-white/95 text-[15px] leading-relaxed line-clamp-2 drop-shadow-md px-2">
                    {post.content}
                  </p>
                )}
                <div className="flex items-center justify-around sm:justify-center sm:gap-16 pt-2 pb-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(e as any);
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-rose-500/20 transition-colors backdrop-blur-md">
                      <Heart className={\`w-6 h-6 transition-all \${liked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white/80 group-hover:text-rose-400'}\`} />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">{likeCount}</span>
                  </button>
                  
                  <Link
                    to={\`/post/\${post.id}\`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors backdrop-blur-md">
                      <MessageCircle className="w-6 h-6 text-white/80 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">{post.commentCount}</span>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(e as any);
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-amber-500/20 transition-colors backdrop-blur-md">
                      <Bookmark className={\`w-6 h-6 transition-all \${saved ? 'fill-amber-500 text-amber-500 scale-110' : 'text-white/80 group-hover:text-amber-400'}\`} />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">Kaydet</span>
                  </button>

                  <button
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
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
`;

if (!content.includes('Media Viewer Lightbox')) {
  // PostCard ends with `</article>\n  );\n}`
  content = content.replace(
    /<\/article>\s*\);\s*\}/,
    `      ${lightboxHtml}\n    </article>\n  );\n}`
  );
}

fs.writeFileSync(path, content);
