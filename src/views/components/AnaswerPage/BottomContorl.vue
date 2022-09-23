<template>
  <div class="bottom-btn">
    <!-- 整页 -->
    <div v-if="paper_show" class="btn-box d-a">
      <div class="item-btn" @click="popupClick"><span>查看答题卡</span></div>
      <div @click="submit" v-if="getAnalysisList.length === 0" class="item-btn last-btn"> <span>提交试卷</span></div>
    </div>
    <!-- 逐题 -->
    <div V-else class="btn-box d-a">
      <div class="item-btn" @click="popupClick"><span>答题卡</span></div>
      <div :class="[this.number === 0 ? 'disableBtn': '','item-btn','second-btn']"  @click="upperSubject"><span>{{this.pageSizeNum > 1 ? '上一页' : '上一题'}}</span></div>
      <div v-if="isCheckAnalysis" @click="handleCheckAnalysis" class="item-btn last-btn"><span>提交本题</span></div>
      <div v-else-if="(this.number === resetNum ||  this.number === this.pageSize - 1) && getAnalysisList.length === 0" @click="submit" class="item-btn last-btn"> <span>提交试卷</span></div>
      <div v-else :class="[this.number === resetNum || this.number === this.pageSize - 1 ? 'disableBtn': '','item-btn', 'last-btn']" @click="nextSubject"><span>{{pageSizeNum>1 ? '下一页':'下一题'}}</span></div>
    </div>
  </div>
</template>
<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    answerOneShow: { // 答案详情--逐题查看
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: ''
    },
    resetList: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {
      number: 0,
      pageNum: 0
    }
  },
  computed: {
    ...mapGetters([
      'getSubQuestion',
      'getAnalysisList',
      'getExamNumber',
      'getQuestionItem',
      'getPageSet'
    ]),
    ...mapState(['practiseRecordList']),
    answeredList() {
      // 已答题数
      return this.getSubQuestion?.length > 0 && this.getSubQuestion.filter((item) => item.answer?.length > 0)
    },
    isCheckAnalysis() { // 答案详情来不需要展示--提交本题按钮
     const answerList = (this.getQuestionItem?.answer || []).filter((e) => e)
     return this.type ? false : this.getPageSet?.enable_practice && this.getPageSet?.judge.enabled && 
     !this.practiseRecordList.includes(this.getQuestionItem?.question_id) && answerList?.length > 0
    },
    paper_show() {
      return this.type ? !this.answerOneShow : this.getPageSet?.paper_setting?.paper_show_type === 'all'
    },
    pageSizeNum() {
      return this.getPageSet?.paper_setting?.page_size
    },
    pageSize() {
      return Math.ceil(this.getSubQuestion.length / this.getPageSet?.paper_setting?.page_size)
    },
    resetNum() {
      return this.type ? this.resetList.length - 1 : this.getSubQuestion.length - 1
    }
  },
  watch: {
    getExamNumber(val) {
      this.number = val
    }
  },
  mounted() {
    // 页面刷新取值
    this.number = this.getExamNumber
  },
  methods: {
    ...mapMutations(['EXAM_NUMBER', 'PRACTISE_RECORD']),
    // 上一题
    upperSubject() {
      if (this.number === 0) {
        return
      }
      this.number--
      this.EXAM_NUMBER(this.number)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    // 下一题
    nextSubject() {
      if (this.number === this.resetNum || this.number === this.pageSize - 1) { // 最后一题
        return
      }
      this.number++
      this.EXAM_NUMBER(this.number)
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    submit() {
      this.$emit('tipsClick') // 交卷提示
    },
    popupClick() {
      this.$emit('popupClick')
    },
    // 查看解析
    handleCheckAnalysis() {
      this.practiseRecordList.push(this.getQuestionItem.question_id)
      this.PRACTISE_RECORD(this.practiseRecordList)
    }
  }
}
</script>
<style lang="less" scoped>
.bottom-btn {
  width: 100%;
  height: 48px;
  line-height: 48px;
  position: fixed;
  bottom: 0px;
  background: #fff;
  border-top: 1px solid #DCDCDC;
  // padding: 10px 16px;
  box-sizing: border-box;
  .item-btn {
    flex:1;
    text-align: center;
    color:#666666;
    font-size: 17px;
    font-family: "PingFang SC";
  }
  .second-btn {
    border-left: 1px solid #DCDCDC;
    border-right: 1px solid #DCDCDC;
  }
  .last-btn {
    background: @color-theme;
    color: white;
  }
  .disableBtn {
    background:#DCDCDC;
    color:#ACACAC;
    cursor: not-allowed;
  }
  // .btn-box {
  //   padding: 0 20px
  // }
  // .btn-answer {
  //   img {
  //     width: 24px;
  //     height: 24px;
  //   }
  //   span {
  //     font-size: 14px;
  //   }
  // }
  // .van-button {
  //   width: 108px;
  //   height: 30px;
  // }
  // .van-button--plain {
  //   margin-right: 15px;
  // }
}
</style>
