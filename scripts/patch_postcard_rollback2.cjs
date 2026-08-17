const fs = require('fs');

let content = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

content = content.replace(
  `      if (!res.ok) setSaved(isCurrentlySaved);
    } catch (e) {
      console.error(e);
    } finally {`,
  `      if (!res.ok) setSaved(isCurrentlySaved);
    } catch (e) {
      console.error(e);
      setSaved(isCurrentlySaved);
    } finally {`
);

content = content.replace(
  `      if (!res.ok) {
        setLiked(isCurrentlyLiked);
        setLikeCount(currentLikeCount);
      }
    } catch (e) {
      console.error(e);
    } finally {`,
  `      if (!res.ok) {
        setLiked(isCurrentlyLiked);
        setLikeCount(currentLikeCount);
      }
    } catch (e) {
      console.error(e);
      setLiked(isCurrentlyLiked);
      setLikeCount(currentLikeCount);
    } finally {`
);

content = content.replace(
  `      if (!res.ok) {
        setReposted(isCurrentlyReposted);
        setRepostCount(currentRepostCount);
      }
    } catch (e) {
      console.error(e);
    } finally {`,
  `      if (!res.ok) {
        setReposted(isCurrentlyReposted);
        setRepostCount(currentRepostCount);
      }
    } catch (e) {
      console.error(e);
      setReposted(isCurrentlyReposted);
      setRepostCount(currentRepostCount);
    } finally {`
);

fs.writeFileSync('src/components/PostCard.tsx', content);
console.log("Patched PostCard rollback catch blocks.");
