const fs = require('fs');
const path = 'src/pages/PostDetail.tsx';
let code = fs.readFileSync(path, 'utf8');

const commentItemOld = `const CommentItem = ({ comment, postId, onDeleted }: any) => {`;
const commentItemNew = `const CommentItem = ({ comment, postId, onDeleted, depth = 0, childrenMap = {}, onReply }: any) => {
  const replies = childrenMap[comment.id] || [];
  const maxDepth = 2;`;

code = code.replace(commentItemOld, commentItemNew);

const renderCommentItemOld = `  return (
    <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:bg-slate-900/80 transition-colors flex gap-3.5 sm:gap-4 group">`;
const renderCommentItemNew = `  return (
    <div className={\`flex flex-col border-b border-slate-200 dark:border-slate-800/80 \${depth > 0 ? 'border-none' : ''}\`}>
      <div className={\`p-4 sm:p-5 hover:bg-slate-50 dark:bg-slate-900/80 transition-colors flex gap-3.5 sm:gap-4 group \${depth > 0 ? 'pl-8 sm:pl-12 pt-2 pb-3 border-l-2 border-slate-100 dark:border-slate-800/50 ml-4' : ''}\`}>`;

code = code.replace(renderCommentItemOld, renderCommentItemNew);

const actionsOld = `              <button
                type="button"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-900 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Yorum seçenekleri"
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>`;

const actionsNew = `              <div className="flex items-center gap-1">
                {depth < maxDepth && (
                  <button
                    type="button"
                    onClick={() => onReply(comment)}
                    className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    Yanıtla
                  </button>
                )}
                <button
                  type="button"
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:bg-slate-900 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Yorum seçenekleri"
                >
                  <MoreHorizontal className="w-[18px] h-[18px]" />
                </button>
              </div>`;

code = code.replace(actionsOld, actionsNew);

const renderCommentItemEndOld = `      </div>
    </div>
  );`;

const renderCommentItemEndNew = `      </div>
      {replies.length > 0 && depth < maxDepth && (
        <div className="flex flex-col">
          {replies.map((reply: any) => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              postId={postId} 
              onDeleted={onDeleted} 
              depth={depth + 1} 
              childrenMap={childrenMap}
              onReply={onReply}
            />
          ))}
        </div>
      )}
      {replies.length > 0 && depth >= maxDepth && (
        <div className="pl-12 ml-4 py-2 text-xs font-bold text-blue-600 dark:text-blue-400">
          {replies.length} yanıt daha...
        </div>
      )}
    </div>
  );`;

code = code.replace(renderCommentItemEndOld, renderCommentItemEndNew);

fs.writeFileSync(path, code);
