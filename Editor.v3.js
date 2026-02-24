import { saveAllCards } from 'https://cdn.jsdelivr.net/gh/Mohamed-Adel-M8A/MyNotesApp/storage.v2.js';

export function applyStyle(tag, props = {}, attributes = {}) {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const el = document.createElement(tag);
    
    Object.assign(el.style, props);
    
    for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
    }
    
    if (tag === 'a') {
        el.target = "_blank";
        el.style.cursor = "pointer";
    }
    
    try {
        const fragment = range.extractContents();
        el.appendChild(fragment);
        range.insertNode(el);
    } catch (e) {
        console.error("خطأ في تنسيق النص:", e);
    }
}

export function renderContextMenu(e, menu, display) {
    menu.innerHTML = ''; 

    const makeBtn = (txt, handler, isColor = false, colorValue = "") => {
        const btn = document.createElement("button");
        btn.innerHTML = txt;
        
        if (isColor) {
            btn.style.cssText = `background-color: ${colorValue}; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc; padding: 0; margin: 2px; flex-shrink: 0;`;
        } else {
            btn.style.cssText = `padding: 6px 10px; text-align: right; width: 100%; border: none; background: none; cursor: pointer; font-size: 13px; display: block;`;
        }

        const executeAction = (event) => {
            event.preventDefault(); 
            event.stopPropagation();
            handler();
            saveAllCards(); 
            menu.style.display = "none";
        };

        btn.onmousedown = executeAction; // للكمبيوتر
        btn.ontouchstart = executeAction; // للجوال
        
        return btn;
    };

    const addGroup = (title, ...btns) => {
        const group = document.createElement("div");
        group.className = "menu-group";
        group.style.cssText = `border-bottom: 1px solid #eee; padding: 5px 0; width: 100%;`;
        
        if (title) {
            const label = document.createElement("div");
            label.innerText = title;
            label.style.cssText = `font-size: 10px; color: #888; padding: 0 10px; margin-bottom: 4px;`;
            group.appendChild(label);
        }

        const container = document.createElement("div");
        container.style.cssText = `display: flex; flex-wrap: wrap; padding: 0 5px;`;
        btns.forEach(btn => container.appendChild(btn));
        group.appendChild(container);
        
        menu.appendChild(group);
    };

    addGroup("تنسيق",
        makeBtn("<b>Bold</b>", () => document.execCommand('bold')),
        makeBtn("<u>Underline</u>", () => document.execCommand('underline')),
        makeBtn("🔗 إضافة رابط", () => {
            let url = prompt("أدخل الرابط المراد إدراجه:");
            if (url) {
                if (!url.startsWith('http')) url = 'https://' + url;
                applyStyle('a', { color: '#2563eb', textDecoration: 'underline' }, { href: url });
            }
        }),
        makeBtn("✨ Clear Format", () => {
            const str = window.getSelection().toString();
            document.execCommand('insertHTML', false, str);
        })
    );

    const textColors = [
        '#e74c3c', '#c0392b', // أحمر
        '#3498db', '#2980b9', // أزرق
        '#2ecc71', '#27ae60', // أخضر
        '#f39c12', '#d35400', // برتقالي
        '#9b59b6', '#8e44ad', // بنفسجي
        '#000000', '#7f8c8d'  // أسود ورمادي
    ];
    const colorBtns = textColors.map(c => makeBtn("", () => document.execCommand('foreColor', false, c), true, c));
    addGroup("ألوان النص", ...colorBtns);

    const sizes = [
        { label: 'H2 عنوان رئيسي', tag: 'h2', size: '24px' },
        { label: 'H3 عنوان فرعي', tag: 'h3', size: '20px' },
        { label: 'H4 عنوان متوسط', tag: 'h4', size: '18px' },
        { label: 'H5 عنوان صغير', tag: 'h5', size: '16px' },
        { label: 'P نص عادي', tag: 'span', size: '14px' }
    ];
    const sizeBtns = sizes.map(sz => makeBtn(sz.label, () => 
        applyStyle(sz.tag, { fontSize: sz.size, display: 'inline-block', fontWeight: 'bold' })
    ));
    addGroup("الأحجام", ...sizeBtns);

    menu.style.display = "flex";
    menu.style.flexDirection = "column";
    menu.style.width = "180px"; 
    menu.style.backgroundColor = "white";
    menu.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
    menu.style.borderRadius = "8px";
    menu.style.overflow = "hidden";
    menu.style.position = "absolute";
    menu.style.zIndex = "10000";
    
    let x = e.pageX;
    let y = e.pageY;

    if (x + 180 > window.innerWidth) x = window.innerWidth - 190;
    if (y + 400 > window.innerHeight) y -= 350;
    if (y < 0) y = 10;

    menu.style.top = `${y}px`;
    menu.style.left = `${x}px`;
}
