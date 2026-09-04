const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

const scrollEffect = `  useEffect(() => {
    if (selectedMediaIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedMediaIndex]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedMediaIndex !== null) {
        setSelectedMediaIndex(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMediaIndex]);
`;

if (!content.includes("document.body.style.overflow = 'hidden'")) {
  content = content.replace(
    /const handleLike = async/,
    scrollEffect + '\n  const handleLike = async'
  );
  fs.writeFileSync(path, content);
  console.log('Added scroll lock effect');
}

