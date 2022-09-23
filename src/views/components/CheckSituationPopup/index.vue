<template>
  <div class="CheckSituation-container">
    <van-popup
      v-model="show"
      closeable
      close-icon-position="top-left"
      round
      position="bottom"
      :style="{ height: '80%' }"
      @click-overlay="cancel"
      @click-close-icon="cancel">
      <div class="popup-content">
        <div class="head-title">答题卡</div>
        <!-- 练习情况 -->
        <div v-if="enable_practice && getAnalysisList.length === 0">
          <div class="practise-header">
            <p><span></span>正确</p>
            <p><span class="erro"></span>错误</p>
          </div>
          <div class="bottom d-ab">
            <div class="left">
              答题进度：<span class="num">{{ answeredList.length }}</span> / {{ getSubQuestion.length }}
              <span :style="{'color': answeredQuestion==='已全部作答'?'#0AD0B6':'#FF7548','marginLeft':'10px'}"><van-icon :name="answeredQuestion==='已全部作答'?'passed':'warning-o'" />{{ answeredQuestion }}</span>
            </div>
            <van-button
              type="info"
              @click="resetPractise">
              重新练习
            </van-button>
          </div>
        </div>
        <div v-else>
          <!-- 考试完成查看 -->
          <div class="result-header" v-if="status === 'examComplete'">
            <p><span></span>正确</p>
            <p><span class="erro"></span>错误</p>
            <div>正确率：<span>{{ init.correctRate }}</span></div>
          </div>
          <!-- 考试中查看 -->
          <div v-else>
            <div class="header">
              <p><span class="default"></span>未作答</p>
              <p><span class="answered"></span>已作答</p>
              <p><span class="sign"></span>标记</p>
            </div>
            <div class="bottom d-ab">
              <div class="left">
                答题进度：<span class="num">{{ answeredList.length }}</span> / {{ getSubQuestion.length }}
                <span :style="{'color': answeredQuestion==='已全部作答'?'#0AD0B6':'#FF7548','marginLeft':'10px'}"><van-icon :name="answeredQuestion==='已全部作答'?'passed':'warning-o'" />{{ answeredQuestion }}</span>
              </div>
              <van-button
                v-if="getAnalysisList && !getAnalysisList.length > 0"
                type="info"
                @click="confirm">
                提交试卷
              </van-button>
            </div>
          </div>
        </div>
        <div :class="{'h-48': !enable_practice&&status !== 'examComplete'}">
          <AnswerSituation
            ref="situationRef"
            v-for="item in answerTabList"
            :key="item.question_name"
            :title="item.question_name"
            :point="item.point"
            :answerList="item.sub_questions"
            :userAnswer="getAnalysisList"
            @close="cancel"
            :status="status"
            :pageType="pageType"
            :answerTabList="answerTabList" />
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script>
import AnswerSituation from './AnswerSituation'
import { THEME_COLOR, ERROR_COLOR } from 'utils/constant'
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
  components: {
    AnswerSituation
  },
  props: {
    showPopup: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: ''
    },
    answerTabList: {
      type: Array,
      default: () => ([])
    },
    pageType: { // 答案详情 页面展示类型
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      show: false,
      themeColor: THEME_COLOR,
      errorColor: ERROR_COLOR,
      answeredList: []
    }
  },
  computed: {
    ...mapGetters([
      'getSubQuestion',
      'getAnalysisList',
      'getPageSet'
    ]),
    ...mapState(['practiseRecordList']),
    enable_practice() {
      return this.getPageSet?.enable_practice
    },
    judgeEnable() {
      return this.getPageSet?.judge?.enabled
    },
    init() {
      let answerCount = {}
      // 练习且不是查看答题解析
      if (this.enable_practice && this.getAnalysisList?.length === 0) {
        const correctTotal = this.getSubQuestion.filter((item) => item.score === item.point && this.practiseRecordList.includes(item.question_id))
        const errorCount = this.getSubQuestion.filter((item) => this.practiseRecordList.includes(item.question_id) && item.score !== item.point && item.answer?.length > 0)
        answerCount = {
          correctCount: correctTotal.length,
          errorCount: errorCount.length // 错题数
        }
        return answerCount
      }
      // 考试
      if (this.getAnalysisList?.length > 0) {
        const correctTotal = this.getAnalysisList.filter((item) => item.correct)
        const rate = ((correctTotal.length / this.getSubQuestion.length) * 100).toFixed(0) + '%'
        const errorCount = this.getSubQuestion.length - correctTotal.length
        answerCount = {
          correctRate: rate, // 正确率
          correctCount: correctTotal.length,
          errorCount // 错题数
        }
      }
      return answerCount
    },
    answeredQuestion() {
      const totalList = this.getSubQuestion
      // 练习
      // if (this.enable_practice && this.getAnalysisList?.length === 0) {
      //   const lostList = Number(totalList.length - this.practiseRecordList.length)
      //   return this.practiseRecordList.length === totalList.length ? '已全部作答' : `剩余${lostList}题未作答`
      // }
      // 剩余未答题数
      const lostList = Number(totalList.length - this.answeredList.length)
      return this.answeredList.length === totalList.length ? '已全部作答' : `剩余${lostList}题未作答`
    }
  },

  watch: {
    showPopup(val) {
      this.show = val
      this.$nextTick(() => {
        for (let i = 0; i < this.answerTabList.length; i++) {
          this.$refs.situationRef[i].initData()
        }
      })
      // 已答题数
      this.answeredList = this.getSubQuestion.filter((item) => item.answer?.length > 0)
    }
  },
  methods: {
    ...mapMutations(['PRACTISE_RECORD', 'EXAM_NUMBER']),
    cancel() {
      this.$emit('update:showPopup', false)
    },
    confirm() {
      this.cancel()
      this.$emit('tipsClick') // 交卷提示
    },
    // 重新练习
    resetPractise() {
      this.$emit('resetPractise')
    }
  }
}
</script>
<style lang='less' scoped>
.CheckSituation-container {
  .van-popup--round {
    border-radius: 10px 10px 0 0;
  }
  .head-title{
    height: 52px;
    line-height: 52px;
    text-align: center;
    border-bottom: 1px solid #DCDCDC;
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }
  .result-header, .practise-header{
    p{
      margin-right: 48px;
    }
  }
  .header {
    p{
      margin-right: 32px;
    }
  }
  .result-header, .header, .practise-header {
    display: flex;
    align-items: center;
    padding: 20px 16px 32px 16px;
    p{
      display: flex;
      align-items: center;
      span{
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background: #0AD0B6;
        margin-right: 8px;
      }
      .erro{
        background: #FF7548;
      }
      .default{
        background: #fff;
        border: 1px solid #DCDCDC;
      }
      .answered{
        background: #3464E0;
      }
      .sign{
        background: #FFA940;
      }
    }
    div{
      span{
        color: #3464E0;
      }
    }
  }
  .bottom{
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    height: 48px;
    line-height: 48px;
    box-sizing: border-box;
    background: #fff;
    border-top: 1px solid #DCDCDC;
    z-index: 2;
    font-size: 14px;
    .left{
      padding-left: 16px;
      .num{
        color: #3464E0;
      }
      .van-icon{
        margin-right: 2px;
      }
    }
    .van-button{
      height: 100%;
      font-size: 17px;
    }
  }
  .h-48{
    padding-bottom: 48px;
  }
}
</style>
