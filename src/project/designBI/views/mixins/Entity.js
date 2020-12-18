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
      return this.Instance.recordData;
    },
    record() {
      return this.Instance.record;
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
    nowBoard: Object
  },
  data() {
    return {
      Instance: null,
      //~ 1 自身shadow，Bubble拥有
      shadow: null,
      //~ 2 加入进来的shadow，单个操作不会出现多个， --> 只有 BaseBubble和 CellBubble有
      addShadows: []
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
    }
  },
  methods: {
    //【shadow 3】拖拽
    dragShadow(shadow) {
      let me = this;
      //# 1 加入到自己体系
      if (shadow.parent !== me) {
        if (shadow.parent) {
          let at = shadow.parent.addShadows.indexOf(shadow);
          at > -1 && shadow.parent.addShadows.splice(at, 1);
        }

        let at2 = me.addShadows.indexOf(shadow);
        at2 < 0 && me.addShadows.push(shadow);
      }
    },
    //【shadow 2】自己生成shadow 并有目标对象
    makeShadow(targetNode) {
      let me = this;
      targetNode = (targetNode && targetNode.$parent) || me.$parent;
      if (!me.shadow) {
        me.shadow = {
          origin: me
        };
      }
      //# 1 不应该报错，按照体系：
      //targetNode.addShadow(shadow);
    },
    //【shadow 1】把被人的shadow加进来
    // --> 只有 BaseBubble和 CellBubble应该调用此
    addShadow(shadow) {
      let me = this;
      //# 2 去除上一个parent的 shadow
      if (shadow.parent) {
        shadow.parent.othersShadow = null;
      }
      tool.apply(shadow, {
        //# 1 这也是一次覆盖，更改parent为me
        parent: me,
        parentIns: me.Instance
      });
      me.othersShadow = shadow;
    }
  }
});

export { Base, Board, Instance };
