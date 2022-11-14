<template>
  <div class="essay-container">
    <div
      v-if="disabledEdit"
      class="analysis-content"
      v-html="currentValue">
    </div>
    <van-field
      v-else
      class="answer-content"
      v-model.trim="currentValue"
      type="textarea"
      placeholder="请输入答案"
      @change="changeValue">
    </van-field>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { examStore } from '@/store/index';

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

const changeValue = () => {
  const list = store.examInfo
  list?.contents?.length > 0 && list.contents.forEach((item: any) => {
    item.sub_questions.forEach((ele: any) => {
      if (ele.question_id === props.questionDetails.question_id) {
        ele.answer = currentValue.value ? [currentValue.value] : []
        ele.choiceValue = currentValue.value
      }
    })
  })
  // 更新考试信息
  store.$patch((state: any) => {
    localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(state.examInfo))
  })
}
</script>

<style lang="less">
.essay-container {
  margin-bottom: 16px;
  position: relative;
  .analysis-content {
    min-height: 100px;
  }
  .analysis-content, .answer-content {
    min-height: 100px;
    background: #fafafa;
    border-radius: 6px;
    font-size: 16px;
    padding: 6px 8px;
    .van-field__body {
      height: 100%;
    }
    .van-field__control--min-height {
      min-height: 100%;
    }
  }
}
</style>
