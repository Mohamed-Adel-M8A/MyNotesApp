// ====== STORAGE ENGINE ======
export function saveAllCards() {
    const cards = document.querySelectorAll('.card');
    
    const data = Array.from(cards).map(card => {
        const titleEl = card.querySelector('.title');
        const displayEl = card.querySelector('.display');
        
        return {
            id: card.dataset.id,
            title: titleEl?.textContent || "",
            html: displayEl?.innerHTML || "",
            tags: card.dataset.tags || "",
            color: card.style.backgroundColor || "#ffffff",
            targetTime: parseInt(card.dataset.targettime || "0"),
            dir: card.dir || "rtl"
        };
    });

    try {
        localStorage.setItem("cards_data", JSON.stringify(data));
    } catch (e) {
        console.error("Storage Save Error:", e);
    }
}

// ====== DATA LOADER ======
export function loadCardsData() {
    try {
        const rawData = localStorage.getItem("cards_data");
        return rawData ? JSON.parse(rawData) : [];
    } catch (e) {
        console.error("Storage Load Error:", e);
        return [];
    }
}

// ====== WIPE DATA ======
export function clearStorage() {
    if (confirm("حذف كل البيانات نهائياً؟")) {
        localStorage.removeItem("cards_data");
        location.reload();
    }
}