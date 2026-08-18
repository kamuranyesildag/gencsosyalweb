import re

with open("src/App.tsx", "r") as f:
    content = f.read()

if "CreatePostPage" not in content:
    content = content.replace('import { Feed } from "./pages/Feed";', 'import { Feed } from "./pages/Feed";\nimport { CreatePostPage } from "./pages/CreatePostPage";')
    content = content.replace('<Route path="/home" element={<Feed />} />', '<Route path="/home" element={<Feed />} />\n              <Route path="/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />')

with open("src/App.tsx", "w") as f:
    f.write(content)
