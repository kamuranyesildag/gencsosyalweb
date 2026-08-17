const fs = require('fs');

let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

// Fix Bookmark
content = content.replace(
  `    if (isSaving) return;
    setIsSaving(true);
    try {
      const isCurrentlySaved = saved;
      setSaved(!isCurrentlySaved);`,
  `    if (isSaving) return;
    setIsSaving(true);
    const isCurrentlySaved = saved;
    try {
      setSaved(!isCurrentlySaved);`
);

// Fix Like
content = content.replace(
  `    if (isLiking) return;
    setIsLiking(true);
    try {
      const isCurrentlyLiked = liked;
      const currentLikeCount = likeCount;
      setLiked(!isCurrentlyLiked);`,
  `    if (isLiking) return;
    setIsLiking(true);
    const isCurrentlyLiked = liked;
    const currentLikeCount = likeCount;
    try {
      setLiked(!isCurrentlyLiked);`
);

// Fix Repost
content = content.replace(
  `    if (isReposting) return;
    setIsReposting(true);
    try {
      const isCurrentlyReposted = reposted;
      const currentRepostCount = repostCount;
      setReposted(!isCurrentlyReposted);`,
  `    if (isReposting) return;
    setIsReposting(true);
    const isCurrentlyReposted = reposted;
    const currentRepostCount = repostCount;
    try {
      setReposted(!isCurrentlyReposted);`
);

fs.writeFileSync('src/components/PostCard.tsx', content);
console.log("Patched PostCard scopes.");
