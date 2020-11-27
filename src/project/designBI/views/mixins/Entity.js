import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance.js";
export default {
  props: {
    Entity: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      Instance: null
    };
  },
  computed: {
    recordData() {
      return this.Entity.recordData;
    },
    record() {
      return this.Entity.record;
    },
    instanceCode() {
      return this.recordData.instanceCode;
    },
    xtype() {
      return this.recordData.xtype;
    },
    //希望快速反应
    parent() {
      return this.record.parent;
    },
    //因为 record里面会自动转化 data的 $context选项,转化为一个 实体
    items() {
      return this.record.items;
    }
  },
  created() {
    let me = this;
    //console.log(["这个 instanceof有点问题"]);
    if (me.Entity instanceof DesignItemInstance) {
      // if (me.Entity.$DNA && me.Entity.$DNA === "DesignItemInstance") {
      me.Instance = me.Entity;
    } else {
      me.Instance = new DesignItemInstance(me.Entity);
    }
  }
};
