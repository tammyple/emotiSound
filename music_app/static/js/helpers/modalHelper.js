// Open and close logic for modal 
export function initModal(triggerSelector, modalSelector, cancelSelector) {
    const trigger = document.querySelector(triggerSelector);
    const modal = document.querySelector(modalSelector);
    const cancelBtn = modal?.querySelector(cancelSelector);

    if (!modal || !trigger) return;

    // Open modal
    trigger.addEventListener("click", () => {
        modal.style.display = "flex";
    });

    // Close modal on cancel button
    cancelBtn?.addEventListener("click", () => {
        modal.style.display = "none";
    });

    return modal; 
}
