import re

with open("server/utils/postStats.ts", "r") as f:
    content = f.read()

target = """  // Create maps for O(1) lookup
  const repostsMap = new Map(repostStats.map(s => [s.postId, { count: s.count, isReposted: s.isReposted === 1 }]));
  const likesMap = new Map(likeStats.map(s => [s.postId, { count: s.count, isLiked: s.isLiked === 1 }]));
  const bookmarksMap = new Map(bookmarkStats.map(s => [s.postId, { isSaved: s.isSaved === 1 }]));
  const commentsMap = new Map(commentStats.map(s => [s.postId, { count: s.count }]));

  return postsList.map(p => {
    const pMedia = allMedia.filter(m => m.postId === p.id).sort((a, b) => a.sortOrder - b.sortOrder);
    const pCollabs = allCollabs.filter(c => c.postId === p.id);
    
    const rStat = repostsMap.get(p.id) || { count: 0, isReposted: false };
    const lStat = likesMap.get(p.id) || { count: 0, isLiked: false };
    const bStat = bookmarksMap.get(p.id) || { isSaved: false };
    const cStat = commentsMap.get(p.id) || { count: 0 };

    let pPollOptions = undefined;
    if (p.postType === 'POLL') {
      const options = allPollOptions.filter(o => o.postId === p.id).sort((a, b) => a.order - b.order);
      const votes = allPollVotes.filter(v => v.postId === p.id);"""

replacement = """  // Create maps for O(1) lookup
  const repostsMap = new Map(repostStats.map(s => [s.postId, { count: s.count, isReposted: s.isReposted === 1 }]));
  const likesMap = new Map(likeStats.map(s => [s.postId, { count: s.count, isLiked: s.isLiked === 1 }]));
  const bookmarksMap = new Map(bookmarkStats.map(s => [s.postId, { isSaved: s.isSaved === 1 }]));
  const commentsMap = new Map(commentStats.map(s => [s.postId, { count: s.count }]));
  
  const mediaMap = new Map();
  allMedia.forEach(m => {
    if (!mediaMap.has(m.postId)) mediaMap.set(m.postId, []);
    mediaMap.get(m.postId).push(m);
  });
  
  const collabsMap = new Map();
  allCollabs.forEach(c => {
    if (!collabsMap.has(c.postId)) collabsMap.set(c.postId, []);
    collabsMap.get(c.postId).push(c);
  });
  
  const pollOptionsMap = new Map();
  allPollOptions.forEach(o => {
    if (!pollOptionsMap.has(o.postId)) pollOptionsMap.set(o.postId, []);
    pollOptionsMap.get(o.postId).push(o);
  });
  
  const pollVotesMap = new Map();
  allPollVotes.forEach(v => {
    if (!pollVotesMap.has(v.postId)) pollVotesMap.set(v.postId, []);
    pollVotesMap.get(v.postId).push(v);
  });

  return postsList.map(p => {
    const pMedia = (mediaMap.get(p.id) || []).sort((a, b) => a.sortOrder - b.sortOrder);
    const pCollabs = collabsMap.get(p.id) || [];
    
    const rStat = repostsMap.get(p.id) || { count: 0, isReposted: false };
    const lStat = likesMap.get(p.id) || { count: 0, isLiked: false };
    const bStat = bookmarksMap.get(p.id) || { isSaved: false };
    const cStat = commentsMap.get(p.id) || { count: 0 };

    let pPollOptions = undefined;
    if (p.postType === 'POLL') {
      const options = (pollOptionsMap.get(p.id) || []).sort((a, b) => a.order - b.order);
      const votes = pollVotesMap.get(p.id) || [];"""

content = content.replace(target, replacement)

with open("server/utils/postStats.ts", "w") as f:
    f.write(content)
