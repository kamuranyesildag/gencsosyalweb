const fs = require('fs');
const path = 'src/pages/PostDetail.tsx';
let code = fs.readFileSync(path, 'utf8');

const stateOld = `  const [collabUserId, setCollabUserId] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const {`;

const stateNew = `  const [collabUserId, setCollabUserId] = useState("");
  const [addingCollab, setAddingCollab] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {`;

code = code.replace(stateOld, stateNew);

const submitCommentOld = `  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return openModal();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetchApi(\`/posts/\${id}/comments\`, {
        method: "POST",
        data: { content: newComment.trim() }
      });
      const json = await res.json();
      if (json.success) {
        setNewComment("");
        // Refresh comments list
        loadInitial();
        setPost((prev: any) => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1,
        }));
        toast.success("Yorum eklendi.");
      } else {
        toast.error(json.error?.message || "Yorum eklenemedi.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };`;

const submitCommentNew = `  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return openModal();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetchApi(\`/posts/\${id}/comments\`, {
        method: "POST",
        data: { content: newComment.trim(), parentId: replyTo?.id || null }
      });
      const json = await res.json();
      if (json.success) {
        setNewComment("");
        setReplyTo(null);
        // Refresh comments list
        loadInitial();
        setPost((prev: any) => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1,
        }));
        toast.success(replyTo ? "Yanıt eklendi." : "Yorum eklendi.");
      } else {
        toast.error(json.error?.message || "Yorum eklenemedi.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };`;

code = code.replace(submitCommentOld, submitCommentNew);

const composerOld = `        <div className="flex gap-3 sm:gap-4">
          <Avatar
            url={currentUser?.avatarUrl}
            name={currentUser?.displayName || currentUser?.username}
            className="w-10 h-10 sm:w-11 sm:h-11 shadow-sm"
          />
          <div className="flex-1">
            <textarea
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 focus:border-slate-500 dark:focus:border-slate-600 rounded-2xl px-4 py-3 text-[14px] sm:text-[15px] text-slate-800 dark:text-slate-100 outline-none transition-all min-h-[100px] resize-none shadow-inner"
              placeholder="Fikrini paylaş..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
            />
            <div className="flex justify-end mt-2.5">
              <Button
                type="submit"
                size="md"
                isLoading={isSubmitting}
                disabled={!newComment.trim()}
                className="rounded-full px-6 shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Gönder
              </Button>
            </div>
          </div>
        </div>`;

const composerNew = `        <div className="flex gap-3 sm:gap-4">
          <Avatar
            url={currentUser?.avatarUrl}
            name={currentUser?.displayName || currentUser?.username}
            className="w-10 h-10 sm:w-11 sm:h-11 shadow-sm"
          />
          <div className="flex-1">
            {replyTo && (
              <div className="mb-2 flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium">
                <span>Yanıtlanıyor: @{replyTo.user?.username || "kullanıcı"}</span>
                <button type="button" onClick={() => setReplyTo(null)} className="hover:text-blue-900 dark:hover:text-blue-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <textarea
              ref={inputRef}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/60 focus:border-slate-500 dark:focus:border-slate-600 rounded-2xl px-4 py-3 text-[14px] sm:text-[15px] text-slate-800 dark:text-slate-100 outline-none transition-all min-h-[100px] resize-none shadow-inner"
              placeholder={replyTo ? "Yanıtını yaz..." : "Fikrini paylaş..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment(e);
                }
              }}
            />
            <div className="flex justify-end mt-2.5">
              <Button
                type="submit"
                size="md"
                isLoading={isSubmitting}
                disabled={!newComment.trim()}
                className="rounded-full px-6 shadow-sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {replyTo ? "Yanıtla" : "Gönder"}
              </Button>
            </div>
          </div>
        </div>`;

code = code.replace(composerOld, composerNew);

const renderListOld = `        {comments.length > 0 ? (
          <InfiniteScroll 
            items={comments}
            renderItem={(comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                onDeleted={(delId: number) => {
                  setComments((prev) => prev.filter((c: any) => c.id !== delId));
                  setPost((prev: any) => ({
                    ...prev,
                    commentCount: Math.max(0, (prev.commentCount || 0) - 1),
                  }));
                }}
              />
            )}`;

const renderListNew = `        {comments.length > 0 ? (
          <InfiniteScroll 
            items={(() => {
              const roots = [];
              const childrenMap = {};
              const idMap = new Set(comments.map(c => c.id));
              
              comments.forEach(c => {
                 if (c.parentId && idMap.has(c.parentId)) {
                    if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
                    childrenMap[c.parentId].push(c);
                 } else {
                    roots.push(c);
                 }
              });
              // store childrenMap somewhere accessible, but InfiniteScroll doesn't easily let us pass extra props dynamically unless we bind it or wrap it
              // we can just attach childrenMap to the roots
              return roots.map(r => ({ ...r, __childrenMap: childrenMap }));
            })()}
            renderItem={(comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                childrenMap={comment.__childrenMap}
                onReply={(c: any) => {
                  setReplyTo(c);
                  inputRef.current?.focus();
                  window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to composer
                }}
                onDeleted={(delId: number) => {
                  setComments((prev) => prev.filter((c: any) => c.id !== delId));
                  setPost((prev: any) => ({
                    ...prev,
                    commentCount: Math.max(0, (prev.commentCount || 0) - 1),
                  }));
                }}
              />
            )}`;

code = code.replace(renderListOld, renderListNew);

fs.writeFileSync(path, code);
