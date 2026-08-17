import re

with open("src/pages/PostDetail.tsx", "r") as f:
    content = f.read()

# I will replace the main render of CommentItem.
# Need to find the return inside CommentItem.

start_idx = content.find("  return (\n    <div className=\"p-4 sm:p-5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors flex gap-3.5\">")
if start_idx == -1:
    print("Could not find CommentItem return")
else:
    end_idx = content.find("  );\n};\n\nexport function PostDetail() {")
    
    if end_idx != -1:
        replacement = """  return (
    <div className="p-4 sm:p-5 border-b border-slate-100/80 hover:bg-slate-50/80 transition-colors flex gap-3.5 sm:gap-4 group">
      <div className="shrink-0 pt-0.5">
        <Avatar url={comment.user?.avatarUrl} name={comment.user?.displayName || comment.user?.username} size="sm" className="ring-2 ring-white shadow-xs" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[13px] sm:text-[14px]">
            <span className="font-extrabold text-slate-900 truncate tracking-tight">
              {comment.user?.displayName || comment.user?.username}
            </span>
            <span className="text-slate-500 font-medium truncate">@{comment.user?.username}</span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-400 font-medium whitespace-nowrap">{formatTimeAgo(comment.createdAt)}</span>
          </div>

          <Dropdown>
            <DropdownTrigger>
              <button
                type="button"
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Yorum seçenekleri"
              >
                <MoreHorizontal className="w-[18px] h-[18px]" />
              </button>
            </DropdownTrigger>
            <DropdownContent align="right" className="w-40 rounded-2xl shadow-lg border-slate-100">
              {isOwner ? (
                <>
                  <DropdownItem
                    icon={<Edit2 className="w-4 h-4" />}
                    onClick={() => setIsEditing(true)}
                  >
                    <span className="font-semibold text-slate-700">Düzenle</span>
                  </DropdownItem>
                  <DropdownItem
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-rose-600 focus:bg-rose-50"
                  >
                    <span className="font-semibold text-rose-600">Sil</span>
                  </DropdownItem>
                </>
              ) : (
                <DropdownItem
                  icon={<AlertTriangle className="w-4 h-4" />}
                  onClick={() => setShowReportDialog(true)}
                  className="text-rose-600 focus:bg-rose-50"
                >
                  <span className="font-semibold text-rose-600">Bildir</span>
                </DropdownItem>
              )}
            </DropdownContent>
          </Dropdown>
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <textarea
              className="w-full bg-slate-50/50 border border-slate-200/60 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-[14px] sm:text-[15px] text-slate-800 outline-none transition-colors min-h-[80px] resize-none"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Yorumunuzu düzenleyin..."
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(currentContent);
                }}
                disabled={isSubmittingEdit}
                className="rounded-full text-slate-500 hover:bg-slate-100 px-4"
              >
                İptal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEdit}
                isLoading={isSubmittingEdit}
                disabled={!editContent.trim() || editContent === currentContent}
                className="rounded-full px-5 font-bold shadow-sm"
              >
                Kaydet
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-[14px] sm:text-[15px] text-slate-800 whitespace-pre-wrap leading-relaxed mt-0.5">
            <RichText content={currentContent} />
          </div>
        )}
      </div>

      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetId={comment.id}
        targetType="COMMENT"
      />
    </div>"""
        
        new_content = content[:start_idx] + replacement + content[end_idx:]
        with open("src/pages/PostDetail.tsx", "w") as f:
            f.write(new_content)
