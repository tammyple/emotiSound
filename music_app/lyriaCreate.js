// lyriaCreate.js
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
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

/**
 * Generate music and save as WAV.
 * @param {Object} options
 * @param {string} options.genre - Music genre prompt.
 * @param {string} options.instrument - Instrument prompt.
 * @param {number} options.bpm - Beats per minute (60–200).
 * @param {number} options.temperature - Musical temperature - AI Creativity (0–1).
 * @param {string} options.outputFile - Absolute path to save the WAV file.
 * @param {string} options.basePrompt - Mood prompt to anchor generation.
 */
export async function lyriaCreate({ genre, instrument, bpm = 100, temperature = 1.0, outputFile, basePrompt }) {
    genre = genre || 'Indie Pop';
    instrument = instrument || 'Piano Ballad';
    basePrompt = basePrompt || 'Dreamy Ambient Pads';

    console.log(`Generating: ${genre}, ${instrument}, BPM ${bpm}, temperature ${temperature}, basePrompt "${basePrompt}"`);

    const audioBuffers = [];
    // Create session object to control music generation.
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

    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await session.stop();

                // Stitch together all the tiny audio chunks 
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
