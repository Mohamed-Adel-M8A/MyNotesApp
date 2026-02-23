import { saveAllCards } from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.v2.js';
import { startCardTimer } from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/timer.js';
import { 
    exportSingleCardAsTxt, 
    exportSingleCardAsPDF, 
    exportSingleCardAsHTML, 
    exportSingleCardAsMD 
} from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/exporter.js';

export function addCard(data = {}) {
    
    const board = document.getElementById("board");
    if (!board) return;

    // إعداد البيانات الافتراضية
    const id = data.id || crypto.randomUUID();
    const title = data.title || 'عنوان جديد';
    const html = data.html || '';
    const color = data.color || '#ffffff';
    const tags = data.tags || '';
    const targetTime = parseInt(data.targetTime || 0);
    const dir = data.dir || 'rtl';
    const width = data.width || '350px';
    const height = data.height || '320px';

    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = id;
    card.dataset.tags = tags.toLowerCase();
    card.dataset.targettime = targetTime;
    
    // تطبيق الأبعاد والستايل
    card.style.backgroundColor = color;
    card.style.width = width;
    card.style.height = height;
    card.dir = dir;

    card.innerHTML = `
        <div class="edit-tools">
            <button class="edit-toggle" title="تعديل">✏️</button>
            <button class="dir-toggle" title="تغيير الاتجاه">↔️</button>
        </div>
        <div class="title" contenteditable="true">${title}</div>
        <div class="timer-box" style="${targetTime > Date.now() ? '' : 'display:none'}"></div>
        <div class="display" contenteditable="false">${html}</div>
        
        <div class="dropdown-controls">
            <button class="dropdown-btn">⚙️ الأدوات والإعدادات</button>
            <div class="dropdown-menu" style="display:none;">
                <div class="dropdown-grid">
                    <input type="number" class="day-in" placeholder="أيام" min="0">
                    <input type="number" class="hour-in" placeholder="ساعات" min="0" max="23">
                    <input type="number" class="min-in" placeholder="دقائق" min="0" max="59">
                    <input type="number" class="sec-in" placeholder="ثواني" min="0" max="59">
                    <button class="start-timer-btn">▶️ بدء المؤقت</button>
                    <button class="export-btn">📃 TXT</button>
                    <button class="export-pdf-btn">📄 PDF</button> 
                    <button class="export-html-btn">🌐 HTML</button>
                    <button class="export-md-btn">📝 Markdown</button>
                </div>
                <div class="color-palette-label">لون البطاقة:</div>
                <div class="color-palette"></div>
                <div class="tags-container">
                    <div class="tags-list"></div>
                    <input type="text" class="tag-input" placeholder="أضف وسماً واضغط Enter">
                </div>
                <button class="delete-card-btn">🗑️ حذف البطاقة</button>
            </div>
        </div>
    `;

    const display = card.querySelector('.display');
    const menu = card.querySelector('.dropdown-menu');
    const tagsList = card.querySelector('.tags-list');
    const tagInput = card.querySelector('.tag-input');

    // فتح وإغلاق القائمة
card.querySelector('.dropdown-btn').onclick = (e) => {
    e.stopPropagation();
    const isHidden = menu.style.display === "none";
    document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = "none");

    if (isHidden) {
        menu.style.display = "flex";
        card.style.height = "auto";
    } else {
        menu.style.display = "none";
        saveAllCards(); 
    }
};

    // وضع التعديل
    card.querySelector('.edit-toggle').onclick = (e) => {
        const isEditable = display.contentEditable === "true";
        display.contentEditable = !isEditable;
        e.target.textContent = isEditable ? "✏️" : "✅";
        if (!isEditable) {
            display.focus();
            card.classList.add('editing');
        } else {
            card.classList.remove('editing');
            saveAllCards();
        }
    };

    // تغيير الاتجاه
    card.querySelector('.dir-toggle').onclick = () => {
        card.dir = card.dir === "rtl" ? "ltr" : "rtl";
        saveAllCards();
    };

    // لوحة الألوان
    const palette = card.querySelector('.color-palette');
    const bgColors = ['#ffffff', '#fff9c4', '#ffecb3', '#e1f5fe', '#f1f8e9', '#fce4ec'];
    bgColors.forEach(clr => {
        const swatch = document.createElement("button");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = clr;
        swatch.onclick = () => {
            card.style.backgroundColor = clr;
            saveAllCards();
        };
        palette.appendChild(swatch);
    });

    // الوسوم
    if (tags) {
        tags.split(',').forEach(t => {
            if (t.trim()) createTag(t.trim(), tagsList, card);
        });
    }

    tagInput.onkeydown = (e) => {
        if (e.key === "Enter" && tagInput.value.trim()) {
            createTag(tagInput.value.trim(), tagsList, card);
            tagInput.value = "";
        }
    };

    // المؤقت
    card.querySelector('.start-timer-btn').onclick = () => {
        const d = parseInt(card.querySelector('.day-in').value) || 0;
        const h = parseInt(card.querySelector('.hour-in').value) || 0;
        const m = parseInt(card.querySelector('.min-in').value) || 0;
        const s = parseInt(card.querySelector('.sec-in').value) || 0;
        const totalMs = ( (d * 86400) + (h * 3600) + (m * 60) + s ) * 1000;
        if (totalMs > 0) {
            const target = Date.now() + totalMs;
            card.dataset.targettime = target;
            const tBox = card.querySelector('.timer-box');
            tBox.style.display = 'inline-flex';
            startCardTimer(card, target, tBox);
            saveAllCards();
        }
    };

    // حفظ الحجم عند انتهاء السحب
    card.onmouseup = () => {
        saveAllCards(); 
    };

    // التصدير والحذف
    card.querySelector('.export-btn').onclick = () => exportSingleCardAsTxt(card);
    card.querySelector('.export-pdf-btn').onclick = () => exportSingleCardAsPDF(card);
    card.querySelector('.export-html-btn').onclick = () => exportSingleCardAsHTML(card);
    card.querySelector('.export-md-btn').onclick = () => exportSingleCardAsMD(card);

    card.querySelector('.delete-card-btn').onclick = () => {
        if (confirm("هل أنت متأكد من حذف هذه البطاقة؟")) {
            card.remove();
            saveAllCards();
        }
    };

    if (targetTime > Date.now()) {
        startCardTimer(card, targetTime, card.querySelector('.timer-box'));
    }
    const resizeObserver = new MutationObserver(() => saveAllCards());
    resizeObserver.observe(card, { attributes: true, attributeFilter: ['style'] });
    board.prepend(card);
}

export function filterCards(query, type) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const title = card.querySelector('.title').textContent.toLowerCase();
        const tags = card.dataset.tags || "";
        const isMatch = (type === 'name') ? title.includes(query) : tags.includes(query);
        card.style.display = isMatch ? "flex" : "none";
    });
}

function createTag(text, container, card) {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.innerHTML = `${text} <button type="button">×</button>`;
    tag.querySelector('button').onclick = (e) => {
        e.stopPropagation();
        tag.remove();
        updateTagsDataset(card);
    };
    container.appendChild(tag);
    updateTagsDataset(card);
}

function updateTagsDataset(card) {
    const allTags = Array.from(card.querySelectorAll('.tag')).map(t => 
        t.textContent.replace('×', '').trim()
    );
    card.dataset.tags = allTags.join(',').toLowerCase();
    saveAllCards();
}



