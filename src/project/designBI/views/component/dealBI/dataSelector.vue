<template>
  <div class="dataSelector">
    <div class="leftTree">
      <IndexTree
        ref="tree"
        class="dataTree"
        :records="records"
        valid="exist"
        @node-click="nodeClickFn"
      >
      </IndexTree>
    </div>
    <div class="rightTable">
      <template v-if="!nowFileRec">
        <div class="fileNotSelectTip">
          <div class="back"></div>
          <div class="text">请从左侧选择表</div>
        </div>
      </template>
      <!-- ~ 4 先写在这里 再独立 -->
      <template v-else-if="DetailData">
        <SimpleCheckData :DetailData="DetailData"> </SimpleCheckData>
      </template>
    </div>
  </div>
</template>

<script>
import dataSelectorMixin from "./dataSelectorMixin";
import SimpleCheckData from "../../Page/UserPage/DesignCenter/newData/SimpleCheckData";
export default {
  name: "dataSelector",
  components: {
    SimpleCheckData
  },
  mixins: [dataSelectorMixin],
  data() {
    return {
      queryFlag: "dataSelector"
    };
  }
};
</script>
