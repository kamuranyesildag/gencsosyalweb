const fs = require('fs');
let content = fs.readFileSync('server/validators/api.ts', 'utf8');

const target = `export const createPostSchema = z.object({
  content: z.string().max(2000).optional(),
  communityId: z.number().int().positive().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]).default("PUBLIC"),
  media: z.array(z.object({
    url: z.string(),
    type: z.enum(["image", "video"]),
    width: z.number().optional(),
    height: z.number().optional()
  })).optional()
}).refine(data => data.content || (data.media && data.media.length > 0), {`;

const replacement = `export const createPostSchema = z.object({
  content: z.string().max(2000).optional(),
  communityId: z.number().int().positive().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE", "FOLLOWERS"]).default("PUBLIC"),
  postType: z.enum(["NORMAL", "POLL", "SENSITIVE"]).default("NORMAL"),
  contentWarning: z.string().max(100).optional(),
  pollOptions: z.array(z.string().min(1).max(100)).min(2).max(10).optional(),
  media: z.array(z.object({
    url: z.string(),
    type: z.enum(["image", "video"]),
    width: z.number().optional(),
    height: z.number().optional()
  })).optional()
}).refine(data => {
  if (data.postType === "POLL" && (!data.pollOptions || data.pollOptions.length < 2)) return false;
  if (data.postType === "SENSITIVE" && !data.contentWarning) return false;
  return data.content || (data.media && data.media.length > 0) || (data.postType === "POLL");
}, {`;

content = content.replace(target, replacement);
fs.writeFileSync('server/validators/api.ts', content);
