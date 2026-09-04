const fs = require('fs');
let content = fs.readFileSync('src/components/CreatePost.tsx', 'utf8');

const oldUserInfo = `{/* User Info (Only visible when focused or standalone) */}
          {isAuthenticated && user && (isFocused || content.length > 0 || mediaFiles.length > 0) && (
            <div className="flex items-center gap-1.5 mb-2 -mt-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-[15px]">{user.displayName || user.username}</span>
              {user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} />}
              <span className="text-slate-500 dark:text-slate-400 text-[14px]">@{user.username}</span>
            </div>
          )}`;

const newUserInfo = `{/* User Info & Visibility */}
          {isAuthenticated && user && (
            <div className="flex flex-col gap-2 mb-3 -mt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-[15px]">{user.displayName || user.username}</span>
                  {user.isVerified && <VerifiedBadge iconClassName="w-4 h-4" withModal={false} />}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                    className="flex items-center gap-1.5 bg-indigo-50/80 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-2.5 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors w-fit shadow-xs border border-indigo-100/50 dark:border-indigo-800/30"
                  >
                    {visibility === "PUBLIC" && <Globe className="w-3.5 h-3.5" />}
                    {visibility === "FOLLOWERS" && <Users className="w-3.5 h-3.5" />}
                    {visibility === "PRIVATE" && <Lock className="w-3.5 h-3.5" />}
                    <span>
                      {visibility === "PUBLIC" && "Herkese Açık"}
                      {visibility === "FOLLOWERS" && "Takipçiler"}
                      {visibility === "PRIVATE" && "Sadece Ben"}
                    </span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>
                  <AnimatePresence>
                    {showVisibilityMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50 flex flex-col p-1.5"
                      >
                        <button onClick={() => { setVisibility("PUBLIC"); setShowVisibilityMenu(false); }} className={\`flex items-center gap-2.5 p-2 rounded-lg text-sm text-left transition-colors \${visibility === "PUBLIC" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"}\`}>
                          <Globe className="w-4 h-4" /> <span>Herkese Açık</span>
                        </button>
                        <button onClick={() => { setVisibility("FOLLOWERS"); setShowVisibilityMenu(false); }} className={\`flex items-center gap-2.5 p-2 rounded-lg text-sm text-left transition-colors \${visibility === "FOLLOWERS" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"}\`}>
                          <Users className="w-4 h-4" /> <span>Sadece Takipçiler</span>
                        </button>
                        <button onClick={() => { setVisibility("PRIVATE"); setShowVisibilityMenu(false); }} className={\`flex items-center gap-2.5 p-2 rounded-lg text-sm text-left transition-colors \${visibility === "PRIVATE" ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold" : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"}\`}>
                          <Lock className="w-4 h-4" /> <span>Sadece Ben</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}`;

content = content.replace(oldUserInfo, newUserInfo);
fs.writeFileSync('src/components/CreatePost.tsx', content);
console.log('Patched UserInfo and Visibility Menu');
