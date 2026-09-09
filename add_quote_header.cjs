const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let code = fs.readFileSync(path, 'utf8');

const replacement = `
    <div>
    {post.repostedBy && (
      <div className="flex items-center gap-2 px-6 pt-3 pb-0 -mb-1 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
        <Repeat2 className="w-3.5 h-3.5" />
        <Link to={\`/\${post.repostedBy?.username}\`} onClick={(e) => e.stopPropagation()} className="hover:underline">
          {post.repostedBy?.displayName || post.repostedBy?.username} repostladı
        </Link>
      </div>
    )}
    {!post.repostedBy && post.quotedPost && (
      <div className="flex items-center gap-2 px-6 pt-3 pb-0 -mb-1 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
        <span>
          {post.user?.displayName || post.user?.username} alıntıladı
        </span>
      </div>
    )}
    <article ref={articleRef}
`;

code = code.replace(
  /<div>\s*\{post\.repostedBy && \([\s\S]*?<\/div>\s*\)\}\s*<article ref=\{articleRef\}/,
  replacement.trim()
);
fs.writeFileSync(path, code);
