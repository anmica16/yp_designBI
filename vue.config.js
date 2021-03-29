const path = require("path");

//## 0 详见官方文档 https://cli.vuejs.org/zh/guide/mode-and-env.html
// 配置文档 https://cli.vuejs.org/zh/config/
module.exports = {
  //【1】webpack的config
  configureWebpack: {
    resolve: {
      //## 1 对这些后缀文件进行 import或者 require时的 别名处理
      extensions: [".js", ".vue", ".json"],
      alias: {
        //## 1-2 import "vue"时，实际引用的这个路径的，因为这个包含运行时的内容，允许模板
        vue$: "vue/dist/vue.js",
        //## 1-3 对@的等价替换
        "@": path.resolve("src"),
        //## 1-3 对@designBI的等价替换
        "@designBI": path.resolve("src/project/designBI")
      }
    },
    module: {
      rules: [
        {
          test: /\.m?jsx?$/,
          //## 2 特意包含了element-ui的文件夹，当 import 这个文件夹内的文件时，也会打包进来，不写就不会包含，那么就会报错
          include: [path.resolve(__dirname, "node_modules/element-ui")],
          use: [
            {
              loader: "babel-loader"
            }
          ]
        }
      ]
    },
    //## 3 外部引用，在模板html中引入，左边是 import的 词，右侧是引入文件中的 变量名
    externals: {
      jquery: "jQuery",
      vue: "Vue",
      Yw: "Yw"
    },
    //## 4 请见webpack官网文档
    devtool: "hidden-source-map"
  },

  css: {
    extract: {
      //## 5 目的： 每次生成同样名字
      filename: `css/[name].css`
    }
  },

  //## 5 目的： 每次生成同样名字
  filenameHashing: false,

  //=============
  // 一、设计器项目 请解除下列注释，并注释【二】中内容
  //=============
  //设计器
  chainWebpack: config => {
    //## 6 将默认的模板换为下列地址中的
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
