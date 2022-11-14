<template>
  <div class="analysis-control-panel">
    <div class="switch-con">
      <span>只看错题</span>
      <van-switch v-model="onlyLookWrong" inactive-color="#dcdcdc" active-color="#3464e0" @change="changeOnlyLookWrong"></van-switch>
    </div>
    <div class="switch-con">
      <span>逐题查看</span>
      <van-switch v-model="oneByOneLook" inactive-color="#dcdcdc" active-color="#3464e0" @change="changePageType"></van-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { examStore } from '@/store/index';
import { computed } from 'vue';

const store = examStore()

const onlyLookWrong = ref(false)
const oneByOneLook = ref(false)

// 题目是否分页显示 一页all 分页page
const paperShowType = computed(() => {
  return store.examResultInfo?.setting?.paper_setting?.paper_show_type
})

onMounted(() => {
  oneByOneLook.value = paperShowType.value === 'page'
})

// 只看错题切换
const changeOnlyLookWrong = (val: boolean) => {
  console.log(val)
  // 数据通过vuex维护 在结果
  store.$patch((state: any) => {
    console.log(state)
    state.examResultInfo.switch_only_look_wrong = val
    state.currentQuestionIndex = 0
  })
}
// 逐题查看切换
const changePageType = (val: boolean) => {
  const type = val ? 'page' : 'all'
  store.$patch((state: any) => {
    state.examResultInfo.setting.paper_setting.paper_show_type = type
    state.currentQuestionIndex = 0
  })
}
</script>

<style lang="less" scoped>
  .analysis-control-panel {
    width: 100%;
    height: 44px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    .switch-con {
      display: flex;
      align-items: center;
      & > span {
        color: #333;
        font-size: 14px;
        margin-right: 6px;
      }
      .van-switch {
        height: 1.05em;
        font-size: 19px;
      }
    }
  }
</style>