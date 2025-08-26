window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/latest-lyria');
        const { file } = await res.json();
    
        const audio = document.getElementById('lyria-audio');
        const musicTooltip = document.getElementById("music-tooltip");
        const tooltipClose = document.getElementById("tooltip-close");
        const feedbackModal = document.getElementById("feedback-modal");
        const playPrompt = document.getElementById("play-prompt");
    
        let musicTooltipShown = false;
        let songCount = 0;
        let feedbackShown = localStorage.getItem("feedbackShown") === "true";
    
        if (file) {
            audio.src = file;
            console.log(`Loaded latest track: ${file}`);
    
            // Prompt user to click play button
            playPrompt.classList.remove("hidden");
    
            // Tooltip logic for edited track
            audio.addEventListener("play", () => {
            console.log("User clicked play!");
            playPrompt.classList.add("hidden");
    
            // Prompt user to edit music
            if (!musicTooltipShown) {
    
                setTimeout(() => {
                musicTooltip.classList.remove("hidden");
                }, 2000);
    
                setTimeout(() => {
                musicTooltip.classList.add("hidden");
                }, 8000);
                musicTooltipShown = true;
            }
    
            songCount++;
    
            // Show feedback modal after 4 plays 
            if (songCount == 4 && !feedbackShown) {
                feedbackModal.classList.remove("hidden");
                localStorage.setItem("feedbackShown", "true"); 
            }
            });
    
            tooltipClose?.addEventListener("click", () => {
            musicTooltip.classList.add("hidden");
            });
    
        } else {
            console.warn('No track found to load.');
        }
    } catch (err) {
      console.error('Failed to fetch track:', err);
    }
});
  