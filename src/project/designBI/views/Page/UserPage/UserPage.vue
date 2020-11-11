<template>
  <div class="UserPage">
    <h2>User {{ $route.params.id }} 欢迎登录</h2>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "UserPage"
};
</script>
