<template>
  <h2>Hello vue3!!</h2>
  <router-link to="/home">home</router-link> |  
  <router-link to="/about">about</router-link>
  <van-button type="primary">button</van-button>
  <router-view></router-view>
</template>

<script setup>
  import { Toast } from 'vant';
  import { RouterView, RouterLink } from 'vue-router';

  console.log("vite vue3>>>>>>")
  
  Toast.loading({
    duration: 3,
    message: '加载中...',
    forbidClick: true,
    loadingType: 'spinner',
  });
</script>

<style lang="less">
  @import "@/style/reset.less";
  .app {
    color: #666;
  }
  h2 {
    font-size: 30px;
    display: flex;
    transform: translateX(1px);
  }
</style>