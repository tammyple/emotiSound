import { playMidi } from "./playback_controls/playMidi.js";
import { initModal } from "./helpers/modalHelper.js";
import { closeOnOutsideClick } from "./helpers/outsideClick.js";
import { updatePlayButton } from "./playback_controls/playbackUI.js";

document.addEventListener("DOMContentLoaded", () => {
    const modal = initModal("#face-icon", "#mood-modal", ".btn.cancel-btn");
    closeOnOutsideClick("#mood-modal", "#face-icon");  

    const confirmPlayBtn = modal.querySelector(".btn.confirm-play-btn");
    const loadingScreen = document.querySelector('.loadingScreen');
    const editPanel = document.getElementById("edit-music");
    const editPanelChosen = editPanel?.style.display !== 'none';

    let selectedMood = null;
    let selectedStyle = null;

    // Mood selection
    modal.querySelectorAll(".emoji-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            modal.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedMood = btn.dataset.mood;  
        console.log("Selected mood:", selectedMood);
        });
    });

    // Optional style selection
    modal.querySelectorAll(".style-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            modal.querySelectorAll(".style-btn").forEach(b => b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedStyle = btn.dataset.style;
            console.log("Selected style:", selectedStyle);
        });
    });

    // Confirm mood change and play a new song
    confirmPlayBtn?.addEventListener("click", async () => {
        if (!selectedMood && !selectedStyle) {
            alert("Please select at least a mood or style.");
            return;
        }

        try {
            // Add loading screen 
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
                modal.style.display = 'none';
                if(editPanel) {
                    editPanel.style.display = 'none';
                }
            }

            // Save mood change to DB
            const res = await fetch("/update-mood", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                mood: selectedMood,
                style: selectedStyle
            })
        });

        const result = await res.json();
        console.log("Mood updated, new quadrant:", result.quadrant);

        // Play the tune (EMOPIA midi)
        // await playMidi();
        // updatePlayButton();

        // Play wav (Lyria)
        const response = await fetch("/get-wav");
        const { wav_url } = await response.json();

        if (wav_url) {
            const audio = document.getElementById("lyria-audio");
            audio.src = wav_url + "?t=" + Date.now();
            audio.play();
        }

        // Hide loading screen when music plays
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
            if (editPanel && editPanelChosen) {
                editPanel.style.display = 'flex';
            }
        }

        } catch (err) {
            console.error("Error fetching or playing new song:", err);
        }

        modal.style.display = "none"; // Close modal
    });

    // Close modal when clicking outside content
    window.addEventListener("click", e => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});
