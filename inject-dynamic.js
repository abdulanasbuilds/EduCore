const fs = require('fs');
const path = require('path');

const targetDirs = [
  'app/(dashboard)',
  'app/(auth)',
  'app/setup',
  'app/register',
  'app/apply'
];

const dynamicExport = "export const dynamic = 'force-dynamic';\n";

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('page.tsx') || fullPath.endsWith('layout.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Inject dynamic
      if (!content.includes("export const dynamic = 'force-dynamic'")) {
        content = dynamicExport + content;
      }
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

targetDirs.forEach(dir => processDirectory(path.join(__dirname, dir)));
console.log("Dynamic exports added successfully.");
