import * as path from "path";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import linaria from "@wyw-in-js/rollup";
import { InputOptions, OutputOptions } from "rollup";
import css from "rollup-plugin-css-only";
import esbuild from "rollup-plugin-esbuild";
import importAssets from "rollup-plugin-import-assets";
import visualizer from "rollup-plugin-visualizer";
import { MinifyOptions } from "terser";
import { glsl } from "./rollup-plugin-glsl";
import { shaderVariables } from "./rollup-plugin-shader-variables";

export const terserOptions: MinifyOptions = {
  compress: {
    keep_infinity: true,
    pure_getters: true,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_math: true,
    unsafe_methods: true,
    inline: true,
    booleans_as_integers: true,
    passes: 10,
  },
  format: {
    wrap_func_args: false,
    comments: false,
  },
  mangle: { properties: true, toplevel: true },
  ecma: 2020,
  toplevel: true,
};

export const minifyHtmlOptions = {
  collapseWhitespace: true,
  useShortDoctype: true,
  minifyCSS: true,
};

export const createRollupInputOptions = (production: boolean) => {
  const classNameMap = new Map<string, string>();
  return {
    input: path.resolve(__dirname, "..", "game", "index.ts"),

    plugins: [
      commonjs(),

      resolve({
        extensions: [".tsx", ".ts", ".js"],
      }),

      json(),

      linaria({
        include: [path.resolve(__dirname, "..", "game", "ui") + "/**/*.ts"],
        extensions: [".ts"],
        evaluate: false,
        babelOptions: {
          presets: ["@babel/preset-typescript"],
        },
        classNameSlug: (hash) => {
          if (!classNameMap.has(hash))
            classNameMap.set(hash, (classNameMap.size + 10).toString(36));
          return classNameMap.get(hash)!;
        },
      }),

      esbuild({
        include: ["**/*.ts"],
        exclude: /node_modules/,
        sourceMap: false,
        target: "es2022",
        minify: false,
        define: {
          "process.env.NODE_ENV": production ? '"production"' : '"dev"',
        },
      }),

      importAssets({
        include: [/\.bin$/i],
        emitAssets: true,
        fileNames: "[hash].[ext]",
        publicPath: "",
      }),

      glsl({
        include: ["**/*.frag", "**/*.vert"],
        compress: production,
      }),

      css({
        output: "style.css",
      }),

      ...(production
        ? [
            shaderVariables(),
            visualizer({
              filename: "dist/bundle-stats.html",
              template: "sunburst",
              gzipSize: true,
              // "treemap",
            }),
          ]
        : []),
    ],
  } as InputOptions;
};

export const rollupOutputOptions = {
  format: "es",
  sourcemap: false,
} satisfies OutputOptions;
