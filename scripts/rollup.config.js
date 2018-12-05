import buble from 'rollup-plugin-buble';
import { eslint } from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import { uglify } from 'rollup-plugin-uglify';
import progress from 'rollup-plugin-progress';
import json from 'rollup-plugin-json';
import nodent from 'rollup-plugin-nodent';
import autoprefixer from 'autoprefixer';
import clean from 'postcss-clean';
import postCSS from 'rollup-plugin-postcss';

const base = {
    input: 'src/frontend.js',
    output: {
        file: `dist/pomment-frontend.${process.env.NODE_ENV === 'production' ? 'min.' : ''}js`,
        name: 'PommentWidget',
        format: 'umd',
        sourcemap: true,
        // globals: {
        //     '@pomment/sdk': 'Pomment',
        // },
    },
    plugins: [
        progress({
            clearLine: false,
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        commonjs(),
        json(),
        postCSS({
            // extract: true,
            plugins: [
                autoprefixer(),
                clean(),
            ],
        }),

        eslint({
            exclude: ['**/*.html', '**/*.scss', '**/*.json'],
        }),
        nodent({
            promises: true,
            noRuntime: true,
        }),
        buble({
            transforms: {
                modules: false,
                dangerousForOf: true,
            },
            objectAssign: 'Object.assign',
        }),
        replace({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        }),
        (process.env.NODE_ENV === 'production' && uglify()),
    ],
    // external: ['@pomment/sdk'],
};

if (process.env.NODE_ENV === 'development') {
    base.watch = {
        chokidar: true,
        include: 'src/**/*',
    };
}

export default base;
