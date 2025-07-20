window.addEventListener("load", async function () {
    if (typeof mm === "undefined") {
      console.error("Magenta.js (mm) is not defined. Check script order.");
      return;
    }
  
    const aiMelodyBtn = document.getElementById("ai-melody-btn");
    const promptText = document.querySelector(".prompt-text");
    const playButton = document.querySelector(".play-btn");
  
    aiMelodyBtn.addEventListener("click", async () => {
        console.log("AI Button clicked");
        playButton.classList.remove("pulse-highlight"); 

        if (promptText) {
            promptText.classList.add("hidden");
        }
    
        const player = new mm.SoundFontPlayer(
            "https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus"
        );
    
        const rnn = new mm.MusicRNN(
            "https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/chord_pitches_improv"
        );
        await rnn.initialize();
    
        const seed = {
            notes: [
            { pitch: 64, startTime: 0.0, endTime: 0.5 },
            { pitch: 67, startTime: 0.5, endTime: 1.0 },
            { pitch: 69, startTime: 1.0, endTime: 1.5 },
            ],
            totalTime: 1.5,
        };
    
        const quantizedSeed = mm.sequences.quantizeNoteSequence(seed, 4);
        const result = await rnn.continueSequence(quantizedSeed, 20, 1.1, ["C", "G", "Am", "F"]);
    
        await player.loadSamples(result);
        player.start(result);
        });
});
  