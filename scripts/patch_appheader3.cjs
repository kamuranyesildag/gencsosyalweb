const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/AppHeader.tsx', 'utf8');

const regex = /<button\s*onClick=\{\(\) => \{ if \(\!isAuthenticated\) openModal\(\); else navigate\('\/notifications'\); \}\}\s*className="p-2\.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"\s*aria-label="Bildirimler"\s*>\s*<Bell className="w-5 h-5 stroke-\[2\]" \/>\s*<\/button>\s*<button\s*onClick=\{\(\) => \{ if \(\!isAuthenticated\) openModal\(\); else navigate\('\/messages'\); \}\}\s*className="p-2\.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex"\s*aria-label="Mesajlar"\s*>\s*<Mail className="w-5 h-5 stroke-\[2\]" \/>\s*<\/button>\s*<div className="ml-1 sm:ml-2">\s*<UserMenu \/>\s*<\/div>/g;

const replacement = `{isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/notifications')}
                className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                aria-label="Bildirimler"
              >
                <Bell className="w-5 h-5 stroke-[2]" />
              </button>
              
              <button
                onClick={() => navigate('/messages')}
                className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:flex"
                aria-label="Mesajlar"
              >
                <Mail className="w-5 h-5 stroke-[2]" />
              </button>

              <div className="ml-1 sm:ml-2">
                <UserMenu />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 ml-1">
              <Link to="/login" className="text-xs sm:text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors px-2 sm:px-3 py-1.5 sm:py-2">Giriş Yap</Link>
              <Link to="/register" className="text-xs sm:text-sm font-bold bg-gray-900 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">Kayıt Ol</Link>
            </div>
          )}`;

if(regex.test(content)) {
    console.log("Regex matches");
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/components/navigation/AppHeader.tsx', content);
} else {
    console.log("Regex does not match");
}
