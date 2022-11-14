<template>
  <Transition>
    <div v-if="visible" class="forced-submit-dialog">
      <div class="container">
        <div class="title">提示</div>
        <p class="tips">{{ forcedTipsText }}</p>
        <p class="time">{{ time }}</p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  visible: {
    type: Boolean,
    default: () => false
  },
  forcedTipsText: {
    type: String,
    default: '考试时间已到，正在强制交卷'
  }
})

const emit = defineEmits(['update:visible', 'submit'])

let time = ref(5)
let timerIns = ref<any>(null)

onMounted(() => {
  startCountDown()
})
onBeforeUnmount(() => {
  stopCountDown()
})

// 倒计时
const startCountDown = () => {
  stopCountDown()
  timerIns.value = setTimeout(() => {
    time.value--
    if (time.value <= 0) {
      stopCountDown()
      emit('submit', true) // 强制交卷
      emit('update:visible', false) // 关闭强制提示弹窗
    } else {
      startCountDown()
    }
  }, 1000)
}
const stopCountDown = () => {
  timerIns.value && clearTimeout(timerIns.value)
  timerIns.value = null
}
</script>

<style lang="less" scoped>
.forced-submit-dialog {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  .container {
    width: 320px;
    background: #fff;
    border-radius: 10px;
    text-align: center;
    overflow: hidden;
    transform: translate3d(0, -10%, 0);
    .title {
      color: #333;
      font-size: 18px;
      font-weight: 500;
      padding: 24px 20px 0;
    }
    .tips {
      color: #666;
      font-size: 16px;
      margin: 15px 0;
      padding: 0 20px;
    }
    .time {
      color: #3464e0;
      font-size: 28px;
      margin: 20px 0;
    }
  }
}
// 弹窗过度动画
.v-enter-active, .v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter-from, .v-leave-to {
  opacity: 0;
}
</style>
