import * as UI from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/UI.v6.js';
import * as Storage from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.v2.js';
import * as Editor from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Editor.v3.js';
import * as Exporter from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/exporter.js';

/* ====== 1. APP INITIALIZATION ====== */
export async function initApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = `
    <header>
        <div class="brand">
            <h1>منظم أفكاري</h1>
        </div>
        <div class="toolbar">
            <div class="main-tools">
                <input type="text" id="searchInput" placeholder="ابحث عن بطاقة...">
                <select id="searchType">
                    <option value="name">بالعنوان</option>
                    <option value="tag">بالوسم</option>
                    <option value="tag">بالمحتوي</option>
                </select>
                <button id="addCardBtn" class="btn-primary">➕ إضافة بطاقة</button>
                <button id="importBtn">📥 استيراد</button>
                <button id="exportTxtBtn">📃 تصدير TXT</button>
                <button id="exportPdfBtn">📄 تصدير PDF</button>
            </div>

            <div class="promo-tools">
                <button id="dealsBtn" class="deals-btn-style">
                    أدوات الإنتاجية ↗
                </button>
            </div>
            
            <input type="file" id="fileInput" style="display:none" accept=".json,.txt,.html">
        </div>
    </header>

    <main id="board"></main>

    <div id="footer-ads">
        <div id="container-8f54a65907f2fd9954b6e8ae38ebaa69"></div>
    </div>

    <div id="contextMenu" class="context-menu" style="display:none;"></div>
    `;

    initGlobalListeners();
    initAutoSave();
    injectAdScript();

    try {
        const savedCards = await Storage.loadCardsData();
        if (savedCards && Array.isArray(savedCards)) {
            savedCards.forEach(cardData => UI.addCard(cardData));
        }
    } catch (e) {
        console.warn("حدث خطأ أثناء تحميل البيانات السابقة.");
    }
}

/* ====== 2. LISTENERS ====== */
function initGlobalListeners() {
    const board = document.getElementById("board");

    // زر إضافة بطاقة جديدة
    document.getElementById("addCardBtn").onclick = () => UI.addCard({});

    // روابط أدوات الإنتاجية
    const dealsBtn = document.getElementById("dealsBtn");
    if (dealsBtn) dealsBtn.onclick = () => window.open('deals.html', '_blank');

    // نظام البحث والفلترة
    const sIn = document.getElementById("searchInput");
    const sTy = document.getElementById("searchType");
    if (sIn && sTy) {
        sIn.oninput = (e) => UI.filterCards(e.target.value.toLowerCase().trim(), sTy.value);
    }

    // نظام الاستيراد
    const importBtn = document.getElementById("importBtn");
    const fileInput = document.getElementById("fileInput");
    if (importBtn && fileInput) {
        importBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            const ext = file.name.split('.').pop().toLowerCase();

            reader.onload = async (event) => {
                let content = event.target.result;
                try {
                    if (ext === 'json') {
                        const data = JSON.parse(content);
                        const success = await Storage.importAllCards(data);
                        if (success) location.reload();
                    } else if (ext === 'html') {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(content, 'text/html');
                        doc.querySelectorAll('style, script, link').forEach(el => el.remove());
                        doc.querySelectorAll('*').forEach(el => el.removeAttribute('style'));
                        
                        UI.addCard({
                            title: file.name.replace(`.html`, ""),
                            html: doc.body.innerHTML,
                            tags: "مستورد"
                        });
                        Storage.saveAllCards();
                    } else {
                        UI.addCard({
                            title: file.name.replace(`.${ext}`, ""),
                            html: content.replace(/\n/g, '<br>'),
                            tags: "مستورد"
                        });
                        Storage.saveAllCards();
                    }
                } catch (err) { alert("الملف تالف أو غير مدعوم!"); }
            };
            reader.readAsText(file);
        };
    }

    // القائمة الجانبية (Context Menu) للمحرر
    const menu = document.getElementById("contextMenu");
    document.addEventListener("click", () => menu.style.display = "none");
    document.body.oncontextmenu = (e) => {
        const disp = e.target.closest(".display");
        if (disp && disp.contentEditable === "true") {
            e.preventDefault();
            Editor.renderContextMenu(e, menu, disp);
        }
    };

    document.getElementById("exportTxtBtn").onclick = () => Exporter.exportToTxt();
    document.getElementById("exportPdfBtn").onclick = () => Exporter.exportToPDF();
}

/* ====== 3. UTILS ====== */
function initAutoSave() {
    const observer = new MutationObserver(() => {
        Storage.saveAllCards();
    });

    observer.observe(document.getElementById("board"), { 
        childList: true, 
        subtree: true, 
        characterData: true, 
        attributes: true,
        attributeFilter: ['style', 'dir'] 
    });
}

function injectAdScript() {
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.async = true;
    adScript.src = 'https://pl28764749.effectivegatecpm.com/8f54a65907f2fd9954b6e8ae38ebaa69/invoke.js';
    document.head.appendChild(adScript);
}



/* ====== 4. Tool ====== */
let selectionTimeout;
document.addEventListener('selectionchange', () => {
    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();
        const menu = document.getElementById("context-menu");

        if (text.length > 0 && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            const fakeEvent = {
                pageX: rect.left + window.scrollX,
                pageY: rect.top + window.scrollY - 10
            };

            if (typeof renderContextMenu === 'function') {
                renderContextMenu(fakeEvent, menu);
            }
        }
    }, 200);
});

