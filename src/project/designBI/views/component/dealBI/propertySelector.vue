<template>
  <div class="propertySelector">
    <div class="selectPart">
      <el-tabs v-model="tabName" type="card">
        <el-tab-pane label="按表选择" name="dataTree">
          <!-- ~ 1 先dataId选择 -->
          <dataPropCoat :candyMaster="candyMaster"></dataPropCoat>
        </el-tab-pane>

        <el-tab-pane label="按组件选择" name="BIList"></el-tab-pane>
      </el-tabs>
    </div>

    <!-- 右侧 -->
    <div class="showPart">
      <div class="theCoat">
        <div class="preText">字段</div>
        <CoatingDim
          ref="propCoat"
          style="height: 30px;"
          :candyMaster="candyMaster"
        ></CoatingDim>
      </div>

      <div class="conditionCmp">
        <div
          ref="conditionCmp"
          :properties="selProps"
          :newCondition="newCondition"
          :Entity="Entity"
          :is="xtype"
        ></div>
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

import dataPropCoat from "./public/dataPropCoat";

export default {
  name: "propertySelector",
  mixins: [dataSelectorMixin],
  components: {
    CoatingDim,
    CandyDimTag,
    dataPropCoat
  },
  props: {
    xtype: {
      type: String,
      required: true
    },
    newCondition: {
      type: Boolean,
      default() {
        return false;
      }
    },
    Entity: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      queryFlag: "propertySelector",

      selectProps: [],
      tabName: "dataTree",
      chartDetail: null,
      //# 1 ref失灵
      propCoat: null,
      conditionCmp: null
    };
  },
  computed: {
    candyMaster() {
      return new CandyMasterCtor();
    },
    selProps() {
      let me = this,
        props = [];

      if (me.propCoat) {
        props = me.propCoat.candies;
      }

      return props;
    }
  },
  methods: {},
  mounted() {
    let me = this;

    me.propCoat = me.$refs.propCoat;
    me.conditionCmp = me.$refs.conditionCmp;
  }
};
</script>
