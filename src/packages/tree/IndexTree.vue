<template>
  <el-tree
    class="IndexTree"
    ref="tree"
    v-bind="propsData"
    @node-click="nodeClickFn"
  ></el-tree>
</template>

<script>
import tool from "@/plugins/js/tool";
export default {
  name: "IndexTree",
  props: {
    records: {
      type: Array,
      required: true
    },
    treeCfg: {
      type: Object,
      default() {
        return {};
      }
    },
    //@ 1 主要配置 props基本
    label: {
      type: String,
      default: "name"
    },
    children: {
      type: String,
      default: "$items"
    },
    isLeaf: {
      type: String,
      default: "isLeaf"
    },
    disabled: {
      type: String,
      default: "disabled"
    },
    //@ 2 主要
    recordKey: {
      type: String,
      default: "id"
    },
    //@ 3 会显示必要要求字段
    valid: String

  },
  data() {
    return {
      tree: null,
      firstRecs: [],
      //~~ 1 累积点击的数据节点，便于刷新的时候对应起来
      clickIndexs: []
    };
  },
  computed: {
    me() {
      return this;
    },
    props() {
      let me = this,
        props = {
          label: me.label,
          children: me.children,
          isLeaf: me.isLeaf,
          disabled: me.disabled
        };
      return props;
    },
    //@@ 1 传递参数
    propsData() {
      let me = this,
        props = me.props,
        //# 1 优先级
        p = tool.apply(
          {
            props,
            "node-key": me.recordKey,
            data: me.firstRecs
          },
          me.treeCfg
        );

      return p;
    }
  },
  methods: {
    //~ 1 如果给了 pIndex 那么寻找其子集，如果没有，则寻找第一级
    getItemRecs(pIndex) {
      let me = this,
        part = pIndex ? `^${pIndex}-(\\d+)$` : "(\\d+)$",
        reg = new RegExp(part),
        recs = [];

      me.records.forEach(rec => {
        let result = reg.exec(rec.index);
        if (result) {
          rec.$indexNumber = parseInt(result[1]);
          recs.push(rec);
        }
      });

      return recs;
    },
    //~ 2 最大index数
    getMaxItemIndex(rec) {
      let me = this,
        max = 0;
      if (rec.$items.length) {
        rec.$items.forEach(item => {
          if (item.$indexNumber > max) {
            max = item.$indexNumber;
          }
        });
      }
      return max;
    },
    //~ 3 把一条 record放入 map中
    expandOneRec(rec, ifDeep) {
      let me = this,
        index = rec.index,
        validItems = [],
        notValidItems = [],
        items = me.getItemRecs(index);
      //# 1 双方关系
      me.$set(rec, "$totItems", items);
      items.forEach(item => {
        item.$parent = rec;

        //# 2 检查是否放入
        if (me.valid) {
          if (!item[me.valid]) {
            notValidItems.push(item);
            return; //不用deep判断
          } else {
            validItems.push(item);
          }
        } else {
          validItems.push(item);
        }

        //~ 4-2 这里执行 可能的深入！
        if (ifDeep) {
          if (me.clickIndexs.indexOf(item.index) > -1) {
            me.expandOneRec(item, ifDeep);
          }
        }
      });
      //# 1-2 进一步
      me.$set(rec, "$notValidItems", notValidItems);
      me.$set(rec, "$items", validItems);
    },
    //~ 4 收集点击信息 并传递
    nodeClickFn(rec, nodeData, node) {
      let me = this,
        index = rec.index;
      //# 1 便于刷新
      if (me.clickIndexs.indexOf(index) < 0) {
        me.clickIndexs.push(index);
      }
      //# 2 并对该rec进行 expand
      me.expandOneRec(rec);

      //# 3 传递
      me.$emit("node-click", rec, nodeData, node);
    }
  },
  watch: {
    //# 1 以后的变更需要跟进
    records() {
      let me = this,
        firstRecs = me.getItemRecs();
      console.log(["indexTree created", firstRecs, me]);
      firstRecs.forEach(rec => {
        me.expandOneRec(rec, true);
      });
      //~ 2 顺序，看是否需要 loading
      me.firstRecs = firstRecs;
    }
  },
  mounted() {
    let me = this;
    me.tree = me.$refs.tree;
  }
};
</script>
