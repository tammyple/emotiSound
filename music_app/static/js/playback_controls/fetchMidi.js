import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.27/+esm";

let currentMidiUrl = null;
// Fetch midi from EMOPIA's library
export async function fetchMidi() {
    try {
        const res = await fetch("/get-midi");
        const data = await res.json();
    
        if (!data.midi_url) {
            console.error("No midi url received from server");        
            return null;
        }

        currentMidiUrl = data.midi_url;

        const response = await fetch(currentMidiUrl);
        const arrayBuffer = await response.arrayBuffer();
        const midi = new Midi(arrayBuffer);

        // Tracking the url for now
        return {midi, url: currentMidiUrl}; 
    } catch(err) {
        console.error("Error: ", err);
        return null;
    }
}