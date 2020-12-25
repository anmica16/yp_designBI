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
import $ from "@/plugins/js/loader";
import Vue from "vue";
import tool from "@/plugins/js/tool";
import X from "./X";
export default {
  name: "NewDataPage",
  mixins: [X],
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
    //@ 5 可传入detail对象
    detail: Object,
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
      workSheet: null, //强调
      dimension: null,

      //@ 2 工具
      X: null,
      //@ 3 其他
      addNewData: false,
      leftDragOver: false,
      //@ 4 上传读取的数据
      workBook: null,
      //@ 5 获取数据：
      DetailData: null,
      exist: true //默认存在，在获取数据后敲定
    };
  },
  computed: {
    leftDragText() {
      return this.workSheet
        ? "拖拽表格到此处以重新上传"
        : "拖拽表格到此处以上传";
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
            //# 3 数据指定 即交给watch刷新
            me.DetailData = data;
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
  watch: {
    DetailData(data) {
      let me = this;
      if (data) {
        let dimension = JSON.parse(data.dimension);
        tool.apply(me, {
          name: data.name,
          fileName: data.fileName,
          fileType: data.fileType,
          workSheet: me.getSheetFromAoa(JSON.parse(data.dataSource), dimension),
          dimension
        });
      }
    }
  },
  created() {
    let me = this;
    if (!me.likeEdit) {
      me.$store.state.progress && (me.$store.state.progress = 100);
    } else {
      me.$store.state.progress = 30;
      if (me.detail) {
        me.DetailData = me.detail;
        me.$store.state.progress = 100;
      } else {
        me.getDetailData().then(success => {
          me.$store.state.progress = 100;
          if (!success) {
            me.backPage();
          }
        });
      }
    }
    //~ 2 参数读取
    // me.id = route.query.id;
    // me.pIndex = route.query.pIndex;
    // me.index = route.query.index;
  }
};
</script>
