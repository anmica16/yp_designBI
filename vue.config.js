const path = require("path");

module.exports = {
  //【1】webpack的config
  configureWebpack: {
    resolve: {
      extensions: [".js", ".vue", ".json"],
      alias: {
        vue$: "vue/dist/vue.js",
        "@": path.resolve("src"),
        "@designBI": path.resolve("src/project/designBI")
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

  //设计器
  chainWebpack: config => {
    //设计器
    config.plugin("html").tap(options => {
      options[0].template = "./src/project/designBI/assets/designBi.html";
      options[0].hash = true;
      return options;
    });
  },

  //--------- v2 分开的项目
  publicPath: "/dist",
  outputDir: "../dist"

  //--------- v1
  // publicPath: "/pages/designBI/",
  // outputDir: "../pages/designBI"

  //v8文件夹
  //outputDir: "../Lserp_v8/dist"
};
