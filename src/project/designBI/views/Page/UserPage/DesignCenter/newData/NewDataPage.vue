<template>
  <div class="NewDataPage">
    <div class="headBar">
      <div class="dataName">
        <span class="pre">数据名</span>
        <el-input
          v-model="name"
          :disabled="!(workSheet && dimension)"
          placeholder="请输入数据名"
        ></el-input>
      </div>
      <div class="fill"></div>
      <div class="yesno">
        <el-button ref="cancel" type="info" @click="cancelFn">取消</el-button>
        <el-button
          ref="submit"
          :type="workSheet ? 'primary' : ''"
          :disabled="!canSubmit_local"
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

            <!-- <el-button
              size="medium"
              @click="addUpdBtn"
              type="primary"
              v-if="workSheet"
              >追加上传</el-button
            >
            <input ref="addInput" type="file" name="file2" @change="addUpdFn" /> -->

            <el-button
              class="reNew"
              size="medium"
              @click="newUpdBtn"
              type="primary"
              v-if="workSheet"
              >再次上传</el-button
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
                <div class="text2">重新上传：全部数据替换为新上传的Excel</div>
              </div>
              <!-- <div class="text1">预览区域只列出前100行数据；</div> -->
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
                  <el-table-column label="自定义名" prop="chineseName">
                    <template slot-scope="scope">
                      <el-input
                        size="small"
                        @change="nameChanged = true"
                        v-model="scope.row.chineseName"
                      ></el-input>
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
        <template v-if="workSheet && dimension">
          <div class="dataResult">
            <div class="topArea">
              <!-- <el-link :underline="false" class="el-icon-date"></el-link> -->

              <div class="selectInfo">
                <span class="type" :class="sourceType">{{ sourceType }}</span>
                <span class="tableName">{{ sourceTableName }}</span>
              </div>
            </div>
            <div class="tableWrap">
              <DimTable
                :data="getStrDateAoa(keySheet)"
                :dimension="dimension"
              ></DimTable>
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
import X from "@designBI/views/mixins/X";
import LoginUser from "@designBI/views/mixins/LoginUser";
import reNewDataWin from "./reNewDataWin";
const reNewDataWinCtor = Vue.extend(reNewDataWin);

export default {
  name: "NewDataPage",
  mixins: [X, LoginUser],
  props: {
    //@ 1 基本
    id: {
      type: String
      //required: true
    },
    pIndex: {
      type: String
    },
    dataType: {
      type: String,
      default: ""
    },
    //@ 5 可传入detail对象
    detail: Object
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
      exist: true, //默认存在，在获取数据后敲定

      //@ 6 再次上传参数
      reUploadCfg: null,
      nameChanged: false
    };
  },
  computed: {
    leftDragText() {
      return this.workSheet
        ? "拖拽表格到此处以再次上传"
        : "拖拽表格到此处以上传";
    },
    //~ 10 既要是非点击新增进入，又要是数据确实已存在
    isEdit() {
      return !!this.id;
    },
    tableName() {
      return (
        (this.DetailData && this.DetailData.tableName) ||
        `P_designBI_local_${tool.uniqueStr()}`
      );
    },
    //+ 1 类型提示
    sourceType() {
      let me = this;
      return me.fileType;
    },
    sourceTableName() {
      let me = this;
      return me.fileName;
    },
    canSubmit_local() {
      let me = this;
      return me.isEdit ? me.reUploadCfg || me.nameChanged : me.workSheet;
    }
  },
  methods: {
    backPage(detailData) {
      //this.$router.push({});
      this.$emit("back", detailData);
    },
    //【=1=】此为新增专用
    submitFn_new() {
      let me = this,
        editTime = tool.now(true),
        record = {
          pIndex: me.pIndex,
          isFolder: false,
          exist: true,
          ownerGroup: me.pageGroupId,

          name: me.name,
          //## 1 name！
          tableName: me.tableName,
          //dataSource: me.getStrDateAoa(me.sheet, true),
          editTime,
          editOperId: me.loginUser.userCode
        };
      me.$store.state.progress = 10;
      //【=1=】首先创建，获取id，然后再执行
      $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.AddNewTreeItem,
        data: {
          table: "data",
          records: JSON.stringify([record]),
          groupId: me.pageGroupId
        }
      })
        .then(result => {
          me.$store.state.progress = 50;
          let theId = result.other;
          tool.apply(record, {
            id: theId
          });

          //固定了 的 第一次数据 不可轻易变动
          tool.apply(record, {
            createTime: editTime,
            createOperId: me.loginUser.userCode,

            fileName: me.fileName,
            fileType: me.fileType,
            dataType: me.dataType,
            //~~ 1 暂时不改
            //## 2 维度！
            dimension: me.dimension.map(d => {
              d.dataId = theId;
              d.tTable = `t${d.dataId}`;
              d.tName = `${d.key}_t${d.dataId}`;
              return d;
            })
          });

          //【=3=】 保存上传！
          $.ajax({
            url: Vue.Api.designBI,
            method: Vue.Api.designBI.CreateOrUpdTable,
            data: {
              DetailData: JSON.stringify(record),
              //## 3 数据！
              keySheet: JSON.stringify(me.getStrDateAoa(me.keySheet, true)),
              groupId: me.pageGroupId
            }
          })
            .then(result => {
              me.$message.success("保存成功！");
              //# 2 返回
              me.backPage(record);
              me.$store.state.progress = 100;
            })
            .catch(r => {
              me.$message.error("保存失败！" + r);
              me.$store.state.progress = 100;
            });
          console.log(["尝试提交", me, record]);
        })
        .catch(r => {
          me.$message.error(r.msg || "提交保存时服务器出了一些问题……");
          me.$store.state.progress = 100;
        });
    },
    submitFn_reUpload() {
      let me = this,
        theId = me.id;

      return new Promise((res, rej) => {
        let record = {
          id: theId,
          name: me.name
        };

        //@@ 1 只是维度改变
        if (!me.reUploadCfg) {
          (record.dimension = JSON.stringify(me.dimension)),
            $.ajax({
              url: Vue.Api.designBI,
              method: Vue.Api.designBI.AddOrUpd,
              data: {
                records: JSON.stringify([record]),
                table: "data",
                groupId: me.pageGroupId
              }
            })
              .then(r => {
                me.$message.success("本地数据更新成功！");
                res();
              })
              .catch(r => {
                me.$message.error("本地数据更新失败！");
                rej();
              });
          return;
        }

        //@@ 2 重新上传了数据
        let { newDims, ifReUpload, ifNewDim } = me.reUploadCfg;
        record.dimension = JSON.stringify(
          me.dimension.filter(d => {
            if (ifNewDim) {
              return true;
            }
            let findD = newDims.find(nd => {
              return nd.key == d.key;
            });
            return !findD;
          })
        );
        //【=3=】 保存上传！
        $.ajax({
          url: Vue.Api.designBI,
          method: Vue.Api.designBI.UpdateLocalTable,
          data: {
            record: JSON.stringify(record),
            //## 2 维度！
            newDims: ifNewDim && newDims.length ? JSON.stringify(newDims) : "",
            ifReUpload,
            ifNewDim,
            //## 3 数据！
            keySheet: JSON.stringify(me.getStrDateAoa(me.keySheet, true)),
            groupId: me.pageGroupId,
            //## 4 用这个来找linkData
            dataId: theId
          }
        })
          .then(result => {
            me.$message.success("再次上传保存成功！");
            res();
          })
          .catch(r => {
            me.$message.error("再次上传保存失败！" + r);
            rej();
          });
      });
    },
    submitFn() {
      let me = this;
      //console.log(["确实开始上传了！"]);
      if (!me.isEdit) {
        me.submitFn_new();
      } else {
        me.submitFn_reUpload().then(r => {
          //~~ 6 重置
          me.nameChanged = false;
          me.reUploadCfg = null;
          //# 2 返回
          me.backPage(me.DetailData);
        });
      }
    },
    //~ 3 取消则直接删除该record
    cancelFn() {
      let me = this;
      //# 1 删除
      // $.ajax({
      //   url: Vue.Api.designBI,
      //   method: Vue.Api.designBI.Delete,
      //   data: {
      //     table: "data",
      //     ids: JSON.stringify([me.id])
      //   }
      // }).catch(r => {});
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

      return new Promise((res, rej) => {
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
                          throw `转换为字符串类型失败，第【${i +
                            1}】行，关键字【${k}】，值【${oldVal}】->【${
                            rec[k]
                          }】`;
                        }
                      } else if (v.type === "number") {
                        rec[k] = parseFloat(rec[k]);
                        if (!tool.isNumber(rec[k])) {
                          throw `转换为数值类型失败，第【${i +
                            1}】行，关键字【${k}】，值【${oldVal}】->【${
                            rec[k]
                          }】`;
                        }
                      } else if (v.type === "date") {
                        rec[k] = tool.Date.toDateTime(rec[k]);
                        if (!tool.isDate(rec[k])) {
                          throw `转换为日期类型失败，第【${i +
                            1}】行，关键字【${k}】，值【${oldVal}】->【${
                            rec[k]
                          }】`;
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
                me.$message.error(
                  er + " 请仔细检查所上传表格数据后再尝试上传！"
                );
                rej(er);
              }
            }
            //# 5 处理维度：
            //console.log(["处理维度的动作", dimension]);
            let dim = [],
              order = 0;
            tool.each(dimension, (k, v) => {
              dim.push({
                key: k,
                type: v.type,
                order: order++,
                chineseName: k,
                //axisType: me.getAxisType(v.type),
                $id: tool.uniqueStr()
              });
            });

            //# 6 作为成功的返回
            res({
              analyseResult: {
                wb,
                fileName,
                fileType,
                analyse,
                keySheet
              },
              name: fileName.substr(0, fileName.length - 1 - fileType.length),
              theWorkSheet,
              dimension: dim
            });
          })
          .catch(er => {
            rej(er);
          });
      });
    },
    newUpdFnBegin(files) {
      let me = this,
        h = me.$createElement;
      me.newUpdFnBase(files).then(
        ({ analyseResult, name, theWorkSheet, dimension }) => {
          //console.log(["上传后，赋值前检查", analyseResult, dimension]);
          let setFn = function() {
            // # 4 成功 则赋值！
            me.workBook = analyseResult.wb; //不是很重要了

            me.name = name;
            me.fileName = analyseResult.fileName;
            me.fileType = analyseResult.fileType;

            me.workSheet = theWorkSheet; //这才是核心

            //# 5 维度：
            me.dimension = dimension;

            //~~ 6 重置
            me.nameChanged = false;
            me.reUploadCfg = null;
          };
          //【=1=】 如果是新增
          if (!me.isEdit) {
            setFn();
          } else {
            console.log(["再一次上传，检查", analyseResult, dimension]);
            //【=2=】如果是再一次上传

            //## 1 维度只能多不能少，且类型不可变
            let vacantA = [],
              typeCgA = [],
              plusA = [];

            //~~~ 1-1 缺少或类型改变检测
            tool.each(me.dimension, dim => {
              let findD = dimension.find(getD => {
                return getD.key == dim.key;
              });
              if (findD) {
                if (findD.type != dim.type) {
                  typeCgA.push({
                    key: dim.key,
                    old: dim,
                    new: findD
                  });
                }
              } else {
                vacantA.push(dim);
              }
            });

            //~~~ 1-2 增加
            tool.each(dimension, getD => {
              let findD = me.dimension.find(dim => {
                return getD.key == dim.key;
              });
              if (!findD) {
                plusA.push(getD);
              }
            });

            //## 2 对维度进行一次报告，成功的后续中进行上传

            me.$msgbox({
              title: "再次上传数据",
              message: h(reNewDataWinCtor, {
                key: tool.uniqueStr(),
                props: {
                  vacantA,
                  typeCgA,
                  plusA
                }
              }),
              closeOnClickModal: false,
              showCancelButton: true,
              //customClass: "newDetail",
              beforeClose(action, ins, done) {
                let reNewDataWin = ins.down("reNewDataWin"),
                  result = reNewDataWin.getResult();
                if (action === "confirm") {
                  if (!result) {
                    done();
                    return;
                  }
                  //=3= 这里才是上传成功的地方，将数据放下吧
                  setFn();
                  me.reUploadCfg = result;
                  done();
                } else {
                  if (result) {
                    me.$message.info("用户取消了本次上传");
                  }
                  done();
                }
              }
            }).catch(() => {});
          }
        }
      );
    },
    leftDrogFn(e) {
      let me = this;
      me.leftDragOver = false;
      me.newUpdFnBegin(e.dataTransfer.files);
    },
    newUpdFn(e) {
      let me = this;
      me.newUpdFnBegin(e.target.files);
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
          method: Vue.Api.designBI.GetLinkDetailData,
          data: {
            id: me.id,
            groupId: me.pageGroupId
          }
        })
          .then(result => {
            let data = result.data;
            if (!data) {
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
              me.cancelFn();
              res(false);
            });
          });
      });
    },
    tryGetDetailData() {
      let me = this;
      return new Promise(res => {
        if (me.DetailData) {
          res(me.DetailData);
        } else {
          me.getDetailData()
            .then(r => {
              res(me.DetailData);
            })
            .catch(r => {
              res(null);
            });
        }
      });
    },
    //~ 2 linkData获取后，处理，并再获取详细数据
    editDealDetailData(data) {
      let me = this;
      if (data) {
        let dimension = tool.isString(data.dimension)
          ? JSON.parse(data.dimension)
          : data.dimension;
        tool.apply(me, {
          name: data.name,
          fileName: data.fileName,
          fileType: data.fileType,

          workSheet: me.getSheetFromAoa(data.dataTable, dimension),
          dimension
        });
      }
    }
  },
  created() {
    let me = this;
    if (!me.isEdit) {
      me.$store.state.progress && (me.$store.state.progress = 100);
    } else {
      me.$store.state.progress = 30;
      if (me.detail) {
        me.DetailData = me.detail;

        //# 4 第四步 进一步处理
        me.editDealDetailData(me.DetailData);
        me.$store.state.progress = 100;
      } else {
        me.tryGetDetailData().then(success => {
          me.$store.state.progress = 100;
          if (!success) {
            me.backPage();
          } else {
            //# 4 第四步 进一步处理
            me.editDealDetailData(me.DetailData);
          }
        });
      }
    }
  }
};
</script>
