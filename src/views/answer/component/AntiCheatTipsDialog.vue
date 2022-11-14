<template>
  <Transition>
    <div v-if="visible" class="anti-cheat-tips">
      <div class="container">
        <div class="title">{{ title }}</div>
        <div class="content" v-html="tipsContent"></div>
        <div class="footer-btn" @click="close">我知道了</div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    type: Boolean,
    default: () => false
  },
  title: {
    type: String,
    default: ''
  },
  tipsContent: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:visible'])

const close = () => {
  emit('update:visible', false)
}
</script>

<style lang="less" scoped>
.anti-cheat-tips {
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
    border-radius: 8px;
    color: #666;
    font-size: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    transform: translate3d(0, -10%, 0);
    .title {
      color: #333;
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      padding: 24px 20px 0;
    }
    :deep(.content) {
      padding: 20px;
      & > p {
        color: #666;
        font-size: 17px;
        font-weight: 400;
        text-align: center;
        margin-bottom: 10px;
        & > span {
          color: #f81d22;
        }
      }
    }
    .footer-btn {
      height: 56px;
      border-top: 1px solid #eaebf2;
      color: #3464e0;
      font-size: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
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
