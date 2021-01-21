<template>
  <div class="detailSelector">
    <div class="selectArea">
      <!-- ~ 1 左侧 dataId选择 -->
      <div class="dataIdSelect">
        <dataPropCoat ref="mainData" :candyMaster="candyMaster"></dataPropCoat>
      </div>
      <!-- ~ 2 多个 joinTable选择 -->
      <div class="joinTablesSelect">
        <!-- #1 可新增，所以手动循环 -->
        <div class="jTabs"></div>
        <div class="jTabBodies"></div>
      </div>
    </div>
    <div class="resultArea">
      <!-- ~ 1 上侧维度 加入 -->
      <div class="detailDims"></div>
      <!-- ~ 2 底侧 表数据一栏 -->
      <div class="detailTable"></div>
    </div>
  </div>
</template>

<script>
import dataSelectorMixin from "./dataSelectorMixin";
import { Instance } from "@designBI/views/mixins/Entity";
import { CandyMaster } from "@designBI/views/component/dropCandy";
import Vue from "vue";
const CandyMasterCtor = Vue.extend(CandyMaster);

import dataPropCoat from "./public/dataPropCoat";

export default {
  name: "detailSelector",
  mixins: [dataSelectorMixin, Instance],
  components: {
    dataPropCoat
  },
  props: {},
  data() {
    return {
      joinTables: []
    }
  },
  computed: {
    candyMaster() {
      return new CandyMasterCtor();
    }
  }
};
</script>
