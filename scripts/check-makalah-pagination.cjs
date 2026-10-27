// Browser regression check: NODE_PATH must include Playwright when not installed locally.
const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && /unique.*key|same key/i.test(message.text())) errors.push(message.text()); });
    await page.addInitScript(() => {
      window.print = () => { window.__printAudit = {
        ready: !!document.querySelector('[data-pagination-ready="true"]'),
        printing: document.body.classList.contains('makalah-printing'),
        pages: document.querySelectorAll('[data-paper-page]').length,
      }; };
    });
    await page.goto('http://localhost:3000/karya/tools/makalah-generator');
    if (process.argv[2]) {
      await page.getByPlaceholder('Paste XML di sini...').fill(fs.readFileSync(process.argv[2], 'utf8'));
      await page.getByRole('button', { name: 'Import XML dari teks', exact: true }).click();
    }
    // Print directly from import/editor; the handler must wait for pagination to finish.
    await page.getByRole('button', { name: 'Print / PDF', exact:true }).click();
    await page.waitForFunction(() => window.__printAudit);
    const printAudit = await page.evaluate(() => window.__printAudit);
    assert.ok(printAudit.ready && printAudit.printing && printAudit.pages > 1, 'Print must wait for ready pages');
    await page.locator('[data-pagination-ready="true"]').waitFor({ timeout: 30000 });
    const audit = async () => page.evaluate(() => {
      const normalize = text => text.replace(/\s+/g, '');
      const source = document.querySelector('[data-pagination-source]');
      const content = [...document.querySelectorAll('[data-paper-page="content"] [data-page-flow]')];
      const bounds = [];
      for (const flow of document.querySelectorAll('[data-page-flow]')) {
        const box = flow.getBoundingClientRect();
        const walker = document.createTreeWalker(flow, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (!node.textContent.trim()) continue;
          const range = document.createRange(); range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.bottom > box.bottom + 1 || rect.right > box.right + 1 || rect.left < box.left - 1) bounds.push({text:node.textContent.slice(0,80),bottom:rect.bottom-box.bottom,right:rect.right-box.right,left:rect.left-box.left});
          }
        }
      }
      return {
        source: normalize(source.textContent), rendered: normalize(content.map(node => node.textContent).join('')),
        bounds, pages: document.querySelectorAll('[data-paper-page]').length,
        numbers: [...document.querySelectorAll('[data-paper-page="content"] [aria-label^="Nomor halaman"]')].map(el=>el.textContent),
        dimensions: [...document.querySelectorAll('[data-paper-page]')].map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})),
      };
    });
    const screen = await audit();
    if (screen.rendered !== screen.source) {
      let index = 0;
      while (screen.rendered[index] === screen.source[index] && index < screen.source.length) index++;
      throw new Error(JSON.stringify({message:'Preview text differs', index, sourceLength:screen.source.length, renderedLength:screen.rendered.length, source:screen.source.slice(Math.max(0,index-80),index+160), rendered:screen.rendered.slice(Math.max(0,index-80),index+160)}));
    }
    assert.deepEqual(screen.bounds, [], 'No text may cross the A4 content box');
    screen.numbers.forEach((number,index)=>assert.equal(number,String(index+1)));
    await page.setViewportSize({width:500,height:850});
    const mobile = await audit();
    assert.deepEqual(mobile, screen, 'Viewport width must not change physical A4 pagination');
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(() => { document.body.classList.add('makalah-printing'); });
    await page.emulateMedia({media:'print'});
    const print = await audit();
    assert.equal(print.rendered, screen.rendered);
    assert.deepEqual(print.bounds, [], 'Printed text must stay inside content area');
    assert.deepEqual(print.dimensions, screen.dimensions, 'Print and preview use identical A4 dimensions');
    const tag = process.argv[3] || 'sample';
    await page.pdf({ path: `/private/tmp/makalah-${tag}.pdf`, preferCSSPageSize: true, printBackground:true });
    await page.locator('[data-paper-page="content"]').first().screenshot({path:`/private/tmp/makalah-${tag}.png`});
    assert.deepEqual(errors, [], 'Browser must not raise runtime errors');
    console.log(JSON.stringify({tag,pages:screen.pages,characters:screen.source.length,numbers:screen.numbers,clipped:screen.bounds.length,pdf:`/private/tmp/makalah-${tag}.pdf`}));
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
