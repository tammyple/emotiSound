import { playMidi } from "./playMidi.js";
import { initModal } from "./helpers/modalHelper.js";
import { closeOnOutsideClick } from "./helpers/outsideClick.js";

document.addEventListener("DOMContentLoaded", () => {
    const modal = initModal("#face-icon", "#mood-modal", ".btn.cancel-btn");
    closeOnOutsideClick("#mood-modal", "#face-icon");  

    const confirmBtn = modal.querySelector(".btn.confirm-btn");

    let selectedMood = null;
    let selectedStyle = null;

    // Mood (quadrant) selection
    modal.querySelectorAll(".emoji-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        modal.querySelectorAll(".emoji-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedMood = btn.dataset.mood;  // store the emoji's mood label
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
    confirmBtn?.addEventListener("click", async () => {
        if (!selectedMood && !selectedStyle) {
            alert("Please select at least a mood or style.");
            return;
        }

    try {
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

        // Play the tune 
        playMidi();
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
