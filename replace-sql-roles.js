const fs = require('fs');
const path = require('path');

const fullPath = path.join(__dirname, 'supabase/migrations/001_initial_schema.sql');
let content = fs.readFileSync(fullPath, 'utf8');

const replacements = [
  { old: /'SUPER_ADMIN'/g, new: "'school_admin'" },
  { old: /'SCHOOL_ADMIN'/g, new: "'school_admin'" },
  { old: /'CLASS_TEACHER'/g, new: "'class_teacher'" },
  { old: /'SUBJECT_TEACHER'/g, new: "'subject_teacher'" },
  { old: /'BURSAR'/g, new: "'bursar'" },
  { old: /'PARENT'/g, new: "'parent'" },
  { old: /'STUDENT'/g, new: "'student'" }
];

for (const { old: oldPattern, new: newStr } of replacements) {
  content = content.replace(oldPattern, newStr);
}

fs.writeFileSync(fullPath, content);
console.log("SQL Roles lowercased successfully.");
