// ═══════════════════════════════════════════════════════════════════════════
// PDF Text Extractor — uses pdf.js to extract text from PDFs in-browser
// No server upload required — everything happens client-side
// ═══════════════════════════════════════════════════════════════════════════

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const MAX_PAGES = 15; // enough for a research paper, avoids timeout

export async function extractTextFromPDFUrl(url) {
  const loadingTask = pdfjsLib.getDocument({
    url,
    withCredentials: false,
  });
  const pdf = await loadingTask.promise;
  return extractPages(pdf);
}

export async function extractTextFromPDFFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return extractPages(pdf);
}

async function extractPages(pdf) {
  const pagesToRead = Math.min(pdf.numPages, MAX_PAGES);
  const textPages = [];

  for (let pageNum = 1; pageNum <= pagesToRead; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    textPages.push(pageText);
  }

  return textPages.join('\n\n');
}
