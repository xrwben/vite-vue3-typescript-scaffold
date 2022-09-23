<template>
  <div
    :class="[
      getAnalysisList && getAnalysisList.length > 0 ? '' : 'mg-bt',
      ,
      'essay-container',
    ]"
  >
    <div
      class="analysis-content"
      v-if="getAnalysisList && getAnalysisList.length > 0 || isPractise"
      v-html="initData.choiceValue"
    ></div>
    <van-field
      v-else
      v-model="initData.choiceValue"
      autosize
      rows="4"
      type="textarea"
      placeholder="请输入内容"
      show-word-limit
      @blur="changeValue(initData.choiceValue)"
    />
  </div>
</template>
<script>
import { mapMutations, mapGetters } from 'vuex'
export default {
  name: 'EssayQuestion',
  props: {
    // list: {
    //   type: Array,
    //   default: () => ([])
    // },
    id: { // 此处id用来做判断，不能动
      type: String,
      default: ''
    },
    initData: {
      type: Object,
      default: () => ({})
    },
    isPractise: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
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
    changeValue(val) {
      const list = this.getExamResult
      list?.contents?.length > 0 && list.contents.forEach(item => {
        item.sub_questions.forEach((ele) => {
          if (ele.question_id === this.id) {
            ele.answer = val ? [val] : []
            ele.choiceValue = val // 用于绑定
            // 计算练习得分
            if (ele.correct_answer?.length > 0) {
              ele.score = val === ele.correct_answer[0] ? ele.point : 0
            }
          }
        })
      })
      this.EXAM_RESULT(list) // 更新所有数据
      // 存用户答题的所有数据
      const info = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`)) || {}
      if (info.examId) {
        const infoResult = {
          ...info,
          currentTime: new Date().getTime(),
          number: this.getExamNumber
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
.essay-container {
  // padding: 16px 0;
  .analysis-content {
    padding: 0 20px;
  }
  /deep/.van-cell__value {
    background: #fafafa;
    padding: 10px 16px;
  }
  /deep/ .van-cell {
    padding:unset;
    border-radius: 4px;
  }
}
</style>
