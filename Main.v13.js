import * as UI from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/UI.js';
import * as Storage from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.js';
import * as Editor from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Editor.js';
import * as Exporter from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/exporter.js';

/**
 * تشغيل التطبيق وحقن الواجهة
 */
export function initApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

    // 1. حقن الهيكل الأساسي + حاوية الإعلان
    root.innerHTML = `
    <header>
        <div class="brand">
            <h1>منظم أفكاري</h1>
        </div>
        <div class="toolbar">
            <input type="text" id="searchInput" placeholder="ابحث بالاسم أو الوسم...">
            <select id="searchType">
                <option value="name">العنوان</option>
                <option value="tag">الوسم</option>
            </select>
            <button id="addCardBtn" class="btn-primary">➕ إضافة بطاقة</button>
            <button id="exportTxtBtn">📃 تصدير TXT</button>
            <button id="exportPdfBtn">📄 تصدير PDF</button>
        </div>
    </header>

    <main id="board"></main>

    <div id="ad-wrapper" style="margin: 20px auto; text-align: center; min-height: 100px; padding: 10px;">
        <div id="container-8f54a65907f2fd9954b6e8ae38ebaa69"></div>
    </div>

    <div id="contextMenu" class="context-menu" style="display:none; position: absolute; z-index: 1000;"></div>
    `;

    // 2. تفعيل المستمعات (Listeners)
    initGlobalListeners();
    initAutoSave();

    // 3. حقن سكريبت الإعلان برمجياً
    injectAdScript();

    // 4. تحميل البطاقات المخزنة (مع تأخير بسيط لضمان استقرار البورد)
    setTimeout(() => {
        try {
            const savedCards = Storage.loadCardsData();
            if (savedCards && Array.isArray(savedCards)) {
                savedCards.forEach(cardData => UI.addCard(cardData));
            }
        } catch (e) {
            console.warn("فشل تحميل البيانات أو لا توجد ملاحظات قديمة.");
        }
    }, 100);
}

/**
 * ربط الأزرار والعمليات
 */
function initGlobalListeners() {
    const addBtn = document.getElementById("addCardBtn");
    if (addBtn) addBtn.onclick = () => UI.addCard({});

    const sIn = document.getElementById("searchInput");
    const sTy = document.getElementById("searchType");
    if (sIn && sTy) {
        sIn.oninput = (e) => {
            const term = e.target.value.toLowerCase().trim();
            const type = sTy.value;
            if (UI.filterCards) UI.filterCards(term, type);
        };
    }

    const menu = document.getElementById("contextMenu");
    if (menu) {
        document.addEventListener("click", () => menu.style.display = "none");
        document.body.oncontextmenu = (e) => {
            const disp = e.target.closest(".display");
            if (disp && disp.contentEditable === "true") {
                e.preventDefault();
                Editor.renderContextMenu(e, menu, disp);
            }
        };
    }

    const exTxt = document.getElementById("exportTxtBtn");
    if (exTxt) exTxt.onclick = () => Exporter.exportToTxt();

    const exPdf = document.getElementById("exportPdfBtn");
    if (exPdf) exPdf.onclick = () => Exporter.exportToPDF();
}

/**
 * الحفظ التلقائي عند أي تغيير في البورد
 */
function initAutoSave() {
    const board = document.getElementById("board");
    if (!board) return;
    const observer = new MutationObserver(() => Storage.saveAllCards());
    observer.observe(board, { childList: true, subtree: true, characterData: true });
}

/**
 * حقن سكريبت الإعلان ديناميكياً
 */
function injectAdScript() {
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.async = true;
    adScript.src = 'https://pl28764749.effectivegatecpm.com/8f54a65907f2fd9954b6e8ae38ebaa69/invoke.js';
    document.head.appendChild(adScript);
}

