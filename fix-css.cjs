const fs = require('fs');
const path = 'C:/Users/user/Desktop/naryn-services/src/styles/index.css';

let content = fs.readFileSync(path, 'utf8');

// Fix background-clip
content = content.replace(
  /-webkit-background-clip:\s*text;/g,
  '-webkit-background-clip: text;\n  background-clip: text;'
);

// Fix line-clamp without important
content = content.replace(
  /(\s*)-webkit-line-clamp:\s*2;/g,
  '$1-webkit-line-clamp: 2;$1line-clamp: 2;'
);

// Fix line-clamp with important
content = content.replace(
  /(\s*)-webkit-line-clamp:\s*2\s*!important;/g,
  '$1-webkit-line-clamp: 2 !important;$1line-clamp: 2 !important;'
);

// De-duplicate in case I added it where it already existed
content = content.replace(/(\s*line-clamp:\s*2\s*!important;)+/g, '$1');
content = content.replace(/(\s*line-clamp:\s*2;)+/g, '$1');

fs.writeFileSync(path, content, 'utf8');
console.log('CSS fixed');
