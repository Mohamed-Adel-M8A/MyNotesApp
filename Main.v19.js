import * as UI from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/UI.js';
import * as Storage from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.js';
import * as Editor from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Editor.js';
import * as Exporter from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/exporter.js';

// ====== APP INITIALIZATION ======
export async function initApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

    root.innerHTML = `
    <header>
        <div class="brand">
            <h1>منظم أفكاري</h1>
        </div>
        <div class="toolbar" style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <div class="main-tools" style="display: flex; gap: 10px; align-items: center;">
                <input type="text" id="searchInput" placeholder="ابحث بالاسم أو الوسم...">
                <select id="searchType">
                    <option value="name">العنوان</option>
                    <option value="tag">الوسم</option>
                </select>
                <button id="addCardBtn" class="btn-primary">➕ إضافة بطاقة</button>
                <button id="importBtn">📥 استيراد</button>
                <button id="exportTxtBtn">📃 TXT</button>
                <button id="exportPdfBtn">📄 PDF</button>
            </div>
            
            <div class="promo-tools">
                <button id="dealsBtn" style="
                    background: #000; 
                    color: #fff; 
                    border: none; 
                    padding: 8px 15px; 
                    border-radius: 5px; 
                    cursor: pointer; 
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    transition: transform 0.2s;
                ">
                    🛒 أدوات الإنتاجية ↗
                </button>
            </div>
            <input type="file" id="fileInput" style="display:none" accept=".json">
        </div>
    </header>

    <div id="ad-container" style="text-align:center; margin:10px auto; min-height:70px;"></div>

    <main id="board"></main>

    <div id="contextMenu" class="context-menu" style="display:none; position: absolute; z-index: 1000;"></div>
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
        console.warn("Load Error.");
    }
}

// ====== LISTENERS ======
function initGlobalListeners() {
    document.getElementById("addCardBtn").onclick = () => UI.addCard({});

    // زر العروض (جهة المعاكسة)
    const dealsBtn = document.getElementById("dealsBtn");
    if (dealsBtn) {
        dealsBtn.onclick = () => window.open('deals.html', '_blank');
        dealsBtn.onmouseover = () => dealsBtn.style.transform = "scale(1.05)";
        dealsBtn.onmouseout = () => dealsBtn.style.transform = "scale(1)";
    }

    const sIn = document.getElementById("searchInput");
    const sTy = document.getElementById("searchType");
    if (sIn && sTy) {
        sIn.oninput = (e) => UI.filterCards(e.target.value.toLowerCase().trim(), sTy.value);
    }

    const importBtn = document.getElementById("importBtn");
    const fileInput = document.getElementById("fileInput");
    if (importBtn && fileInput) {
        importBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const db = await Storage.openDB();
                    const tx = db.transaction("notes", "readwrite");
                    const store = tx.objectStore("notes");
                    await store.clear();
                    data.forEach(item => store.add(item));
                    location.reload();
                } catch (err) { alert("الملف غير صالح! يجب أن يكون ملف Backup بصيغة JSON."); }
            };
            reader.readAsText(file);
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

    document.getElementById("exportTxtBtn").onclick = () => Exporter.exportToTxt();
    document.getElementById("exportPdfBtn").onclick = () => Exporter.exportToPDF();
}

// ====== AUTO SAVE ======
function initAutoSave() {
    const board = document.getElementById("board");
    if (!board) return;
    const observer = new MutationObserver(() => Storage.saveAllCards());
    observer.observe(board, { childList: true, subtree: true, characterData: true });
}

// ====== ADS INJECTION ======
function injectAdScript() {
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.async = true;
    adScript.src = 'https://pl28764749.effectivegatecpm.com/8f54a65907f2fd9954b6e8ae38ebaa69/invoke.js';
    document.head.appendChild(adScript);
}
