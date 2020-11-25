<template>
  <div class="UserPage">
    <div class="topH">
      <h2>User {{ $route.params.id }} 欢迎登录</h2>
    </div>
    <div class="theBody">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserPage",
};
</script>
