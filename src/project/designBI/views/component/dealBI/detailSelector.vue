<template>
  <div class="detailSelector">
    <div class="selectArea">
      <!-- ~ 1 左侧 dataId选择 -->
      <div class="dataIdSelect oneArea">
        <div class="mainTitle areaTitle">一、主表选择</div>
        <dataPropCoat
          v-loading="loadStep1"
          class="mainTableSelector areaBody"
          ref="mainData"
          :dimClass="'joinTagCard main'"
          preText="主表"
          :candyMaster="candyMaster"
          @confirmData="mainDataConfirm(true)"
          @revokeData="mainDataConfirm(false)"
        ></dataPropCoat>
      </div>
      <!-- ~ 2 多个 joinTable选择 -->
      <div class="joinTablesSelect oneArea">
        <div class="detailTitle areaTitle">二、关联表选择</div>
        <div class="detailTableSelector areaBody" v-loading="loadStep2">
          <template v-if="dataId">
            <!-- #1 可新增，所以手动循环 -->
            <div class="jTabs">
              <Scrollbar>
                <template v-for="jt in joinTables">
                  <div
                    :key="jt.$id"
                    class="oneTab"
                    :class="{
                      active: jt === nowJoinTable,
                      notHealthy: jt.$notHealthy
                    }"
                    @click="changeJoin(jt)"
                  >
                    <span class="tabTitle">{{
                      (jt.dataId &&
                        theJoinTables[jt.dataId] &&
                        theJoinTables[jt.dataId].name) ||
                        "未选定"
                    }}</span>
                    <span
                      class="deleteBtn el-icon-delete"
                      @click="deleteJoinTable(jt)"
                    ></span>
                  </div>
                </template>
                <div class="oneTab addNewJoinBtn" @click="addNewJoinFn">
                  <span class="el-icon-circle-plus-outline"></span>
                  <span class="text">添加关联表</span>
                </div>
              </Scrollbar>
            </div>
            <!-- #2 tabBody部分 -->
            <div class="jTabBodies">
              <template v-for="(jt, j) in joinTables">
                <div
                  v-show="jt === nowJoinTable"
                  class="oneBody"
                  :key="jt.$id"
                  :class="{
                    active: jt === nowJoinTable,
                    notHealthy: jt.$notHealthy
                  }"
                >
                  <dataPropCoat
                    :key="jt.$id"
                    :ref="'join' + jt.$id"
                    :candyMaster="candyMaster"
                    :disabled="disabledFn"
                    :dimClass="`joinTagCard detail ${detailClass(j)}`"
                    :preText="`关联${j + 1}`"
                    @confirmData="confirmDataFn(jt)"
                    @revokeData="revokeDataFn(jt)"
                  ></dataPropCoat>
                  <!-- #3 两个字段的选择 -->
                  <div class="propSelector">
                    <div class="selItem joinThis">
                      <span class="pre">主表字段：</span>
                      <el-select
                        size="mini"
                        v-model="jt.joinThisProperty"
                        @change="propChangeFn(jt)"
                        :disabled="!mainData.dataIdDims.length"
                      >
                        <template v-for="dim in mainData.dataIdDims">
                          <el-option
                            :key="dim.$id"
                            :label="dim.key"
                            :value="dim.key"
                          ></el-option>
                        </template>
                      </el-select>
                    </div>
                    <div class="selItem joinTable">
                      <span class="pre">join表字段：</span>
                      <el-select
                        size="mini"
                        :disabled="
                          !jtRefs[jt.$id] ||
                            !jtRefs[jt.$id].dataIdDims ||
                            !jtRefs[jt.$id].dataIdDims.length
                        "
                        v-model="jt.joinTableProperty"
                        @change="propChangeFn(jt)"
                      >
                        <template v-if="jtRefs[jt.$id]">
                          <template v-for="dim in jtRefs[jt.$id].dataIdDims">
                            <el-option
                              :key="dim.$id"
                              :label="dim.key"
                              :value="dim.key"
                            ></el-option>
                          </template>
                        </template>
                      </el-select>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </template>

          <div v-else class="notSelectTip">
            <div class="back"></div>
            <div class="text">请先选择左侧主表</div>
          </div>
        </div>
      </div>
    </div>
    <div class="dimsAndResult">
      <div class="resultArea oneArea">
        <div class="resultTitle areaTitle">三、主表关联统计</div>
        <!-- ~ 1 上侧维度 加入 -->
        <div class="detailDims areaBody">
          <div class="dimsSelectArea">
            <div class="dimType">维度指标：</div>
            <div class="dimsHere">
              <CoatingDim
                style="min-height: 30px;"
                :candyMaster="candyMaster"
                ref="detailDims"
                @candyAddRemove="candyAddRemoveFn"
              >
                <span class="noTip">请拖入左侧指标</span>
              </CoatingDim>
            </div>
          </div>

          <!-- ~~ 1-2 右侧 统计信息 -->
          <div class="summaryInfo">
            <div class="MainT">
              <span class="mTitle">所选主表：</span>
              <span class="mTitleName">{{
                mainData && mainData.DetailData && mainData.DetailData.name
              }}</span>
            </div>

            <div class="JoinT">
              <div class="JoinTitle">关联表：</div>
              <div class="JoinTBody">
                <template v-for="(jt, j) in fullInfoJTs">
                  <div
                    class="oneJTBody"
                    v-if="jt.mainDim && jt.joinDim"
                    :key="jt.$id"
                  >
                    <div class="tbName">
                      <span class="count">{{ j + 1 }}、</span>
                      <span class="name">{{ jt.joinTableNameCH }}</span>
                    </div>
                    <div class="joinInfo">
                      <DimTypeTag
                        :class="jt.mainDim.dimClass"
                        :type="jt.mainDim.type"
                        :name="jt.mainDim.key"
                        :preText="jt.mainDim.preText"
                      ></DimTypeTag>
                      <span> = </span>
                      <DimTypeTag
                        :class="jt.joinDim.dimClass"
                        :type="jt.joinDim.type"
                        :name="jt.joinDim.key"
                        :preText="jt.joinDim.preText"
                      ></DimTypeTag>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- ~ 2 底侧 表数据一栏 -->
      <div class="detailTableArea oneArea">
        <div class="areaTitle">四、关联结果表</div>
        <div class="areaBody" v-loading="resultDataLoading">
          <DimTable
            v-show="resultData.length"
            ref="resultTable"
            :data="resultData"
            :dimension="sourceDimsReal"
          ></DimTable>

          <div v-show="!resultData.length" class="notDataTip">
            <div class="back"></div>
            <div class="text">需要选择至少一个维度【于左侧维度栏】</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dataSelectorMixin from "./dataSelectorMixin";
import { CandyMaster } from "@designBI/views/component/dropCandy";
import CoatingDim from "@designBI/views/component/dropCandy/CoatingDim";

import Vue from "vue";
const CandyMasterCtor = Vue.extend(CandyMaster);

import dataPropCoat from "./public/dataPropCoat";
import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";

export default {
  name: "detailSelector",
  mixins: [dataSelectorMixin],
  components: {
    dataPropCoat,
    CoatingDim
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    Instance: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      queryFlag: "detailSelector",
      //# 1 保存用
      joinTables: [],
      //# 2 循环使用
      theJoinTables: {},
      nowJoinTable: null,
      jtRefs: {},
      //# 3 ，main

      //# 0 工具
      mainData: null,
      mainDataId: null,

      //# 6 load
      resultData: [],
      resultDataAjax: null,
      resultDataLoading: false,

      //# 7 配置界面加载
      loadStep1: false,
      loadStep2: false
    };
  },
  computed: {
    candyMaster() {
      return new CandyMasterCtor();
    },
    validJTs() {
      let me = this,
        r = me.joinTables.filter(jt => {
          return jt.joinTableProperty && jt.joinThisProperty;
        });

      return r;
    },
    validDims() {
      let me = this,
        theJTs = me.validJTs,
        insVue = me.Instance.instanceVue,
        theDims = (insVue.sourceDims || []).filter(d => {
          let at = theJTs.find(jt => {
              return jt.dataId == d.dataId;
            }),
            at2 = d.dataId == me.mainDataId;
          return at || at2 ? true : false;
        });
      return theDims;
    },
    fullInfoJTs() {
      let me = this,
        mainRef = me.mainData,
        vJTs = me.validJTs,
        r = [];
      vJTs.forEach(jt => {
        let jtRef = me.jtRefs[jt.$id],
          mainDimName = jt.joinThisProperty,
          joinDimName = jt.joinTableProperty,
          mainDim = null,
          joinDim = null;
        //~ 1 join的Dim
        tool.each(jtRef.dataIdDims, d => {
          if (d.key == joinDimName && d.dataId == jt.dataId) {
            joinDim = d;
            return false;
          }
        });
        //~ 2 main的Dim
        tool.each(mainRef.dataIdDims, d => {
          if (d.key == mainDimName && d.dataId == me.mainDataId) {
            mainDim = d;
            return false;
          }
        });
        r.push({
          ...jt,
          joinDim,
          mainDim
        });
      });
      return r;
    },
    sourceDimsReal() {
      let me = this,
        hasJoin = me.validJTs.length,
        dims = me.validDims,
        r = [];
      if (dims && dims.length) {
        r = dims.map(d => {
          let dim = tool.apply(
            {
              realKey: hasJoin ? d.tName : d.key
            },
            d
          );
          return dim;
        });
      }
      return r;
    },
    dataId() {
      let me = this,
        ins = me.Instance;
      return ins.instanceVue.dataId;
    }
  },
  methods: {
    changeJoin(joinTable) {
      this.nowJoinTable = joinTable;
    },
    //【update】不可重复选择相同的
    addNewJoinFn() {
      let me = this,
        join = {
          $id: tool.uniqueStr(),
          //~ 1 选择得来 通过computed来进行转换
          dataId: null,
          //~ 2 下拉选择 1
          joinTableProperty: null,
          joinThisProperty: null,
          joinTableName: null,
          joinTableNameCH: null
        };
      me.joinTables.push(join);
      //++ 1 改变为当前新增
      me.changeJoin(join);
      //++ 2 加入到ins中去
      me.propChangeFn(join);

      //++ 3 option循环
      me.$nextTick(() => {
        me.$set(me.jtRefs, join.$id, me.$refs["join" + join.$id][0]);
      });
    },
    deleteJoinTable(jt) {
      let me = this;
      me.joinTables = me.joinTables.filter(theJT => {
        return theJT !== jt;
      });
      me.propChangeFn();
      me.joinTables.length && me.changeJoin(me.joinTables[0]);
    },
    //# 1 确认，那么可dataId
    confirmDataFn(joinTable) {
      let me = this,
        jtRef = me.$refs["join" + joinTable.$id];
      if (tool.isArray(jtRef)) {
        jtRef = jtRef[0];
      }
      me.$set(me.jtRefs, joinTable.$id, jtRef);
      let refDetailData = jtRef.DetailData,
        dataId = refDetailData.id,
        theJts = me.theJoinTables;
      // console.log([
      //   "这个confirmDataFn决定的jt数据",
      //   refDetailData,
      //   refDetailData.dataType,
      //   refDetailData.dataBaseName
      // ]);
      //~~ 1 完善jt
      joinTable.dataId = dataId;
      joinTable.joinTableName =
        refDetailData.dataType == "sql"
          ? `${refDetailData.sourceName}.${refDetailData.dataBaseName}.dbo.${refDetailData.tableName}`
          : refDetailData.tableName;
      joinTable.joinTableNameCH = refDetailData.name;
      //~~ 1-2 非保存信息
      if (!theJts[dataId]) {
        me.$set(theJts, dataId, refDetailData);
      }
      //~~ 2 同步一些信息
      tool.apply(theJts[dataId], {
        $dataIdDims: jtRef.dataIdDims
      });
    },
    mainDataConfirm(ifPass) {
      let me = this;

      if (ifPass) {
        me.mainDataId = me.mainData.DetailData.id;
      }
      if (!ifPass) {
        //~~ 1 candies去除 dataId的
        let detailDims = me.$refs.detailDims;
        detailDims.candies = detailDims.candies.filter(c => {
          return c.dataId != me.mainDataId;
        });

        me.joinTables.forEach(jt => {
          //jt.joinThisProperty = null;
          me.revokeDataFn(jt);
        });
        me.mainDataId = null;
      }
      me.Instance.setData({
        linkDataId: me.mainDataId
      });
    },
    //# 2 取消
    revokeDataFn(joinTable) {
      let me = this,
        dataId = joinTable.dataId;

      //~~ 1 candies去除 dataId的
      let detailDims = me.$refs.detailDims;
      detailDims.candies = detailDims.candies.filter(c => {
        return c.dataId != dataId;
      });

      //~~ 2 select重置
      tool.apply(joinTable, {
        dataId: null,
        //~ 2 下拉选择 1
        joinTableProperty: null,
        joinThisProperty: null,
        joinTableName: null,
        joinTableNameCH: null
      });

      //~~ 3 对应ref也resetp
      // let jtRef = me.jtRefs[joinTable.$id];
      // jtRef.reStep();
      me.$set(me.jtRefs, joinTable.$id, null);
      //me.nowJoinTable = null;
    },
    //# 3 字段改变
    propChangeFn(jt) {
      let me = this;
      //~~ 1 可结束不健康状态
      if (jt && jt.$notHealthy) {
        if (
          !tool.isNull(jt.joinTableProperty) &&
          !tool.isNull(jt.joinThisProperty)
        ) {
          me.$set(jt, "$notHealthy", false);
        }
      }
      let joinDataIds = me.validJTs.length
        ? `,${me.validJTs
            .map(theJT => {
              return theJT.dataId;
            })
            .join(",")},`
        : "";

      me.Instance.setData({
        config_more: {
          //+ 2 关联表选项启动
          JoinTables: me.validJTs.map(theJT => {
            let _jt = {
              dataId: theJT.dataId,
              //~ 2 下拉选择 1
              joinTableProperty: theJT.joinTableProperty,
              joinThisProperty: theJT.joinThisProperty,
              joinTableName: theJT.joinTableName,
              joinTableNameCH: theJT.joinTableNameCH
            };
            return _jt;
          })
        },
        joinDataIds
      });
    },
    //# 4 维度指标选择变化
    candyAddRemoveFn(candies) {
      let me = this;
      //console.log(["维度指标选择变化", candies, arguments]);
      me.Instance.setData({
        // + 1 可被选择的维度集合，在《ItemEdit》中通过Entity化 Ins的sourceDims传递给《OneItemEdit》，从而可被拖拽选中
        source: {
          Dims: candies.map(c => {
            let tc = tool.apply({}, c);
            delete tc.parentCoating;

            return tc;
          })
        }
      });
    },
    //# 5 判断是否为禁用的函数
    disabledFn(data, node) {
      //++ 1 可以自己join自己！
      return false;

      // let me = this,
      //   disabled = !me.mainDataId || data.id == me.mainDataId;
      // data.$disabled = disabled;
      // //console.log(["# 5 判断是否为禁用的函数", node, arguments]);
      // return disabled;
    },
    //# 6 维度选择之后的 结果数据展示
    getResultData() {
      let me = this,
        mainData = me.mainData,
        linkRec = mainData.DetailData,
        //剔除无效的
        theJTs = me.validJTs,
        theDims = me.sourceDimsReal;
      //~~ 1 避免失败请求
      if (!linkRec || !theDims.length) {
        return;
      }
      //console.log(["右下数据获取？"]);

      me.resultDataAjax && me.resultDataAjax.abort();
      me.resultDataLoading = true;

      me.resultDataAjax = $.ajax({
        url: Vue.Api.designBI,
        method: Vue.Api.designBI.GetDataDetail,
        data: {
          id: linkRec.id,
          tableName:
            linkRec.dataType == "sql"
              ? `${linkRec.sourceName}.${linkRec.dataBaseName}.dbo.${linkRec.tableName}`
              : linkRec.tableName,
          type: "detail",
          JoinTables: JSON.stringify(theJTs),
          Dims: JSON.stringify(theDims)
        }
      });
      me.resultDataAjax
        .then(r => {
          let ls = r.data;
          me.resultData = ls;
          me.resultDataLoading = false;
        })
        .catch(r => {
          if (r && r.statusText === "abort") {
            //
          } else {
            me.$message.error("获取关联结果表列数据失败！" + r.msg);
            me.resultDataLoading = false;
          }
        });
    },
    detailClass(count) {
      let a = ["d1", "d2", "d3", "d4", "d5"];
      return a[Math.floor(count) % a.length];
    }
  },
  watch: {
    sourceDimsReal() {
      this.getResultData();
    },
    fullInfoJTs() {
      this.getResultData();
    }
  },
  mounted() {
    let me = this,
      insVue = me.Instance.instanceVue;
    me.mainData = me.$refs.mainData;

    //++ 1 提供修改入口
    if (me.isEdit) {
      me.loadStep1 = true;
      me.loadStep2 = true;
      //~~ 1 左上
      let idRec = {
        id: me.dataId
      };
      me.mainData.getDetailData(idRec).then(data => {
        if (data) {
          me.mainData.step = 3;
          me.loadStep1 = false;
        }
      });

      //~~ 2 右上
      let JTs =
        insVue._joinTables && insVue._joinTables.length
          ? tool.clone(insVue._joinTables)
          : [];
      JTs = JTs.map(j => {
        j.$id = tool.uniqueStr();
        return j;
      });
      me.joinTables = JTs.map(jt => {
        let tJT = tool.apply({}, jt, {
          dataId: null,
          //~ 2 下拉选择 1
          joinTableProperty: null,
          joinThisProperty: null,
          joinTableName: null,
          joinTableNameCH: null
        });
        return tJT;
      });
      me.$nextTick(() => {
        let pros = [];
        me.joinTables.forEach(jt => {
          let jtRef = me.$refs["join" + jt.$id][0];
          me.$set(me.jtRefs, jt.$id, jtRef);
          let okJT = JTs.find(j => {
            return j.$id == jt.$id;
          });
          let pro = jtRef.getDetailData({
            id: okJT.dataId
          });
          pros.push(pro);
          pro.then(data => {
            if (data) {
              jtRef.step = 3;
              tool.apply(jt, okJT);
            }
          });
        });
        Promise.all(pros).then(r => {
          me.loadStep2 = false;
        });

        me.joinTables.length && me.changeJoin(me.joinTables[0]);
      });

      //~~ 3 左下
      let sourceDims = insVue.sourceDims || [],
        detailDims = me.$refs.detailDims;
      detailDims.candies = sourceDims.map(d => {
        let theD = tool.apply({}, d);
        return theD;
      });
    }
  }
};
</script>
