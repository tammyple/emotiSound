import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const API_KEY = process.env.GOOGLE_API_KEY;
console.log ("API_KEY", API_KEY);

if (!API_KEY) {
    console.error('Error: Missing GOOGLE_API_KEY. Add it to your .env file.');
    process.exit(1);
}

const client = new GoogleGenAI({
  apiKey: API_KEY,
  apiVersion: 'v1alpha',
});

async function runLyria() {
  // Connect to Lyria RealTime
  const session = await client.live.music.connect({
    model: 'models/lyria-realtime-exp',
    callbacks: {
      // Changed from onMessage to onmessage
      onmessage: (message) => {
        console.log('Received audio chunk:', message);
      },
      onError: (error) => {
        console.error('Session error:', error);
      },
      onClose: () => {
        console.log('Session closed.');
      },
      onOpen: () => {
        console.log('Session opened.')
      }, 
    },
  });

  // Send initial music prompts
  await session.setWeightedPrompts({
    weightedPrompts: [{ text: 'minimal techno', weight: 1.0 }],
  });

  // Configure the music generation
  await session.setMusicGenerationConfig({
    musicGenerationConfig: { bpm: 90, temperature: 1.0 },
  });

  // Start generating music
  console.log('Starting music stream...');
  session.play();
}

runLyria().catch(console.error);
