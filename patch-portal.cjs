const fs = require('fs');
const path = 'src/components/PostCard.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add createPortal import
if (!content.includes('createPortal')) {
  content = content.replace(
    /import React, { useState, useEffect, useRef } from "react";/,
    'import React, { useState, useEffect, useRef } from "react";\nimport { createPortal } from "react-dom";'
  );
}

// 2. Wrap the lightbox in createPortal
const lightboxStart = `      {/* Media Viewer Lightbox */}
      <AnimatePresence>
        {selectedMediaIndex !== null && (`;
        
const newLightboxStart = `      {/* Media Viewer Lightbox */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedMediaIndex !== null && (`;
          
const lightboxEnd = `        )}
      </AnimatePresence>

    </article>`;
    
const newLightboxEnd = `          )}
        </AnimatePresence>,
        document.body
      )}

    </article>`;

content = content.replace(lightboxStart, newLightboxStart);
content = content.replace(lightboxEnd, newLightboxEnd);

fs.writeFileSync(path, content);
console.log('Patched Lightbox with createPortal');
