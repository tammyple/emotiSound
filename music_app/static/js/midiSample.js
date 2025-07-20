import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.27/+esm";

// Tone.js must already be loaded
document.getElementById("play-midi-btn").addEventListener("click", async () => {
    await Tone.start();
    const midiUrl = "/static/midis/Q1__8v0MFBZoco_0.mid";

    const response = await fetch(midiUrl);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    const synth = new Tone.PolySynth().toDestination();

    midi.tracks.forEach(track => {
        track.notes.forEach(note => {
        synth.triggerAttackRelease(
            note.name,
            note.duration,
            note.time
        );
        });
    });

    Tone.Transport.start();
});
