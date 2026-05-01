const fs = require('fs');
const path = require('path');

const targetDirs = [
  'app/(dashboard)',
  'app/(auth)',
  'app/setup',
  'app/register',
  'app/apply'
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const hasUseClient1 = content.includes('"use client"');
      const hasUseClient2 = content.includes("'use client'");
      const hasDynamic = content.includes("export const dynamic = 'force-dynamic';");

      if ((hasUseClient1 || hasUseClient2) && hasDynamic) {
        // Strip out the use client directives and dynamic export
        content = content.replace(/"use client";?\s*/g, '');
        content = content.replace(/'use client';?\s*/g, '');
        content = content.replace(/export const dynamic = 'force-dynamic';\s*/g, '');

        // Prepend them in correct order
        content = '"use client";\nexport const dynamic = \'force-dynamic\';\n\n' + content;
        
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

targetDirs.forEach(dir => processDirectory(path.join(__dirname, dir)));
console.log("Client components fixed.");
