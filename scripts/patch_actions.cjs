const fs = require('fs');

function patchFile(filepath, replaces) {
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf8');
    for (const [search, replace] of replaces) {
      content = content.replace(search, replace);
    }
    fs.writeFileSync(filepath, content);
  }
}

// PostCard.tsx
patchFile('src/components/PostCard.tsx', [
  ['import { useAuthStore } from "../context/useAuth";', 'import { useAuthStore } from "../context/useAuth";\nimport { useAuthModalStore } from "../context/useAuthModal";'],
  ['export function PostCard({ post, onInteraction, detailed = false }: PostCardProps) {', 'export function PostCard({ post, onInteraction, detailed = false }: PostCardProps) {\n  const { openModal } = useAuthModalStore();\n  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);'],
  ['const handleLike = async (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();', 'const handleLike = async (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();\n    if (!isAuthenticated) return openModal();'],
  ['const handleRepost = async (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();', 'const handleRepost = async (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();\n    if (!isAuthenticated) return openModal();'],
  ['const handleBookmark = async (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();', 'const handleBookmark = async (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();\n    if (!isAuthenticated) return openModal();'],
  ['const openComments = (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();', 'const openComments = (e: React.MouseEvent) => {\n    e.preventDefault();\n    e.stopPropagation();\n    if (!isAuthenticated) return openModal();']
]);

// CreatePost.tsx
patchFile('src/components/CreatePost.tsx', [
  ['import { useAuthStore } from "../context/useAuth";', 'import { useAuthStore } from "../context/useAuth";\nimport { useAuthModalStore } from "../context/useAuthModal";'],
  ['export function CreatePost({ communityId, onPostCreated }: { communityId?: number, onPostCreated?: (post: any) => void }) {', 'export function CreatePost({ communityId, onPostCreated }: { communityId?: number, onPostCreated?: (post: any) => void }) {\n  const { openModal } = useAuthModalStore();\n  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);'],
  ['const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();', 'const handleSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    if (!isAuthenticated) return openModal();']
]);

