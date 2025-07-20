// Open and close logic for modal 

/**
 * Initializes a modal with open and close logic.
 * @param {string} triggerSelector - Selector for the element that opens the modal (e.g., "#face-icon").
 * @param {string} modalSelector - Selector for the modal itself (e.g., "#mood-modal").
 * @param {string} cancelSelector - Selector for the cancel/close button inside the modal.
 */
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
