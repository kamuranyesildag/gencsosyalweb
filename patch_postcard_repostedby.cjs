const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let code = fs.readFileSync(path, 'utf8');

const regex = /<article\s*ref=\{articleRef\}/;
const match = code.match(regex);
if (match) {
  const replacement = `
    <div>
    {post.repostedBy && (
      <div className="flex items-center gap-2 px-6 pt-3 pb-0 -mb-1 text-[13px] font-semibold text-slate-500 dark:text-slate-400">
        <Repeat2 className="w-3.5 h-3.5" />
        <Link to={\`/\${post.repostedBy?.user?.username || post.repostedBy?.username}\`} onClick={(e) => e.stopPropagation()} className="hover:underline">
          {post.repostedBy?.user?.displayName || post.repostedBy?.displayName || post.repostedBy?.user?.username || post.repostedBy?.username} repostladı
        </Link>
      </div>
    )}
    <article ref={articleRef}`;
  code = code.replace(match[0], replacement);

  // also need to close the div at the end
  const endRegex = /<\/article>\s*\);\s*\};/;
  code = code.replace(endRegex, '</article>\n    </div>\n  );\n};');

  fs.writeFileSync(path, code);
}
