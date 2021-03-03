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
    userDefaultGroup() {
      let me = this;
      return me.$store.state.userDefaultGroup;
    }
  }
};

export default LoginUser;
