import re

with open("src/components/CreatePost.tsx", "r") as f:
    content = f.read()

# Add Verified badge icon import
if "BadgeCheck" not in content:
    content = content.replace("Trash2,", "Trash2,\n  BadgeCheck,")

# Update avatar area
old_avatar = """        {/* Avatar Area */}
        <div className="shrink-0 pt-1">
          <Avatar
            url={user?.avatarUrl}
            name={user?.displayName || user?.username || "?"}
            size="md"
            className="ring-2 ring-white shadow-xs"
          />
        </div>
        
        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">"""

new_avatar = """        {/* Avatar Area */}
        <div className="shrink-0 pt-1">
          <Avatar
            url={user?.avatarUrl}
            name={user?.displayName || user?.username || "?"}
            size="md"
            className="ring-2 ring-white shadow-xs"
          />
        </div>
        
        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* User Info (Only visible when focused or standalone) */}
          {isAuthenticated && user && (isFocused || content.length > 0 || mediaFiles.length > 0) && (
            <div className="flex items-center gap-1.5 mb-2 -mt-1">
              <span className="font-bold text-slate-900 text-[15px]">{user.displayName || user.username}</span>
              {user.isVerified && <BadgeCheck className="w-4 h-4 text-indigo-500" />}
              <span className="text-slate-500 text-[14px]">@{user.username}</span>
            </div>
          )}"""

content = content.replace(old_avatar, new_avatar)

with open("src/components/CreatePost.tsx", "w") as f:
    f.write(content)
