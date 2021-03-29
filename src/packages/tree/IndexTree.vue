<template>
  <el-tree
    class="IndexTree"
    ref="tree"
    v-bind="propsData"
    @node-click="nodeClickFn"
    @node-expand="nodeExpandFn"
    @node-collapse="nodeCollapseFn"
  ></el-tree>
</template>

<script>
import tool from "@/plugins/js/tool";
import Vue from "vue";
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
      type: [String, Function],
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
      validFirstRecs: [],
      //~~ 1 累积点击的数据节点，便于刷新的时候对应起来
      clickIndexs: [],
      //~~ 2 累积展开的 id，以便复原！
      expandIds: []
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
            data: me.validFirstRecs,
            "render-content": me.renderContent
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
        part = pIndex ? `^${pIndex}-(\\d+)$` : "^(\\d+)$",
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
      if (rec.$totItems && rec.$totItems.length) {
        rec.$totItems.forEach(item => {
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
      if (validItems.length) {
        //# 2 解决不及时刷新子数据的问题
        me.$nextTick(() => {
          let node = me.tree.getNode(rec.id);
          node.updateChildren();
        });
      }
    },
    //~ 4 收集点击信息 并传递
    nodeClickFn(rec, nodeData, node) {
      let me = this,
        index = rec.index;
      //# 1 便于刷新
      if (me.clickIndexs.indexOf(index) < 0) {
        me.clickIndexs.push(index);
      }
      //# 2 并对该rec的 item进行 expand
      rec.$items &&
        rec.$items.forEach(item => {
          me.expandOneRec(item);
        });

      //# 3 传递
      me.$emit("node-click", rec, nodeData, node);
    },
    //~ 5 这个就交给主动触发了
    refresh() {
      let me = this,
        firstRecs = me.getItemRecs();
      //console.log(["indexTree created", firstRecs, me]);
      let validFirstRecs = firstRecs.filter(r => {
        return me.valid ? r[me.valid] : true;
      });
      validFirstRecs.forEach(rec => {
        me.expandOneRec(rec, true);
      });
      //~ 2 顺序，看是否需要 loading
      me.firstRecs = firstRecs;
      me.validFirstRecs = validFirstRecs;
      //~ 3 复原 下一次刷新时搞
      me.$nextTick(() => {
        me.expandIds.forEach(id => {
          let node = me.tree.getNode(id);
          node && node.expand();
        });
      });
    },
    //~ 6 记录已展开的ids，以便刷新的时候进行展开复原
    nodeExpandFn(rec) {
      let me = this,
        id = rec.id,
        at = me.expandIds.indexOf(id);
      if (at < 0) {
        me.expandIds.push(id);
      }
    },
    //~ 6-2
    nodeCollapseFn(rec) {
      let me = this,
        id = rec.id,
        at = me.expandIds.indexOf(id);
      if (at > -1) {
        me.expandIds.splice(at, 1);
      }
    },
    //+ 7 想要一个区分文件夹和节点的图标：
    renderContent(h, { node, data, store }) {
      let me = this,
        ctor = Vue.extend({
          template: `
        <span class="custom-tree-node">
          <span :class="config.isFolder ?  node.expanded ? 'el-icon-folder-opened' : 'el-icon-folder' : 'el-icon-paperclip'"></span>
          <span>{{config[tree.label]}}</span>
        </span>`,
          props: {
            config: Object,
            tree: Object,
            node: Object
          }
        });
      return h(ctor, {
        props: {
          config: data,
          tree: me,
          node
        }
      });
    }
  },
  watch: {
    records(newVal, oldVal) {
      if (
        newVal
        // (newVal && !oldVal) ||
        // (newVal && oldVal && newVal.length !== oldVal.length)
      ) {
        this.refresh();
      }
    }
  },
  // created() {
  //   let me = this;
  //   me.refresh();
  // },
  mounted() {
    let me = this;
    me.tree = me.$refs.tree;
  }
};
</script>
