import sys

with open("src/pages/Profile.tsx", "r") as f:
    content = f.read()

# 1. Add state
old_state = "  const [following, setFollowing] = useState(false);"
new_state = """  const [following, setFollowing] = useState(false);
  const [notificationPref, setNotificationPref] = useState<'none' | 'standard' | 'all'>('standard');
  const [showPrefMenu, setShowPrefMenu] = useState(false);"""
content = content.replace(old_state, new_state)

# 2. Update state on load
old_load = """          setFollowing(json.data.isFollowing);
        }"""
new_load = """          setFollowing(json.data.isFollowing);
          if (json.data.notificationPreference) {
            setNotificationPref(json.data.notificationPreference);
          }
        }"""
content = content.replace(old_load, new_load)

# 3. Add handler
old_handler = """  const handleFollow = async () => {"""
new_handler = """  const handleUpdatePref = async (pref: 'none' | 'standard' | 'all') => {
    if (!profile) return;
    try {
      setNotificationPref(pref);
      setShowPrefMenu(false);
      await fetchApi(`/users/${profile.id}/follow-preference`, { 
        method: 'PUT',
        body: JSON.stringify({ preference: pref })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollow = async () => {"""
content = content.replace(old_handler, new_handler)

# 4. Add Bell button next to Follow button
old_ui = """              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-full font-bold transition-all shadow-sm ${following ? 'border border-gray-200 text-gray-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md'}`}
              >
                {following ? 'Takibi Bırak' : 'Takip Et'}
              </button>
              <div className="relative">"""

new_ui = """              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-full font-bold transition-all shadow-sm ${following ? 'border border-gray-200 text-gray-900 hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-md'}`}
              >
                {following ? 'Takibi Bırak' : 'Takip Et'}
              </button>
              
              {following && profile.isOfficialAccount && (
                <div className="relative">
                  <button 
                    onClick={() => setShowPrefMenu(!showPrefMenu)}
                    className={`p-2 border rounded-full transition-colors ${notificationPref === 'all' || notificationPref === 'standard' ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                  >
                    <Bell className="w-5 h-5" />
                  </button>
                  <AnimatePresence>
                    {showPrefMenu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-20"
                      >
                        <div className="py-1">
                           <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">Bildirimler</div>
                           <button onClick={() => handleUpdatePref('all')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                             <span>Tümü</span>
                             {notificationPref === 'all' && <Check className="w-4 h-4 text-indigo-600" />}
                           </button>
                           <button onClick={() => handleUpdatePref('standard')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                             <span>Standart</span>
                             {notificationPref === 'standard' && <Check className="w-4 h-4 text-indigo-600" />}
                           </button>
                           <button onClick={() => handleUpdatePref('none')} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between">
                             <span>Hiçbiri</span>
                             {notificationPref === 'none' && <Check className="w-4 h-4 text-indigo-600" />}
                           </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="relative">"""
content = content.replace(old_ui, new_ui)

if "Bell" not in content:
    content = content.replace("MoreVertical,", "MoreVertical, Bell, Check,")
elif "Check" not in content:
    content = content.replace("Bell", "Bell, Check")

with open("src/pages/Profile.tsx", "w") as f:
    f.write(content)

