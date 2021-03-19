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
    pageGroups() {
      let me = this;
      return me.$store.state.pageGroups;
    },
    pageGroup() {
      let me = this;
      return me.$store.getters.pageGroup;
    },
    pageGroupId() {
      let me = this;
      return me.pageGroup && me.$store.state.pageGroupId;
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
    },
    userRankMap() {
      return {
        "1": "超级管理员",
        "10": "管理员",
        "20": "编辑者",
        "30": "查看者",
        "40": "游客"
      };
    },
    userRankList() {
      let me = this,
        list = [];
      tool.each(me.userRankMap, (key, val) => {
        list.push({
          userRank: key,
          userRankStr: val
        });
      });
      return list;
    },
    //# 2 4个权限！
    rankSuper() {
      let me = this;
      return me.loginUserRank && me.loginUserRank == 1;
    },
    rankAdmin() {
      let me = this;
      return me.loginUserRank && me.loginUserRank <= 10;
    },
    rankNormal() {
      let me = this;
      return me.loginUserRank && me.loginUserRank <= 20;
    },
    rankVisit() {
      let me = this;
      return me.loginUserRank && me.loginUserRank <= 30;
    },
    loginUserMainPageCode() {
      let me = this;
      return me.loginUser ? me.loginUser.mainPageCode : "";
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
      let map = this.userRankMap;
      return userRank ? map[userRank] : "";
    },
    getTagColorClass(str) {
      let me = this,
        colorCount = 30,
        codeSum = tool.getStrCodeSum(str);
      return `tagColor tagColor${codeSum % colorCount}`;
    },
    //+ 5 获得目标gid的 用户group
    getPageGroup(gid) {
      let me = this;
      return gid
        ? me.pageGroups.find(g => {
            return g.id == gid;
          })
        : null;
    }
  }
};

export default LoginUser;
