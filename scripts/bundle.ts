import * as esbuild from 'esbuild';
import * as path from 'path';
import * as fs from 'fs-extra';

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const ENTRY = path.join(ROOT, 'src/TranslationManager.ts');
const OUTPUT = path.join(DIST, 'TranslationManager.js');

async function bundle() {
    console.log('[TranslationManager] Bundling for GAS...');

    if (!fs.existsSync(DIST)) {
        fs.ensureDirSync(DIST);
    }

    try {
        await esbuild.build({
            entryPoints: [ENTRY],
            bundle: true,
            outfile: OUTPUT,
            minify: false,
            format: 'iife',
            globalName: 'TranslationManagerLibrary',
            target: 'es2015',
            // Map the global name to the expected Shared.TranslationManager namespace
            footer: {
                js: 'if (typeof Shared === "undefined") Shared = {}; if (typeof Shared.TranslationManager === "undefined") Shared.TranslationManager = TranslationManagerLibrary;'
            }
        });

        console.log(`[TranslationManager] Bundle created at ${OUTPUT}`);
    } catch (err) {
        console.error('[TranslationManager] Bundle failed:', err);
        process.exit(1);
    }
}

bundle();
