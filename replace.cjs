const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/medBlue/g, 'primary')
    .replace(/bg-blue-50/g, 'bg-orange-50')
    .replace(/bg-blue-100/g, 'bg-orange-100')
    .replace(/text-blue-200/g, 'text-orange-200')
    .replace(/text-blue-300/g, 'text-orange-300')
    .replace(/text-blue-400/g, 'text-orange-400')
    .replace(/text-blue-500/g, 'text-orange-500')
    .replace(/border-blue-50/g, 'border-orange-50')
    .replace(/border-blue-100/g, 'border-orange-100')
    .replace(/border-blue-200/g, 'border-orange-200')
    .replace(/bg-med-gradient/g, 'bg-primary-gradient');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Modified', filePath);
  }
}

function walkArgs(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (!p.includes('node_modules')) walkArgs(p);
    } else {
      if (p.endsWith('.tsx') || p.endsWith('.ts') || p.endsWith('.html')) replaceInFile(p);
    }
  });
}

walkArgs(process.cwd());
