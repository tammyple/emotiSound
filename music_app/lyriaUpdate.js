// Update arguments based on user interaction (changed mood/style or music elements)
import path from 'path';
import { fileURLToPath } from 'url';
import { lyriaCreate } from './lyriaCreate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const [genreArg, instrumentArg, bpmArg, temperatureArg, outputArg, basePromptArg] = process.argv.slice(2);

const genre = genreArg || undefined;
const instrument = instrumentArg || undefined;

let bpm = parseInt(bpmArg, 10);
if (isNaN(bpm)) bpm = undefined;

let temperature = parseFloat(temperatureArg);
if (isNaN(temperature)) temperature = undefined;

// Set output file path
const outputFile = path.resolve(
    __dirname,
    'static',
    'generated',
    path.basename(outputArg) || `lyria_${Date.now()}.wav`
);

// Call lyriaCreate with the new parameters
lyriaCreate({
    genre,
    instrument,
    bpm,
    temperature,
    outputFile,
    basePrompt: basePromptArg || undefined
}).catch(err => {
    console.error('Music update failed:', err);
    process.exit(1);
});
