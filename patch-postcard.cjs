const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// Use proper imports
if (!content.includes('Globe')) {
    content = content.replace(/ShieldAlert,/, 'ShieldAlert,\n  Globe,\n  Users,\n  Lock,');
}

// Fix visibility UI in the header
const oldHeader = `<time dateTime={post.createdAt} className="hover:underline">
                {formatTimeAgo(post.createdAt)}
              </time>
            </div>
          </div>

          {/* Post Options Menu */}`;
const newHeader = `<time dateTime={post.createdAt} className="hover:underline">
                {formatTimeAgo(post.createdAt)}
              </time>
              
              {post.visibility === "FOLLOWERS" && <Users className="w-3.5 h-3.5 text-slate-400 ml-0.5" />}
              {post.visibility === "PRIVATE" && <Lock className="w-3.5 h-3.5 text-slate-400 ml-0.5" />}
            </div>
          </div>

          {/* Post Options Menu */}`;
content = content.replace(oldHeader, newHeader);

// Fix Sensitive Warning UI
const oldSensitive = `<p className="text-sm font-medium text-slate-700 mb-3">Bu gönderi gizlenmiş olabilir.</p>`;
const newSensitive = `<p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{post.contentWarning || "Hassas İçerik"}</p>
                <p className="text-xs font-medium text-slate-500 mb-3">Bu gönderi gizlenmiş olabilir.</p>`;
content = content.replace(oldSensitive, newSensitive);

fs.writeFileSync('src/components/PostCard.tsx', content);
console.log('Patched visibility and contentWarning in PostCard.tsx');
