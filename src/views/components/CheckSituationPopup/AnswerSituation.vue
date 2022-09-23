<template>
  <div class="SubjectContent">
    <div class="multiple-box">
      <div class="title">
        {{ title }} <span> (合计{{ point }}分)</span>
      </div>
      <div class="radio-box">
        <div
          :class="[
            i >= 8 ? 'mg-tp' : '',
            judgeCorrect(item),
            'default',
            'd-ac',
          ]"
          v-for="(item, i) in list"
          :key="i"
          @click="goExam(item.question_id)">
          <div class="radio-circle">
            {{ item.question_index }}
          </div>
          <div class="flag-box"><img v-if="item.startFlag" src="@/assets/img/answer/flag_active.svg" alt=""></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    point: {
      type: Number
    },
    userAnswer: {
      type: Array,
      default: () => ([])
    },
    answerList: {
      type: Array,
      default: () => ([])
    },
    status: {
      type: String,
      default: ''
    },
    pageType: { // 答案详情 页面展示类型
      type: Boolean,
      default: false
    },
    answerTabList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [],
      createScrollTimer: null
    }
  },
  computed: {
    ...mapGetters([
      'getSubQuestion',
      'getExamResult',
      'getPageSet'
    ]),
    ...mapState(['practiseRecordList']),
    enable_practice() {
      return this.getPageSet?.enable_practice && this.getPageSet?.judge.enabled
    },
    paper_show_type() {
      return this.getPageSet?.paper_setting?.paper_show_type
    }
  },
  unmounted() {
    clearTimeout(this.createScrollTimer)
    this.createScrollTimer = null
  },
  methods: {
    ...mapMutations(['EXAM_NUMBER']),
    initData() {
      // 处理父组件运行子组件没有渲染的问题
      this.list = [].concat(this.answerList)
    },
    handleNeedData(id) {
      // 答案详情number写法后期修改，先能使用，后期优化
      let list = []
      let number = 0
      if (this.$route.path === '/answerAnalysis') {
        this.answerTabList.forEach(item => list.push(...item.sub_questions))
        number = list.findIndex((item) => item.question_id === id)
      } else {
        number = this.getSubQuestion.findIndex((item) => item.question_id === id)
      }
      this.EXAM_NUMBER(number)
    },
    handlePageType(id) {
      const list = []
      const subQuestion = [].concat(this.getSubQuestion)
      const pageSize = Math.ceil(this.getSubQuestion.length / this.getPageSet?.paper_setting?.page_size)
      for (let i = 0; i < pageSize; i++) {
        const data = subQuestion.splice(0, this.getPageSet?.paper_setting?.page_size)
        list.push(data)
      }
      // 处理跳转分页
      const number = list.findIndex((e) => e.find((v) => v.question_id === id))
      this.EXAM_NUMBER(number)
      // 处理定位到每一题
      const dataItem = []
      list.forEach((e) => e.forEach((v) => {
        if (v.question_id === id) {
          dataItem.push(v)
        }
      }))
      // 加定时器是分页时dom还未生成
      this.createScrollTimer = setTimeout(() => {
        const PageId = document.querySelector('#topic' + dataItem[0].question_id)
        window.scrollTo({
          top: PageId?.offsetTop - 93 || 0,
          behavior: 'smooth'
        })
      }, 50)
    },
    fullPage(id) {
      // 获取点击的按钮对应页面的id
      // 答案详情number写法后期修改，先能使用，后期优化
      let list = []
      let number = 0
      if (this.$route.path === '/answerAnalysis') {
        this.answerTabList.forEach(item => list.push(...item.sub_questions))
        number = list.findIndex((item) => item.question_id === id)
      } else {
        number = this.getSubQuestion.findIndex((item) => item.question_id === id)
      }
      this.EXAM_NUMBER(number)
      const PageId = document.querySelector('#topic' + number)
      window.scrollTo({
        top: PageId?.offsetTop - 66 || 0,
        behavior: 'smooth'
      })
    },
    goExam(id) {
      this.$emit('close')
      const { path } = this.$route
      const { exam_id, record_id, exam_name } = this.getExamResult
      if (this.status === 'examComplete' && path === '/answerAnalysis') { // 考试结果(去掉) 考试详情
        if (!this.pageType) { // 整页
          this.fullPage(id)
        } else {
          this.handleNeedData(id)
        }
      } else { // 练习
        if (this.getPageSet?.enable_practice) {
          this.handleNeedData(id)
          const query = {
            record_id,
            exam_id,
            exam_name
          }
          const needQuery = path === '/answer' ? query : {}
          this.$router.push({ // 答题页，答案解析页
            path,
            query: needQuery
          })
        } else { // 考试
          if (this.paper_show_type === 'all') { // 整页
            this.fullPage(id)
          } else { // 多题每页
            this.handlePageType(id)
          }
        }
      }
    },

    judgeCorrect(subItem) {
      if (this.enable_practice && this.userAnswer?.length === 0) { // 练习情况
        // 答题没有提交查看 默认
        if (subItem.answer?.length > 0 && !this.practiseRecordList.includes(subItem.question_id)) {
          return 'active'
        } else { // 提交后正确
          if (subItem.score === subItem.point) {
            return 'answer-active'
          } else { // 提交后错误
            if (this.practiseRecordList.includes(subItem.question_id)) {
              return 'active-error'
            }
            return
          }
        }
      }
      if (this.userAnswer?.length > 0) { // 考试情况
        let obj = this.userAnswer.find((item) => item.question_id === subItem.question_id)
        if (obj && obj.correct) { // 答题完成
          return 'answer-active'
        } else {
          return 'active-error'
        }
      } else {
        const flag = this.getSubQuestion.some((item) => item.question_id === subItem.question_id && item.answer?.length > 0)
        if (flag) { // 正常答题
          return 'active'
        }
      }
    }
  }
}
</script>
<style lang="less">
.SubjectContent {
  .title {
    text-align: left;
    padding: 0 16px;
    color: #333;
    font-weight: 500;
    font-size: 16px;
    span{
      color: #666;
      font-weight: 400;
    }
  }
  .radio-box {
    display: flex;
    flex-wrap: wrap;
    padding: 16px 16px 30px;
    .default {
      color: white;
      margin-right: 20px;
      position: relative;
      .radio-circle {
        width: 24px;
        height: 24px;
        background: #dcdcdc;
        text-align: center;
        line-height: 24px;
        font-family: TTTGBMedium;
        font-size: 12px;
        font-weight: 500;
      }
    }
    .default:nth-child(8n) {
      margin-right: unset;
    }
    .mg-tp {
      margin-top: 20px;
    }
    .active {
      .radio-circle {
        background-color: @color-theme;
      }
    }
    .answer-active{
      .radio-circle{
        background-color: @color-info;
      }
    }
    .active-error {
      .radio-circle {
        background-color: @color-hint;
      }
    }
  }
  .flag-box{
    position: absolute;
    top: 24px;
    img{
      width: 12px;
      height: 12px;
    }
  }
}
</style>
