const fs = require('fs');
const path = 'src/pages/Profile.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace('const [following, setFollowing] = useState(false);', 'const [following, setFollowing] = useState(false);\n  const [followStatus, setFollowStatus] = useState<"none"|"pending"|"accepted">("none");');

code = code.replace('setFollowing(json.data.isFollowing);', 'setFollowing(json.data.isFollowing);\n          setFollowStatus(json.data.followStatus || (json.data.isFollowing ? "accepted" : "none"));');

const handle_follow_old = `  const handleFollow = async () => {
    if (!isAuthenticated) return openModal();
    if (!profile || isFollowLoading) return;

    setIsFollowLoading(true);
    const nextState = !following;
    setFollowing(nextState);

    // Optimistic follower count update
    setProfile((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        followersCount: Math.max(0, (prev.followersCount || 0) + (nextState ? 1 : -1)),
      };
    });

    try {
      const res = await fetchApi(\`/users/\${profile.id}/follow\`, {
        method: nextState ? "POST" : "DELETE",
      });
      if (!res.ok) {
        // Revert on failure
        setFollowing(!nextState);
        setProfile((prev: any) => ({
          ...prev,
          followersCount: Math.max(0, (prev.followersCount || 0) + (nextState ? -1 : 1)),
        }));
        toast.error("İşlem gerçekleştirilemedi.");
      } else {
        toast.success(nextState ? \`@\${profile.username} takip ediliyor\` : \`Takip bırakıldı\`);
        window.dispatchEvent(
          new CustomEvent("user_follow_toggled", {
            detail: { userId: profile.id, isFollowing: nextState },
          })
        );
      }
    } catch (e) {
      console.error(e);
      setFollowing(!nextState);
      setProfile((prev: any) => ({
        ...prev,
        followersCount: Math.max(0, (prev.followersCount || 0) + (nextState ? -1 : 1)),
      }));
      toast.error("İşlem gerçekleştirilemedi.");
    } finally {
      setIsFollowLoading(false);
    }
  };`;

const handle_follow_new = `  const handleFollow = async () => {
    if (!isAuthenticated) return openModal();
    if (!profile || isFollowLoading) return;

    setIsFollowLoading(true);
    const nextState = followStatus === 'none' ? (profile.isPrivate ? 'pending' : 'accepted') : 'none';
    const wasFollowing = following;
    const wasFollowStatus = followStatus;

    setFollowStatus(nextState);
    setFollowing(nextState === 'accepted');

    // Optimistic follower count update
    if (nextState === 'accepted' || wasFollowing) {
      setProfile((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          followersCount: Math.max(0, (prev.followersCount || 0) + (nextState === 'accepted' ? 1 : -1)),
        };
      });
    }

    try {
      const res = await fetchApi(\`/users/\${profile.id}/follow\`, {
        method: nextState !== 'none' ? "POST" : "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error("Failed");
      } else {
        if (json.data && json.data.status) {
            setFollowStatus(json.data.status);
            setFollowing(json.data.status === 'accepted');
        }
        toast.success(nextState === 'none' ? \`İşlem iptal edildi\` : json.data.message || \`İşlem başarılı\`);
        window.dispatchEvent(
          new CustomEvent("user_follow_toggled", {
            detail: { userId: profile.id, isFollowing: nextState === 'accepted' },
          })
        );
      }
    } catch (e) {
      console.error(e);
      setFollowStatus(wasFollowStatus);
      setFollowing(wasFollowing);
      if (nextState === 'accepted' || wasFollowing) {
        setProfile((prev: any) => ({
          ...prev,
          followersCount: Math.max(0, (prev.followersCount || 0) + (nextState === 'accepted' ? -1 : 1)),
        }));
      }
      toast.error("İşlem gerçekleştirilemedi.");
    } finally {
      setIsFollowLoading(false);
    }
  };`;

code = code.replace(handle_follow_old, handle_follow_new);

const btn_old = `<Button
                  variant={following ? "secondary" : "primary"}
                  size="md"
                  isLoading={isFollowLoading}
                  onClick={handleFollow}
                  className={\`rounded-full px-5 font-bold transition-all shadow-xs \${
                    following
                      ? "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                      : "shadow-slate-500/20"
                  }\`}
                >
                  {following ? "Takip Ediliyor" : profile?.followsMe ? "Sende Takip Et" : "Takip Et"}
                </Button>`;

const btn_new = `<Button
                  variant={followStatus !== 'none' ? "secondary" : "primary"}
                  size="md"
                  isLoading={isFollowLoading}
                  onClick={handleFollow}
                  className={\`rounded-full px-5 font-bold transition-all shadow-xs \${
                    followStatus !== 'none'
                      ? "hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                      : "shadow-slate-500/20"
                  }\`}
                >
                  {followStatus === 'accepted' ? "Takip Ediliyor" : followStatus === 'pending' ? "İstek Gönderildi" : profile?.followsMe ? "Sende Takip Et" : "Takip Et"}
                </Button>`;

code = code.replace(btn_old, btn_new);

fs.writeFileSync(path, code);
