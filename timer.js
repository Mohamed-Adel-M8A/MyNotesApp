// ====== CARD TIMER ENGINE ======
export function startCardTimer(card, targetTime, timerBox) {
    if (card._interval) clearInterval(card._interval);

    const updateTimer = () => {
        const remaining = Math.floor((targetTime - Date.now()) / 1000);

        if (remaining > 0) {
            const days = Math.floor(remaining / 86400);
            const hours = Math.floor((remaining % 86400) / 3600);
            const mins = Math.floor((remaining % 3600) / 60);
            const secs = remaining % 60;

            timerBox.innerHTML = `<span>⏳</span> ${days}d : ${hours}h : ${mins}m : ${secs}s`;
            card.style.borderColor = "transparent";
        } else {
            clearInterval(card._interval);
            card._interval = null;
            timerBox.innerHTML = "⏰ انتهى الوقت!";
            card.style.border = "2px solid #e74c3c";
            card.classList.add('timer-done');
        }
    };

    updateTimer();
    card._interval = setInterval(updateTimer, 1000);
}

// ====== STOP & RESET ======
export function stopCardTimer(card, timerBox) {
    if (card._interval) {
        clearInterval(card._interval);
        card._interval = null;
    }
    card.dataset.targettime = "0";
    timerBox.textContent = "";
    card.style.borderColor = "transparent";
}