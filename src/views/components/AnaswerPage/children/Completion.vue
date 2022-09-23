<template>
  <div
    :class="[
      getAnalysisList && getAnalysisList.length > 0 ? '' : 'mg-bt',
      ,
      'completion-container',
    ]"
  >
    <div
      v-for="(item, index) in list"
      :key="item.index"
      class="field-box"
    >
      <van-field
        v-model="item.choiceValue"
        :disabled="getAnalysisList && getAnalysisList.length > 0 || isPractise"
        :label="list.length === 1 ? '' : index + 1"
        placeholder="点击输入答案"
        @input="changeValue(item.choiceValue, index)"
      />
    </div>
  </div>
</template>
<script>
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'Completion',
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    id: { // 此处id用来做判断，不能动
      type: String,
      default: ''
    },
    isPractise: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      textList: []
    }
  },
  computed: {
    ...mapGetters([
      'getAnalysisList',
      'getName',
      'getExamResult',
      'getExamNumber'
    ])
  },
  methods: {
    ...mapMutations(['EXAM_RESULT']),
    changeValue(val, index) {
      this.getExamResult?.contents?.length > 0 && this.getExamResult.contents.forEach(item => {
        item.sub_questions.forEach((ele) => {
          if (ele.question_id === this.id) {
            this.textList = { ...this.textList, [index]: val, 'length': this.list.length }
            ele.answer = [].concat(Array.from(this.textList)).map((e) => { if (!e) { return '' } return e })
            // 计算练习得分
            if (ele.correct_answer?.length > 0) {
              let answerFlag = ''
              if (ele.allow_answer_out_order) { // 允许乱序
                const answerSelf = [...new Set(ele.answer)] // 过滤掉重复答案
                answerFlag = answerSelf.filter((e) => ele.correct_answer.includes(e))
              } else {
                answerFlag = ele.answer.filter((e, i, arr) => ele.correct_answer[i] === arr[i])
              }
              const pScore = ele.point / this.list.length * answerFlag?.length
              // 全部回答正确，全部回答错误
              ele.score = answerFlag.length === ele.correct_answer.length ? ele.point : 
                answerFlag.length === 0 ? 0 : Number.isInteger(pScore) ? pScore : pScore.toFixed(1)
            }
            ele.options.forEach((v, i) => {
              if (index === i) {
                v.choiceValue = val
              }
            })
          }
        })
      })
      this.EXAM_RESULT(this.getExamResult) // 更新所有数据
      // 存用户答题的所有数据
      const info = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`)) || {}
      if (info.examId) {
        const infoResult = {
          ...info,
          number: this.getExamNumber,
          currentTime: new Date().getTime()
        }
        localStorage.setItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`, JSON.stringify(infoResult))
      }
    }
  }
}
</script>
<style lang="less" scoped>
// .mg-bt {
//   margin-bottom: 50px;
// }
.completion-container {
  // padding: 16px 0;
  .field-box {
    padding: 0px 16px;
    margin-bottom: 10px;
    /deep/ .van-cell {
      background: #fafafa;
      // padding: 10px 16px;
      padding:unset;
      border-radius: 4px;
    }
    /deep/.van-field__label {
      width: unset;
      color: black;
    }
    /deep/.van-field__control {
      color: #999999;
    }
    // /deep/.van-field__label {
    //   span::after {
    //     width: 1px;
    //     color: black;
    //   }
    // }
  }
}
</style>
