import vue from "rollup-plugin-vue";
import resolve from "rollup-plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import sass from "rollup-plugin-sass";
import autoprefixer from "autoprefixer";
import url from "rollup-plugin-url";
import json from "rollup-plugin-json";
import commonjs from "rollup-plugin-commonjs";
import alias from "rollup-plugin-alias";
import babel from "rollup-plugin-babel";
import svg from "rollup-plugin-vue-unoptimized-inline-svg";
import path from "path";

export default {
  input: "src/speed.js", 
  output: {
    format: 'cjs',
    file: "dist/floorspace.min.js",
    exports: "default",
    name: 'floorspace'
  },
  plugins: [
    vue({
      css: true,
      template: {
        isProduction: true
      }
    }),
    resolve({
      modules: true,
    }),
    svg(),
    sass(),
    alias({
      vue: path.resolve(__dirname, '../node_modules/vue/dist/vue.js'),
    }),
    url(),
    json(),
    commonjs({
      namedExports: {
        'node_modules/vue-runtime-helpers/dist/normalize-component.js': [ 'named' ],
        'node_modules/portal-vue/dist/portal-vue.js': ['Portal', 'PortalTarget'],
        'node_modules/element-ui/lib/element-ui.common.js': [ 'Table', 'TableColumn' ],
      }
    }),
    postcss({
      plugins: [
        autoprefixer({
          browsers: ['last 2 versions']
        })
      ]
    }),
    babel({
      exclude: 'node_moduels/**',
      babelrc: false,
      presets: ["es2015-rollup", "stage-3"],
      comments: false, 
    }),
  ]
};