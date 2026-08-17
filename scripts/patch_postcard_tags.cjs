const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

const oldStr = `          <div className="flex items-center justify-between text-gray-500 max-w-md pr-4">
            <button onClick={(e) => { e.stopPropagation(); navigate(\`/post/\${post.id}\`); }}`;

const newStr = `            </>
          )}

          <div className="flex items-center justify-between text-gray-500 max-w-md pr-4">
            <button onClick={(e) => { e.stopPropagation(); navigate(\`/post/\${post.id}\`); }}`;

content = content.replace(oldStr, newStr);

fs.writeFileSync('src/components/PostCard.tsx', content);
