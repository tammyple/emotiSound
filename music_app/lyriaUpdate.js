// lyriaUpdate.js
import path from 'path';
import { fileURLToPath } from 'url';
import { lyriaCreate } from './lyriaCreate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI args (Flask will call it like: node lyriaUpdate.js <genre> <instrument> <bpm> <temperature> <outputFile>)
const [genreArg, instrumentArg, bpmArg, temperatureArg, outputArg] = process.argv.slice(2);

const genre = genreArg || undefined;
const instrument = instrumentArg || undefined;

let bpm = parseInt(bpmArg, 10);
if (isNaN(bpm)) bpm = undefined;

let temperature = parseFloat(temperatureArg);
if (isNaN(temperature)) temperature = undefined;

// Always save inside static/generated
const outputFile = path.resolve(
    __dirname,
    'static',
    'generated',
    path.basename(outputArg) || `lyria_${Date.now()}.wav`
);

lyriaCreate({ genre, instrument, bpm, temperature, outputFile })
    .catch(err => {
        console.error('Music update failed:', err);
        process.exit(1);
    });
