const fs = require('fs');
let content = fs.readFileSync('src/components/InfiniteScroll.tsx', 'utf8');

content = content.replace(
  '  }, [hasMore, isLoading, onLoadMore]);',
  '  }, [hasMore, isLoading, onLoadMore, isAuthenticated, openModal]);'
);

fs.writeFileSync('src/components/InfiniteScroll.tsx', content);
