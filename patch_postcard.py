import re

with open("src/components/PostCard.tsx", "r") as f:
    content = f.read()

# Replace main wrapper of the PostCard
target = """    <article
      ref={articleRef}
      onClick={handlePostClick}
      className="border-b border-slate-100/90 p-4 sm:p-5 hover:bg-slate-50/60 transition-colors duration-150 cursor-pointer group select-none relative"
      aria-label={`${post.user?.displayName || post.user?.username} adlı kullanıcının gönderisi`}
    >"""

replacement = """    <article
      ref={articleRef}
      onClick={handlePostClick}
      className="border-b border-slate-200/50 p-4 sm:p-5 hover:bg-slate-50/50 transition-colors duration-200 cursor-pointer group select-none relative bg-white"
      aria-label={`${post.user?.displayName || post.user?.username} adlı kullanıcının gönderisi`}
    >"""

content = content.replace(target, replacement)

# Replace author info layout slightly
author_target = """        {/* 1. Author Avatar */}
        <Link
          to={`/profile/${post.user?.username}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-full"
          aria-label={`${post.user?.displayName || post.user?.username} profili`}
        >
          <Avatar
            url={post.user?.avatarUrl}
            name={post.user?.displayName || post.user?.username}
            size="md"
            className="ring-1 ring-slate-200/80 group-hover:ring-indigo-200 transition-all duration-200"
          />
        </Link>"""

author_replacement = """        {/* 1. Author Avatar */}
        <Link
          to={`/profile/${post.user?.username}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded-full mt-0.5"
          aria-label={`${post.user?.displayName || post.user?.username} profili`}
        >
          <Avatar
            url={post.user?.avatarUrl}
            name={post.user?.displayName || post.user?.username}
            size="md"
            className="ring-2 ring-white shadow-xs group-hover:shadow-md transition-all duration-300"
          />
        </Link>"""

content = content.replace(author_target, author_replacement)

# Update name text styles
name_target = """              <Link
                to={`/profile/${post.user?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-slate-900 hover:text-indigo-600 hover:underline truncate transition-colors"
              >
                {post.user?.displayName || post.user?.username}
              </Link>"""

name_replacement = """              <Link
                to={`/profile/${post.user?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="font-extrabold text-slate-900 hover:text-indigo-600 hover:underline truncate transition-colors tracking-tight text-[15px]"
              >
                {post.user?.displayName || post.user?.username}
              </Link>"""

content = content.replace(name_target, name_replacement)

with open("src/components/PostCard.tsx", "w") as f:
    f.write(content)

