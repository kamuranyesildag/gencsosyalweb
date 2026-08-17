const fs = require('fs');
let content = fs.readFileSync('server/utils/postStats.ts', 'utf8');

if (!content.includes('pollOptions')) {
  content = content.replace(
    'import { postMedia, reposts, likes, bookmarks, comments, postCollaborators, users, profiles } from "../../src/db/schema.js";',
    'import { postMedia, reposts, likes, bookmarks, comments, postCollaborators, users, profiles, pollOptions, pollVotes } from "../../src/db/schema.js";'
  );
}

content = content.replace(
  'let allCollabs: any[] = [];',
  'let allCollabs: any[] = [];\n  let allPollOptions: any[] = [];\n  let allPollVotes: any[] = [];'
);

const promiseAllTarget = `    [allMedia, repostStats, likeStats, bookmarkStats, commentStats, allCollabs] = await Promise.all([`;
const promiseAllReplacement = `    [allMedia, repostStats, likeStats, bookmarkStats, commentStats, allCollabs, allPollOptions, allPollVotes] = await Promise.all([`;

content = content.replace(promiseAllTarget, promiseAllReplacement);

const dbQueriesTarget = `      db.select({
        postId: postCollaborators.postId,
        user: {
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }
      })
      .from(postCollaborators)
      .leftJoin(users, eq(postCollaborators.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(inArray(postCollaborators.postId, postIds))
    ]);`;

const dbQueriesReplacement = `      db.select({
        postId: postCollaborators.postId,
        user: {
          id: users.id,
          username: users.username,
          displayName: profiles.displayName,
          avatarUrl: profiles.avatarUrl
        }
      })
      .from(postCollaborators)
      .leftJoin(users, eq(postCollaborators.userId, users.id))
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .where(inArray(postCollaborators.postId, postIds)),
      
      db.select().from(pollOptions).where(inArray(pollOptions.postId, postIds)),
      
      db.select({
        optionId: pollVotes.optionId,
        postId: pollVotes.postId,
        count: sql<number>\`cast(count(*) as integer)\`,
        isVoted: sql<number>\`MAX(CASE WHEN \${pollVotes.userId} = \${currentUserId} THEN 1 ELSE 0 END)\`
      }).from(pollVotes).where(inArray(pollVotes.postId, postIds)).groupBy(pollVotes.optionId, pollVotes.postId)
    ]);`;

content = content.replace(dbQueriesTarget, dbQueriesReplacement);

const mappingTarget = `    return {
      ...p,
      media: pMedia,
      repostCount: rStat.count,`;

const mappingReplacement = `    let pPollOptions = undefined;
    if (p.postType === 'POLL') {
      const options = allPollOptions.filter(o => o.postId === p.id).sort((a, b) => a.order - b.order);
      const votes = allPollVotes.filter(v => v.postId === p.id);
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
      repostCount: rStat.count,`;

content = content.replace(mappingTarget, mappingReplacement);

fs.writeFileSync('server/utils/postStats.ts', content);
