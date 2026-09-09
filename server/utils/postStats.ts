import { db } from "../../src/db/index.js";
import { postMedia, reposts, likes, reactions, bookmarks, comments, postCollaborators, users, profiles, pollOptions, pollVotes, follows, posts } from "../../src/db/schema.js";
import { eq, and, inArray, sql, or } from "drizzle-orm";

export async function populatePostStats(postsList: any[], currentUserId?: number | null) {
  if (!postsList || postsList.length === 0) return postsList;
  
  const postIds = postsList.map(p => p.id);
  const authorIds = Array.from(new Set(postsList.map(p => p.user?.id || p.userId).filter(Boolean)));
  const viewerId = currentUserId ?? -1;
  
  let allMedia: any[] = [];
  let repostStats: any[] = [];
  let likeStats: any[] = [];
  let bookmarkStats: any[] = [];
  let commentStats: any[] = [];
  let allCollabs: any[] = [];
  let allPollOptions: any[] = [];
  let allPollVotes: any[] = [];
  let followStats: any[] = [];

  if (postIds.length > 0) {
    [allMedia, repostStats, likeStats, bookmarkStats, commentStats, allCollabs, allPollOptions, allPollVotes] = await Promise.all([
      db.select().from(postMedia).where(inArray(postMedia.postId, postIds)),
      
      db.select({
        postId: reposts.postId,
        count: sql<number>`cast(count(*) as integer)`,
        isReposted: sql<number>`MAX(CASE WHEN ${reposts.userId} = ${viewerId} THEN 1 ELSE 0 END)`
      }).from(reposts).where(inArray(reposts.postId, postIds)).groupBy(reposts.postId),
      
      db.select({
        postId: reactions.postId,
        count: sql<number>`cast(count(*) as integer)`,
        myReaction: sql<string>`MAX(CASE WHEN ${reactions.userId} = ${viewerId} THEN ${reactions.type} ELSE NULL END)`
      }).from(reactions).where(inArray(reactions.postId, postIds)).groupBy(reactions.postId),
      
      db.select({
        postId: bookmarks.postId,
        isSaved: sql<number>`MAX(CASE WHEN ${bookmarks.userId} = ${viewerId} THEN 1 ELSE 0 END)`
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
        isVoted: sql<number>`MAX(CASE WHEN ${pollVotes.userId} = ${viewerId} THEN 1 ELSE 0 END)`
      }).from(pollVotes).where(inArray(pollVotes.postId, postIds)).groupBy(pollVotes.optionId, pollVotes.postId)
    ]);
  }

  if (viewerId !== -1 && authorIds.length > 0) {
    followStats = await db.select({
      followerId: follows.followerId,
      followingId: follows.followingId
    }).from(follows)
    .where(
      or(
        and(eq(follows.followerId, viewerId), inArray(follows.followingId, authorIds)),
        and(eq(follows.followingId, viewerId), inArray(follows.followerId, authorIds))
      )
    );
  }

  // Fetch Quoted Posts
  const quotedPostIds = Array.from(new Set(postsList.map(p => p.quotedPostId).filter(Boolean)));
  let quotedPostsMap = new Map();

  if (quotedPostIds.length > 0) {
    const quotedPostsData = await db.select({
      id: posts.id,
      content: posts.content,
      createdAt: posts.createdAt,
      user: {
        id: users.id,
        username: users.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
      }
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .leftJoin(profiles, eq(users.id, profiles.userId))
    .where(inArray(posts.id, quotedPostIds));

    const quotedMedia = await db.select().from(postMedia).where(inArray(postMedia.postId, quotedPostIds));
    const qMediaMap = new Map();
    quotedMedia.forEach((m: any) => {
      if (!qMediaMap.has(m.postId)) qMediaMap.set(m.postId, []);
      qMediaMap.get(m.postId).push(m);
    });

    quotedPostsData.forEach((qp: any) => {
      quotedPostsMap.set(qp.id, {
        ...qp,
        media: (qMediaMap.get(qp.id) || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder)
      });
    });
  }

  // Create maps for O(1) lookup
  const isFollowingMap = new Map();
  const followsMeMap = new Map();
  followStats.forEach(f => {
    if (f.followerId === viewerId) isFollowingMap.set(f.followingId, true);
    if (f.followingId === viewerId) followsMeMap.set(f.followerId, true);
  });
  const repostsMap = new Map(repostStats.map(s => [s.postId, { count: s.count, isReposted: s.isReposted === 1 }]));
  const reactionsMap = new Map(likeStats.map(s => [s.postId, { count: s.count, myReaction: s.myReaction }]));
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
    const pMedia = (mediaMap.get(p.id) || []).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
    const pCollabs = collabsMap.get(p.id) || [];
    
    const rStat = repostsMap.get(p.id) || { count: 0, isReposted: false };
    const rStat2 = reactionsMap.get(p.id) || { count: 0, myReaction: null };
    const bStat = bookmarksMap.get(p.id) || { isSaved: false };
    const cStat = commentsMap.get(p.id) || { count: 0 };

    let pPollOptions: any = undefined;
    if (p.postType === 'POLL') {
      const options = (pollOptionsMap.get(p.id) || []).sort((a: any, b: any) => a.order - b.order);
      const votes = pollVotesMap.get(p.id) || [];
      let totalVotes = 0;
      let userVotedOptionId = null;
      const optionsWithVotes = options.map((o: any) => {
        const vStat = votes.find((v: any) => v.optionId === o.id) || { count: 0, isVoted: 0 };
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

    const authorId = p.user?.id || p.userId;
    const postUser = p.user ? {
      ...p.user,
      isFollowing: viewerId === -1 || authorId === viewerId ? false : !!isFollowingMap.get(authorId),
      followsMe: viewerId === -1 || authorId === viewerId ? false : !!followsMeMap.get(authorId)
    } : p.user;

    return {
      ...p,
      user: postUser,
      quotedPost: p.quotedPostId ? quotedPostsMap.get(p.quotedPostId) : undefined,
      pollData: pPollOptions,
      media: pMedia,
      repostCount: rStat.count,
      isReposted: rStat.isReposted,
      likeCount: rStat2.count,
      isLiked: !!rStat2.myReaction,
      myReaction: rStat2.myReaction,
      commentCount: cStat.count,
      isSaved: bStat.isSaved,
      collaborators: pCollabs.map((c: any) => ({ userId: c.userId, username: c.username, displayName: c.displayName, avatarUrl: c.avatarUrl }))
    };
  });
}
