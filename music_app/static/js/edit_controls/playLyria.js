window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/latest-lyria');
    const { file } = await res.json();

    const audio = document.getElementById('lyria-audio');
    const editTooltip = document.getElementById("tooltip-edit");
    const tooltipClose = document.getElementById("tooltip-close");
    const feedbackModal = document.getElementById("feedback-modal");
    const playPrompt = document.getElementById("play-prompt");

    let editTooltipShown = false;
    let songCount = 0;
    let feedbackShown = false;

    if (file) {
      audio.src = file;
      console.log(`Loaded latest quadrant track: ${file}`);

      // Prompt user to click play button
      playPrompt.classList.remove("hidden");

      // Tooltip logic for edited track
      audio.addEventListener("play", () => {
        console.log("User clicked play!");
        playPrompt.classList.add("hidden");

        // Prompt user to edit music
        if (!editTooltipShown) {
          
          setTimeout(() => {
            editTooltip.classList.remove("hidden");
          }, 2000);

          setTimeout(() => {
            editTooltip.classList.add("hidden");
          }, 8000);
          editTooltipShown = true;
        }

        songCount++;

        // Show feedback modal after 3 plays or 1 minute
        if (!feedbackShown) {
          setTimeout(() => {
            if (songCount >= 3) {
              feedbackModal.classList.remove("hidden");
              feedbackShown = true;
            }
          }, 60000);
        }

        if (!feedbackShown && songCount >= 3) {
          feedbackModal.classList.remove("hidden");
          feedbackShown = true;
        }
      });

      tooltipClose?.addEventListener("click", () => {
        editTooltip.classList.add("hidden");
      });

    } else {
      console.warn('No quadrant track found to load.');
    }
  } catch (err) {
    console.error('Failed to fetch quadrant track:', err);
  }
});
