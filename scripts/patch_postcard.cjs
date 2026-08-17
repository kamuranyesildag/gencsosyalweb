const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

const stateTarget = `  const [isReposting, setIsReposting] = useState(false);`;
const stateReplacement = `  const [isReposting, setIsReposting] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [pollData, setPollData] = useState(post.pollData);
  const [isVoting, setIsVoting] = useState(false);
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const { openModal } = useAuthModalStore();`;

content = content.replace(stateTarget, stateReplacement);

const methodsTarget = `  const handleDelete = async (e: React.MouseEvent) => {`;
const methodsReplacement = `  const handleVote = async (e: React.MouseEvent, optionId: number) => {
    e.stopPropagation();
    if (!isAuthenticated) return openModal();
    if (isVoting || pollData?.userVotedOptionId) return;
    setIsVoting(true);
    try {
      const res = await fetchApi(\`/posts/\${post.id}/poll/vote\`, {
        method: 'POST',
        data: { optionId }
      });
      if (res.ok) {
        // Optimistically update poll data
        setPollData(prev => {
          if (!prev) return prev;
          const newOptions = prev.options.map(o => 
            o.id === optionId ? { ...o, voteCount: o.voteCount + 1 } : o
          );
          return {
            ...prev,
            options: newOptions,
            totalVotes: prev.totalVotes + 1,
            userVotedOptionId: optionId
          };
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Oy verme başarısız.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {`;

content = content.replace(methodsTarget, methodsReplacement);

const contentTarget = `            {isEditing ? (
              <div className="mt-2 pr-4">`;

const pollUi = `
            {/* Post Content Logic */}
            {post.postType === 'SENSITIVE' && !isRevealed ? (
              <div className="my-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                <ShieldAlert className="w-8 h-8 text-orange-500 mb-2" />
                <h4 className="font-bold text-gray-900 mb-1">İçerik Uyarısı</h4>
                <p className="text-sm text-gray-500 mb-4 max-w-sm">{post.contentWarning}</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                  className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 font-semibold px-4 py-2 rounded-full text-sm transition-colors shadow-sm"
                >
                  İçeriği Göster
                </button>
              </div>
            ) : (
              <>
                {isEditing ? (`;

content = content.replace(contentTarget, pollUi);

const mediaTarget = `                {post.media && post.media.length > 0 && (
                  <div className="mt-3 relative z-0" onClick={e => e.stopPropagation()}>`;

const mediaReplacement = `                {post.postType === 'POLL' && pollData && (
                  <div className="mt-3 mb-2 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-gray-900 mb-1">{post.content}</h3>
                    {pollData.options.map(opt => {
                      const hasVoted = !!pollData.userVotedOptionId;
                      const isSelected = pollData.userVotedOptionId === opt.id;
                      const percentage = pollData.totalVotes > 0 ? Math.round((opt.voteCount / pollData.totalVotes) * 100) : 0;
                      
                      return (
                        <button
                          key={opt.id}
                          onClick={(e) => handleVote(e, opt.id)}
                          disabled={hasVoted || isVoting}
                          className={cn(
                            "relative overflow-hidden w-full text-left rounded-xl border p-3 transition-all",
                            hasVoted ? "border-gray-200 bg-gray-50/50" : "border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 bg-white cursor-pointer",
                            isSelected && "border-indigo-600 bg-indigo-50/50"
                          )}
                        >
                          {hasVoted && (
                            <div 
                              className={cn("absolute inset-y-0 left-0 opacity-10 transition-all duration-1000 ease-out", isSelected ? "bg-indigo-600" : "bg-gray-600")} 
                              style={{ width: \`\${percentage}%\` }} 
                            />
                          )}
                          <div className="relative z-10 flex justify-between items-center gap-2">
                            <span className={cn("text-[15px]", isSelected ? "font-bold text-indigo-900" : "font-medium text-gray-700")}>
                              {opt.text}
                            </span>
                            {hasVoted && (
                              <div className="flex items-center gap-2">
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                                <span className={cn("text-sm font-semibold", isSelected ? "text-indigo-600" : "text-gray-500")}>
                                  {percentage}%
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    <div className="text-sm text-gray-400 mt-1 pl-1">
                      {pollData.totalVotes} oy
                    </div>
                  </div>
                )}
                
                {post.postType !== 'POLL' && post.content && (
                  <div className="text-[15px] sm:text-[16px] text-gray-900 leading-relaxed mt-1 break-words">
                    <RichText text={post.content} />
                  </div>
                )}

                {post.media && post.media.length > 0 && (
                  <div className="mt-3 relative z-0" onClick={e => e.stopPropagation()}>`;

const removeOldContentTarget = `                <div className="text-[15px] sm:text-[16px] text-gray-900 leading-relaxed mt-1 break-words">
                  <RichText text={post.content} />
                </div>
                
                {post.media`;

content = content.replace(removeOldContentTarget, `                {post.media`);
content = content.replace(mediaTarget, mediaReplacement);

const bottomTarget = `            {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 text-gray-500 max-w-md" onClick={e => e.stopPropagation()}>`;

const bottomReplacement = `              </>
            )}

            {/* Action Buttons */}
          <div className="flex items-center justify-between mt-3 text-gray-500 max-w-md" onClick={e => e.stopPropagation()}>`;

content = content.replace(bottomTarget, bottomReplacement);


if (!content.includes('ShieldAlert')) {
  content = content.replace('import { Heart, MessageCircle', 'import { ShieldAlert, Heart, MessageCircle');
}

fs.writeFileSync('src/components/PostCard.tsx', content);
