#!/usr/bin/env node
// Tez JSX sintaksis tekshiruvi (next build'siz): node scripts/jsx-check.js <fayl...>
// Next bilan birga keladigan Babel parser'dan foydalanadi; import'larni tekshirmaydi,
// faqat sintaksis + e'lon qilinmagan/ishlatilmagan import nomlarini sanaydi.
const fs = require('fs');
const path = require('path');
const bundle = require('next/dist/compiled/babel/bundle');
const parser = bundle.parser();
const traverse = bundle.traverse();

let xato = 0;
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(f, 'utf8');
  let ast;
  try {
    ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] });
  } catch (e) {
    console.log(`✗ ${f}: ${e.message}`);
    xato++;
    continue;
  }
  // Import qilingan nomlar ishlatilganmi?
  const imported = new Map();
  const used = new Set();
  traverse.default(ast, {
    ImportDeclaration(p) {
      p.node.specifiers.forEach((s) => imported.set(s.local.name, p.node.source.value));
    },
    Identifier(p) {
      if (p.parent.type === 'ImportSpecifier' || p.parent.type === 'ImportDefaultSpecifier') return;
      used.add(p.node.name);
    },
    JSXIdentifier(p) {
      used.add(p.node.name);
    },
  });
  const unused = [...imported.keys()].filter((n) => !used.has(n));
  console.log(`✓ ${path.relative(process.cwd(), f)} — sintaksis OK${unused.length ? `; ishlatilmagan import: ${unused.join(', ')}` : ''}`);
}
process.exit(xato ? 1 : 0);
