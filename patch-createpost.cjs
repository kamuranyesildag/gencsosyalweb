const fs = require('fs');
let content = fs.readFileSync('src/components/CreatePost.tsx', 'utf8');

// Add missing lucide icons
content = content.replace(
  /Trash2,/,
  'Trash2,\n  Globe,\n  Users,\n  Lock,\n  ChevronDown,'
);

// Add visibility state
content = content.replace(
  /const \[isFocused, setIsFocused\] = useState\(false\);/,
  'const [isFocused, setIsFocused] = useState(false);\n  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE" | "FOLLOWERS">("PUBLIC");\n  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);'
);

// Add visibility to API call
content = content.replace(
  /data: \{\n          content,\n          media: mediaUrls,\n          communityId,\n          postType,\n          contentWarning: postType === "SENSITIVE" \? contentWarning : undefined,\n          pollOptions: postType === "POLL" \? filteredOptions : undefined,\n        \},/,
  'data: {\n          content,\n          visibility,\n          media: mediaUrls,\n          communityId,\n          postType,\n          contentWarning: postType === "SENSITIVE" ? contentWarning : undefined,\n          pollOptions: postType === "POLL" ? filteredOptions : undefined,\n        },'
);

// Reset visibility on success
content = content.replace(
  /setIsFocused\(false\);/,
  'setIsFocused(false);\n        setVisibility("PUBLIC");'
);

fs.writeFileSync('src/components/CreatePost.tsx', content);
console.log('Patched states and API call in CreatePost');
