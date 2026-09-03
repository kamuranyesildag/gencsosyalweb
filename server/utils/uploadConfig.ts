import path from "path";
import fs from "fs";

export const getUploadDir = () => {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
};

export const ensureUploadDir = () => {
  const dir = getUploadDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};
