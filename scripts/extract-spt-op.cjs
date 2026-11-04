// One-time, reproducible extraction of declarative prototype assets only.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node CJS extraction script. */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(process.argv[2], 'utf8');
const lines = source.split('\n');
const range = (a, b) => lines.slice(a - 1, b).join('\n');
const constants = range(16, 56) + '\n' + range(82, 83) + '\n' + range(96, 126);
// Only audited declarations, not prototype event handlers or browser scripts.
const selected = constants.slice(0, constants.indexOf('const LAYOUTS='));
const layouts = source.match(/const LAYOUTS=(\{[\s\S]*?\n\});/)[1];
const names = ['PAGES','PAGE_NAMES','tables','BOOKS','bookAccounts','bookCommon','bokFields','profileFields','questionFields','extraFields','propsDefault','NAV'];
const data = vm.runInNewContext(selected + '\nconst LAYOUTS=' + layouts + ';\nJSON.stringify({' + names.join(',') + ',LAYOUTS})', Object.create(null), {timeout: 1000});
const catalog = JSON.parse(data);
const out = path.join(__dirname, '../public/tools/spt-op/forms');
fs.mkdirSync(out, {recursive:true});
catalog.PAGES = catalog.PAGES.map((p, i) => {
  const svg = Buffer.from(p.svg.split(',')[1], 'base64').toString('utf8');
  if (/<script|<foreignObject|onload=|https?:\/\/(?!www.w3.org|www.inkscape.org)/i.test(svg.replace(/xmlns[^=]*="[^"]*"/g,''))) throw Error('Unexpected SVG content');
  fs.writeFileSync(path.join(out, `page-${i+1}.svg`), svg);
  return {w:p.w,h:p.h,src:`/tools/spt-op/forms/page-${i+1}.svg`};
});
fs.mkdirSync(path.join(__dirname,'../src/modules/spt-op'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'../src/modules/spt-op/prototype.json'),JSON.stringify(catalog,null,2)+'\n');
console.log(`Extracted ${catalog.PAGES.length} SVGs and ${Object.keys(catalog.tables).length} table definitions.`);
