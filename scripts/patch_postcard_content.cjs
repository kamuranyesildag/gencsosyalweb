const fs = require('fs');
let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

const target = `          <div className="text-gray-900 whitespace-pre-wrap break-words mb-3.5 text-[15px] sm:text-base leading-relaxed">
            {isEditing ? (
               <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                 <textarea
                   className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm min-h-[100px]"
                   value={editContent}
                   onChange={e => setEditContent(e.target.value)}
                   autoFocus
                 />
                 <div className="flex justify-end gap-2">
                   <button onClick={() => { setIsEditing(false); setEditContent(currentContent); }} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg">İptal</button>
                   <button disabled={isSubmittingEdit || !editContent.trim()} onClick={handleEditSubmit} className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">Kaydet</button>
                 </div>
               </div>
            ) : (
               <RichText text={currentContent} />
            )}
          </div>

          {post.media && post.media.length > 0 && (`;

const replacement = `          {/* SENSITIVE CONTENT WRAPPER */}
          {post.postType === 'SENSITIVE' && !isRevealed ? (
            <div className="my-3 bg-orange-50 border border-orange-100 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-8 h-8 text-orange-500 mb-2" />
              <h4 className="font-bold text-gray-900 mb-1">İçerik Uyarısı</h4>
              <p className="text-sm text-gray-500 mb-4 max-w-sm">{post.contentWarning}</p>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsRevealed(true); }}
                className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 font-semibold px-5 py-2 rounded-full text-sm transition-colors shadow-sm"
              >
                İçeriği Göster
              </button>
            </div>
          ) : (
            <>
              {/* NORMAL OR REVEALED TEXT CONTENT */}
              {post.postType !== 'POLL' && (
                <div className="text-gray-900 whitespace-pre-wrap break-words mb-3.5 text-[15px] sm:text-base leading-relaxed">
                  {isEditing ? (
                    <div className="flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                      <textarea
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm min-h-[100px]"
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setIsEditing(false); setEditContent(currentContent); }} className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg">İptal</button>
                        <button disabled={isSubmittingEdit || !editContent.trim()} onClick={handleEditSubmit} className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">Kaydet</button>
                      </div>
                    </div>
                  ) : (
                    <RichText text={currentContent} />
                  )}
                </div>
              )}

              {/* POLL UI */}
              {post.postType === 'POLL' && pollData && (
                <div className="mt-2 mb-4 flex flex-col gap-2.5" onClick={e => e.stopPropagation()}>
                  <h3 className="text-[15px] sm:text-base text-gray-900 font-semibold mb-1 leading-relaxed whitespace-pre-wrap break-words">{currentContent}</h3>
                  {pollData.options.map((opt: any) => {
                    const hasVoted = !!pollData.userVotedOptionId;
                    const isSelected = pollData.userVotedOptionId === opt.id;
                    const percentage = pollData.totalVotes > 0 ? Math.round((opt.voteCount / pollData.totalVotes) * 100) : 0;
                    
                    return (
                      <button
                        key={opt.id}
                        onClick={(e) => handleVote(e, opt.id)}
                        disabled={hasVoted || isVoting}
                        className={cn(
                          "relative overflow-hidden w-full text-left rounded-xl border p-3.5 sm:p-4 transition-all duration-200",
                          hasVoted ? "border-gray-200 bg-gray-50/50" : "border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-sm bg-white cursor-pointer",
                          isSelected && "border-indigo-600 bg-indigo-50/30"
                        )}
                      >
                        {hasVoted && (
                          <div 
                            className={cn("absolute inset-y-0 left-0 opacity-10 transition-all duration-1000 ease-out", isSelected ? "bg-indigo-600" : "bg-gray-600")} 
                            style={{ width: \`\${percentage}%\` }} 
                          />
                        )}
                        <div className="relative z-10 flex justify-between items-center gap-2">
                          <span className={cn("text-[15px] sm:text-base", isSelected ? "font-bold text-indigo-900" : "font-medium text-gray-800")}>
                            {opt.text}
                          </span>
                          {hasVoted && (
                            <div className="flex items-center gap-2">
                              {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                              <span className={cn("text-sm font-bold", isSelected ? "text-indigo-600" : "text-gray-500")}>
                                {percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                  <div className="text-sm font-medium text-gray-400 mt-1 pl-1">
                    {pollData.totalVotes} oy
                  </div>
                </div>
              )}

              {/* MEDIA WRAPPER */}
              {post.media && post.media.length > 0 && (`;

content = content.replace(target, replacement);

const oldPollLogic = `            {/* Post Content Logic */}
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

if (content.includes(oldPollLogic)) {
  content = content.replace(oldPollLogic, '');
}

const mediaLogicTarget = `                {post.postType === 'POLL' && pollData && (`;
if (content.includes(mediaLogicTarget)) {
   const splitPart = content.split(`                {post.postType === 'POLL' && pollData && (`)[1].split(`              </>
            )}

            {/* Action Buttons */}`)[0];
   content = content.replace(`                {post.postType === 'POLL' && pollData && (` + splitPart + `              </>
            )}`, '');
}

fs.writeFileSync('src/components/PostCard.tsx', content);
