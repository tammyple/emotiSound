import { Midi } from "https://cdn.jsdelivr.net/npm/@tonejs/midi@2.0.27/+esm";

export class PlaybackManager {

    constructor() {
        this.isPlaying = false;
        this.currentSynth = null;
        this.currentFile = null;
        this.songHistory = [];
    }

    get playing() {
        return this.isPlaying;
    }

    set playing(value) {
        this.isPlaying = value;
    }

    get synth() {
        return this.currentSynth;
    }

    set synth(value) {
        this.currentSynth = value;
    }

    get file() {
        return this.currentFile;
    }

    set file(value) {
        this.currentFile = value;
    }

    get history() {
        return this.songHistory;
    }

    set history(value) {
        this.songHistory = value;
    }

}

export const playbackManager = new PlaybackManager();