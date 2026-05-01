const fs = require('fs');
const content = fs.readFileSync('actions/registration- actions. ts', 'utf8');
['actions/registration- actions. ts', 'actions/registration- actions. ts', 'actions/registration- actions. ts'].forEach(f => fs.writeFileSync(f, content, 'utf8'));
console.log('synced');