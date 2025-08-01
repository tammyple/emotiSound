// On page load, fetch the latest quadrant-generated Lyria track
window.addEventListener('DOMContentLoaded', async () => {
  try {
      const res = await fetch('/latest-lyria');
      const { file } = await res.json();

      const audio = document.getElementById('lyria-audio');
      const editTooltip = document.getElementById("tooltip-edit");
      const tooltipClose = document.getElementById("tooltip-close");

      let editTooltipShown = false;

      if (file) {
          audio.src = file;
          console.log(`Loaded latest quadrant track: ${file}`);

                // Tooltip logic for edited track
      audio.addEventListener("play", () => {
        console.log('User clicked play!');
        if (!editTooltipShown) {
          editTooltip.classList.remove("hidden");

          setTimeout(() => {
            editTooltip.classList.add("hidden");
          }, 8000);

          editTooltipShown = true;
        }
      });

      // Manual close for tooltip
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

