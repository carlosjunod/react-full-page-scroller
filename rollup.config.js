import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

export default {
  type: "module",
  main: "./dist/index.cjs.js",
  module: "./dist/index.esm.js",
  exports: {
    require: "./dist/index.cjs.js",
    import: "./dist/index.esm.js"
  },
  input: 'src/index.jsx',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm'
    }
  ],
  external: ['react', 'react-dom', 'framer-motion'],
  plugins: [
    resolve({ extensions: ['.js', '.jsx'] }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: ['@babel/preset-react']
    })
  ]
};
