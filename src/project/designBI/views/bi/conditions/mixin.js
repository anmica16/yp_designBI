import { Instance } from "@designBI/views/mixins/Entity";
export default {
  mixins: [Instance],
  props: {
    //【update】多个同时应用?
    property: {
      type: String,
      required: true
    }
  }
};
