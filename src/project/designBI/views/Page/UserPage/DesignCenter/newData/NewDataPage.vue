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
          :type="workSheet ? 'primary' : ''"
          :disabled="!workSheet"
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
            <span class="fileName">{{ fileName }}</span>
          </div>
          <dir class="fill"></dir>
          <div class="operArea">
            <el-button
              size="medium"
              type="primary"
              @click="newUpdBtn"
              v-if="!workSheet"
              >上传数据</el-button
            >
            <input ref="newInput" type="file" name="file" @change="newUpdFn" />

            <el-button
              size="medium"
              @click="addUpdBtn"
              type="primary"
              v-if="workSheet"
              >追加上传</el-button
            >
            <input ref="addInput" type="file" name="file2" @change="addUpdFn" />

            <el-button
              class="reNew"
              size="medium"
              @click="newUpdBtn"
              type="primary"
              v-if="workSheet"
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
          <div class="tipText" :class="{ workSheet }">
            <template v-if="!workSheet">
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
          <template v-if="workSheet">
            <div class="fieldType">
              <div class="topTip">字段类型设置</div>
              <div class="tableWrap">
                <el-table
                  :data="dimension"
                  border
                  style="width: 100%"
                  height="100%"
                >
                  <el-table-column
                    label="字段名"
                    prop="key"
                    width="300"
                  ></el-table-column>
                  <el-table-column label="字段类型" prop="type">
                    <template slot-scope="scope">
                      <DimTypeTag :type="scope.row.type"> </DimTypeTag>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </template>
          <!-- ~ 2 覆盖全部body的 drop层 -->
          <div
            v-show="leftDragOver"
            class="dragTip"
            @dragleave="leftDragLeaveFn"
            :class="{ newUpd: !workSheet }"
          >
            <div class="icon"></div>
            <div class="text">{{ leftDragText }}</div>
          </div>
        </div>
      </div>
      <div class="rightArea">
        <template v-if="workSheet">
          <div class="dataResult">
            <div class="topArea">
              <el-link :underline="false" class="el-icon-date"></el-link>
            </div>
            <div class="tableWrap">
              <el-table
                :data="getStrDateAoa(keySheet)"
                style="width: 100%"
                height="100%"
                border
              >
                <template v-for="(dim, i) in dimension">
                  <el-table-column
                    :key="dim.key"
                    :label="dim.key"
                    :prop="dim.key"
                    :index="i"
                    :width="dim.type === 'date' ? '200' : ''"
                  >
                    <template slot="header">
                      <DimTypeTag
                        :type="dimension[i].type"
                        :name="dimension[i].key"
                      >
                      </DimTypeTag>
                    </template>
                  </el-table-column>
                </template>
              </el-table>
            </div>
          </div>
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
    },
    dataType: {
      type: String,
      default: ""
    },
    //@ 4 是否是非手动新增 的进入？
    likeEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      //@ 1-2 附加信息加入
      name: "",
      fileName: "",
      fileType: "",
      workSheet: null,
      dimension: null,

      //@ 2 工具
      X: null,
      //@ 3 其他
      addNewData: false,
      leftDragOver: false,
      //@ 4 上传读取的数据
      reading: false,
      workBook: null,
      minSamePer: 80,
      //@ 5 获取数据：
      dbData: null,
      exist: true //默认存在，在获取数据后敲定
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
      return this.workSheet
        ? "拖拽表格到此处以重新上传"
        : "拖拽表格到此处以上传";
    },
    sheet() {
      let me = this,
        sheet = [];
      if (me.workSheet) {
        sheet = me.wbToArray(me.workSheet);
      }
      return sheet;
    },
    keySheet() {
      let me = this,
        sheet = [];
      if (me.workSheet) {
        sheet = me.wbToArray(me.workSheet, true);
      }
      return sheet;
    },
    //~ 10 既要是非点击新增进入，又要是数据确实已存在
    isEidt() {
      return this.likeEdit && this.exist;
    }
  },
  methods: {
    backPage(detailData) {
      this.$router.push({});
      this.$emit("back", detailData);
    },
    //~ 2 保存后就取消该 id的 readyAdd状态

    submitFn() {
      let me = this,
        editTime = tool.now(true),
        record = {
          id: me.id,
          dataSource: me.getStrDateAoa(me.sheet, true),
          editTime
        };
      if (me.isEdit) {
        // tool.apply(record, {
        //   exist: true,
        // });
      } else {
        tool.apply(record, {
          name: me.name,
          fileName: me.fileName,
          fileType: me.fileType,
          dataType: me.dataType,
          //~~ 1 暂时不改
          dimension: me.dimension,
          exist: true
        });
      }

      //# 1 保存上传！
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.AddOrUpd,
        data: {
          table: "data",
          records: JSON.stringify([record])
        }
      })
        .then(result => {
          me.$message.success("保存成功！");
          //# 2 返回
          me.backPage(record);
        })
        .catch(r => {
          me.$message.success("保存失败！" + r);
        });
      console.log(["尝试提交", me, record]);
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

          console.log(["读取完毕", wb, me]);
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
          let keySheet = me.wbToArray(ws, true);
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
      if (me.workSheet) {
        // 待补充 删除
      }
      //# 2 赋值
      me.dealFile(files)
        .then(({ wb, fileName, fileType, analyse, keySheet }) => {
          let dimension = analyse.dimension,
            theWorkSheet = null;

          if (analyse.perfect) {
            //~~ 1 经过前面检验，这里一定有！
            theWorkSheet = me.getWorkSheet(wb);
          } else if (analyse.healthy) {
            //# 3 针对有风险数据进行强转
            try {
              tool.each(keySheet, (rec, i) => {
                tool.each(dimension, (k, v) => {
                  if (v.status !== 1) {
                    //# 4 肯定是确定类型的
                    let oldVal = rec[k];
                    if (v.type === "string") {
                      rec[k] = rec[k] + "";
                      if (!tool.isString(rec[k])) {
                        throw `转换为字符串类型失败，第【${i}】行，关键字【${k}】，值【${oldVal}】->【${rec[k]}】`;
                      }
                    } else if (v.type === "number") {
                      rec[k] = parseFloat(rec[k]);
                      if (!tool.isNumber(rec[k])) {
                        throw `转换为数值类型失败，第【${i}】行，关键字【${k}】，值【${oldVal}】->【${rec[k]}】`;
                      }
                    } else if (v.type === "date") {
                      rec[k] = tool.Date.toDateTime(rec[k]);
                      if (!tool.isDate(rec[k])) {
                        throw `转换为日期类型失败，第【${i}】行，关键字【${k}】，值【${oldVal}】->【${rec[k]}】`;
                      }
                    } else {
                      throw "遇到了未知类型，程序出错！";
                    }
                  }
                });
              });
              //# 4 0 失误则视为成功
              me.$message.success("有风险维度的数据均已顺利转换！");
              theWorkSheet = me.X.utils.json_to_sheet(keySheet, {
                cellDates: true
              });
            } catch (er) {
              me.$message.error(er + " 请仔细检查所上传表格数据后再尝试上传！");
              return;
            }
          }
          // # 4 成功 则赋值！
          me.workBook = wb; //不是很重要了

          (me.name = fileName.substr(0, fileName.length - 1 - fileType.length)),
            (me.fileName = fileName);
          me.fileType = fileType;
          me.workSheet = theWorkSheet; //这才是核心
          //# 5 维度：
          let dim = [],
            order = 0;
          tool.each(dimension, (k, v) => {
            dim.push({
              key: k,
              type: v.type,
              order: order++
            });
          });
          me.dimension = dim;
        })
        .catch(() => {});
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
    wbToArray(ws, withKey) {
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
    },
    //------------------
    // 二、 修改编辑页方面
    //------------------
    //~ 1 获取
    getDetailData() {
      let me = this;
      return new Promise((res, rej) => {
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.GetDataDetail,
          data: {
            id: me.id
          }
        })
          .then(result => {
            let datas = result.data;
            if (!datas || !datas.length) {
              //# 1 数据不存在！页面不允许访问！
              me.$msgbox({
                title: "错误提示",
                message: "数据不存在！页面不允许访问！",
                type: "error"
              }).finally(() => {
                res(false);
              });
              return;
            }
            let data = datas[0];
            if (!data.exist) {
              //# 2 数据处于新增状态！即便是好像edit，但也实为新增
              me.exist = false;
              res(true);
              return;
            }

            let dimension = JSON.parse(data.dimension);
            me.dbData = data;
            tool.apply(me, {
              name: data.name,
              fileName: data.fileName,
              fileType: data.fileType,
              workSheet: me.getSheetFromAoa(
                JSON.parse(data.dataSource),
                dimension
              ),
              dimension
            });
            res(true);
          })
          .catch(r => {
            me.$msgbox({
              title: "错误提示",
              message: "获取数据集数据失败，页面将返回",
              type: "error"
            }).finally(() => {
              res(false);
            });
          });
      });
    }
  },
  created() {
    let me = this;
    //~ 1 引入插件
    import(
      /* webpackChunkName: "bi-center-data" */
      "xlsx"
    ).then(function (mod) {
      console.log(["加载xlsx完毕", arguments, me]);
      me.X = mod;
      if (!me.likeEdit) {
        me.$store.state.progress && (me.$store.state.progress = 100);
      } else {
        me.$store.state.progress = 30;
        me.getDetailData().then(success => {
          me.$store.state.progress = 100;
          if (!success) {
            me.backPage();
          }
        });
      }
    });
    //~ 2 参数读取
    // me.id = route.query.id;
    // me.pIndex = route.query.pIndex;
    // me.index = route.query.index;
  }
};
</script>
