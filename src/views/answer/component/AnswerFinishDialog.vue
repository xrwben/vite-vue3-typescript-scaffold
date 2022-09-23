<template>
  <div class="finish-dialog">
    <van-dialog
      v-model="show"
      :show-cancel-button="false"
      :show-confirm-button="false"
      title="提示"
    >
      <div class="finish-dialog-content">
        <p>考试时间已到，正在强制交卷</p>
        <p class="timer">{{ count }}</p>
      </div>
    </van-dialog>
  </div>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      count: 5,
      timer: null
    }
  },
  watch: {
    show (newValue) {
      if (newValue) {
       this.handleTimer()
      }
    }
  },
  mounted() {
    const sessionTime = sessionStorage.getItem('downTime_value')
    this.count = sessionTime >= 1 ? sessionTime : 5
  },
  destroyed() {
    this.timer = null
    clearInterval(this.timer)
    sessionStorage.removeItem('downTime_value')
  },
  methods: {
    handleTimer() {
      this.timer = setInterval(() => {
        this.count--
        sessionStorage.setItem('downTime_value', this.count)
        if (this.count === 1) {
          clearInterval(this.timer)
          this.timer = null
          sessionStorage.removeItem('downTime_value')
          this.$emit('update:show', false)
          this.$emit('submit', true) // 强制交卷
        }
      }, 1000)
    }
  }

}
</script>
<style lang="less">
.finish-dialog {
  &-content {
    padding: 20px;
    text-align: center;
    .timer {
      color: @color-theme;
      font-size: 28px;
      margin-top: 20px;
    }
  }
}
</style>
