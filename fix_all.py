import re

# 1. Fix react-router-dom -> react-router in SuggestedUsers and StarterQuestsCard
for file in ["src/components/SuggestedUsers.tsx", "src/components/StarterQuestsCard.tsx"]:
    with open(file, "r") as f:
        content = f.read()
    content = content.replace("react-router-dom", "react-router")
    with open(file, "w") as f:
        f.write(content)

# 2. Fix User interface in useAuth.ts
with open("src/context/useAuth.ts", "r") as f:
    content = f.read()
if "onboardingCompleted" not in content:
    content = content.replace("createdAt: string;", "createdAt: string;\n  onboardingCompleted?: boolean;")
with open("src/context/useAuth.ts", "w") as f:
    f.write(content)

# 3. Fix StarterQuestsCard.tsx checkAuth -> it doesn't exist. Instead of checkAuth, just reload the page or do fetchApi("/auth/me")
with open("src/components/StarterQuestsCard.tsx", "r") as f:
    content = f.read()
content = content.replace("const checkAuth = useAuthStore(state => state.checkAuth);", "")
content = content.replace("await checkAuth();", "window.location.reload();")
with open("src/components/StarterQuestsCard.tsx", "w") as f:
    f.write(content)

# 4. Fix CreatePost.tsx Avatar src -> url
with open("src/components/CreatePost.tsx", "r") as f:
    content = f.read()
content = content.replace("src={user?.avatarUrl}", "url={user?.avatarUrl}")
content = content.replace('fallback={user?.displayName?.[0] || user?.username?.[0] || "?"}', 'name={user?.displayName || user?.username || "?"}')
with open("src/components/CreatePost.tsx", "w") as f:
    f.write(content)

# 5. Fix PostDetail.tsx
with open("src/pages/PostDetail.tsx", "r") as f:
    content = f.read()

# handleEdit is missing in CommentItem. Let's find CommentItem and see if there is handleEdit.
# The user's original CommentItem had a handleEdit? 
# Wait, I completely replaced the return statement of CommentItem and removed handleEdit?
# Let's write handleEdit inside CommentItem:
