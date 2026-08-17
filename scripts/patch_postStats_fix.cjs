const fs = require('fs');
let content = fs.readFileSync('server/utils/postStats.ts', 'utf8');

const target = `        .where(and(inArray(postCollaborators.postId, postIds), eq(postCollaborators.status, 'accepted')))
    ]);`;

const replacement = `        .where(and(inArray(postCollaborators.postId, postIds), eq(postCollaborators.status, 'accepted'))),
        
      db.select().from(pollOptions).where(inArray(pollOptions.postId, postIds)),
      
      db.select({
        optionId: pollVotes.optionId,
        postId: pollVotes.postId,
        count: sql<number>\`cast(count(*) as integer)\`,
        isVoted: sql<number>\`MAX(CASE WHEN \${pollVotes.userId} = \${currentUserId} THEN 1 ELSE 0 END)\`
      }).from(pollVotes).where(inArray(pollVotes.postId, postIds)).groupBy(pollVotes.optionId, pollVotes.postId)
    ]);`;

content = content.replace(target, replacement);

fs.writeFileSync('server/utils/postStats.ts', content);
