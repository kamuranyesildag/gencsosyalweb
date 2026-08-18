import re

with open("src/components/CreatePost.tsx", "r") as f:
    content = f.read()

# Add Verified badge icon import
if "BadgeCheck" not in content:
    content = content.replace("Trash2,", "Trash2,\n  BadgeCheck,")

old_str = """        {/* Input Area */}
        <div className="flex-1 min-w-0">"""

new_str = """        {/* Input Area */}
        <div className="flex-1 min-w-0">
          {/* User Info (Only visible when focused or standalone) */}
          {isAuthenticated && user && (isFocused || content.length > 0 || mediaFiles.length > 0) && (
            <div className="flex items-center gap-1.5 mb-2 -mt-1">
              <span className="font-bold text-slate-900 text-[15px]">{user.displayName || user.username}</span>
              {user.isVerified && <BadgeCheck className="w-4 h-4 text-indigo-500" />}
              <span className="text-slate-500 text-[14px]">@{user.username}</span>
            </div>
          )}"""

content = content.replace(old_str, new_str)

with open("src/components/CreatePost.tsx", "w") as f:
    f.write(content)
