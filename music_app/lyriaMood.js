import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
import fs from 'fs';
import { Buffer } from 'buffer';
import path from 'path';

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_API_KEY in .env');
  process.exit(1);
}

const client = new GoogleGenAI({
  apiKey: API_KEY,
  apiVersion: 'v1alpha',
});

// CLI arguments: [prompt, outputFile]
const [promptArg, outputArg] = process.argv.slice(2);
const prompt = promptArg || 'Dreamy Ambient Pads';
const outputFile = outputArg
    ? path.resolve(outputArg)
    : path.resolve(`./static/generated/lyria_${Date.now()}.wav`);
let audioBuffers = [];

// Helper function to add chunks to WAV 
function createWavFile(chunks) {
  const data = Buffer.concat(chunks);
  const header = Buffer.alloc(44);

  const sampleRate = 44100;
  const numChannels = 2;
  const bitsPerSample = 16;

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);

  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);

  return Buffer.concat([header, data]);
}

async function run() {
  console.log(`Generating WAV for: ${prompt}`);

  const session = await client.live.music.connect({
    model: 'models/lyria-realtime-exp',
    callbacks: {
      onmessage: (msg) => {
        if (msg?.serverContent?.audioChunks) {
          const chunk = msg.serverContent.audioChunks[0];
          const raw = Buffer.from(chunk.data, 'base64');
          audioBuffers.push(raw);
        }
      },
      onError: (err) => console.error('Lyria error:', err),
      onClose: () => console.log('Stream closed.'),
    },
  });

  await session.setWeightedPrompts({
    weightedPrompts: [{ text: prompt, weight: 1.0 }],
  });

  await session.setMusicGenerationConfig({
    musicGenerationConfig: { bpm: 90, temperature: 1.0 },
  });

  session.play();

  setTimeout(() => {
    session.stop();
    const wavFile = createWavFile(audioBuffers);
    fs.writeFileSync(outputFile, wavFile);
    console.log(`Saved WAV to ${outputFile}`);
    process.exit(0);
  }, 10000);
}

run().catch(console.error);
