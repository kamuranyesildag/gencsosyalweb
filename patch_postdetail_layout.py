import re

with open("src/pages/PostDetail.tsx", "r") as f:
    content = f.read()

header_target = """      <header className="sticky top-16 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center gap-3.5 shadow-xs">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Geri"
          className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          Gönderi
        </h1>
      </header>"""

header_replacement = """      <header className="sticky top-0 sm:top-16 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-6 py-4 flex items-center gap-4 transition-all">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Geri"
          className="w-9 h-9 flex items-center justify-center -ml-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors shadow-sm border border-slate-200/50"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Gönderi
        </h1>
      </header>"""

content = content.replace(header_target, header_replacement)


comment_input_target = """      {/* Comment Input */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white sticky top-[calc(4rem+60px)] z-10 shadow-xs">
        <div className="flex gap-3">
          <Avatar url={user?.avatarUrl} name={user?.displayName || user?.username} size="sm" className="hidden sm:block mt-1" />
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={Math.max(1, Math.min(3, commentText.split('\\n').length))}
              placeholder="Bir yanıt yaz..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-2xl px-4 py-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 outline-none transition-colors resize-none leading-relaxed"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => {
                if (!isAuthenticated) {
                  inputRef.current?.blur();
                  openModal();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleComment();
                }
              }}
            />
            <div className="absolute bottom-full mb-2 left-0 z-30">
              <MentionAutocomplete
                text={commentText}
                onSelect={setCommentText}
                inputRef={inputRef as any}
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={!commentText.trim() || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleComment}
            className="rounded-full px-5 min-h-[44px]"
            rightIcon={<Send className="w-4 h-4" />}
          >
            Yanıtla
          </Button>
        </div>
      </div>"""

comment_input_replacement = """      {/* Comment Input */}
      <div className="p-4 sm:p-5 border-b border-slate-200/60 bg-white/60 backdrop-blur-sm sticky top-[calc(4rem+70px)] z-10 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex gap-3 sm:gap-4 items-start">
          <Avatar url={user?.avatarUrl} name={user?.displayName || user?.username} size="md" className="hidden sm:flex mt-0.5 shadow-xs ring-2 ring-white" />
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              rows={Math.max(1, Math.min(4, commentText.split('\\n').length))}
              placeholder="Yanıtını paylaş..."
              className="w-full bg-white border border-slate-200 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 rounded-[20px] px-4 sm:px-5 py-3 text-[15px] sm:text-[16px] text-slate-800 placeholder:text-slate-400 outline-none transition-all resize-none shadow-sm leading-relaxed"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onFocus={() => {
                if (!isAuthenticated) {
                  inputRef.current?.blur();
                  openModal();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleComment();
                }
              }}
            />
            <div className="absolute bottom-full mb-2 left-0 z-30">
              <MentionAutocomplete
                text={commentText}
                onSelect={setCommentText}
                inputRef={inputRef as any}
              />
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            disabled={!commentText.trim() || isSubmitting}
            isLoading={isSubmitting}
            onClick={handleComment}
            className="rounded-full px-6 min-h-[52px] shadow-sm font-bold text-[14px]"
          >
            <Send className="w-4 h-4 mr-2" />
            Yanıtla
          </Button>
        </div>
      </div>"""

content = content.replace(comment_input_target, comment_input_replacement)

with open("src/pages/PostDetail.tsx", "w") as f:
    f.write(content)
