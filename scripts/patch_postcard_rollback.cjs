const fs = require('fs');

let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// Patch handleLike
content = content.replace(
  `  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isCurrentlyLiked = liked;
      setLiked(!isCurrentlyLiked);
      setLikeCount(isCurrentlyLiked ? likeCount - 1 : likeCount + 1);
      
      const res = await fetchApi(\`/posts/\${post.id}/like\`, { method: isCurrentlyLiked ? 'DELETE' : 'POST' });
      if (!res.ok) {
        setLiked(isCurrentlyLiked);
        setLikeCount(isCurrentlyLiked ? likeCount : likeCount - 1);
      }
    } catch (e) {
      console.error(e);
    }
  };`,
  `  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isCurrentlyLiked = liked;
      const currentLikeCount = likeCount;
      setLiked(!isCurrentlyLiked);
      setLikeCount(isCurrentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1);
      
      const res = await fetchApi(\`/posts/\${post.id}/like\`, { method: isCurrentlyLiked ? 'DELETE' : 'POST' });
      if (!res.ok) {
        setLiked(isCurrentlyLiked);
        setLikeCount(currentLikeCount);
      }
    } catch (e) {
      console.error(e);
    }
  };`
);

// Patch handleRepost
content = content.replace(
  `  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isCurrentlyReposted = reposted;
      setReposted(!isCurrentlyReposted);
      setRepostCount(isCurrentlyReposted ? repostCount - 1 : repostCount + 1);
      
      const res = await fetchApi(\`/posts/\${post.id}/repost\`, { method: isCurrentlyReposted ? 'DELETE' : 'POST' });
      if (!res.ok) {
        setReposted(isCurrentlyReposted);
        setRepostCount(isCurrentlyReposted ? repostCount : repostCount - 1);
      }
    } catch (e) {
      console.error(e);
    }
  };`,
  `  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isCurrentlyReposted = reposted;
      const currentRepostCount = repostCount;
      setReposted(!isCurrentlyReposted);
      setRepostCount(isCurrentlyReposted ? currentRepostCount - 1 : currentRepostCount + 1);
      
      const res = await fetchApi(\`/posts/\${post.id}/repost\`, { method: isCurrentlyReposted ? 'DELETE' : 'POST' });
      if (!res.ok) {
        setReposted(isCurrentlyReposted);
        setRepostCount(currentRepostCount);
      }
    } catch (e) {
      console.error(e);
    }
  };`
);

fs.writeFileSync('src/components/PostCard.tsx', content);
