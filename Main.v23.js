import * as UI from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/UI.v2.js';
import * as Storage from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.v1.js';
import * as Editor from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Editor.js';
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
                <input type="text" id="searchInput" placeholder="ابحث...">
                <select id="searchType">
                    <option value="name">العنوان</option>
                    <option value="tag">الوسم</option>
                </select>
                <button id="addCardBtn" class="btn-primary">➕ إضافة بطاقة</button>
                <button id="importBtn">📥 استيراد</button>
                
                <div class="zoom-controls">
                    <span>🔍</span>
                    <button id="zoomOut">➖</button>
                    <button id="zoomIn">➕</button>
                </div>

                <button id="exportTxtBtn">📃 TXT</button>
                <button id="exportPdfBtn">📄 PDF</button>
            </div>

            <div class="promo-tools">
                <button id="dealsBtn" class="deals-btn-style">
                    🛒 أدوات الإنتاجية ↗
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
        console.warn("Load Error.");
    }
}

/* ====== 2. LISTENERS ====== */
function initGlobalListeners() {
    const board = document.getElementById("board");

    document.getElementById("addCardBtn").onclick = () => UI.addCard({});

    // تحسين نظام الزووم (Zoom)
    let currentZoom = 1;
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");

    zoomIn.onclick = () => {
        if (currentZoom < 1.5) {
            currentZoom += 0.1;
            board.style.zoom = currentZoom;
        }
    };
    zoomOut.onclick = () => {
        if (currentZoom > 0.5) {
            currentZoom -= 0.1;
            board.style.zoom = currentZoom;
        }
    };

    const dealsBtn = document.getElementById("dealsBtn");
    if (dealsBtn) dealsBtn.onclick = () => window.open('deals.html', '_blank');

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
            const ext = file.name.split('.').pop().toLowerCase();

            reader.onload = async (event) => {
                const content = event.target.result;
                try {
                    if (ext === 'json') {
                        const data = JSON.parse(content);
                        await Storage.importAllCards(data);
                        location.reload();
                    } else {
                        UI.addCard({
                            title: file.name.replace(`.${ext}`, ""),
                            html: ext === 'html' ? content : content.replace(/\n/g, '<br>'),
                            tags: "مستورد"
                        });
                        Storage.saveAllCards();
                    }
                } catch (err) { alert("خطأ في الملف!"); }
            };
            reader.readAsText(file);
        };
    }

    // Context Menu
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
    const observer = new MutationObserver(() => Storage.saveAllCards());
    observer.observe(document.getElementById("board"), { 
        childList: true, 
        subtree: true, 
        characterData: true, 
        attributes: true
    });
}

function injectAdScript() {
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.async = true;
    adScript.src = 'https://pl28764749.effectivegatecpm.com/8f54a65907f2fd9954b6e8ae38ebaa69/invoke.js';
    document.head.appendChild(adScript);
}

