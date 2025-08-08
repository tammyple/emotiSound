import { fetchMidi } from "./fetchMidi.js";

export let player = new mm.Player();

let currentSequence = null;
let currentUrl = null;
let songList = [];
let currentIndex = -1;

export async function playMidi(url = null) {
    try {
        // Fetch a random song if no song url is provided
        if (!url) {
            const result = await fetchMidi();
            if (!result?.url) return;
            url = result.url;
        }

        // Fetch specific url from song list
        const foundIndex = songList.indexOf(url);
        if ( foundIndex === -1 ) {
            songList.push(url);
            currentIndex = songList.length - 1;
        } else {
            currentIndex = foundIndex;
        }
        
        console.log("Playing midi: ", url);
        console.log("currentIndex:", currentIndex);
        console.log("songList", songList);

        // Stop any current song
        if (player.getPlayState() !== "stopped") {
            player.stop();
        }
        
        // Fetch midi
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert to NoteSequence
        let sequence = mm.midiToSequenceProto(uint8Array);

        // Quantize so we can set a tempo
        let qns = mm.sequences.quantizeNoteSequence(sequence, 4);

        currentSequence = qns;
        currentUrl = url;

        // Play the tune (midi sequence)
        player.start(currentSequence);

        // Schedule reset of play button when track ends
        const duration = currentSequence ? currentSequence.totalTime : 0;
        const now = player.context ? player.context.currentTime : 0;
        const delay = (duration - now) * 1000;

        if (delay > 0 && isFinite(delay)) {
            setTimeout(() => {
                const btn = document.querySelector("#play-btn img");
                if (btn) {
                    btn.src = "static/images/play.png";
                } else {
                    console.log("Play button not found in DOM.");
                }
            }, delay);
        } else {
            console.warn("Delay invalid or track already stopped, no timeout scheduled.");
        }

    } catch (err) {
        console.error("Error: ", err);
    }
}

export async function nextMidi() {
    if (player.getPlayState !== "stopped") {
        player.stop();
    }

    // Set timeout to make sure the player stops before playing the next song
    setTimeout( () => {
        // Fetch new random song
        if (currentIndex === songList.length - 1) {
            playMidi();
        } else {
            currentIndex++;
            playMidi(songList[currentIndex]);
        }
    }, 1000);
}

export async function prevMidi() {
    if (player.getPlayState !== "stopped") {
        player.stop();
    }

    // Play the previous tune in songList 
    setTimeout( () => {
        if (currentIndex > 0 ) {
            currentIndex--;
            playMidi(songList[currentIndex]);
        } else {
            console.log("At the beginning of the list, can't go back");
        }
    }, 500);
}
