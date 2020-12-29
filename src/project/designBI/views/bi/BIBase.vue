<template>
  <div class="BIBase">
    BIBase
  </div>
</template>

<script>
import { Instance } from "../mixins/Entity";

//【1】要求必有 数据
export default {
  name: "BIBase",
  mixins: [Instance],
  data() {
    return {
      SummaryData: null
    };
  },
  computed: {},
  mounted() {
    let me = this,
      dataId = me.recordData.linkDataId;
    //~ 1 数据
    me.EditNode.getLinkData(dataId).then(data => {
      if (data) {
        me.SummaryData = data;
      }
    });
  }
};
</script>
