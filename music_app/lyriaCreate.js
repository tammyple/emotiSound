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
 * @param {number} options.temperature - Musical temperature (0–1).
 * @param {string} options.outputFile - Absolute path to save the WAV file.
 */
export async function lyriaCreate({ genre, instrument, bpm = 100, temperature = 1.0, outputFile }) {
    // Apply defaults only if missing
    genre = genre || 'Indie Pop';
    instrument = instrument || 'Piano Ballad';
    bpm = bpm !== undefined ? bpm : 100;
    temperature = temperature !== undefined ? temperature : 1.0;

    console.log(`Generating: ${genre}, ${instrument}, BPM ${bpm}, temperature ${temperature}`);

    const audioBuffers = [];

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

    await session.setWeightedPrompts({
        weightedPrompts: [
            { text: genre, weight: 1.0 },
            { text: instrument, weight: 0.4 },
            { text: 'Drums', weight: 0.5 },
            { text: 'Bassline', weight: 0.5 },
            { text: 'Melodic Synth', weight: 0.4 }
        ],
    });

    await session.setMusicGenerationConfig({
        musicGenerationConfig: { bpm, temperature },
    });
    session.resetContext();

    session.play();

    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                await session.stop();

                // Convert audio chunks to Float32
                const rawData = Buffer.concat(audioBuffers);
                const samples = new Float32Array(rawData.length / 2);
                for (let i = 0; i < samples.length; i++) {
                    samples[i] = rawData.readInt16LE(i * 2) / 32768;
                }

                const audioData = {
                    sampleRate: 44100,
                    channelData: [samples],
                };

                const wavBuffer = await wav.encode(audioData);
                fs.writeFileSync(outputFile, Buffer.from(wavBuffer));

                console.log(`Saved valid WAV file: ${outputFile}`);
                resolve(outputFile);
                process.exit(0); 
            } catch (err) {
                reject(err);
            }
        }, 8000); 
    });
}
