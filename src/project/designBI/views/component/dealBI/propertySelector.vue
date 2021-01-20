<template>
  <div class="propertySelector">
    <div class="selectPart">
      <el-tabs v-model="tabName" type="card">
        <el-tab-pane label="按表选择" name="dataTree">
          <!-- ~ 1 先dataId选择 -->
          <div class="firstStep">
            <IndexTree
              class="dataTree"
              :records="records"
              valid="exist"
              @node-click="dataTreeNodeClick"
            >
            </IndexTree>
          </div>
          <transition name="PageMove">
            <div class="secondStep" v-if="treeDetail">
              <div class="theDims">
                <Scrollbar>
                  <!-- 【update】拖拽 -->
                  <CandyDimTag
                    class="edit"
                    v-for="dim in treeDims"
                    :key="dim.key"
                    :Dim="dim"
                    :candyMaster="candyMaster"
                  ></CandyDimTag>
                </Scrollbar>
              </div>
            </div>
          </transition>
        </el-tab-pane>

        <el-tab-pane label="按组件选择" name="BIList"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 右侧 -->
    <div class="showPart">
      <div class="theCoat">
        <CoatingDim
          ref="propCoat"
          style="height: 30px;"
          :candyMaster="candyMaster"
        ></CoatingDim>
      </div>

      <div class="conditionCmp">
        <div ref="conditionCmp" :properties="selProps" :is="xtype"></div>
      </div>
    </div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import dataSelectorMixin from "./dataSelectorMixin";

import { CandyMaster } from "@designBI/views/component/dropCandy";
import Vue from "vue";
const CandyMasterCtor = Vue.extend(CandyMaster);
import CandyDimTag from "@designBI/views/component/dropCandy/CandyDimTag";
import CoatingDim from "@designBI/views/component/dropCandy/CoatingDim";

export default {
  name: "propertySelector",
  mixins: [dataSelectorMixin],
  components: {
    CoatingDim,
    CandyDimTag
  },
  props: {
    xtype: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      queryFlag: "propertySelector",

      selectProps: [],
      tabName: "dataTree",
      treeDetail: null,
      chartDetail: null
    };
  },
  computed: {
    treeDims() {
      let me = this,
        result = [];
      if (me.treeDetail && me.treeDetail.dimension) {
        let dimStr = me.treeDetail.dimension,
          dims = tool.isString(dimStr) ? JSON.parse(dimStr) : dimStr;
        result = dims.map(d => {
          return {
            ...d,
            dataId: me.treeDetail.id
          };
        });
      }
      return result;
    },
    candyMaster() {
      return new CandyMasterCtor();
    },
    selProps() {
      let me = this,
        props = [];
      if (me.$refs.propCoat) {
        props = me.$refs.propCoat.candies;
      }

      return props;
    }
  },
  methods: {
    //# 1 没必要 选择这么多，单纯的选择，然后显现prop选择
    dataTreeNodeClick(rec) {
      let me = this;
      if (!rec.isFolder) {
        me.getDetailData(rec).then(data => {
          me.treeDetail = data;
        });
      }
    }
  }
};
</script>
