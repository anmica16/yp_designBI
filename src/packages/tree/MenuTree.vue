<template>
  <el-menu
    ref="menu"
    v-bind="treeCfg"
    class="MenuTree"
    @select="selectFn"
    @submenu-click="submenuClickFn"
  >
    <template v-for="record in firstRecs">
      <MenuTreeNode
        :key="record.index"
        :record="record"
        :tree="tree"
      ></MenuTreeNode>
    </template>
  </el-menu>
</template>

<script>
import MenuTreeNode from "./MenuTreeNode";
export default {
  name: "MenuTree",
  components: {
    MenuTreeNode
  },
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
    }
  },
  data() {
    return {
      menu: null
    };
  },
  computed: {
    tree() {
      return this;
    },
    firstRecs() {
      let me = this,
        reocrds = [];
      me.records.forEach(rec => {
        if (rec.index && rec.index.indexOf("-") < 0) {
          reocrds.push(rec);
        }
      });

      return reocrds;
    }
  },
  methods: {
    //~ 1 获得大范围的 items
    getTotItemRecs(rec, records) {
      let me = this,
        pIndex = rec.index,
        reg = new RegExp(`^${pIndex}`),
        itemRecs = [];
      records = records || me.records;
      records.forEach(rec => {
        if (reg.test(rec.index)) {
          itemRecs.push(rec);
        }
      });
      return itemRecs;
    },
    //~ 2 对应item的 el-item点中
    selectFn(index, a, menuItem) {
      let me = this;
      me.$emit("select", menuItem.$parent, menuItem);
    },
    //~ 3 对应 树节点（文件夹）的选中，无论扩展或收缩
    submenuClickFn(submenu) {
      let me = this;
      me.$emit("submenu-click", submenu.$parent, submenu);
    },
  },
  mounted() {
    let me = this;
    me.menu = me.$refs.menu;
  }
};
</script>
