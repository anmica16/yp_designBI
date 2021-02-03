<template>
  <div class="detailSelector">
    <div class="selectArea">
      <!-- ~ 1 左侧 dataId选择 -->
      <div class="dataIdSelect">
        <dataPropCoat
          ref="mainData"
          :dimClass="'main'"
          preText="主表"
          :candyMaster="candyMaster"
          @confirmData="mainDataConfirm(true)"
          @revokeData="mainDataConfirm(false)"
        ></dataPropCoat>
      </div>
      <!-- ~ 2 多个 joinTable选择 -->
      <div class="joinTablesSelect">
        <template v-if="dataId">
          <!-- #1 可新增，所以手动循环 -->
          <div class="jTabs">
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
              </div>
            </template>
            <div
              class="addNewJoinBtn el-icon-circle-plus-outline"
              @click="addNewJoinFn"
            ></div>
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
                  :dimClass="`detail_${j + 1}`"
                  :preText="`明细${j + 1}`"
                  @confirmData="confirmDataFn(jt)"
                  @revokeData="revokeDataFn(jt)"
                ></dataPropCoat>
                <!-- #3 两个字段的选择 -->
                <div class="propSelector">
                  <div class="joinThis">
                    <span class="pre">主表字段：</span>
                    <el-select
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
                  <div class="joinTable">
                    <span class="pre">join表字段：</span>
                    <el-select
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
        <div v-else>请先选择左侧表</div>
      </div>
    </div>
    <div class="resultArea">
      <!-- ~ 1 上侧维度 加入 -->
      <div class="detailDims">
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
      <!-- ~ 2 底侧 表数据一栏 -->
      <div class="detailTable"></div>
    </div>
  </div>
</template>

<script>
import dataSelectorMixin from "./dataSelectorMixin";
import { Instance } from "@designBI/views/mixins/Entity";
import { CandyMaster } from "@designBI/views/component/dropCandy";
import CoatingDim from "@designBI/views/component/dropCandy/CoatingDim";
import Vue from "vue";
const CandyMasterCtor = Vue.extend(CandyMaster);

import dataPropCoat from "./public/dataPropCoat";
import tool from "@/plugins/js/tool";

export default {
  name: "detailSelector",
  mixins: [dataSelectorMixin, Instance],
  components: {
    dataPropCoat,
    CoatingDim
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
      mainDataId: null
    };
  },
  computed: {
    candyMaster() {
      return new CandyMasterCtor();
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
          joinTableName: null
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
      console.log([
        "这个confirmDataFn决定的jt数据",
        refDetailData,
        refDetailData.dataType,
        refDetailData.dataBaseName
      ]);
      //~~ 1 完善jt
      joinTable.dataId = dataId;
      joinTable.joinTableName =
        refDetailData.dataType == "sql"
          ? `${refDetailData.sourceName}.${refDetailData.dataBaseName}.dbo.${refDetailData.tableName}`
          : refDetailData.tableName;
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
        joinTableName: null
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
      if (jt.$notHealthy) {
        if (
          !tool.isNull(jt.joinTableProperty) &&
          !tool.isNull(jt.joinThisProperty)
        ) {
          me.$set(jt, "$notHealthy", false);
        }
      }
      me.Instance.setData({
        config_more: {
          JoinTables: me.joinTables
        }
      });
    },
    //# 4 维度指标选择变化
    candyAddRemoveFn(candies) {
      let me = this;
      console.log(["维度指标选择变化", candies, arguments]);
      me.Instance.setData({
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
      let me = this,
        disabled = !me.mainDataId || data.id == me.mainDataId;
      data.$disabled = disabled;
      //console.log(["# 5 判断是否为禁用的函数", node, arguments]);
      return disabled;
    }
  },
  mounted() {
    let me = this;
    me.mainData = me.$refs.mainData;
  }
};
</script>
