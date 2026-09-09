const fs = require('fs');
const path = 'src/pages/Notifications.tsx';
let code = fs.readFileSync(path, 'utf8');

const snippet_old = `{/* Text Description */}
                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {details.text}
                      </p>`;

const snippet_new = `{/* Text Description */}
                      <p className="text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                        {details.text}
                      </p>
                      
                      {/* Follow Request Actions */}
                      {notif.type === "follow_request" && (
                        <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                            onClick={async () => {
                              try {
                                const res = await fetchApi(\`/users/me/follow-requests/\${notif.actor?.id}/accept\`, { method: "POST" });
                                if (res.ok) {
                                  window.location.reload();
                                }
                              } catch(e) {}
                            }}
                          >Kabul Et</button>
                          <button 
                            className="bg-slate-100 text-slate-700 dark:bg-white/[0.05] dark:text-slate-300 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-white/[0.1] hover:bg-slate-200 dark:hover:bg-white/[0.1] transition-colors"
                            onClick={async () => {
                              try {
                                const res = await fetchApi(\`/users/me/follow-requests/\${notif.actor?.id}/reject\`, { method: "POST" });
                                if (res.ok) {
                                  window.location.reload();
                                }
                              } catch(e) {}
                            }}
                          >Reddet</button>
                        </div>
                      )}`;

code = code.replace(snippet_old, snippet_new);
fs.writeFileSync(path, code);
