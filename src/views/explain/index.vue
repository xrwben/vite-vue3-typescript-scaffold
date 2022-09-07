<template>
  <div class="explain">说明页</div>
  <!-- <img src="@/assert/pic.jpg" alt="">
  <img src="/img.jpg" alt=""> -->
</template>

<script setup lang="ts">
  import { Toast } from 'vant';
  import { RouterView, RouterLink } from 'vue-router';
  console.log(import.meta.env)
  Toast.loading({
    duration: 3000,
    message: '加载中...',
    forbidClick: true,
    loadingType: 'spinner',
  });

  const abc: number = '123'
  console.log(abc)
</script>

<style lang="less" scoped>
  .explain {
    color: red;
  }
</style>