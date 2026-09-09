const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace state
code = code.replace(
  'const [liked, setLiked] = useState(post.isLiked || false);',
  `const [liked, setLiked] = useState(post.isLiked || false);
  const [reactionType, setReactionType] = useState<string | null>(post.myReaction || null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const reactionPickerTimeoutRef = useRef<NodeJS.Timeout | null>(null);`
);

// We need to import useRef if it's not imported
code = code.replace(
  'import React, { useState, useEffect } from "react";',
  'import React, { useState, useEffect, useRef } from "react";'
);

const handleLikeOld = `  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isLiking) return;
    setIsLiking(true);

    const isCurrentlyLiked = liked;
    const currentLikeCount = likeCount;

    try {
      setLiked(!isCurrentlyLiked);
      setLikeCount(isCurrentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1);

      const res = await fetchApi(\`/posts/\${post.id}/like\`, {
        method: isCurrentlyLiked ? "DELETE" : "POST",
      });
      if (!res.ok) {
        setLiked(isCurrentlyLiked);
        setLikeCount(currentLikeCount);
      }
    } catch (e) {
      console.error(e);
      setLiked(isCurrentlyLiked);
      setLikeCount(currentLikeCount);
    } finally {
      setIsLiking(false);
    }
  };`;

const handleLikeNew = `  const handleReaction = async (e: React.MouseEvent, type: string = 'like') => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isLiking) return;
    setIsLiking(true);
    setShowReactionPicker(false);

    const isRemoving = reactionType === type;
    const oldReaction = reactionType;
    const currentLikeCount = likeCount;

    try {
      if (isRemoving) {
        setReactionType(null);
        setLiked(false);
        setLikeCount(Math.max(0, currentLikeCount - 1));
        const res = await fetchApi(\`/posts/\${post.id}/reaction\`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
      } else {
        const wasEmpty = !reactionType;
        setReactionType(type);
        setLiked(true);
        if (wasEmpty) setLikeCount(currentLikeCount + 1);
        
        const res = await fetchApi(\`/posts/\${post.id}/reaction\`, {
          method: "POST",
          body: JSON.stringify({ type })
        });
        if (!res.ok) throw new Error("Failed");
      }
    } catch (err) {
      console.error(err);
      setReactionType(oldReaction);
      setLiked(!!oldReaction);
      setLikeCount(currentLikeCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleMouseEnterPicker = () => {
    if (reactionPickerTimeoutRef.current) clearTimeout(reactionPickerTimeoutRef.current);
    setShowReactionPicker(true);
  };

  const handleMouseLeavePicker = () => {
    reactionPickerTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 300);
  };`;

code = code.replace(handleLikeOld, handleLikeNew);

// UI replacement for like button
const likeBtnOld = `          {/* Like Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleLike}
            aria-label={\`\${likeCount} beğeni. \${liked ? "Beğeniyi geri al" : "Beğen"}\`}
            className={cn(
              "group/btn flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors",
              liked
                ? "text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30"
                : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30"
            )}
          >
            <Heart
              className={cn(
                "w-4.5 h-4.5",
                liked ? "fill-rose-600 dark:fill-rose-500 stroke-rose-600 dark:stroke-rose-500" : "stroke-[1.75]"
              )}
            />
            <span className="text-xs sm:text-[13px] font-medium min-w-[16px]">
              {likeCount}
            </span>
          </motion.button>`;

const likeBtnNew = `          {/* Reaction Button with Picker */}
          <div 
            className="relative" 
            onMouseEnter={handleMouseEnterPicker} 
            onMouseLeave={handleMouseLeavePicker}
          >
            {showReactionPicker && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full left-0 mb-2 flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/[0.08] shadow-lg rounded-full z-50"
              >
                {[
                  { type: 'like', icon: '👍', color: 'text-blue-500' },
                  { type: 'love', icon: '❤️', color: 'text-rose-500' },
                  { type: 'haha', icon: '😂', color: 'text-yellow-500' },
                  { type: 'wow', icon: '😮', color: 'text-yellow-500' },
                  { type: 'sad', icon: '😢', color: 'text-yellow-500' },
                  { type: 'angry', icon: '😡', color: 'text-orange-500' }
                ].map(r => (
                  <button
                    key={r.type}
                    onClick={(e) => handleReaction(e, r.type)}
                    className="p-2 hover:scale-125 transition-transform origin-bottom text-xl leading-none"
                    title={r.type}
                  >
                    {r.icon}
                  </button>
                ))}
              </motion.div>
            )}
            
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={(e) => handleReaction(e, reactionType || 'like')}
              aria-label={\`\${likeCount} tepki.\`}
              className={cn(
                "group/btn flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors",
                reactionType
                  ? "text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30"
                  : "text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/30"
              )}
            >
              {reactionType === 'love' ? (
                <Heart className="w-4.5 h-4.5 fill-rose-600 stroke-rose-600 dark:fill-rose-500 dark:stroke-rose-500" />
              ) : reactionType === 'haha' ? (
                <span className="text-[17px] leading-none">😂</span>
              ) : reactionType === 'wow' ? (
                <span className="text-[17px] leading-none">😮</span>
              ) : reactionType === 'sad' ? (
                <span className="text-[17px] leading-none">😢</span>
              ) : reactionType === 'angry' ? (
                <span className="text-[17px] leading-none">😡</span>
              ) : reactionType === 'like' ? (
                <span className="text-[17px] leading-none">👍</span>
              ) : (
                <Heart className="w-4.5 h-4.5 stroke-[1.75]" />
              )}
              <span className="text-xs sm:text-[13px] font-medium min-w-[16px]">
                {likeCount}
              </span>
            </motion.button>
          </div>`;

code = code.replace(likeBtnOld, likeBtnNew);

fs.writeFileSync(path, code);
