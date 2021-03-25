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

  //=============
  // 一、设计器项目 请解除下列注释，并注释【二】中内容
  //=============
  //设计器
  chainWebpack: config => {
    //设计器
    config.plugin("html").tap(options => {
      options[0].template = "./src/project/designBI/assets/designBi.html";
      options[0].hash = true;
      return options;
    });
  },
  publicPath: "/dist",
  outputDir: "../dist"

  //=============
  // 二、lserp项目 请解除下列注释，并注释【一】中内容
  //=============
  //-------------------
  //outputDir: "../../Lskj.WebErp.View_7.0/Lserp_v8/dist"
};
