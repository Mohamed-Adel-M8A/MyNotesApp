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
            
            <div class="main-tools" style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                <input type="text" id="searchInput" placeholder="ابحث...">
                <select id="searchType">
                    <option value="name">العنوان</option>
                    <option value="tag">الوسم</option>
                </select>
                <button id="addCardBtn" class="btn-primary">➕ إضافة بطاقة</button>
                <button id="importBtn">📥 استيراد</button>
                
                <div class="zoom-controls" style="display: flex; align-items: center; gap: 5px; background: #eee; padding: 5px; border-radius: 5px;">
                    <span>🔍</span>
                    <button id="zoomOut">➖</button>
                    <button id="zoomIn">➕</button>
                </div>

                <button id="exportTxtBtn">📃 TXT</button>
                <button id="exportPdfBtn">📄 PDF</button>
            </div>

            <div class="promo-tools">
                <button id="dealsBtn" style="background: #000; color: #fff; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                    🛒 أدوات الإنتاجية ↗
                </button>
            </div>
            
            <input type="file" id="fileInput" style="display:none" accept=".json,.txt,.html">
        </div>
    </header>

    <main id="board"></main>

    <div id="footer-ads" style="text-align:center; margin: 30px auto; padding: 20px; border-top: 1px dashed #ccc;">
        <div id="container-8f54a65907f2fd9954b6e8ae38ebaa69"></div>
    </div>

    <div id="contextMenu" class="context-menu" style="display:none; position: absolute; z-index: 1000;"></div>
    `;

    initGlobalListeners();
    initAutoSave();
    injectAdScript();

    // تحميل البيانات
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
    const board = document.getElementById("board");

    // إضافة بطاقة
    document.getElementById("addCardBtn").onclick = () => UI.addCard({});

    // ميزة الزووم (التكبير والتصغير للبطاقات)
    let currentZoom = 1;
    document.getElementById("zoomIn").onclick = () => {
        if (currentZoom < 1.5) {
            currentZoom += 0.1;
            board.style.transform = `scale(${currentZoom})`;
            board.style.transformOrigin = "top center";
        }
    };
    document.getElementById("zoomOut").onclick = () => {
        if (currentZoom > 0.5) {
            currentZoom -= 0.1;
            board.style.transform = `scale(${currentZoom})`;
            board.style.transformOrigin = "top center";
        }
    };

    // زر العروض
    const dealsBtn = document.getElementById("dealsBtn");
    if (dealsBtn) dealsBtn.onclick = () => window.open('deals.html', '_blank');

    // البحث
    const sIn = document.getElementById("searchInput");
    const sTy = document.getElementById("searchType");
    if (sIn && sTy) {
        sIn.oninput = (e) => UI.filterCards(e.target.value.toLowerCase().trim(), sTy.value);
    }

    // الاستيراد المطور
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
                        const db = await Storage.openDB();
                        const tx = db.transaction("notes", "readwrite");
                        await tx.objectStore("notes").clear();
                        data.forEach(item => tx.objectStore("notes").add(item));
                        location.reload();
                    } else {
                        const newCard = {
                            id: "card_" + Date.now(),
                            title: file.name.replace(`.${ext}`, ""),
                            html: ext === 'html' ? content : content.replace(/\n/g, '<br>'),
                            tags: "مستورد", color: "#ffffff", targetTime: 0, dir: "rtl"
                        };
                        UI.addCard(newCard);
                        await Storage.saveAllCards();
                    }
                } catch (err) { alert("خطأ في الملف!"); }
            };
            reader.readAsText(file);
        };
    }

    // إدارة أحداث البطاقة (Minimize / Maximize) عبر الـ Delegation
    board.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card) return;

        if (e.target.classList.contains('btn-minimize')) {
            card.classList.toggle('minimized');
            const display = card.querySelector('.display');
            display.style.display = display.style.display === 'none' ? 'block' : 'none';
        }

        if (e.target.classList.contains('btn-maximize')) {
            card.classList.toggle('full-screen');
        }
    });

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

// ====== AUTO SAVE ======
function initAutoSave() {
    const observer = new MutationObserver(() => Storage.saveAllCards());
    observer.observe(document.getElementById("board"), { childList: true, subtree: true, characterData: true });
}

// ====== ADS INJECTION ======
function injectAdScript() {
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.async = true;
    adScript.src = 'https://pl28764749.effectivegatecpm.com/8f54a65907f2fd9954b6e8ae38ebaa69/invoke.js';
    document.head.appendChild(adScript);
}
