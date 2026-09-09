const fs = require('fs');
const path = 'server/routes/follows.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'import { follows, blocks, users, profiles, notifications } from "../../src/db/schema.js";',
  'import { follows, blocks, users, profiles, notifications } from "../../src/db/schema.js";\nimport { notify } from "../utils/notifications.js";'
);

code = code.replace(
  `await tx.insert(notifications).values({ 
          actorId: currentUserId, 
          recipientId: followerId, 
          type: 'follow_accepted' 
        });`,
  `await notify(currentUserId, followerId, 'follow_accepted', undefined, undefined, undefined, tx);`
);

code = code.replace(
  `await tx.insert(notifications).values({ 
          actorId: currentUserId, 
          recipientId: targetUserId, 
          type: notifType 
        });`,
  `await notify(currentUserId, targetUserId, notifType, undefined, undefined, undefined, tx);`
);

fs.writeFileSync(path, code);
