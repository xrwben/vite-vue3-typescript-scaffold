<template>
  <div class="judgement-question-container">
    <van-radio-group v-model="currentValue" :disabled="disabledEdit" @change="changeRaido">
      <van-radio
        v-for="item in optionList"
        :key="item.option_value"
        :name="item.option_value">
        <div class="option-text">
          {{ item.option_text }}
        </div>
      </van-radio>
    </van-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { examStore } from '@/store/index'

const store = examStore()

const props = defineProps({
  // 题目详情
  questionDetails: {
    type: Object,
    default: null
  },
  // 题目是否可编辑
  disabledEdit: {
    type: Boolean,
    default: true
  }
})

let currentValue = ref('')
currentValue.value = props.questionDetails.answer && props.questionDetails.answer[0]
// console.log(props.questionDetails)

const defaultList = reactive([ // 这里不用后端的数据，兼容处理后端导入数据options为空的问题
  { option_value: '1', option_text: '正确' },
  { option_value: '0', option_text: '错误' }
])
const optionList = computed(() => {
  if (store.examInfo?.options_out_order || store.examInfo?.setting?.options_out_order) {
    return props.questionDetails.options
  }
  return defaultList
})
// 是否显示练习结果
const isShowPracticeResult = computed(() => {
  return store.examInfo?.setting?.enable_practice && store.examInfo?.setting?.judge?.enabled
})

// 点击选择
const changeRaido = (val: string) => {
  if (val) {
    const list = store.examInfo
    list.contents.forEach((item: any) => {
      item.sub_questions.forEach((ele: any) => {
        if (ele.question_id === props.questionDetails.question_id) {
          ele.answer = [val]
          ele.choiceValue = val
          // 计算练习得分
          if (isShowPracticeResult.value && ele.correct_answer.length) {
            const isCorrect = ele.correct_answer.includes(val)
            ele.correct = isCorrect
            ele.score = isCorrect ? ele.point : 0
          }
        }
      })
    })
    // 更新考试信息
    // this.$store.commit('exam/saveExamInfo', list)
    store.$patch((state: any) => {
      localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(state.examInfo))
    })
  }
}
</script>

<style lang="less" scoped>
.judgement-question-container {
  margin-bottom: 16px;
  :deep(.van-radio-group) {
    width: 100%;
    .van-radio {
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      .van-radio__icon {
        font-size: 16px;
      }
      .van-radio__icon--checked .van-icon {
        border-color: #3464e0;
        background: #3464e0;
      }
    }
    .option-text {
      color: #333;
      font-size: 14px;
      line-height: 24px;
    }
  }
}
</style>
