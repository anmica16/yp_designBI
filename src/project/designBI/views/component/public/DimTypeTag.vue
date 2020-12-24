<template>
  <div class="DimTypeTag" :class="type">
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
