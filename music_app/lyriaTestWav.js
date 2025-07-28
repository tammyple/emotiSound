import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import fs from 'fs';
import { Buffer } from 'buffer';
import path from 'path';

// Get API key
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('Error: Missing GOOGLE_API_KEY in .env');
  process.exit(1);
}

const client = new GoogleGenAI({
  apiKey: API_KEY,
  apiVersion: 'v1alpha',
});

// Generate a unique filename
const timestamp = Date.now();
const outputDir = path.resolve('./static/generated');
const outputFile = path.join(outputDir, `lyria_${timestamp}.wav`);

// Make sure the directory exists
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

let audioBuffers = [];  // Store PCM chunks

// Helper: Add a WAV header for PCM 16-bit stereo, 44.1kHz
function createWavFile(chunks) {
  const data = Buffer.concat(chunks);
  const header = Buffer.alloc(44);

  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  // RIFF chunk descriptor
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM
  header.writeUInt16LE(1, 20); // Audio format (PCM = 1)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);

  return Buffer.concat([header, data]);
}

async function runLyria() {
  const session = await client.live.music.connect({
    model: 'models/lyria-realtime-exp',
    callbacks: {
      onmessage: (message) => {
        if (message?.serverContent?.audioChunks) {
          const chunk = message.serverContent.audioChunks[0];
          const raw = Buffer.from(chunk.data, 'base64');
          audioBuffers.push(raw);
          console.log(`Received chunk: ${raw.length} bytes`);
        }
      },
      onError: (err) => console.error('Session error:', err),
      onClose: () => console.log('Stream closed.'),
    },
  });

  // To change style (genres, instruments) 
  await session.setWeightedPrompts({
    weightedPrompts: [{ text: 'minimal techno', weight: 1.0 }],
  });

  //To change technical parameters (bpm, density, temperature)
  await session.setMusicGenerationConfig({
    musicGenerationConfig: { bpm: 90, temperature: 1.0 },
  });

  console.log('Starting music stream...');
  session.play();

  // Stop after 10 seconds and save to WAV
  setTimeout(() => {
    console.log('Stopping stream...');
    session.stop();

    // Save file to directory
    const wavFile = createWavFile(audioBuffers);
    fs.writeFileSync(outputFile, wavFile);
    console.log(`Saved to ${outputFile}`);

    // exit node
    process.exit(0); 
  }, 30000);
}

runLyria().catch(console.error);
