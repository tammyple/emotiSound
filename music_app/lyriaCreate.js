// Generate music after users updated mood/music or elements (tempo, genre, etc.)
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import wav from 'wav-encoder';
import 'dotenv/config';

const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
    throw new Error('Missing GOOGLE_API_KEY');
}

const client = new GoogleGenAI({
    apiKey: API_KEY,
    apiVersion: 'v1alpha',
});
// Main function lyriaCreate to generate music with some default parameters
export async function lyriaCreate({ genre, instrument, bpm = 100, temperature = 1.0, outputFile, basePrompt }) {
    genre = genre || 'Indie Pop';
    instrument = instrument || 'Piano Ballad';
    basePrompt = basePrompt || 'Dreamy Ambient Pads';

    console.log(`Generating: ${genre}, ${instrument}, BPM ${bpm}, temperature ${temperature}, basePrompt "${basePrompt}"`);

    const audioBuffers = [];
    // Create session object to control music generation.
    // Follow Lyria Documentation: https://ai.google.dev/gemini-api/docs/music-generation
    const session = await client.live.music.connect({
        model: 'models/lyria-realtime-exp',
        callbacks: {
            onmessage: (msg) => {
                if (msg.serverContent?.audioChunks) {
                    const chunk = msg.serverContent.audioChunks[0];
                    const buffer = Buffer.from(chunk.data, 'base64');
                    audioBuffers.push(buffer);
                }
            },
            onerror: (err) => console.error('Lyria error:', err),
            onclose: () => console.log('Lyria stream closed.'),
        },
    });

    // Set base prompt (mood + style) with other music elements
    await session.setWeightedPrompts({
        weightedPrompts: [
            { text: basePrompt, weight: 1.5 },
            { text: genre, weight: 0.6 },
            { text: instrument, weight: 0.5 },
            { text: 'Bassline', weight: 0.4 },
            { text: 'Melodic Synth', weight: 0.4 }
        ],
    });

    // Set music config such as tempo or temperature (creativity)
    await session.setMusicGenerationConfig({
        musicGenerationConfig: { bpm, temperature },
    });
    session.resetContext();

    // Start generating music
    session.play();

    // Convert PCM chunks to audio 
    // https://stackoverflow.com/questions/61777531/nodejs-capturing-a-stereo-pcm-wave-stream-into-mono-audiobuffer
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await session.stop();

                // Stitch together all the tiny audio chunks 
                // https://www.w3schools.com/nodejs/met_buffer_concat.asp
                const rawData = Buffer.concat(audioBuffers);
                // Make a buffer to hold samples
                const samples = new Float32Array(rawData.length / 2);
                for (let i = 0; i < samples.length; i++) {
                    samples[i] = rawData.readInt16LE(i * 2) / 32768;
                }

                // Describe the audio so the encoder knows how to pack it
                const audioData = {
                    sampleRate: 44100,
                    channelData: [samples],
                };

                // Turn the samples into a WAV file
                // https://www.jsdelivr.com/package/npm/wav-encoder
                const wavBuffer = await wav.encode(audioData);
                fs.writeFileSync(outputFile, Buffer.from(wavBuffer));

                console.log(`Saved valid WAV file: ${outputFile}`);
                resolve(outputFile);

                // End this Node process
                process.exit(0);
            } catch (err) {
                reject(err);
            }
        }, 8000);
    });
}
