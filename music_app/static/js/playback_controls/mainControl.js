import { player, playMidi } from "./playMidi.js";

const playBtn = document.getElementById("play-btn");
const playbackImg = playBtn?.querySelector("img");

const prevBtn = document.getElementById("previous-btn");
const nextBtn = document.getElementById("next-btn");

// Check state periodically
setInterval(() => {
    if (player.getPlayState() === "stopped") {
      if (playbackImg) playbackImg.src = "static/images/play.png";
    }
}, 500);

// Toggle between Play and Pause 
playBtn?.addEventListener("click", async () => {
    await Tone.start(); 

    // Get play state to determine play or pause
    const state = player.getPlayState();
    console.log("Current State: ", state);

    if (state === 'started') {
        player.pause();  
        if (playbackImg) playbackImg.src = "static/images/play.png";
        console.log("Paused");
    } else if (state === 'paused') {
        player.resume();  // Resume if paused
        if (playbackImg) playbackImg.src = "static/images/pause.png";
        console.log("Resumed");
    } else {
        console.log("Current State with else: ", state);
        await playMidi();  // Start new playback
        if (playbackImg) playbackImg.src = "static/images/pause.png";
        console.log("Started a new track");
    }
    
  });