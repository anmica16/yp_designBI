import { Instance } from "@designBI/views/mixins/Entity";
import tool from "@/plugins/js/tool";
export default {
  mixins: [Instance],
  props: {
    //【update】多个非同表同时应用！
    properties: {
      //# 1 key和 dataId的组合
      type: Array,
      required: true
    },
    newCondition: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    condId() {
      return tool.uniqueStr();
    }
  }
};
