import { player, playMidi, nextMidi, prevMidi } from "./playMidi.js";

const playBtn = document.getElementById("play-btn");
const playbackImg = playBtn?.querySelector("img");

const prevBtn = document.getElementById("previous-btn");
const nextBtn = document.getElementById("next-btn");

// Button updater
function updatePlayButton() {
    const state = player.getPlayState();
    if (state === "started") {
        playbackImg.src = "static/images/pause.png";
    } else {
        playbackImg.src = "static/images/play.png";
    }
}

// Toggle between Play and Pause 
playBtn?.addEventListener("click", async () => {
    await Tone.start(); 

    // Get play state to determine play or pause
    const state = player.getPlayState();
    console.log("Current State: ", state);

    // State 1: Start playing new song
    if (state === 'stopped') {
        await playMidi();  
        console.log("Started a new track");
   
    // State 2: Pause
    } else if (state === 'started') {
        player.pause();  
        console.log("Paused");

    // State 3: Resume
    } else if (state === 'paused') {
        player.resume();  
        console.log("Resumed");
    }

    updatePlayButton();
});

// Next song

nextBtn.addEventListener("click", () => {
    nextMidi();
    updatePlayButton();
    console.log("state after play next song",player.getPlayState());
    console.log("Playing next song");
})

// Previous song

prevBtn.addEventListener("click", () => {
    prevMidi();
    updatePlayButton();
    console.log("state after play previous song",player.getPlayState());
    console.log("Playing previous song");
});
