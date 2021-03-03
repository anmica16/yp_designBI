import tool from "@/plugins/js/tool";

let LoginUser = {
  computed: {
    loginUser() {
      let me = this;
      return me.$store.state.loginUser;
    },
    defaultGroupId() {
      let me = this;
      return me.loginUser ? me.loginUser.defaultGroup : "";
    },
    pageGroupId() {
      let me = this;
      return me.$store.state.pageGroupId;
    },
    pageGroup() {
      let me = this;
      return me.$store.state.pageGroup;
    }
  }
};

export default LoginUser;
