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
                    padding: 8px 18px; 
                    border-radius: 6px; 
                    cursor: pointer; 
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                ">
                    🛒 أدوات الإنتاجية ↗
                </button>
            </div>
            
            <input type="file" id="fileInput" style="display:none" accept=".json,.txt,.html">
        </div>
    </header>

    <div id="ad-container" style="text-align:center; margin:10px auto; min-height:70px;">
        <div id="container-8f54a65907f2fd9954b6e8ae38ebaa69"></div>
    </div>

    <main id="board"></main>

    <div id="contextMenu" class="context-menu" style="display:none; position: absolute; z-index: 1000;"></div>
    `;

    initGlobalListeners();
    initAutoSave();
    injectAdScript();

    // تحميل البيانات من IndexedDB
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
    // إضافة بطاقة جديدة
    const addBtn = document.getElementById("addCardBtn");
    if (addBtn) addBtn.onclick = () => UI.addCard({});

    // زر العروض (المكان المعاكس)
    const dealsBtn = document.getElementById("dealsBtn");
    if (dealsBtn) {
        dealsBtn.onclick = () => window.open('deals.html', '_blank');
        dealsBtn.onmouseover = () => dealsBtn.style.transform = "translateY(-2px)";
        dealsBtn.onmouseout = () => dealsBtn.style.transform = "translateY(0)";
    }

    // البحث والفلترة
    const sIn = document.getElementById("searchInput");
    const sTy = document.getElementById("searchType");
    if (sIn && sTy) {
        sIn.oninput = (e) => {
            const term = e.target.value.toLowerCase().trim();
            const type = sTy.value;
            if (UI.filterCards) UI.filterCards(term, type);
        };
    }

    // نظام الاستيراد الذكي (JSON, TXT, HTML)
    const importBtn = document.getElementById("importBtn");
    const fileInput = document.getElementById("fileInput");
    if (importBtn && fileInput) {
        importBtn.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            const extension = file.name.split('.').pop().toLowerCase();

            reader.onload = async (event) => {
                const content = event.target.result;
                try {
                    if (extension === 'json') {
                        const data = JSON.parse(content);
                        const db = await Storage.openDB();
                        const tx = db.transaction("notes", "readwrite");
                        const store = tx.objectStore("notes");
                        await store.clear();
                        data.forEach(item => store.add(item));
                        location.reload();
                    } 
                    else if (extension === 'txt' || extension === 'html') {
                        const newCardData = {
                            id: "card_" + Date.now(),
                            title: file.name.replace(`.${extension}`, ""),
                            html: extension === 'html' ? content : content.replace(/\n/g, '<br>'),
                            tags: "مستورد",
                            color: "#ffffff",
                            targetTime: 0,
                            dir: "rtl"
                        };
                        UI.addCard(newCardData);
                        await Storage.saveAllCards();
                    }
                } catch (err) {
                    alert("خطأ في قراءة الملف!");
                }
            };
            reader.readAsText(file);
        };
    }

    // القائمة الجانبية (ContextMenu)
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

    // أزرار التصدير
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

// ====== ADS INJECTION (OLD SYSTEM) ======
function injectAdScript() {
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.async = true;
    adScript.src = 'https://pl28764749.effectivegatecpm.com/8f54a65907f2fd9954b6e8ae38ebaa69/invoke.js';
    document.head.appendChild(adScript);
}
