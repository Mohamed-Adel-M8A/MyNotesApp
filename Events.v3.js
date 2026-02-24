import * as UI from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/UI.v12.js';
import * as Storage from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.v2.js';
import * as Editor from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/Editor.v3.js';
import * as Exporter from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/exporter.js';

// ====== GLOBAL EVENT LISTENERS ======
export function initGlobalListeners() {
    const addBtn = document.getElementById("addCardBtn");
    if (addBtn) addBtn.onclick = () => UI.addCard({});

    const dirBtn = document.getElementById("toggleDirBtn");
    if (dirBtn) {
        dirBtn.onclick = () => {
            const b = document.body;
            b.dir = b.dir === "rtl" ? "ltr" : "rtl";
            b.style.textAlign = b.dir === "rtl" ? "right" : "left";
        };
    }

    const exTxt = document.getElementById("exportTxtBtn");
    if (exTxt) exTxt.onclick = () => Exporter.exportToTxt();

    const exPdf = document.getElementById("exportPdfBtn");
    if (exPdf) exPdf.onclick = () => Exporter.exportToPDF();

    // --- SEARCH SYSTEM ---
    const sIn = document.getElementById("searchInput");
    const sTy = document.getElementById("searchType");
    if (sIn && sTy) {
        sIn.oninput = (e) => {
            const term = e.target.value.toLowerCase().trim();
            const type = sTy.value;
            UI.filterCards(term, type);
        };
    }

    // --- CONTEXT MENU CONTROL ---
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
}

// ====== AUTO SAVE SYSTEM ======
export function initAutoSave() {
    const board = document.getElementById("board");
    if (!board) return;

    const observer = new MutationObserver(() => {
        Storage.saveAllCards();
    });

    observer.observe(board, {
        childList: true,
        subtree: true,
        characterData: true
    });

}













