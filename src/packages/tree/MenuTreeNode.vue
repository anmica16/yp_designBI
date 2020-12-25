<template>
  <div
    v-if="record && record.exist"
    :class="{ isDir: !!items.length }"
    :index="index"
    :is="xtype"
  >
    <template v-if="items.length">
      <template slot="title">
        <i class="icon"></i>
        <span>{{ record.name }}</span>
      </template>
      <MenuTreeNode
        v-for="rec in items"
        :key="rec.index"
        :tree="tree"
        :record="rec"
        :parentNode="me"
        :level="level + 1"
      ></MenuTreeNode>
    </template>
    <template v-else>
      {{ record.name }}
    </template>
  </div>
</template>

<script>
export default {
  name: "MenuTreeNode",
  props: {
    tree: {
      type: Object,
      required: true
    },
    record: {
      type: Object,
      required: true
    },
    parentNode: Object,
    level: {
      type: Number,
      default: 1
    }
  },
  computed: {
    me() {
      return this;
    },
    index() {
      return this.record.index;
    },
    totItems() {
      let me = this,
        records;
      if (me.parentNode) {
        records = me.parentNode.totItems;
      }
      return me.tree.getTotItemRecs(me.record, records);
    },
    //~ 2 获得具体的sub items
    items() {
      let me = this,
        rec = me.record,
        reg = new RegExp(`^${rec.index}-(\\d+)$`),
        items = [];

      me.totItems.forEach(item => {
        let result = reg.exec(item.index);
        if (result) {
          item.$indexNumber = parseInt(result[1]);
          items.push(item);
        }
      });

      return items;
    },
    xtype() {
      let me = this,
        items = me.items;
      return items.length ? "el-submenu" : "el-menu-item";
    },
    isFolder() {
      return this.record.isFolder;
    }
  },
  methods: {
    getMaxItemIndex() {
      let me = this,
        max = 0;
      if (me.items.length) {
        me.items.forEach(item => {
          if (item.$indexNumber > max) {
            max = item.$indexNumber;
          }
        });
      }
      return max;
    }
  }
};
</script>
