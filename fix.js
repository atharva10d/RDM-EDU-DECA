const fs = require('fs');
const path = 'C:/Studies/RDM Intenship/edu-deca-final/apps/mobile/src/screens/main/QuizScreen.tsx';
let code = fs.readFileSync(path, 'utf8');
code = code.replace(/\\\/g, '').replace(/\\\$/g, '');
fs.writeFileSync(path, code);
