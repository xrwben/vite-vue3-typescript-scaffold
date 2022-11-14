<template>
  <Transition>
    <div v-if="visible" class="verification-tips-dialog">
      <div class="container">
        <div class="content">
          人脸身份验证需要您提供<span class="strong">个人照片、真实姓名以及身份证号码，</span>用于核验考试者的身份，如不提供上述信息将无法参加本场考试，是否同意授权考试平台使用上述个人信息？
        </div>
        <div class="footer-btn">
          <div class="btn cancel" @click="close('cancel')">不同意</div>
          <div class="btn confirm" @click="close('confirm')">同意授权</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps({
  visible: {
    type: Boolean,
    default: () => false
  }
})
const emit = defineEmits(['update:visible', 'faceVerification'])

const close = (type: string) => {
  if (type === 'confirm') {
    emit('faceVerification')
  }
  emit('update:visible', false)
}
</script>

<style lang="less" scoped>
.verification-tips-dialog {
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
    transition: all 1s ease;
    transform: translate3d(0, -10%, 0);
    .content {
      color: #666;
      line-height: 24px;
      padding: 32px 20px;
      .strong {
        color: #333;
        font-weight: bold;
      }
    }
    .footer-btn {
      height: 56px;
      border-top: 1px solid #eaebf2;
      display: flex;
      .btn {
        flex: 1;
        color: #333;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        &:not(:last-of-type) {
          border-right: 1px solid #eaebf2;
        }
      }
      .confirm {
        color: #3464e0;
        font-weight: 500;
      }
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
