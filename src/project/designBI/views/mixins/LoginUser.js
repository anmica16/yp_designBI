import tool from "@/plugins/js/tool";

let LoginUser = {
  computed: {
    loginUser() {
      let me = this;
      return me.$store.state.loginUser;
    },
    loginUserCode() {
      let me = this;
      return me.loginUser ? me.loginUser.userCode : "";
    },
    loginUserName() {
      let me = this;
      return me.loginUser
        ? me.loginUser.userName || `用户${me.loginUser.userCode}`
        : "未登录";
    },
    defaultGroupId() {
      let me = this;
      return me.loginUser ? me.loginUser.defaultGroup : "";
    },
    pageGroupId() {
      let me = this;
      return me.$store.state.pageGroupId;
    },
    pageGroups() {
      let me = this;
      return me.$store.state.pageGroups;
    },
    pageGroup() {
      let me = this;
      return me.$store.getters.pageGroup;
    },
    pageGroupName() {
      let me = this;
      return me.pageGroup ? me.pageGroup.name : "";
    },
    loginUserRank() {
      let me = this;
      return me.pageGroup ? me.pageGroup.userRank : "";
    },
    loginUserRankStr() {
      let me = this,
        map = {
          "1": "超级管理员",
          "10": "管理员",
          "20": "编辑者",
          "30": "查看者"
        };
      return me.loginUserRank ? map[me.loginUserRank] : "";
    }
  }
};

export default LoginUser;
