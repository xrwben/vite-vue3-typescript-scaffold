<template>
  <div class="completion-question-container">
    <div class="field-input" v-for="(item, index) in optionList" :key="item.index">
      <van-field
        v-model.trim="item.option_value"
        placeholder="点击输入答案"
        :label="index + 1"
        :disabled="disabledEdit"
        @change="changeValue(item.option_value, index)">
      </van-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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
const questionDetails = ref(props.questionDetails)
// console.log(questionDetails.value)

let optionList = ref<any>([])
if (questionDetails.value.answer) {
  questionDetails.value.options.forEach((item: any, index: number) => {
    item.option_value = questionDetails.value.answer[index]
  })
}
optionList.value = questionDetails.value.options

// 是否显示练习结果
const isShowPracticeResult = computed(() => {
  return store.examInfo?.setting?.enable_practice && store.examInfo?.setting?.judge?.enabled
})

const changeValue = (val: string, index: number) => {
  console.log(1232, val, index)
  const list = store.examInfo
  list?.contents?.length && list.contents.forEach((item: any) => {
    item.sub_questions.forEach((ele: any) => {
      if (ele.question_id === props.questionDetails.question_id) {
        ele.options[index].option_value = val
        // 过滤出填写的值
        const answerArr = optionList.value.map((item: any) => {
          return item.option_value || ''
        })
        /* 优化
          原因：答题状态是否完成仅根据是否有answer.length判断，而上面answerArr只要change必定有空值且答题状态为已答题
          方案：判断存不存在一个不为空的值，如果不存在则返回空数组，否则其它没填写的答案填充为空字符串
        */
        const isSome = answerArr.some((item: string) => item.length)
        ele.answer = isSome ? answerArr : []
        // 计算练习得分
        if (isShowPracticeResult.value && ele.correct_answer.length) {
          let correctArr = []
          if (ele.allow_answer_out_order) { // 允许乱序
            const answerSelf = [...new Set(ele.answer)] // 过滤掉重复答案
            correctArr = answerSelf.filter((item) => ele.correct_answer.includes(item))
          } else {
            correctArr = ele.answer.filter((e: string, i: number, arr: string[]) => ele.correct_answer[i] === arr[i])
          }
          // 计算答对分数
          const pScore = ele.point / optionList.value.length * correctArr.length
          // 全部回答正确，全部回答错误
          ele.correct = correctArr.length === ele.correct_answer.length
          ele.score = correctArr.length === ele.correct_answer.length ? ele.point :
            correctArr.length === 0 ? 0 : Number.isInteger(pScore) ? pScore : pScore.toFixed(1)
        }
      }
    })
  })
  // 更新考试信息
  store.$patch((state: any) => {
    localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(list))
  })
}

</script>

<style lang="less" scoped>
.completion-question-container {
  margin-bottom: 16px;
  .field-input {
    margin-bottom: 12px;
    :deep(.van-cell) {
      background: #fafafa;
      border-radius: 6px;
      padding: 5px 8px;
      .van-field__label {
        width: auto;
      }
    }
  }
}
</style>
