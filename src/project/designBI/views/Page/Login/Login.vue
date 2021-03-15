<template>
  <div class="LoginPage" @keydown.enter="enterFn">
    <div class="topSpace">
      <div class="logo"></div>
    </div>
    <div class="formSpace">
      <transition name="PageMove2">
        <div class="loginWrap" v-if="!isRegister">
          <div class="title">登录</div>
          <el-form
            ref="loginForm"
            :model="loginInfo"
            label-position="top"
            v-loading="logining"
          >
            <el-form-item
              label="用户名"
              prop="userCode"
              :rules="{
                required: true,
                message: '用户名不能为空',
                trigger: 'blur'
              }"
            >
              <el-input
                v-model="loginInfo.userCode"
                placeholder="请输入用户名"
              ></el-input>
            </el-form-item>

            <el-form-item label="密码" prop="password">
              <el-input
                type="password"
                v-model="loginInfo.password"
                placeholder="请输入密码"
              ></el-input>
            </el-form-item>

            <el-form-item class="loginBtn">
              <el-button type="primary" @click="login">登录</el-button>
            </el-form-item>

            <el-form-item class="loginTip">
              <el-link
                type="primary"
                :underline="false"
                @click="isRegister = true"
                >免费注册👨‍🔧</el-link
              >
              <div class="fill"></div>
              <el-link :underline="false">忘记密码？</el-link>
            </el-form-item>
          </el-form>
        </div>
      </transition>

      <transition name="PageMove2">
        <div class="registerWrap" v-if="isRegister">
          <div class="leftPart">
            <div class="imageArea"></div>
            <div class="textArea">欢迎注册体验朗速BI数据可视化平台！🧙‍♂️</div>
            <dir class="bottomLogo"></dir>
          </div>
          <div class="rightPart">
            <div class="title">免费注册</div>
            <el-form
              ref="registerForm"
              :model="registerInfo"
              label-position="top"
              v-loading="registering"
            >
              <el-form-item
                label="用户名"
                prop="userCode"
                :rules="{
                  required: true,
                  message: '用户名不能为空',
                  trigger: 'blur'
                }"
              >
                <el-input
                  v-model="registerInfo.userCode"
                  placeholder="请输入用户名"
                ></el-input>
              </el-form-item>

              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="registerInfo.password"
                  type="password"
                  placeholder="请输入密码"
                ></el-input>
              </el-form-item>

              <el-form-item class="loginBtn">
                <el-button type="primary" @click="register">立即使用</el-button>
              </el-form-item>

              <el-form-item class="registerTip">
                <span class="tipText"
                  >已有账号
                  <el-link
                    type="primary"
                    :underline="false"
                    @click="isRegister = false"
                    >去登录</el-link
                  ></span
                >
              </el-form-item>
            </el-form>
          </div>
        </div>
      </transition>
    </div>
    <div class="bottomSpace">
      <a href="javascript:;">
        <span class="leftLine"></span>
        <span class="text">朗速BI<span class="dot">·</span>数据可视化平台</span>
        <span class="rightLine"></span>
      </a>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import loader from "@/plugins/js/loader";
export default {
  name: "Login",
  data() {
    return {
      loginInfo: {
        userCode: "",
        password: ""
      },
      logining: false,
      //@ 2 注册页也在这里
      isRegister: false,
      registerInfo: {
        userCode: "",
        password: ""
      },
      registering: false
    };
  },
  methods: {
    enterFn() {
      let me = this;
      me.isRegister ? me.register() : me.login();
    },
    login() {
      let me = this;

      me.$refs.loginForm.validate(ifPass => {
        if (ifPass) {
          me.logining = true;

          loader
            .ajax({
              url: Vue.Api.designBI,
              data: {
                method: Vue.Api.designBI.Login,
                ...me.loginInfo
              }
            })
            .then(result => {
              me.logining = false;
              let user = result.data;
              me.$store.dispatch("loginIn", user);
              if (user.defaultGroup) {
                me.$router.push({ name: "DesignCenter-menu" });
              } else {
                me.$msgbox({
                  type: "warning",
                  message:
                    "用户没有设置默认团队，将跳转至团队设置页，请于该页设置！"
                }).catch(() => {});

                me.$router.push({ name: "Group" });
              }
            })
            .catch(r => {
              me.logining = false;
              me.$message.warning(r.msg);
            });
        }
      });
    },
    register() {
      let me = this;

      me.$refs.registerForm.validate(ifPass => {
        if (ifPass) {
          me.registering = true;

          loader
            .ajax({
              url: Vue.Api.designBI,
              data: {
                method: Vue.Api.designBI.Register,
                ...me.registerInfo
              }
            })
            .then(result => {
              me.registering = false;
              let user = result.data;
              me.$store.dispatch("loginIn", user);
              if (user.defaultGroup) {
                me.$router.push({ name: "DesignCenter" });
              } else {
                me.$msgbox({
                  type: "info",
                  message:
                    "注册成功！新注册用户需要设置默认团队，将跳转至团队设置页，请于该页设置！"
                }).catch(() => {});

                me.$router.push({ name: "Group" });
              }
            })
            .catch(r => {
              me.registering = false;
              me.$message.warning(r.msg);
            });
        }
      });
    }
  }
};
</script>
