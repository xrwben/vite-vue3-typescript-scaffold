<template>
  <div class="explain">说明页</div>
</template>

<script setup lang="ts">
  import { Toast } from 'vant';
  import { RouterView, RouterLink } from 'vue-router';

  Toast.loading({
    duration: 3000,
    message: '加载中...',
    forbidClick: true,
    loadingType: 'spinner',
  });
</script>

<style lang="less" scoped>
  .explain {
    color: red;
  }
</style>