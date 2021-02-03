<template>
  <div :is="xtype" :title="title" class="DimTypeTag" :class="type">
    <span v-if="preText" class="preText">{{ preText }}</span>
    <i class="icon" :class="icon"></i>
    <span class="text">{{ name || typeName }}</span>
  </div>
</template>

<script>
export default {
  name: "DimTypeTag",
  props: {
    type: {
      type: String,
      required: true,
      validator(val) {
        return ["number", "date", "string", "other"].indexOf(val) > -1;
      }
    },
    name: {
      type: String
    },
    xtype: {
      type: String,
      default: "div"
    },
    preText: {
      type: String
    }
  },
  computed: {
    icon() {
      switch (this.type) {
        case "number":
          return "el-icon-cpu";
        case "date":
          return "el-icon-time";
        case "string":
          return "el-icon-chat-line-square";
      }
      return "el-icon-scissors";
    },
    typeName() {
      switch (this.type) {
        case "number":
          return "数值";
        case "date":
          return "日期";
        case "string":
          return "文本";
      }
      return "其他";
    },
    title() {
      return `${this.typeName}：${this.name || this.typeName}`;
    }
  }
};
</script>

<style lang="scss">
.DimTypeTag {
  $blue: #3685f2;
  $green: #37b4aa;
  $orange: #faaa39;
  $red: #f56c6c;

  > .icon {
    font-size: 20px;
    margin-right: 5px;
    position: relative;
    top: 2px;
  }

  &.string {
    > .icon {
      color: $blue;
    }
  }
  &.number {
    > .icon {
      color: $green;
    }
  }
  &.date {
    > .icon {
      color: $orange;
    }
  }
  &.other {
    > .icon {
      color: $red;
    }
  }
}
</style>
