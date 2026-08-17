import { db } from "../../src/db/index.js";
import { postMedia, reposts, likes, bookmarks, comments, postCollaborators, users, profiles, pollOptions, pollVotes } from "../../src/db/schema.js";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function populatePostStats(postsList: any[], currentUserId: number) {
  if (!postsList || postsList.length === 0) return postsList;
  
  const postIds = postsList.map(p => p.id);
  
  let allMedia: any[] = [];
  let repostStats: any[] = [];
  let likeStats: any[] = [];
  let bookmarkStats: any[] = [];
  let commentStats: any[] = [];
  let allCollabs: any[] = [];
  let allPollOptions: any[] = [];
  let allPollVotes: any[] = [];

  if (postIds.length > 0) {
    [allMedia, repostStats, likeStats, bookmarkStats, commentStats, allCollabs, allPollOptions, allPollVotes] = await Promise.all([
      db.select().from(postMedia).where(inArray(postMedia.postId, postIds)),
      
      db.select({
        postId: reposts.postId,
        count: sql<number>`cast(count(*) as integer)`,
        isReposted: sql<number>`MAX(CASE WHEN ${reposts.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(reposts).where(inArray(reposts.postId, postIds)).groupBy(reposts.postId),
      
      db.select({
        postId: likes.postId,
        count: sql<number>`cast(count(*) as integer)`,
        isLiked: sql<number>`MAX(CASE WHEN ${likes.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(likes).where(inArray(likes.postId, postIds)).groupBy(likes.postId),
      
      db.select({
        postId: bookmarks.postId,
        isSaved: sql<number>`MAX(CASE WHEN ${bookmarks.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(bookmarks).where(inArray(bookmarks.postId, postIds)).groupBy(bookmarks.postId),
      
      db.select({
        postId: comments.postId,
        count: sql<number>`cast(count(*) as integer)`
      }).from(comments).where(inArray(comments.postId, postIds)).groupBy(comments.postId),
      
      db.select({ 
        postId: postCollaborators.postId, 
        userId: users.id, 
        username: users.username, 
        displayName: profiles.displayName, 
        avatarUrl: profiles.avatarUrl 
      }).from(postCollaborators)
        .innerJoin(users, eq(postCollaborators.userId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(and(inArray(postCollaborators.postId, postIds), eq(postCollaborators.status, 'accepted'))),
        
      db.select().from(pollOptions).where(inArray(pollOptions.postId, postIds)),
      
      db.select({
        optionId: pollVotes.optionId,
        postId: pollVotes.postId,
        count: sql<number>`cast(count(*) as integer)`,
        isVoted: sql<number>`MAX(CASE WHEN ${pollVotes.userId} = ${currentUserId} THEN 1 ELSE 0 END)`
      }).from(pollVotes).where(inArray(pollVotes.postId, postIds)).groupBy(pollVotes.optionId, pollVotes.postId)
    ]);
  }

  // Create maps for O(1) lookup
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
      const votes = pollVotesMap.get(p.id) || [];
      let totalVotes = 0;
      let userVotedOptionId = null;
      const optionsWithVotes = options.map(o => {
        const vStat = votes.find(v => v.optionId === o.id) || { count: 0, isVoted: 0 };
        totalVotes += vStat.count;
        if (vStat.isVoted) userVotedOptionId = o.id;
        return { ...o, voteCount: vStat.count };
      });
      pPollOptions = {
        options: optionsWithVotes,
        totalVotes,
        userVotedOptionId
      };
    }

    return {
      ...p,
      pollData: pPollOptions,
      media: pMedia,
      repostCount: rStat.count,
      isReposted: rStat.isReposted,
      likeCount: lStat.count,
      isLiked: lStat.isLiked,
      commentCount: cStat.count,
      isSaved: bStat.isSaved,
      collaborators: pCollabs.map(c => ({ userId: c.userId, username: c.username, displayName: c.displayName, avatarUrl: c.avatarUrl }))
    };
  });
}
