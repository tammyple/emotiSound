import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.27/+esm";
import { fetchMidi } from "./fetchMidi.js";

export let player = new mm.Player();
let currentTempo = 120;
let currentSequence = null;

export async function playMidi() {
    try {
        const { url } = await fetchMidi();
        if (!url) return;
    
        console.log("Play midi from Magenta Player:", url);
    
        // Fetch url
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Convert to NoteSequence
        let sequence = mm.midiToSequenceProto(uint8Array);

        // Quantize so we can set a tempo
        let qns = mm.sequences.quantizeNoteSequence(sequence, 4);

        currentSequence = qns;

        // Play music

        player.start(currentSequence);

        console.log("player.isPlaying", player.isPlaying());

    } catch (err) {
        console.error("Error: ", err);
    }
}
