import re

with open("src/pages/PostDetail.tsx", "r") as f:
    content = f.read()

target = """      if (json.success) {
        setCommentText("");
        addItem(json.data);
        setPost({ ...post, commentCount: (post.commentCount || 0) + 1 });
        toast.success("Yanıtınız paylaşıldı.");
      }"""

replacement = """      if (json.success) {
        setCommentText("");
        addItem(json.data);
        setPost({ ...post, commentCount: (post.commentCount || 0) + 1 });
        toast.success("Yanıtınız paylaşıldı.");
      } else {
        toast.error(json.error?.message || "Yanıt gönderilemedi.");
      }"""

content = content.replace(target, replacement)

with open("src/pages/PostDetail.tsx", "w") as f:
    f.write(content)
