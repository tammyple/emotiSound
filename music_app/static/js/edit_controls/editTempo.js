import { player, currentSequence, playMidi } from "./playback_controls/playMidi.js";

const tempoSlider = document.getElementById("tempo-slider");
const tempoValue = document.getElementById("tempo-value");

export function changeTempo(newTempo) {
    if (!currentSequence) {
        console.warn("No sequence loaded yet. Tempo change ignored.");
        return;
    }

    // Update tempo
    currentSequence.tempos = [{ qpm: newTempo }];

    console.log(`Tempo changed to ${newTempo} BPM`);

    // Stop current playback and restart with new tempo
    if (player.getPlayState() !== "stopped") {
        player.stop();
        console.log("player stopped for changing tempo")
    }

    const btn = document.querySelector("#play-btn img");
    if (btn) btn.src = "static/images/loading.gif"; 

    // Play new sequence with updated tempo
    setTimeout(() => {
        player.start(currentSequence);
        if (btn) btn.src = "static/images/pause.png"; 
    }, 500);
}

// Bind slider events
if (tempoSlider) {
    tempoSlider.addEventListener("input", (e) => {
        console.log("Changing tempo")
        const bpm = parseInt(e.target.value, 10);
        tempoValue.textContent = bpm;
        changeTempo(bpm);
    });
}
