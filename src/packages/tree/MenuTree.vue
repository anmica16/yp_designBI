<template>
  <el-menu v-bind="treeCfg" class="MenuTree">
    <template v-for="reocrd in firstRecs">
      <MenuTreeNode
        :key="reocrd.index"
        :reocrd="reocrd"
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
    return {};
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
    }
  }
};
</script>
