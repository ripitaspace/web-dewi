# Invoice Retur acceptance checks

`npm run test:invoice-retur` runs the standalone normalization and grouping checks.

For the full acceptance suite, supply the directory containing the four original
PDFs and local copies of the browser libraries. The runtime currently uses PDF.js
3.11.174 (including its worker) and SheetJS 0.18.5 from the CDN URLs in
`public/tools/invoice-retur/Invoice_Retur_Scrapper.html`. Save those scripts with
`.cjs` extensions for Node. Run using Node 20+:

```sh
RETURN_PDF_DIR=/path/to/private/pdfs \
PDFJS_TEST_MODULE=/path/to/pdf-3.11.174.cjs \
PDFJS_TEST_WORKER=/path/to/pdf-worker-3.11.174.cjs \
XLSX_TEST_MODULE=/path/to/xlsx-0.18.5.cjs \
node tests/invoice-retur-parser.test.cjs
```

The source PDFs remain outside the repository. Expected output is eight notes and
19 items. The suite checks every item name, quantity, unit, price and value;
note number, reference, return date, totals, page attribution, stable reimport
keys, and an XLSX write/read round-trip including zeros and text identifiers.
When no PDF directory is configured the suite explicitly reports unit checks
only; it does not claim the original documents passed.

Browser smoke check on `/karya/pajak/invoice-retur-rahasia`:

1. Upload the four original PDFs via the file chooser; expect eight notes and
   19 table rows. Upload them again; those counts must remain unchanged.
2. Review HO102656, change the first quantity to 1.5 and check the return value
   updates to 253654.5. Restore quantity 0.833 and the printed value 140863.
3. Download Excel and verify 19 item rows, the restored value, correct return
   dates, and no PPnBM equal to 2026. Check the results table and review on desktop
   and a 390px viewport; horizontal tables scroll inside their panels.

Amounts printed in the document remain authoritative. Differences greater than
Rp1 between calculated and printed values require review. Blank totals remain
blank; explicit dashes become zero. No tax rates or missing amounts are inferred.
