const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let code = fs.readFileSync(path, 'utf8');

const oldRepostButton = `          {/* Repost Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleRepost}
            aria-label={\`\${repostCount} yeniden paylaşım. Yeniden paylaş.\`}
            className={cn(
              "group/btn flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors",
              reposted
                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30"
                : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
            )}
          >
            <Repeat2 className={cn("w-4.5 h-4.5", reposted ? "stroke-[2.2]" : "stroke-[1.75]")} />
            <span className="text-xs sm:text-[13px] font-medium min-w-[16px]">
              {repostCount}
            </span>
          </motion.button>`;

const newRepostButton = `          {/* Repost Menu */}
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown>
              <DropdownTrigger>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  aria-label={\`\${repostCount} yeniden paylaşım.\`}
                  className={cn(
                    "group/btn flex items-center gap-1.5 py-1.5 px-2 rounded-lg transition-colors",
                    reposted
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30"
                      : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
                  )}
                >
                  <Repeat2 className={cn("w-4.5 h-4.5", reposted ? "stroke-[2.2]" : "stroke-[1.75]")} />
                  <span className="text-xs sm:text-[13px] font-medium min-w-[16px]">
                    {repostCount}
                  </span>
                </motion.button>
              </DropdownTrigger>
              <DropdownContent align="start" className="w-40">
                <DropdownItem onClick={(e) => { e.stopPropagation(); handleRepost(e); }}>
                  <div className="flex items-center gap-2">
                    <Repeat2 className="w-4 h-4" />
                    <span>{reposted ? "Repost'u Geri Al" : "Repost"}</span>
                  </div>
                </DropdownItem>
                <DropdownItem onClick={(e) => { e.stopPropagation(); navigate(\`/create?quoteId=\${post.id}\`); }}>
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    <span>Alıntıla</span>
                  </div>
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>`;

code = code.replace(oldRepostButton, newRepostButton);
fs.writeFileSync(path, code);
