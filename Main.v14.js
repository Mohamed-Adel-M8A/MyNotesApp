import * as UI from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/UI.js';
import * as Storage from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Storage.js';
import * as Editor from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Editor.js';
import * as Exporter from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/exporter.js';

// ====== APP INITIALIZATION ======
export function initApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

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

    <div id="ad-wrapper" style="margin: 20px auto; text-align: center; min-height: 100px;">
        <div id="container-8f54a65907f2fd9954b6e8ae38ebaa69"></div>
    </div>

    <div id="contextMenu" class="context-menu" style="display:none; position: absolute; z-index: 1000;"></div>
    `;

    initGlobalListeners();
    initAutoSave();
    injectAdScript();

    setTimeout(async () => {
        try {
            const savedCards = await Storage.loadCardsData();
            if (savedCards && Array.isArray(savedCards)) {
                savedCards.forEach(cardData => UI.addCard(cardData));
            }
        } catch (e) {
            console.warn("Load Error.");
        }
    }, 100);
}

// ====== LISTENERS ======
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

// ====== AUTO SAVE ======
function initAutoSave() {
    const board = document.getElementById("board");
    if (!board) return;
    const observer = new MutationObserver(() => Storage.saveAllCards());
    observer.observe(board, { childList: true, subtree: true, characterData: true });
}

// ====== ADS INJECTION ======
function injectNewAd() {
    const adContainer = document.getElementById('ad-container');
    
    window.atOptions = {
        'key' : '5c11d6bd3b90979d196f54bd06080171',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
    };

    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.src = 'https://www.highperformanceformat.com/5c11d6bd3b90979d196f54bd06080171/invoke.js';
    adContainer.appendChild(adScript);
}
