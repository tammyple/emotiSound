import { closeOnOutsideClick } from "../helpers/outsideClick.js";

document.addEventListener("DOMContentLoaded", () => {
    const editIcon = document.getElementById("edit-icon");
    const editPanel = document.getElementById("edit-panel-container");
    const tempoSlider = document.getElementById("tempo-slider");
    const tempoValue = document.getElementById("tempo-value");
    const temperatureSlider = document.getElementById("temperature-slider");
    const temperatureValue = document.getElementById("temperature-value")

    const instrumentButtons = document.querySelectorAll('.instrument-btn');
    const genreButtons = document.querySelectorAll('.genre-btn');

    // Centralized state for all parameters
    const selections = {
        instrument: null,
        genre: null,
        bpm: tempoSlider ? parseInt(tempoSlider.value, 10) : undefined,
        temperature: temperatureSlider ? parseFloat(temperatureSlider.value) : undefined
    };

    if (editIcon && editPanel) {
        editIcon.addEventListener("click", () => {
            const isVisible = editPanel.style.display === "block";
            editPanel.style.display = isVisible ? "none" : "block";
        });
    }

    // Update slider values in UI 
    tempoSlider?.addEventListener("input", () => {
        selections.bpm = parseInt(tempoSlider.value);
        tempoValue.textContent = tempoSlider.value;
        console.log("Tempo: ", tempoSlider.value);
        sendEditRequest();
    });

    temperatureSlider?.addEventListener("input", () => {
        selections.temperature = parseFloat(temperatureSlider.value);
        temperatureValue.textContent = temperatureSlider.value; 

        console.log("temperature: ", temperatureSlider.value);
        sendEditRequest();
    });

    // Toggle genre selections (for instruments and genres)
    function setupMusicButton(buttonGroup, key) {
        buttonGroup.forEach(btn => {
            btn.addEventListener('click', () => {
                buttonGroup.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                selections[key] = btn.dataset.value;
                console.log(`Selected ${key}: ${btn.dataset.value}`);
                sendEditRequest();
            });
        });
    }
    
    // Apply separately for instruments and genres
    setupMusicButton(instrumentButtons, 'instrument');
    setupMusicButton(genreButtons, 'genre');

    // Send updated values to backend
    async function sendEditRequest() {
        const payload = {
            instrument: selections.instrument,  
            genre: selections.genre,
            bpm: selections.bpm,
            temperature: selections.temperature
        };

        const res = await fetch('/edit-lyria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const { newFile } = await res.json();
        if (newFile) {
            const audio = document.getElementById('lyria-audio');
            if (audio) {
                audio.src = newFile + '?t=' + Date.now(); 
                audio.play();
            }
        }
    }

    closeOnOutsideClick("edit-music", "edit-icon");
});
