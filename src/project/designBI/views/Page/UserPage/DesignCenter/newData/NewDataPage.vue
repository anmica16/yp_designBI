<template>
  <div class="NewDataPage">
    <div class="headBar">
      <div class="dataName">
        <span class="pre">表名</span>
        <el-input v-model="name" placeholder="请输入表名"></el-input>
      </div>
      <div class="fill"></div>
      <div class="yesno">
        <el-button ref="cancel" type="info" @click="cancelFn">取消</el-button>
        <el-button
          ref="submit"
          :type="workBook ? 'primary' : ''"
          :disabled="!workBook"
          @click="submitFn"
          >{{ addNewData ? "保存" : "确定" }}</el-button
        >
      </div>
    </div>
    <div class="operateBody">
      <div class="leftArea">
        <!-- ~ 1 上传信息、操作 -->
        <div class="topMain">
          <div class="updInfo">
            <span class="pre">上传信息：</span>
            <span class="fileName"></span>
          </div>
          <dir class="fill"></dir>
          <div class="operArea">
            <el-button
              size="medium"
              type="primary"
              @click="newUpdBtn"
              v-if="!workBook"
              >上传数据</el-button
            >
            <input ref="newInput" type="file" name="file" @change="newUpdFn" />

            <el-button
              size="medium"
              @click="addUpdBtn"
              type="primary"
              v-if="workBook"
              >追加上传</el-button
            >
            <input ref="addInput" type="file" name="file2" @change="addUpdFn" />

            <el-button
              class="reNew"
              size="medium"
              @click="newUpdBtn"
              type="primary"
              v-if="workBook"
              >重新上传</el-button
            >
          </div>
        </div>
        <div
          class="bodyInfo"
          @dragenter.stop.prevent="leftDragOverFn"
          @dragover.stop.prevent="leftDragOverFn"
          @drop.stop.prevent="leftDrogFn"
        >
          <div class="tipText">
            <template v-if="!workBook">
              <div class="text1">要求：</div>
              <div class="text1">1.支持格式：xls、csv、xlsx；</div>
              <div class="text1">
                2.只读取第一个sheet的数据，请确保从第一个单元格开始没有：复杂函数或者VBA编程等；
              </div>
              <div class="text1">
                3.第一行为字段名，第二行开始为字段的值，请确保第一行没有合并单元格；
              </div>
            </template>
            <template v-else>
              <div class="group1">
                <div class="text2">
                  追加上传：只需上传新增的Excel数据，把新上传的Excel数据增添到原数据后，忽略新增字段
                </div>
                <div class="text2">重新上传：全部替换为新上传的Excel</div>
              </div>
              <div class="text1">预览区域只列出前100行数据；</div>
              <div class="text1">第一行为字段名，第二行开始为字段的值</div>
            </template>
          </div>
          <!-- ~ 1  -->
          <template v-if="workBook">
            <div class="fieldType"></div>
          </template>
          <!-- ~ 2 覆盖全部body的 drop层 -->
          <div
            v-show="leftDragOver"
            class="dragTip"
            @dragleave="leftDragLeaveFn"
            :class="{ newUpd: !workBook }"
          >
            <div class="icon"></div>
            <div class="text">{{ leftDragText }}</div>
          </div>
        </div>
      </div>
      <div class="rightArea">
        <template v-if="workBook">
          <div></div>
        </template>
        <div v-else class="noTip">
          <div class="back"></div>
          <div class="text">请先上传Excel数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const supports = ["xlsx", "xlsm", "xlsb", "xls", "csv", "txt"];
import $ from "@/plugins/js/loader";
import Vue from "vue";
import tool from "@/plugins/js/tool";
import updDataReport from "./updDataReport";
export default {
  name: "NewDataPage",
  props: {
    //@ 1 基本
    id: {
      type: String,
      required: true
    },
    pIndex: {
      type: String,
      required: true
    },
    index: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      //@ 1-2 附加信息加入
      name: "",
      fileName: "",
      fileType: "",

      //@ 2 工具
      X: null,
      //@ 3 其他
      addNewData: false,
      leftDragOver: false,
      //@ 4 上传读取的数据
      reading: false,
      workBook: null,
      minSamePer: 95
    };
  },
  computed: {
    rABS() {
      return (
        typeof FileReader !== "undefined" &&
        (FileReader.prototype || {}).readAsBinaryString
      );
    },
    leftDragText() {
      return this.workBook
        ? "拖拽表格到此处以重新上传"
        : "拖拽表格到此处以上传";
    },
    sheet() {
      let me = this,
        sheet = [];
      if (me.workBook) {
        sheet = me.wbToArray(me.workBook);
      }
      return sheet;
    }
  },
  methods: {
    backPage() {
      this.$router.push({});
    },
    //~ 2 保存后就取消该 id的 readyAdd状态
    submitFn() {
      let me = this;
      console.log(["尝试提交", me]);
    },
    //~ 3 取消则直接删除该record
    cancelFn() {
      let me = this;
      //# 1 删除
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.Delete,
        data: {
          table: "data",
          ids: JSON.stringify([me.id])
        }
      }).catch(r => {});
      //# 2 返回
      me.backPage();
    },
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
        reader.onload = function(e) {
          var data = e.target.result;
          if (!rABS) data = new Uint8Array(data);
          //# 2 获取
          let wb = X.read(data, {
              type: rABS ? "binary" : "array",
              cellDates: true
            }),
            keySheet = me.wbToArray(wb, true),
            fileName = f.name,
            fileTypeM = /\.([^.]+)$/.exec(fileName),
            fileType = (fileTypeM && fileTypeM[1]).toLowerCase();

          console.log(["读取完毕", wb, me]);
          if (supports.indexOf(fileType) < 0) {
            me.$message.error(`不支持的文件类型：${fileType}！`);
            rej(wb);
            return;
          } else if (!keySheet.length) {
            me.$message.error(`未从文件${fileName}中获取到数据！`);
            rej(wb);
            return;
          }

          //# 3 研究100个数据样本，确定维度信息
          let analyse = me.analyseDimension(keySheet),
            successFn = function() {
              me.reading = false;
              me.$message.success("上传表格数据成功！");
              res({ wb, fileName, fileType });
            };
          //# 3-1 维度不确定数据
          if (!analyse.healthy) {
            me.notHealthyTip({ analyse, keySheet, wb })
              .then(r1 => {
                successFn();
              })
              .catch(r1 => {});
          }
          //# 3-2 维度确定，但仍有少数不符合格式数据
          else if (analyse.healthy && !analyse.perfect) {
            me.notPerfectTip({ analyse, keySheet, wb })
              .then(r1 => {})
              .catch(r1 => {});
          }
          //# 3-3 健康维度一致数据
          else {
            me.perfectTip({ analyse, keySheet, wb })
              .then(r1 => {})
              .catch(r1 => {});
            //successFn();
          }
        };
        if (rABS) reader.readAsBinaryString(f);
        else reader.readAsArrayBuffer(f);
      });
    },
    //~ 5-3 不健康数据确认提示
    notHealthyTip({ analyse, keySheet, wb }) {
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
          template: `<updDataReport :rows="rows" analyse="analyse"></updDataReport>`,
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
    //~ 5-4 不健康数据确认提示
    notPerfectTip() {
      let me = this;
      return new Promise((res, rej) => {});
    },
    perfectTip() {
      let me = this;
      return new Promise((res, rej) => {});
    },
    //~ 4 drop相关
    leftDragOverFn(e) {
      let me = this;
      me.leftDragOver = true;
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
    },
    leftDragLeaveFn(e) {
      let me = this;
      me.leftDragOver = false;
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "move";
      }
    },
    newUpdFnBase(files) {
      let me = this;
      if (me.workBook) {
        // 待补充 删除
      }
      //# 2 赋值
      me.dealFile(files).then(({ wb, fileName, fileType }) => {
        me.workBook = wb;
        me.fileName = fileName;
        me.fileType = fileType;
      });
    },
    leftDrogFn(e) {
      let me = this;
      me.leftDragOver = false;
      me.newUpdFnBase(e.dataTransfer.files);
    },
    newUpdFn(e) {
      let me = this;
      me.newUpdFnBase(e.target.files);
    },
    addUpdFn(e) {
      let me = this;

      //# 1 先获取值
      if (e.target.files && e.target.files.length) {
        me.dealFile(e.target.files).then(({ wb, fileName, fileType }) => {
          //# 2 再追加！
          console.log(["开始追加", wb]);
          // let newCsv = me.wbToCsv(wb),
          //   fLineEnd = newCsv.indexOf(wb);
          // if (fLineEnd > -1) {
          //   newCsv = newCsv.substr(fLineEnd + 1);
          // }
          // let totCsv = me.csvData + newCsv,
          //   newWb = me.X.read(totCsv, { type: "string", cellDates: true });

          // me.workBook = newWb;

          // console.log(["追加的 csv和 wb", newCsv, totCsv]);
        });
      }
    },
    //~ 6 点击上传
    newUpdBtn(e) {
      this.$refs.newInput.click(e);
    },
    //~ 6.2 追加上传
    addUpdBtn(e) {
      this.$refs.addInput.click(e);
    },
    //~ 7 转化有关
    wbToArray(wb, withKey) {
      let me = this,
        sheet = [];
      tool.each(wb.Sheets, (key, val) => {
        if (val && val["!ref"]) {
          let headerCfg = withKey ? {} : { header: 1 };
          sheet = me.X.utils.sheet_to_json(val, headerCfg); //header1表示 二维数组模式！
          return false;
        } else {
          return true;
        }
      });
      return sheet;
    }
  },
  created() {
    let me = this;
    //~ 1 引入插件
    import(
      /* webpackChunkName: "bi-center-data" */
      "xlsx"
    ).then(function(mod) {
      console.log(["加载xlsx完毕", arguments, me]);
      me.X = mod;
      me.$store.state.progress && (me.$store.state.progress = 100);
    });
    //~ 2 参数读取
    // me.id = route.query.id;
    // me.pIndex = route.query.pIndex;
    // me.index = route.query.index;
  }
};
</script>

<style lang="scss">
.updDataReport {
  width: 90%;
}
</style>
