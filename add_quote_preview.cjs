const fs = require('fs');
const path = 'src/components/CreatePost.tsx';
let code = fs.readFileSync(path, 'utf8');

// import formatTimeAgo if needed
if (!code.includes('formatTimeAgo')) {
  code = code.replace(
    'import { cn } from "../lib/utils";',
    'import { cn, formatTimeAgo } from "../lib/utils";'
  );
}

const mediaPreviewHtml = `          {/* Media Previews */}`;

const quotePreviewHtml = `
          {/* Quote Preview */}
          {quoteId && quotedPost && (
             <div className="mb-4 border border-slate-200 dark:border-white/[0.08] rounded-xl p-3 bg-white dark:bg-slate-950 shadow-sm opacity-80 pointer-events-none">
                <div className="flex items-center gap-2 mb-2">
                   <Avatar url={quotedPost.user?.avatarUrl} name={quotedPost.user?.displayName || quotedPost.user?.username} size="sm" />
                   <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{quotedPost.user?.displayName || quotedPost.user?.username}</span>
                      <span className="text-slate-500 dark:text-slate-400">@{quotedPost.user?.username}</span>
                      <span className="text-slate-400">&bull; {formatTimeAgo(quotedPost.createdAt)}</span>
                   </div>
                </div>
                <div className="text-sm text-slate-800 dark:text-slate-200 line-clamp-3">
                   {quotedPost.content}
                </div>
             </div>
          )}

          {/* Media Previews */}`;

code = code.replace(mediaPreviewHtml, quotePreviewHtml);
fs.writeFileSync(path, code);
