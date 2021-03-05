<template>
  <span class="pub-userBtn">
    <el-popover trigger="hover">
      <el-link slot="reference" :underline="false"
        ><i class="el-icon-user-solid"></i
        ><span class="text">{{ loginUserName }}</span>
        <span v-show="userRankStr" class="rankText">{{
          `(${userRankStr})`
        }}</span>
        <i class="el-icon-arrow-down"></i
      ></el-link>
      <el-button size="mini" type="danger" @click="loginOutFn">登出</el-button>
    </el-popover>
  </span>
</template>

<script>
import LoginUser from "@designBI/views/mixins/LoginUser";
export default {
  name: "userBtn",
  mixins: [LoginUser],
  props: {
    userRankStr: String
  }
};
</script>

<style lang="scss">
.pub-userBtn {
  .el-link--inner {
    .el-icon-user-solid {
      padding: 5px;
      background: rgb(77, 215, 250);
      border-radius: 50px;
      margin-right: 6px;
      color: white;
    }
    .text {
      margin-right: 3px;
    }
  }
}
</style>
