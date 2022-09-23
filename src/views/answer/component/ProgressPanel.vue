<template>
  <div class="progress-panel">
    <div class="count-down">
      <img src="@/assets/img/answer/down_time.svg" alt="">
      <span :class="{'warn': timeWarning}">{{ timeFormat(remainTime) }}</span>
    </div>
    <div class="progress">答题进度：<span>{{ answeredList.length }}</span> / {{ store.getExamQuestionList.length }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { examStore } from '@/store/index'

const store = examStore()

let remainTime = ref(0)
let timerIns = ref<any>(null)

const emit = defineEmits(['submitTips'])

// 三分钟倒计时警告
const timeWarning = computed(() => {
  return remainTime.value <= 3 * 60
})
// 已作答问题列表
const answeredList = computed(() =>  {
  return store.getExamQuestionList.filter((item: any) => item.answer?.length > 0)
})
// 剩余时间格式化
const timeFormat = computed(() => {
  return (time: any) => {
    time = time <= 0 ? 0 : time
    let hours: any = Math.floor(time / 60 / 60)
    let minutes: any = Math.floor(time / 60 % 60)
    let seconds: any = time % 60
    hours = hours < 10 ? '0' + hours : hours
    minutes = minutes < 10 ? '0' + minutes : minutes
    seconds = seconds < 10 ? '0' + seconds : seconds
    return `${hours}:${minutes}:${seconds}`
  }
})

onMounted(() => {
  const startTime = new Date(store.examInfo.start_time).getTime()
  const currrentTime = new Date().getTime()
  const useTime = currrentTime - startTime
  remainTime.value = Math.ceil((store.examInfo.exam_duration * 1000 - useTime) / 1000)
  console.log(remainTime.value)
  startCountDown()
})
// 倒计时
const startCountDown = () => {
  stopCountDown()
  timerIns.value = setTimeout(() => {
    if (remainTime.value % 60 === 59) {
      console.log('内存泄漏：定时器还在走')
    }
    remainTime.value--
    if (remainTime.value <= 0) {
      stopCountDown()
      console.log('倒计时完成')
      // 强制交卷
      emit('submitTips', true)
    } else {
      startCountDown()
    }
  }, 1000)
}
const stopCountDown = () => {
  timerIns && clearTimeout(timerIns.value)
  timerIns.value = null
}
</script>

<style lang="less" scoped>
.progress-panel {
  width: 100%;
  height: 44px;
  background: #fff;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #333;
  font-size: 14px;
  .count-down {
    display: flex;
    align-items: center;
    & > img {
      width: 16px;
      height: 16px;
      margin-right: 8px;
    }
    .warn {
      color: #f81d22;
    }
  }
  .progress {
    & > span {
      color: #3464e0;
    }
  }
}
</style>
