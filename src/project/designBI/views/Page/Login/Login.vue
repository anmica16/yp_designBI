<template>
  <div @keydown.enter="login">
    <div>
      <label for="name">用户名</label>
      <el-input
        type="text"
        name="name"
        placeholder="请输入用户名"
        v-model="name"
      />
    </div>
    <div>
      <label for="password">密码</label>
      <el-input
        type="password"
        name="password"
        placeholder="请输入密码"
        v-model="password"
      />
    </div>
    <el-button v-loading="onLogin" type="primary" plain @click="login"
      >登录</el-button
    >
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "@/plugins/js/loader";
export default {
  name: "Login",
  data: () => {
    return {
      name: "",
      password: "",
      onLogin: false,
      onTest: false
    };
  },
  methods: {
    login() {
      console.log(["查看本component", this]);
      let me = this,
        Yw = window.Yw;
      me.onLogin = true;
      $.ajax({
        url: Yw.Api.user,
        data: {
          method: Yw.Api.user.login,
          username: this.name,
          password: this.password
        }
      })
        .then(data => {
          if (data.success) {
            let user = data.data;
            this.$store.dispatch("setUser", user);
            this.$router.push({ name: "Main" });
          }
        })
        .finally(() => {
          me.onLogin = false;
        });
    }
  }
};
</script>

<style scoped>
div {
  color: aqua;
}
</style>
