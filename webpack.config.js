var StatsPlugin = require("stats-webpack-plugin");
var StringReplacePlugin = require("string-replace-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var webpack = require("webpack");

const version = require("./package.json").version;
const date = new Date().toISOString().replace(/:\d+\.\d+Z$/, "Z");

const copyright = `/*!
 * CLDR JavaScript Library v@VERSION @DATE MIT license © Rafael Xavier
 * http://git.io/h4lmVg
 */`
  .replace(/@VERSION/g, version)
  .replace(/@DATE/g, date);

const banner = {
  banner: copyright,
  raw: true
};

// If you enable this, webpack will create a
// profile_*.json file for each bundle.
// This file can then be uploaded on
// https://webpack.github.io/analyse/ for analysis.
const enable_profile = false;

const optimization = {
  // You can enable this to debug webpack's output
  //minimize: false
};

// This is used in each bundle that isn't
// cldr's core to tell it how to include it
const externals = {
  "./core": {
    commonjs2: "../cldr",
    commonjs: "../cldr",
    amd: "../cldr",
    root: "Cldr"
  }
};

function stats(file) {
  if (!enable_profile) {
    return false;
  }

  return new StatsPlugin(file, {
    chunkModules: true
  });
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function createReplacements(substitutions) {
  const replacements = Object.keys(substitutions).map(key => {
    return {
      pattern: new RegExp(`require\\("${escapeRegExp(key)}"\\)`, "gi"),
      replacement: () => substitutions[key]
    };
  });

  return StringReplacePlugin.replace({ replacements });
}

module.exports = [
  // Cldr's Core file
  {
    entry: "./src/core.js",
    output: {
      library: "Cldr",
      libraryTarget: "umd",
      filename: "cldr.js"
    },
    plugins: [
      new webpack.BannerPlugin(banner),
      new CopyWebpackPlugin([
        {
          from: "src/build/node_main.js",
          to: "node_main.js",
          transform(content) {
            return banner.banner + "\n" + content;
          }
        }
      ]),
      new StringReplacePlugin(),
      stats("profile_core.json")
    ].filter(Boolean),
    optimization
  },
  // Cldr's Event extension
  // Excluding Cldr core
  {
    entry: "./src/event.js",
    output: {
      library: "Cldr",
      libraryTarget: "umd",
      filename: "cldr/event.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          // Build optimization hack to avoid duplicating functions across modules.
          loader: createReplacements({
            "./common/validate/presence": "Cldr._validatePresence",
            "./common/validate/type": "Cldr._validateType",
            "../type": "Cldr._validateType",
            "./path/normalize": "Cldr._pathNormalize"
          })
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin(banner),
      new StringReplacePlugin(),
      stats("profile_event.json")
    ].filter(Boolean),
    optimization,
    externals
  },
  // Cldr's Supplemental extension
  // Excluding Cldr core
  {
    entry: "./src/supplemental.js",
    output: {
      library: "Cldr",
      libraryTarget: "umd",
      filename: "cldr/supplemental.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          // Build optimization hack to avoid duplicating functions across modules.
          loader: createReplacements({
            "../util/always_array": "Cldr._alwaysArray"
          })
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin(banner),
      new StringReplacePlugin(),
      stats("profile_supplemental.json")
    ].filter(Boolean),
    optimization,
    externals
  },
  // Cldr's Unresolved extension
  // Excluding Cldr core
  {
    entry: "./src/unresolved.js",
    output: {
      library: "Cldr",
      libraryTarget: "umd",
      filename: "cldr/unresolved.js"
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          // Build optimization hack to avoid duplicating functions across modules.
          loader: createReplacements({
            "../path/normalize": "Cldr._pathNormalize",
            "../util/json/merge": "Cldr._jsonMerge",
            "../resource/get": "Cldr._resourceGet",
            "./core/load": "Cldr._coreLoad",
            "../common/validate/presence": "Cldr._validatePresence",
            "./common/validate/type/path": "Cldr._validateTypePath"
          })
        }
      ]
    },
    plugins: [
      new webpack.BannerPlugin(banner),
      new StringReplacePlugin(),
      stats("profile_unresolved.json")
    ].filter(Boolean),
    optimization,
    externals
  }
];
