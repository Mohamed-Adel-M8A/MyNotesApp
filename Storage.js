const DB_NAME = "NotesAppDB";
const DB_VERSION = 1;
const STORE_NAME = "notes";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject("IndexedDB Open Error");
    });
}

// ====== STORAGE ENGINE (SAVE) ======
export async function saveAllCards() {
    const cards = document.querySelectorAll('.card');
    const data = Array.from(cards).map(card => ({
        id: card.dataset.id,
        title: card.querySelector('.title')?.textContent || "",
        html: card.querySelector('.display')?.innerHTML || "",
        tags: card.dataset.tags || "",
        color: card.style.backgroundColor || "#ffffff",
        targetTime: parseInt(card.dataset.targettime || "0"),
        dir: card.dir || "rtl"
    }));

    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        await store.clear();
        for (const item of data) {
            store.add(item);
        }
        return new Promise((resolve) => {
            tx.oncomplete = () => resolve();
        });
    } catch (e) {
        console.error("Save Error:", e);
    }
}

// ====== DATA LOADER ======
export async function loadCardsData() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    } catch (e) {
        console.error("Load Error:", e);
        return [];
    }
}

// ====== WIPE DATA ======
export async function clearStorage() {
    if (confirm("حذف كل البيانات نهائياً؟")) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.clear();
            tx.oncomplete = () => {
                localStorage.removeItem("cards_data");
                location.reload();
            };
        } catch (e) {
            console.error("Wipe Error:", e);
        }
    }
}
