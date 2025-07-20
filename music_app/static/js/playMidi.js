import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.27/+esm";

let isPlaying = false;
let currentSynth = null;
let currentFile = null;

const playBtn = document.getElementById("play-btn");
const playIcon = playBtn.querySelector("img"); 
const nextBtn = document.getElementById("next-btn");
const previousBtn = document.getElementById("previous-btn");

export async function playMidi() {
    try {
        await Tone.start(); 
        console.log("Audio context started");

        // If synth exists and transport is paused, just resume
        if (isPlaying === false && Tone.Transport.state === "paused") {
            Tone.Transport.start();
            isPlaying = true;
            return;
        }

        // Otherwise, start a fresh song
        Tone.Transport.stop();
        Tone.Transport.cancel();

        if (currentSynth) {
            currentSynth.releaseAll();
            currentSynth.dispose();
            currentSynth = null;
        }

        const res = await fetch("/get-midi");
        const data = await res.json();

        if (!data.midi_url) {
            console.error("No MIDI URL received from server");
            return;
        }

        // Fetch the MIDI file
        const response = await fetch(data.midi_url);
        const arrayBuffer = await response.arrayBuffer();
        const midi = new Midi(arrayBuffer);

        currentSynth = new Tone.PolySynth().toDestination();

        // Schedule MIDI notes
        midi.tracks.forEach(track => {
            track.notes.forEach(note => {
                currentSynth.triggerAttackRelease(
                    note.name, 
                    note.duration, 
                    note.time);
            });
        });
        

        Tone.Transport.bpm.value = 120;
        Tone.Transport.start();

        isPlaying = true;
        console.log("Playing MIDI:", data.midi_url);
        console.log("isPlaying", isPlaying);
    } catch (error) {
        console.error("Error playing MIDI:", error);
    }
}
export function pauseMidi() {
    console.log("currentSynth", currentSynth)
    if (currentSynth) {
        currentSynth.releaseAll();  // Kill any notes still ringing
        currentSynth.dispose();     
        currentSynth = null;
    }

    // Delay stopping the Transport slightly so release can trigger properly
    setTimeout(() => {
        Tone.Transport.stop();
        Tone.Transport.cancel();  // Clear scheduled notes
    }, 50);  

    isPlaying = false;
}

// Toggle play/pause
playBtn?.addEventListener("click", () => {
    if (isPlaying) {
        pauseMidi();
        playIcon.src = "static/images/play.png";
    } else {
        playMidi();
        playIcon.src = "static/images/pause.png";
    }
});
