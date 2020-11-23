import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import progress from 'rollup-plugin-progress';
import json from 'rollup-plugin-json';
import nodent from 'rollup-plugin-nodent';
import eft from 'rollup-plugin-eft';
import autoprefixer from 'autoprefixer';
import clean from 'postcss-clean';
import postCSS from 'rollup-plugin-postcss';

const env = process.env.NODE_ENV;

const base = {
    input: 'src/frontend.js',
    output: {
        file: 'dist/pomment-frontend.min.js',
        name: 'PommentWidget',
        format: 'umd',
        sourcemap: (env !== 'production'),
        globals: {
            crypto: 'crypto',
        },
    },
    external: ['crypto'],
    plugins: [
        progress({
            clearLine: false,
        }),
        resolve({
            browser: true,
        }),
        commonjs(),
        json(),
        postCSS({
            extract: true,
            plugins: [
                autoprefixer(),
                clean(),
            ],
        }),
        eslint({
            exclude: ['**/*.html', '**/*.css', '**/*.scss', '**/*.json', '**/*.eft'],
        }),
        eft(),
        nodent({
            promises: true,
            noRuntime: true,
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        terser(),
    ],
};

if (process.env.NODE_ENV === 'development') {
    base.watch = {
        chokidar: true,
        include: 'src/**/*',
    };
}

export default base;
