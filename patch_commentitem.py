import re

with open("src/pages/PostDetail.tsx", "r") as f:
    content = f.read()

handle_edit_code = """
  const handleEdit = async () => {
    if (!editContent.trim() || editContent === currentContent) return;
    setIsSubmittingEdit(true);
    try {
      const res = await fetchApi(`/posts/comments/${comment.id}`, {
        method: "PUT",
        data: { content: editContent.trim() }
      });
      const json = await res.json();
      if (json.success) {
        setCurrentContent(editContent.trim());
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingEdit(false);
    }
  };
"""

content = content.replace("const handleDelete = async () => {", handle_edit_code + "\n  const handleDelete = async () => {")

content = content.replace('targetType="COMMENT"', 'targetType="comment"')

with open("src/pages/PostDetail.tsx", "w") as f:
    f.write(content)
