const path = require("path");

module.exports = {
  //【1】webpack的config
  configureWebpack: {
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        vue$: "vue/dist/vue.js",
        "@": path.resolve("src")
      }
    },
    module: {
      rules: [
        {
          test: /\.m?jsx?$/,
          include: [path.resolve(__dirname, "node_modules/element-ui")],
          use: [
            {
              loader: "babel-loader"
            }
          ]
        }
      ]
    },
    externals: {
      jquery: "jQuery",
      vue: "Vue",
      Yw: "Yw"
    },
    devtool: "hidden-source-map"
  },

  css: {
    extract: {
      filename: `css/[name].css`
    }
  },

  filenameHashing: false,

  //publicPath: "/pages/designBI/",
  //outputDir: "../pages/designBI",
  outputDir: "../Lserp_v8/dist"
};
