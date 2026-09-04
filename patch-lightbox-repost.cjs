const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the Footer Actions to include Repost.
// Find the exact snippet
const targetSnippet = `<div className="p-3 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors backdrop-blur-md">
                      <MessageCircle className="w-6 h-6 text-white/80 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">{post.commentCount}</span>
                  </Link>`;

const replacementSnippet = `<div className="p-3 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors backdrop-blur-md">
                      <MessageCircle className="w-6 h-6 text-white/80 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">{post.commentCount}</span>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRepost(e as any);
                    }}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div className="p-3 rounded-full bg-white/5 group-hover:bg-emerald-500/20 transition-colors backdrop-blur-md">
                      <Repeat2 className={\`w-6 h-6 transition-all \${reposted ? 'stroke-[2.5] text-emerald-500' : 'text-white/80 group-hover:text-emerald-400'}\`} />
                    </div>
                    <span className="text-[13px] font-medium text-white/80">{repostCount}</span>
                  </button>`;

if (content.includes(targetSnippet)) {
  content = content.replace(targetSnippet, replacementSnippet);
  fs.writeFileSync(path, content);
  console.log('Patched Lightbox to include Repost');
} else {
  console.log('Snippet not found!');
}
