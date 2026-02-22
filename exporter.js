// ====== 1. دالة المساعدة الأساسية للتحميل ======
function downloadFile(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type: `${type};charset=utf-8` });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ====== 2. تصدير بطاقة واحدة (TXT) ======
export function exportSingleCardAsTxt(card) {
  const title = card.querySelector('.title').textContent.trim();
  const body = card.querySelector('.display').textContent.trim();
  const tags = card.dataset.tags || "";

  const content = `# ${title}\nالوسوم: ${tags}\n\nالمحتوى:\n${body}`;
  downloadFile(`${title || "Note"}.txt`, content);
}

// ====== 3. تصدير بطاقة واحدة (HTML) ======
export function exportSingleCardAsHTML(card) {
  const title = card.querySelector('.title').textContent.trim();
  const body = card.querySelector('.display').innerHTML;
  const tags = card.dataset.tags || "";
  const cardColor = card.style.backgroundColor || "#ffffff";

  const htmlContent = `
<!DOCTYPE html>
<html dir="${card.dir || 'rtl'}" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; padding: 40px; background-color: #f1f5f9; color: #334155; }
        .card-export { max-width: 800px; margin: auto; background: ${cardColor}; border: 1px solid #cbd5e1; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .tags { color: #2563eb; font-size: 0.9em; margin-bottom: 20px; font-weight: bold; }
        h1 { border-bottom: 2px solid #2563eb; padding-bottom: 10px; color: #1e293b; }
        .content { white-space: pre-wrap; word-wrap: break-word; }
        a { color: #2563eb; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="card-export">
        <h1>${title}</h1>
        <div class="tags">الوسوم: ${tags}</div>
        <div class="content">${body}</div>
    </div>
</body>
</html>`;

  downloadFile(`${title || "Note"}.html`, htmlContent, 'text/html');
}

// ====== 4. تصدير بطاقة واحدة (Markdown) ======
export function exportSingleCardAsMD(card) {
  const title = card.querySelector('.title').textContent.trim();
  const tags = card.dataset.tags || "";
  
  // تحويل HTML بسيط إلى Markdown لضمان توافق التنسيق
  let body = card.querySelector('.display').innerHTML;
  
  body = body
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<u.*?>(.*?)<\/u>/gi, '$1')
    .replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<h2.*?>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3.*?>(.*?)<\/h3>/gi, '### $1\n')
    .replace(/<span.*?>(.*?)<\/span>/gi, '$1');

  const mdContent = `# ${title}\n\n**الوسوم:** ${tags}\n\n---\n\n${body}`;
  downloadFile(`${title || "Note"}.md`, mdContent);
}

// ====== 5. تصدير بطاقة واحدة (PDF) ======
export function exportSingleCardAsPDF(card) {
  const title = card.querySelector('.title').textContent.trim();
  const body = card.querySelector('.display').innerHTML;
  const tags = card.dataset.tags || "";

  const printWindow = window.open('', '_blank');
  
  const htmlContent = `
      <html dir="rtl">
      <head>
          <title>${title}</title>
          <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; direction: rtl; line-height: 1.6; }
              .card-header { border-bottom: 2px solid #3498db; margin-bottom: 20px; padding-bottom: 10px; }
              h1 { color: #2c3e50; margin: 0; }
              .tags { color: #7f8c8d; font-size: 14px; margin-top: 5px; }
              .content { font-size: 16px; color: #333; white-space: pre-wrap; }
              a { color: #2980b9; }
          </style>
      </head>
      <body>
          <div class="card-header">
              <h1>${title}</h1>
              <div class="tags">الوسوم: ${tags}</div>
          </div>
          <div class="content">${body}</div>
      </body>
      </html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
  };
}

// ====== 6. تصدير جميع البطاقات (TXT) ======
export function exportToTxt() {
  const cards = document.querySelectorAll('.card');
  if (cards.length === 0) return alert("لا توجد بطاقات لتصديرها!");

  let fullContent = "--- سجل الملاحظات الكامل ---\n\n";

  cards.forEach((card, i) => {
      const title = card.querySelector('.title').textContent.trim();
      const body = card.querySelector('.display').textContent.trim();
      const tags = card.dataset.tags || "";

      fullContent += `[${i + 1}] ${title}\nالوسوم: ${tags}\nالمحتوى:\n${body}\n`;
      fullContent += `--------------------------------\n\n`;
  });

  downloadFile("جميع_الملاحظات.txt", fullContent);
}

// ====== 7. تصدير جميع البطاقات (PDF) ======
export function exportToPDF() {
  const cards = document.querySelectorAll('.card');
  if (cards.length === 0) return alert("لا توجد بطاقات لتصديرها!");

  const printWindow = window.open('', '_blank');
  let cardsHtml = '';

  cards.forEach(card => {
      const title = card.querySelector('.title').textContent.trim();
      const body = card.querySelector('.display').innerHTML;
      const tags = card.dataset.tags || "";
      
      cardsHtml += `
          <div class="pdf-card">
              <h2>${title}</h2>
              <p class="pdf-tags">الوسوم: ${tags}</p>
              <div class="pdf-body">${body}</div>
          </div>`;
  });

  const htmlContent = `
      <html dir="rtl">
      <head>
          <title>تصدير جميع الملاحظات</title>
          <style>
              body { font-family: 'Arial', sans-serif; padding: 20px; direction: rtl; }
              .pdf-card { border-bottom: 1px solid #ddd; padding: 20px 0; page-break-inside: avoid; }
              h2 { color: #2c3e50; margin-bottom: 5px; }
              .pdf-tags { color: #7f8c8d; font-size: 13px; margin-bottom: 10px; }
              .pdf-body { line-height: 1.6; color: #333; }
              h1 { text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
          </style>
      </head>
      <body>
          <h1>سجل الأفكار الكامل</h1>
          ${cardsHtml}
      </body>
      </html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
  };
}

