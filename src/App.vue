<template>
  <!-- <header>导航</header> -->
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { getUserInfoAPI } from '@/api/index'
import { examStore } from '@/store/index'

const store = examStore()

const getUserInfo = () => {
  getUserInfoAPI().then((res: any) => {
    const { code, success, data } = res
    if (code === '200' && success) {
      store.$patch((state: any) => {
        state.userInfo = data
        localStorage.setItem('Tencent_Exam_User_Info', JSON.stringify(data))
      })
    }
  })
}
onBeforeMount(() => {
  getUserInfo()
})
</script>

<style lang="less">
  @import "@/style/reset.less";
  #app {
    width: 100%;
    height: 100vh;
    background: #f5f7f9;
    overflow: auto;
  }
</style>