// On page load, fetch the latest quadrant-generated Lyria track
window.addEventListener('DOMContentLoaded', async () => {
  try {
      const res = await fetch('/latest-lyria');
      const { file } = await res.json();

      const audio = document.getElementById('lyria-audio');

      if (file) {
          audio.src = file;
          console.log(`Loaded latest quadrant track: ${file}`);
      } else {
          console.warn('No quadrant track found to load.');
      }
  } catch (err) {
      console.error('Failed to fetch quadrant track:', err);
  }
});

