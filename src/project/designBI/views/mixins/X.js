import tool from "@/plugins/js/tool";
import Vue from "vue";
const Xpro = import(
  /* webpackChunkName: "bi-center-data" */
  "xlsx"
);
const supports = ["xlsx", "xlsm", "xlsb", "xls", "csv", "txt"];
import updDataReport from "../Page/UserPage/DesignCenter/newData/updDataReport.vue";
export default {
  data() {
    return {
      X: null,
      minSamePer: 80,
      reading: false,
      workSheet: null
    };
  },
  computed: {
    rABS() {
      return (
        typeof FileReader !== "undefined" &&
        (FileReader.prototype || {}).readAsBinaryString
      );
    },
    sheet() {
      let me = this,
        sheet = [];
      if (me.workSheet) {
        sheet = me.wsToArray(me.workSheet);
      }
      return sheet;
    },
    keySheet() {
      let me = this,
        sheet = [];
      if (me.workSheet) {
        sheet = me.wsToArray(me.workSheet, true);
      }
      return sheet;
    }
  },
  methods: {
    //~ 5-2 维度确定 keySheet注意
    //【update】分析的细节展现，看耗不耗时了
    analyseDimension(sheet) {
      let me = this,
        sampleSheet = sheet, //tool.getSample(sheet, 100),
        dimension = {};
      //# 1 成分分析
      tool.each(sampleSheet, rec => {
        tool.each(rec, (key, val) => {
          dimension[key] = dimension[key] || {
            number: 0,
            string: 0,
            date: 0,
            other: 0
          };
          if (tool.isDate(val)) {
            ++dimension[key].date;
          } else if (tool.isNumber(val)) {
            ++dimension[key].number;
          } else if (tool.isString(val)) {
            ++dimension[key].string;
          } else {
            ++dimension[key].other;
          }
        });
      });
      //# 2 百分比化
      tool.each(dimension, (key, val) => {
        let totCount = 0,
          perfect = false,
          healthy = false;
        //# 2-1 总数
        tool.each(val, (k, v) => {
          totCount += v;
        });
        //# 2-2 百分比
        let loopVal = tool.apply({}, val);
        val.type = "other";
        tool.each(loopVal, (k, v) => {
          let per = (v / totCount) * 100;
          if (per >= me.minSamePer) {
            healthy = true;
            //# 2-3 只要是healthy就可以断定是什么类型了
            val.type = k;
            if (per === 100) {
              perfect = true;
            }
          }
          val[k + "_per"] = per;
        });
        val.healthy = healthy;
        val.perfect = perfect;
      });
      //# 3 健康？
      let isHealthy = true,
        isPerfect = true;
      tool.each(dimension, (key, val) => {
        //~~ 1 不至于退出
        val.status = 1;
        if (!val.perfect) {
          isPerfect = false;
          val.status = 2;
        }
        if (!val.healthy) {
          isHealthy = false;
          val.status = 3;
        }
      });

      return {
        healthy: isHealthy,
        perfect: isPerfect,
        dimension
      };
    },
    //~ 5 核心 读取文件，返回res的 wb
    dealFile(files) {
      let me = this,
        X = me.X,
        rABS = me.rABS;
      me.reading = true;
      return new Promise((res, rej) => {
        var f = files[0];
        //【update】看能不能自动转换？ie9
        var reader = new FileReader();
        //# 1 经过时间处理
        reader.onload = function (e) {
          var data = e.target.result;
          if (!rABS) data = new Uint8Array(data);
          //# 2 获取
          let wb = X.read(data, {
            type: rABS ? "binary" : "array",
            cellDates: true
          }),
            ws = me.getWorkSheet(wb),
            fileName = f.name,
            fileTypeM = /\.([^.]+)$/.exec(fileName),
            fileType = (fileTypeM && fileTypeM[1]).toLowerCase();

          console.log(["读取完毕", me, ws, fileName]);
          //@@ 1 不支持的文件类型
          if (supports.indexOf(fileType) < 0) {
            me.$message.error(`不支持的文件类型：${fileType}！`);
            rej();
            return;
          }
          //@@ 2 无表
          if (!ws) {
            me.$message.error(`未能从文件${fileName}中获取到表！`);
            rej();
            return;
          }
          //@@ 3 无数据
          let keySheet = me.wsToArray(ws, true);
          if (!keySheet.length) {
            me.$message.error(`未从文件${fileName}的表中获取到数据！`);
            rej();
            return;
          }

          //# 3 研究所上传的数据样本，确定维度信息
          let analyse = me.analyseDimension(keySheet);
          me.reading = false;
          //# 4 可能存在维度不确定数据
          me.dataHealthyReport({ analyse, keySheet, wb })
            .then(r1 => {
              if (analyse.perfect) {
                return;
              }
              if (analyse.healthy) {
                //# 4-2 针对不确定数据进行类型强转
                res({ wb, fileName, fileType, analyse, keySheet });
              } else {
                //@@ 4 不健康数据 强制取消本次上传
                rej();
              }
            })
            .catch(r1 => {
              if (analyse.perfect) {
                return;
              }
              //@@ 5 不完美数据 用户主动取消
              me.$message.info("用户取消本次数据上传");
              rej(r1);
            });
          //# 5 确定完美的，就直接敲定
          if (analyse.perfect) {
            me.$message.success("上传表格数据成功！");
            res({ wb, fileName, fileType, analyse, keySheet });
          }
        };
        if (rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
      });
    },
    //~ 5-3 不健康数据确认提示
    dataHealthyReport({ analyse, keySheet, wb }) {
      let me = this,
        h = me.$createElement;
      return new Promise((res, rej) => {
        console.log(["分析！", analyse, keySheet]);
        let rows = [];
        tool.each(analyse.dimension, (key, val) => {
          rows.push({
            key,
            ...val
          });
        });
        let report = Vue.extend({
          name: "report",
          template: `<updDataReport :rows="rows" :analyse="analyse"></updDataReport>`,
          components: {
            updDataReport
          },
          data() {
            return {
              rows,
              analyse
            };
          }
        });

        me.$msgbox({
          title: "数据健康报告",
          closeOnClickModal: false,
          showCancelButton: true,
          message: h(report),
          customClass: "updDataReport"
        })
          .then(r => {
            res(r);
          })
          .catch(r => {
            rej(r);
          });
      });
    },
    //~ 7 转化有关
    getWorkSheet(wb) {
      let ws = null;
      tool.each(wb.Sheets, (key, val) => {
        if (val && val["!ref"]) {
          ws = val;
          return false;
        } else {
          return true;
        }
      });
      return ws;
    },
    wsToArray(ws, withKey) {
      let me = this,
        cfg = {
          cellDates: true
        },
        sheet = [];
      if (!withKey) {
        cfg.header = 1;
      }
      sheet = me.X.utils.sheet_to_json(ws, cfg); //header1表示 二维数组模式！
      return sheet;
    },
    //~ 7-2 Aoa sheet转化日期为可保存的
    getStrDateAoa(_aoa, withS, fmt) {
      let me = this,
        aoa = tool.clone(_aoa);
      fmt = fmt || "yyyy-MM-dd hh:mm:ss" + (withS ? ".S" : "");
      tool.each(aoa, row => {
        //# 1 二维数组转化
        if (tool.isArray(row)) {
          tool.each(row, (cell, i) => {
            if (tool.isDate(cell)) {
              row[i] = tool.Date.format(cell, fmt);
            }
          });
        }
        //# 2 值对象转化
        else if (tool.isObject(row)) {
          tool.each(row, (k, val) => {
            if (tool.isDate(val)) {
              row[k] = tool.Date.format(val, fmt);
            }
          });
        }
      });
      return aoa;
    },
    getSheetFromAoa(_aoa, dim) {
      let me = this,
        X = me.X,
        aoa = tool.clone(_aoa),
        header = aoa[0],
        toDate = [];
      console.log(["查看 转化问题0"]);
      //# 1 对首行、维度进行匹配
      if (tool.isObject(dim)) {
        tool.each(dim, (k, v) => {
          if (v === "date") {
            let at = header.indexOf(k);
            if (at > -1) {
              toDate.push(at);
            }
          }
        });
      } else if (tool.isArray(dim)) {
        tool.each(dim, oneDim => {
          if (oneDim.type === "date") {
            let at = header.indexOf(oneDim.key);
            if (at > -1) {
              toDate.push(at);
            }
          }
        });
      } else {
        return null;
      }
      //# 2 处理数据
      aoa.forEach((row, y) => {
        if (y > 0) {
          row.forEach((val, x) => {
            if (toDate.indexOf(x) > -1) {
              row[x] = new Date(val);
            }
          });
        }
      });
      //# 3 转化结果
      let ws = X.utils.aoa_to_sheet(aoa, { cellDates: true });
      return ws;
    }
  },
  created() {
    let me = this;
    Xpro.then(mod => {
      me.X = mod;
      console.log(["Xready！", mod, me]);
      me.$emit("Xready");
    });
  }
};

let Xplus = {
  props: {
    DetailData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      workSheet: null,
    };
  },
  computed: {
    dimension() {
      return JSON.parse(this.DetailData.dimension);
    }
  },
  methods: {
    refresh() {
      let me = this;
      me.workSheet = me.getSheetFromAoa(
        JSON.parse(me.DetailData.dataSource),
        me.dimension
      );
    }
  },
  watch: {
    dimension() {
      this.refresh();
    }
  },
  created() {
    let me = this;
    me.$on("Xready", () => {
      me.refresh();
    });
  }
};

export { Xplus };
