<template>
  <div
    :class="[
      getAnalysisList && getAnalysisList.length > 0 ? '' : 'mg-bt',
      'judgement-container',
    ]"
  >
    <!-- 答题回显 -->
    <div v-if="(getAnalysisList && getAnalysisList.length > 0) || isPractise">
      <div
        class="answer-group"
        v-for="ele in optionList"
        :key="ele.option_title"
      >
        <div class="group-box">
          <div class="d-a radio-icon-text">
            <span :class="[handleName(ele.option_value, 'iconBg')]">
              <van-icon
                :class="[handleName(ele.option_value, 'iconBg')]"
                :name="handleName(ele.option_value)"
                size="22"
            /></span>
            <span class="item-text">{{ ele.option_text }}</span>
          </div>
        </div>
      </div>
    </div>
    <van-radio-group
      v-else
      v-model="initData.choiceValue"
      @change="choiceClick"
      :disabled="getAnalysisList && getAnalysisList.length > 0"
    >
      <van-radio
        v-for="item in optionList"
        :key="item.option_value"
        class="default-value"
        :checked-color="color"
        :name="item.option_value"
      >
        {{ item.option_text }}
      </van-radio>
    </van-radio-group>
  </div>
</template>
<script>
import { mapMutations, mapGetters } from 'vuex'
import { THEME_COLOR } from 'utils/constant'
export default {
  name: 'JudgmentQuestion',
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
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
      color: THEME_COLOR,
      defaultList: [ // 这里不用后端的数据，兼容处理后端导入数据options为空的问题
        {
          option_value: '1',
          option_text: '正确'
        },
        {
          option_value: '0',
          option_text: '错误'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'getAnalysisList',
      'getName',
      'getExamResult',
      'getExamNumber',
      'getQuestionItem'
    ]),
    optionList() {
      if (this.getExamResult?.options_out_order || this.getExamResult?.setting?.options_out_order) {
        return this.list
      }
      return this.defaultList
    }
  },
  methods: {
    ...mapMutations(['EXAM_RESULT']),
    choiceClick(val) {
      if (val) {
        const list = this.getExamResult
        list?.contents?.length > 0 && list.contents.forEach(item => {
          item.sub_questions.forEach((ele) => {
            if (ele.question_id === this.id) {
              ele.answer = [val]
              ele.choiceValue = val // 用于绑定
              // 练习计算得分
              const correctAnswer = ele?.correct_answer?.length > 0 && ele?.correct_answer[0]
              ele.score = val === correctAnswer ? ele.point : 0
            }
          })
        })
        this.EXAM_RESULT(list)
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
    },
    handleName(val, stringLabel) {
      let color = ''
      let choiceList = []
       if (this.isPractise) {
        choiceList = this.getQuestionItem?.answer?.length > 0 ? this.getQuestionItem?.answer : [] // 用户的答案
      } else {
        const data = this.getAnalysisList.find((e) => e.question_id === this.id) // 用户的答案
        choiceList = data?.answer 
      }
      if (choiceList?.includes(val)) { // 展示用户选择
        color = stringLabel ? `checked-${stringLabel}` : 'checked'
      } else {
        color = stringLabel ? `circle-${stringLabel}` : 'circle'
      }
      return color
    }
  }
}
</script>
<style lang="less" scoped>
// .mg-bt {
//   margin-bottom: 50px;
// }
.judgement-container {
  // padding: 16px 0;
  // .choice-content {
  //   line-height: 60px;
  // }
  .default-value {
    padding-top: 12px;
  }
  .choice_bg {
    background: #ebf0fb;
  }
  /deep/.van-radio__icon--disabled .van-icon {
    color: #fff;
    background-color: #fff;
  }
  /deep/.van-radio__icon--checked .van-icon {
    background-color: #3464e0;
    border-color: #3464e0;
  }
  /deep/.van-radio__label--disabled {
    color: #333;
  }
  .answer-group {
    .group-box {
      .radio-icon-text {
        padding-top: 12px;
      }
      .item-text {
        margin-left: 10px;
        line-height: 16px;
        word-break: break-all;
      }
    }
    .reset-img-box {
      text-align: center;
      padding-bottom: 20px;
    }
  }
  .checked-iconBg {
    color: @color-theme;
  }
  .checked-boxBg {
    background: #ebf0fb;
  }
  .circle-iconBg {
    color: #c8c9cc;
  }
}
</style>
