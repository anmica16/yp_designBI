<script>
import { Instance } from "@designBI/views/mixins/Entity.js";
import DesignItemInstance from './DesignItemInstance';
export default {
  name: "InstanceVue",
  mixins: [Instance],
  props: {
    //# 1 改写 Ins的 Entity，直接 是这个类型
    Entity: {
      type: DesignItemInstance,
      required: true,
    }
  },
  computed: {
    // parent() {
    //   return this.Entity.reocrd.parent;
    // },
    //# 2 不同于 各个item，放在 Ins上面的 list是唯一的
    parentsList() {
      let me = this,
        list = [];
      if (me.parent instanceof DesignItemInstance) {
        list = me.parent.instanceVue.parentsList.concat(me.parent);
      }
      return list;
    },
  }

}
</script>

