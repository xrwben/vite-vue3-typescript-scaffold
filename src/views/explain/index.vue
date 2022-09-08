<template>
  <div class="explain">
    <span>说明页</span>
  </div>
  <img src="@/assert/pic.jpg" alt="">
  <!-- <img src="/img.jpg" alt=""> -->
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
  if(abc){
    console.log(1)
  }
  var fileArr = [
    'http://demo.ntsgw.oa.com/api/sso/content-center/api/v1/content/doc/batch-download?signature=3c087c76ac7d4aabed76ffc07310e052&compress_name=中文sadda通用配置没有开启能力项评估',
    'http://demo.ntsgw.oa.com/api/sso/content-center/api/v1/content/doc/batch-download?signature=3c087c76ac7d4aabed76ffc07310e052&compress_name=中文sadda通用配置没有开启评委评审记录',
    'http://demo.ntsgw.oa.com/api/sso/content-center/api/v1/content/doc/batch-download?signature=3c087c76ac7d4aabed76ffc07310e052&compress_name=中文sadda阿斯顿发生'
  ]
  fileArr.forEach(item => {
    console.log(item)
    // window.open(item)
  });
</script>

<style lang="less" scoped>
  .explain {
    color: red;
  }
</style>