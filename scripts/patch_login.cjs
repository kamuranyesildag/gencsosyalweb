const fs = require('fs');

let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

const search = `            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-700">Şifre</label>
            </div>`;

const replace = `            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-700">Şifre</label>
              <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                Şifremi Unuttum?
              </Link>
            </div>`;

content = content.replace(search, replace);

// Ensure Link is imported
if (!content.includes('import { Link')) {
  content = content.replace('import { useNavigate } from "react-router";', 'import { useNavigate, Link } from "react-router";');
}

fs.writeFileSync('src/pages/Login.tsx', content);
console.log("Patched Login.tsx with Forgot Password link.");
