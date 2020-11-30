import DrawEntityBase from "@designBI/store/Entity/DrawEntityBase.js";
import tool from "@/plugins/js/tool";
let Base = {
  props: {
    Entity: {
      type: DrawEntityBase,
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
    id() {
      return this.recordData.id;
    },
    name() {
      return this.recordData.name;
    },
    desp() {
      return this.recordData.desp;
    }
  },
  created() {
    let me = this;
    //console.log(["这个 instanceof有点问题"]);
    //# 1 这里表示 临时的未save的 也可以
    if (me.Entity instanceof DrawEntityBase) {
      // if (me.Entity.$DNA && me.Entity.$DNA === "DesignItemInstance") {
      me.Instance = me.Entity;
    } else {
      //+ 1 要改成 getter的形式
      me.Instance = me.$store.getters.getInstance(me.Entity);
    }
  }
};

let Board = tool.mergeClone({}, Base, {
  computed: {
    templateCode() {
      return this.recordData.templateCode;
    },
    rootInstance() {
      return this.record.rootInstance;
    }
  }
});

let Instance = tool.mergeClone({}, Base, {
  computed: {
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
  }
});

export { Base, Board, Instance };
