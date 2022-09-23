<template>
  <div class="answer-progress d-ab">
    <div class="progress-time d-a">
      <img src="@/assets/img/answer/down_time.svg" alt="">
      <span :style="{'color': Number(lastTime) <= 180000 ? '#F81D22' : '' }">{{ timer }}</span>
    </div>
    <div class="progress-title">答题进度：<span>{{answerList.length}}</span>{{ ` / ${getSubQuestion.length}` }}</div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { fomatSecondNone } from 'utils/filters'
export default {
  props: {
    time: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      stopTimer: null,
      lastTime: '',
      timer: 0
    }
  },
  computed: {
    ...mapGetters([
      'getSubQuestion',
      'getAnalysisList',
      'getName'
    ]),
    answerList() {
      if (this.getAnalysisList?.length) {
        return this.getAnalysisList.filter((e) => e.answer?.length)
      }
      return this.getSubQuestion.filter((e) => e.answer?.length)
    }
  },
  mounted() {
    // 关闭浏览器时
    window.addEventListener('beforeunload', () => this.saveLocalTime())
    this.handleCountDown()
  },
  destroyed() {
    this.stopInterval()
    this.saveLocalTime()
  },
  methods: {
    // 防止刷新页面倒计时重置
    // handleCountDown() {
    //   // 如果已经存储时间了，那就从缓存中取，否则拿开始的数据
    //   const info = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`)) 
    //   this.lastTime = info?.countDownTime >= 0
    //     ? info.countDownTime
    //     : this.time * 1000
    //   if (this.lastTime === 0) {
    //     this.stopInterval()
    //     this.$emit('changeFinish') // 强制交卷
    //     return
    //   }
    //   if (this.lastTime > 0) {
    //     this.stopTimer = setInterval(() => {
    //       this.lastTime -= 1000
    //       this.saveLocalTime()
    //       this.timer = fomatSecond(this.lastTime)
    //       if (this.lastTime === 0) {
    //         this.stopInterval()
    //         this.$emit('changeFinish') // 强制交卷
    //       }
    //     }, 1000)
    //   }
    // },
    handleCountDown: function () {
      const that = this
      const info = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`)) 
      this.lastTime = info?.countDownTime >= 0 ? info.countDownTime : this.time * 1000
      if (this.lastTime <= 0) { 
        this.stopInterval()
        this.$emit('changeFinish') // 强制交卷return
      }
      const interval = 1000
      const start = new Date().getTime()
      let count = 0
      this.stopTimer = setTimeout(countDownStart, interval)
      function countDownStart() {
        let offset, nextTime // offset是倒计时误差时间，nextTime是减去误差时间后下一次执行的时间
        count++
        offset = new Date().getTime() - (start + count * interval)
        nextTime = interval - offset
        if (nextTime < 0) { nextTime = 0 }
        that.lastTime -= interval
        that.saveLocalTime()
        that.timer = fomatSecondNone(that.lastTime)
        // console.log('误差: ' + offset + 'ms, 下一次执行: ' + nextTime + 'ms后，离活动开始还有: ' + that.lastTime + 'ms')
        if (that.lastTime <= 0) {
          that.stopInterval()
          that.$emit('changeFinish') // 强制交卷return
        } else {
          that.stopTimer = setTimeout(countDownStart, nextTime)
        }
      }
    },
    // 每次刷新关闭页面-推出页面都会存储时间
    saveLocalTime() {
      // 存储倒计时
      const info = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`)) || {}
      const infoResult = {
        ...info,
        countDownTime: this.lastTime
      }
      if (info.examId) {
        localStorage.setItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`, JSON.stringify(infoResult))
      }
    },
    stopInterval() {
      clearTimeout(this.stopTimer)
      this.stopTimer = null
    }
  }
}
</script>
<style lang="less">
.answer-progress {
  background: #fff;
  padding: 12px 16px;
  color: @color-text-black;
  font-size: 14px;
  .progress-time {
    img {
      width: 15px;
      height: 15px;
      margin-right: 5px
    }
  }
  .progress-title {
    span:first-of-type {
      color: @color-theme;
    }
  }
}
</style>
