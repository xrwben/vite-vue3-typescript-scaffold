<template>
  <div class="onlypc-container">
    <img class="pic" src="@/assets/img/onlypc-bg.png" alt="">
    <p class="tips">本场考试仅支持电脑作答，请更换考试设备后重新进入考试页面</p>
    <p class="link">{{ linkUrl }}</p>
    <p class="btn" @click="copyLink">复制考试链接</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Toast } from 'vant'

const route = useRoute()

let linkUrl = ref('')

const copyLink = () => {
  let newInput = document.createElement('input')
  newInput.value = linkUrl.value
  document.body.appendChild(newInput)
  newInput.select()
  document.execCommand('Copy')
  newInput.remove()
  Toast('复制成功！')
}

onMounted(() => {
  const exam_id = route.query.exam_id
  const host = import.meta.env.MODE === 'production' ? 'https://exam.woa.com/exam/user/exam' : 'http://dev.ntsapps.oa.com/exam/user/exam'
  linkUrl.value = `${host}?exam_id=${exam_id}`
})
</script>

<style lang="less" scoped>
  .onlypc-container {
    width: 100%;
    height: 100%;
    padding: 0 30px;
    color: #666;
    font-size: 14px;
    line-height: 24px;
    text-align: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    .pic {
      width: 250px;
      height: 155px;
      margin: 0 auto;
    }
    .tips {
      margin: 20px 0 24px;
    }
    .link {
      word-break: break-all;
    }
    .btn {
      margin-top: 16px;
      color: #3464e0;
    }
  }
</style>
