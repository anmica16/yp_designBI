<template>
  <el-form
    ref="form"
    size="mini"
    :model="formData"
    :rules="rules"
    label-width="100px"
  >
    <el-form-item label="数据源名称" prop="name">
      <el-input
        v-model="formData.name"
        placeholder="请输入数据源名称"
      ></el-input>
    </el-form-item>

    <el-form-item label="数据源地址" prop="ip">
      <el-input v-model="formData.ip" placeholder="请输入数据源地址"></el-input>
    </el-form-item>

    <!-- <el-form-item label="数据库名" prop="dataBaseName">
      <el-input
        v-model="formData.dataBaseName"
        placeholder="请输入所连接的数据库名"
      ></el-input>
    </el-form-item> -->

    <el-form-item label="登录用户" prop="username">
      <el-input
        v-model="formData.username"
        placeholder="请输入数据源登录用户"
      ></el-input>
    </el-form-item>

    <el-form-item label="用户密码" prop="password">
      <el-input
        type="password"
        v-model="formData.password"
        placeholder="请输入数据源登录用户密码"
      ></el-input>
    </el-form-item>

    <el-form-item size="small">
      <el-button type="primary" @click="conFirmFn">确认</el-button>
      <el-button @click="cancelFn">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "AddSqlSource",
  data() {
    return {
      formData: {
        name: "",
        ip: "",
        //dataBaseName: "",
        username: "",
        password: ""
      },
      rules: {
        name: [
          { required: true, message: "请输入数据源名称", trigger: "blur" }
        ],
        ip: [{ required: true, message: "请输入数据源地址", trigger: "blur" }],
        // dataBaseName: [
        //   { required: true, message: "请输入所连接的数据库名", trigger: "blur" }
        // ],
        username: [
          { required: true, message: "请输入数据源登录用户", trigger: "blur" }
        ],
        password: [
          {
            required: true,
            message: "请输入数据源登录用户密码",
            trigger: "blur"
          }
        ]
      }
    };
  },
  methods: {
    conFirmFn() {
      let me = this,
        form = me.$refs.form;
      form.validate(ifPass => {
        if (ifPass) {
          me.$emit("submit", me.formData);
        }
      });
    },
    cancelFn() {
      let me = this;
      me.$emit("cancel");
    }
  }
};
</script>
