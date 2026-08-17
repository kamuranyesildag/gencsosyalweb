const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>',
  '<Route element={<AppLayout />}>'
);

// We need to wrap protected routes individually
// Some routes can be public: /home, /explore, /profile/:username, /post/:id
content = content.replace('<Route path="/home" element={<Feed />} />', '<Route path="/home" element={<Feed />} />');
content = content.replace('<Route path="/explore" element={<Explore />} />', '<Route path="/explore" element={<Explore />} />');
content = content.replace('<Route path="/profile/:username" element={<Profile />} />', '<Route path="/profile/:username" element={<Profile />} />');
content = content.replace('<Route path="/post/:id" element={<PostDetail />} />', '<Route path="/post/:id" element={<PostDetail />} />');

// The rest should be protected:
// notifications, messages, bookmarks, settings, admin, projects, hashtags
const protectedRoutes = [
  '<Route path="/notifications" element={<Notifications />} />',
  '<Route path="/messages" element={<Messages />} />',
  '<Route path="/messages/:id" element={<MessageDetail />} />',
  '<Route path="/bookmarks" element={<Bookmarks />} />',
  '<Route path="/settings" element={<Settings />} />',
  '<Route path="/admin" element={<Admin />} />'
];

for (const r of protectedRoutes) {
  content = content.replace(r, r.replace('element={<', 'element={<ProtectedRoute><').replace('/>} />', '/></ProtectedRoute>} />'));
}

fs.writeFileSync('src/App.tsx', content);
