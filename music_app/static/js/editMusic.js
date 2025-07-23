document.addEventListener("DOMContentLoaded", () => {
    const editIcon = document.getElementById("edit-icon");
    const editPanel = document.getElementById("edit-panel-container");
    const tempoSlider = document.getElementById("tempo-slider");
    const tempoValue = document.getElementById("tempo-value");
    const intensitySlider = document.getElementById("intensity-slider");
    const intensityValue = document.getElementById("intensity-value");

    if (editIcon && editPanel) {
        editIcon.addEventListener("click", () => {
            const isVisible = editPanel.style.display === "block";
            editPanel.style.display = isVisible ? "none" : "block";
        });
    }

    // Update slider values in UI (later we connect to Magenta RT)
    tempoSlider?.addEventListener("input", () => {
        tempoValue.textContent = tempoSlider.value;
    });

    intensitySlider?.addEventListener("input", () => {
        intensityValue.textContent = `${intensitySlider.value}%`;
    });

    // Toggle instrument/genre selections
    const editButtons = document.querySelectorAll('.edit-btn');
    let selectedValue = null;

    editButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            editButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedValue = btn.dataset.value;
        });
    });
});
