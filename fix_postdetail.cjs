const fs = require('fs');
const path = 'src/pages/PostDetail.tsx';
let code = fs.readFileSync(path, 'utf8');

// The end of PostDetail is messed up, and the end of CommentItem needs the new stuff.

// 1. Remove the injected replies logic from the end of PostDetail.
code = code.replace(/      \{replies\.length > 0 && depth < maxDepth && \([\s\S]*?      \)\}\n    <\/div>\n  \);\n\}/, '    </div>\n  );\n}');

// 2. Add the injected replies logic and missing closing div to CommentItem.
// Find CommentItem's ReportDialog
code = code.replace(/        targetType="comment"\n      \/>\n    <\/div>\n  \);/, 
`        targetType="comment"
      />
      </div>
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
  );`);

fs.writeFileSync(path, code);
