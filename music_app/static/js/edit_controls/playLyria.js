// On page load, fetch the latest Lyria file so the audio element is ready
window.addEventListener('DOMContentLoaded', async () => {
    try {
      const res = await fetch('/latest-lyria'); 
      const { file } = await res.json();
      console.log("file", file);
  
      const audio = document.getElementById('lyria-audio');
  
      if (file) {
        audio.src = file;
        console.log(`Loaded latest Lyria track: ${file}`);
      } else {
        console.warn('No Lyria music found yet.');
      }
    } catch (err) {
      console.error('Failed to fetch Lyria music:', err);
    }
  });
  
  
  