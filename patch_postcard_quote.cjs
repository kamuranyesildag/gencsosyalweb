const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /\{\/\*\s*Media Grid\s*\*\/\}/;
const match = code.match(regex);
if (match) {
  const replacement = `
                {/* Quote Preview */}
                {post.quotedPost && (
                   <div 
                     onClick={(e) => { e.stopPropagation(); navigate(\`/post/\${post.quotedPost.id}\`); }}
                     className="mt-3 mb-1 border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 sm:p-4 bg-white hover:bg-slate-50 dark:bg-slate-950/50 dark:hover:bg-slate-900/60 cursor-pointer transition-colors shadow-sm"
                   >
                      <div className="flex items-center gap-2 mb-2">
                         <Avatar url={post.quotedPost.user?.avatarUrl} name={post.quotedPost.user?.displayName || post.quotedPost.user?.username} size="sm" />
                         <div className="flex items-center gap-1.5 text-[13px] sm:text-sm">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{post.quotedPost.user?.displayName || post.quotedPost.user?.username}</span>
                            <span className="text-slate-500 dark:text-slate-400">@{post.quotedPost.user?.username}</span>
                            <span className="text-slate-400">&bull; {formatTimeAgo(post.quotedPost.createdAt)}</span>
                         </div>
                      </div>
                      <div className="text-[13px] sm:text-[14px] text-slate-800 dark:text-slate-200 line-clamp-3">
                         {post.quotedPost.content}
                      </div>
                      {/* Optional: Minimal Media Preview for Quoted Post */}
                      {post.quotedPost.media && post.quotedPost.media.length > 0 && (
                         <div className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> Media eklentisi
                         </div>
                      )}
                   </div>
                )}
  ` + match[0];
  code = code.replace(match[0], replacement);
  fs.writeFileSync(path, code);
}
