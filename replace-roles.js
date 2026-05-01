const fs = require('fs');
const path = require('path');

const dirsToScan = ['app', 'actions', 'components', 'lib', 'types'];

const replacements = [
  { old: /'SUPER_ADMIN'/g, new: "'school_admin'" },
  { old: /"SUPER_ADMIN"/g, new: '"school_admin"' },
  { old: /'SCHOOL_ADMIN'/g, new: "'school_admin'" },
  { old: /"SCHOOL_ADMIN"/g, new: '"school_admin"' },
  { old: /'CLASS_TEACHER'/g, new: "'class_teacher'" },
  { old: /"CLASS_TEACHER"/g, new: '"class_teacher"' },
  { old: /'SUBJECT_TEACHER'/g, new: "'subject_teacher'" },
  { old: /"SUBJECT_TEACHER"/g, new: '"subject_teacher"' },
  { old: /'BURSAR'/g, new: "'bursar'" },
  { old: /"BURSAR"/g, new: '"bursar"' },
  { old: /'PARENT'/g, new: "'parent'" },
  { old: /"PARENT"/g, new: '"parent"' },
  { old: /'STUDENT'/g, new: "'student'" },
  { old: /"STUDENT"/g, new: '"student"' }
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { old: oldPattern, new: newStr } of replacements) {
        if (oldPattern.test(content)) {
          content = content.replace(oldPattern, newStr);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

dirsToScan.forEach(dir => processDirectory(path.join(__dirname, dir)));
console.log("Roles lowercased successfully.");
