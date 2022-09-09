<template>
  <header>导航</header>
  {{ store.userInfo }}
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import { getUserInfoAPI } from '@/api/index'
import { examStore } from '@/store/index'

const store = examStore()
console.log(store.userInfo)

const getUserInfo = () => {
  getUserInfoAPI().then((res: any) => {
    console.log(res)
    const { code, success, data } = res
    if (code === '200' && success) {
      // store.userInfo = data
      store.$patch({
        userInfo: data
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
    color: #666;
  }
</style>