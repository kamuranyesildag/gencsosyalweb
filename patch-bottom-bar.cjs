const fs = require('fs');
let content = fs.readFileSync('src/components/CreatePost.tsx', 'utf8');

const postTypeRegex = /\{\/\* Post Type Selector - Modernized Segmented Control \*\/\}[\s\S]*?<\/div>\s*\{\/\* Sensitive Warning Input Area \*\/\}/;
content = content.replace(postTypeRegex, '{/* Sensitive Warning Input Area */}');

const oldBottomBar = `{/* Bottom Bar: Action Icons & Submit Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 ml-[-8px]">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else fileInputRef.current?.click();
                }}
                disabled={mediaFiles.length >= 4}
                aria-label="Medya Ekle"
                className="flex items-center justify-center w-9 h-9 rounded-full text-blue-500 hover:bg-blue-50 disabled:opacity-40 transition-colors"
              >
                <ImageIcon className="w-[18px] h-[18px] stroke-[2]" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
            </div>
            
            <Button
              variant="primary"
              size="sm"
              disabled={!isFormValid()}
              isLoading={loading}
              onClick={handleSubmit}
              className="px-5 py-2 font-bold rounded-full text-[15px] bg-blue-500 hover:bg-blue-600 border-0"
            >
              Paylaş
            </Button>
          </div>`;

const newBottomBar = `{/* Bottom Bar: Action Icons & Submit Button */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1 ml-[-8px]">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) openModal();
                  else fileInputRef.current?.click();
                }}
                disabled={mediaFiles.length >= 4}
                aria-label="Medya Ekle"
                className="flex items-center justify-center w-9 h-9 rounded-full text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 disabled:opacity-40 transition-colors"
              >
                <ImageIcon className="w-[18px] h-[18px] stroke-[2]" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
              />
              
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) return openModal();
                  setPostType(postType === "POLL" ? "NORMAL" : "POLL");
                }}
                aria-label="Anket Ekle"
                className={\`flex items-center justify-center w-9 h-9 rounded-full transition-colors \${postType === "POLL" ? "text-white bg-indigo-500" : "text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"}\`}
              >
                <ListOrdered className="w-[18px] h-[18px] stroke-[2]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) return openModal();
                  setPostType(postType === "SENSITIVE" ? "NORMAL" : "SENSITIVE");
                }}
                aria-label="Hassas İçerik"
                className={\`flex items-center justify-center w-9 h-9 rounded-full transition-colors \${postType === "SENSITIVE" ? "text-white bg-rose-500" : "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"}\`}
              >
                <ShieldAlert className="w-[18px] h-[18px] stroke-[2]" />
              </button>
            </div>
            
            <Button
              variant="primary"
              size="sm"
              disabled={!isFormValid()}
              isLoading={loading}
              onClick={handleSubmit}
              className="px-6 py-2.5 font-bold rounded-full text-[15px] shadow-sm"
            >
              Paylaş
            </Button>
          </div>`;

content = content.replace(oldBottomBar, newBottomBar);

// We should also replace standard textarea border styles to match new modern layout
content = content.replace(
  /className="w-full bg-transparent resize-none outline-none text-\[15px\] sm:text-\[17px\] min-h-\[56px\] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 py-1 transition-all leading-relaxed"/,
  'className="w-full bg-transparent resize-none outline-none text-[15px] sm:text-[17px] min-h-[56px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 py-1 transition-all leading-relaxed font-medium"'
);

fs.writeFileSync('src/components/CreatePost.tsx', content);
console.log('Patched bottom bar');
