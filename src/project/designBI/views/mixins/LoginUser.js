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
      let me = this;
      return me.getLoginUserRankStr(me.loginUserRank);
    }
  },
  methods: {
    //+ 4 登出
    loginOutFn() {
      let me = this;
      me.$msgbox({
        type: "info",
        title: "确认",
        message: "确认登出吗？",
        showCancelButton: true
      })
        .then(() => {
          me.$store.dispatch("loginOut");
        })
        .catch(() => {});
    },
    getLoginUserRankStr(userRank) {
      let map = {
        "1": "超级管理员",
        "10": "管理员",
        "20": "编辑者",
        "30": "查看者"
      };
      return userRank ? map[userRank] : "";
    }
  }
};

export default LoginUser;
