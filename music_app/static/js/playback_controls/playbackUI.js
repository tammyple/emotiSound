import { player } from "./playMidi.js";

// Toggle between play and pause 
export function updatePlayButton() {
    const state = player.getPlayState();
    const playbackImg = document.querySelector("#play-btn img");
    if (playbackImg) {
        playbackImg.src = state === "started"
            ? "static/images/pause.png"
            : "static/images/play.png";
    }
}
