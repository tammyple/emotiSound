// lyriaUpdate.js
import path from 'path';
import { fileURLToPath } from 'url';
import { lyriaCreate } from './lyriaCreate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CLI args (Flask will call it like: node lyriaUpdate.js <genre> <instrument> <bpm> <density> <outputFile>)
const [genreArg, instrumentArg, bpmArg, densityArg, outputArg] = process.argv.slice(2);

const genre = genreArg || undefined;
const instrument = instrumentArg || undefined;

let bpm = parseInt(bpmArg, 10);
if (isNaN(bpm)) bpm = undefined;

let density = parseFloat(densityArg);
if (isNaN(density)) density = undefined;

// Always save inside static/generated
const outputFile = path.resolve(
    __dirname,
    'static',
    'generated',
    path.basename(outputArg) || `lyria_${Date.now()}.wav`
);

lyriaCreate({ genre, instrument, bpm, density, outputFile })
    .catch(err => {
        console.error('Music update failed:', err);
        process.exit(1);
    });
