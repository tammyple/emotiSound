import { closeOnOutsideClick } from "../helpers/outsideClick.js";



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

    // Toggle genre selections (for instruments and genres)
    const instrumentButtons = document.querySelectorAll('.instrument-btn');
    const genreButtons = document.querySelectorAll('.genre-btn');
    
    let selectedInstrument = null;
    let selectedGenre = null;
    
    function toggleSelection(buttonGroup, groupType) {
        buttonGroup.forEach(btn => {
            btn.addEventListener('click', () => {
            buttonGroup.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        
            // Update the correct variable based on groupType
            if (groupType === 'instrument') {
                selectedInstrument = btn.dataset.value;
                console.log(`Selected instrument: ${selectedInstrument}`);
            } else if (groupType === 'genre') {
                selectedGenre = btn.dataset.value;
                console.log(`Selected genre: ${selectedGenre}`);
            }
            });
        });
    }
    
    // Apply separately for instruments and genres
    toggleSelection(instrumentButtons, 'instrument');
    toggleSelection(genreButtons, 'genre');
    

    closeOnOutsideClick("edit-music", "edit-icon");
});
