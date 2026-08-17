const fs = require('fs');
let content = fs.readFileSync('server/routes/posts.ts', 'utf8');

const targetReturn = `      if (media && media.length > 0) {
        await tx.insert(postMedia).values(
          media.map((m: any, i: number) => ({
            postId: newPost.id,
            mediaUrl: m.url,
            mediaType: m.type,
            sortOrder: i,
          }))
        );
      }
      return newPost;
    });`;

const replacementReturn = `      if (media && media.length > 0) {
        await tx.insert(postMedia).values(
          media.map((m: any, i: number) => ({
            postId: newPost.id,
            mediaUrl: m.url,
            mediaType: m.type,
            sortOrder: i,
          }))
        );
      }

      let pPollOptions = undefined;
      if (parsed.data.postType === 'POLL' && parsed.data.pollOptions) {
        const optionsWithVotes = parsed.data.pollOptions.map((opt, i) => ({
           id: -i, // temp id for optimistic UI
           text: opt,
           order: i,
           voteCount: 0
        }));
        pPollOptions = {
          options: optionsWithVotes,
          totalVotes: 0,
          userVotedOptionId: null
        };
      }

      const postWithRelations = {
        ...newPost,
        pollData: pPollOptions,
        user: {
           id: req.user!.userId,
           username: req.user!.username
        },
        repostCount: 0,
        isReposted: false,
        likeCount: 0,
        isLiked: false,
        commentCount: 0,
        isSaved: false,
        media: media || []
      };
      
      return postWithRelations;
    });`;

if (content.includes(targetReturn)) {
    content = content.replace(targetReturn, replacementReturn);
    fs.writeFileSync('server/routes/posts.ts', content);
    console.log("Success");
} else {
    console.log("Failed");
}
