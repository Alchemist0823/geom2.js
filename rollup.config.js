import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from '@rollup/plugin-babel'
import {uglify} from 'rollup-plugin-uglify'
import pkg from './package.json'

const extensions = [
    '.js', '.jsx', '.ts', '.tsx',
];

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
            },
            {
                file: pkg.module,
                format: 'esm',
            },
        ],
        external: [],
        plugins: [
            // Allows node_modules resolution
            resolve({ extensions }),

            // Allow bundling cjs modules. Rollup doesn't understand cjs
            commonjs(),

            // Compile TypeScript/JavaScript files
            babel({
                extensions,
                include: ['src/**/*'],
                babelHelpers: 'runtime',
            }),
        ],
    },
    {
        input: pkg.main,
        external: [],
        plugins: [
            uglify(),
        ],
        output: {
            file: pkg.main.replace('.js', '.min.js'),
            format: 'cjs',
        }
    }
]