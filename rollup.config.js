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
            {
                file: pkg.umd,
                name: 'Geom2',
                format: 'umd',
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
        input: pkg.umd,
        external: [],
        plugins: [
            uglify(),
        ],
        output: {
            file: pkg.umd.replace('.js', '.min.js'),
            format: 'umd',
        }
    }
]
