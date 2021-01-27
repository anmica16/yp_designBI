import DrawEntityBase from "@designBI/store/Entity/DrawEntityBase.js";
import tool from "@/plugins/js/tool";
let Base = {
  props: {
    //是否不必须 交给使用者覆盖
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
      return this.Instance ? this.Instance.recordData : {};
    },
    record() {
      return this.Instance ? this.Instance.record : {};
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
    //console.log(["执行created Base start"]);
    //console.log(["这个 instanceof有点问题"]);
    //# 1 这里表示 临时的未save的 也可以
    if (me.Entity instanceof DrawEntityBase) {
      // if (me.Entity.$DNA && me.Entity.$DNA === "DesignItemInstance") {
      me.Instance = me.Entity;
    } else {
      //+ 1 要改成 getter的形式
      me.Instance = me.$store.getters.getInstance(me.Entity);
    }
    //me.Instance.$vNode = me;
    //console.log(["执行created Base end"]);
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
  props: {
    nowBoard: Object,
    EditNode: Object
  },
  data() {
    return {
      Instance: null
    };
  },
  computed: {
    instanceVue() {
      return this.Instance.instanceVue;
    },
    instanceCode() {
      return this.recordData.instanceCode;
    },
    xtype() {
      return this.recordData.xtype;
    },
    source() {
      return this.recordData.source;
    },
    sourceDims() {
      let me = this,
        source = me.source,
        dims = [];
      if (source && source.Dims) {
        dims = source.Dims;
      }
      return dims;
    },
    //希望快速反应
    parent() {
      return this.record.parent;
    },
    parentCode() {
      return (
        this.recordData.parent &&
        this.recordData.parent.$context &&
        this.recordData.parent.$context.instanceCode
      );
    },
    //【update 1204】该变量放在单独的ins.vue里面
    parentsList() {
      let me = this;
      return me.instanceVue.parentsList;
    },
    //因为 record里面会自动转化 data的 $context选项,转化为一个 实体
    items() {
      // console.log([
      //   "items数量有变！",
      //   this.record.items,
      //   this.record.items && this.record.items.length
      // ]);
      let theItems = (this.Instance && this.record.items) || [];

      return theItems.filter(i => i);
    },
    canDrop() {
      return this.recordData.drag_resize_cfg.can_drop != "";
    },
    dataId() {
      return this.recordData ? this.recordData.linkDataId : null;
    },
    chartType() {
      let me = this,
        t = me.recordData ? me.recordData.chartType || "line" : "line";
      return t;
    },
    theme() {
      let me = this,
        t = me.recordData ? me.recordData.theme : "";
      return t;
    },
    //++ 1 更多配置
    config_more() {
      let me = this;
      return me.recordData ? me.recordData.config_more : null;
    },
    //++ 2 明细关联表
    _joinTables() {
      return this.config_more ? this.config_more.JoinTables : null;
    }
  }
});

export { Base, Board, Instance };
