// Close modal/menu when user clicks outside

export function closeOnOutsideClick(targetSelector, triggerSelector = null) {
    const target = document.querySelector(targetSelector);
    const trigger = triggerSelector ? document.querySelector(triggerSelector) : null;

    if (!target) return;

    document.addEventListener("click", (e) => {
        const clickedInside = target.contains(e.target) || (trigger && trigger.contains(e.target));
        if (!clickedInside) {
            target.style.display = "none";
        }
    });
}
