<template>
  <div class="pagination-control-button">
    <div class="btn" @click="showSituationPopup">答题卡</div>
    <div
      v-if="paperShowType === 'page'"
      :class="['btn', {'forbid': isFisrtQuestion}]"
      @click="prev">
      上一题
    </div>
    <div
      v-if="paperShowType === 'page' && !isLastQuestion || useScene === 'analysis'"
      :class="['btn', 'next', {'forbid': isLastQuestion}]"
      @click="next">
      下一题
    </div>
    <div v-else class="btn submit" @click="submit">提交试卷</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { examStore } from '@/store/index';

const store = examStore()

const emit = defineEmits(['showSituationPopup', 'submitTips'])

const props = defineProps({
  // 使用场景（答题面板、分析面板）
  useScene: {
    type: String,
    default: 'answer'
  }
})

// 题目是否分页显示 一页all 分页page
const paperShowType = computed(() => {
  const _info = props.useScene === 'answer' ? store.examInfo : store.examResultInfo
  return _info?.setting?.paper_setting?.paper_show_type
})
// 只看错题 解析页才使用
const onlyShowWrong = computed(() => {
  return store.examResultInfo?.switch_only_look_wrong
})
// 题目列表
const questionList = computed(() => {
  const answerList = onlyShowWrong.value ? store.getExamAnswerList.filter((item: any) => !item.correct) : store.getExamAnswerList
  return props.useScene === 'answer' ? store.getExamQuestionList : answerList
})
// 是否为第一题
const isFisrtQuestion = computed(() => {
  return store.currentQuestionIndex === 0
})
// 是否为最后一题
const isLastQuestion = computed(() => {
  return store.currentQuestionIndex === questionList.value.length - 1
})

// 答题卡
const showSituationPopup = () => {
  console.log('弹出')
  emit('showSituationPopup')
}
// 上一题
const prev = () => {
  const _index = store.currentQuestionIndex - 1
  store.$patch((state: any) => {
    state.currentQuestionIndex = _index
  })
}
// 下一题
const next = () => {
  const _index = store.currentQuestionIndex + 1
  store.$patch((state: any) => {
    state.currentQuestionIndex = _index
  })
}
// 提交答案 主动提交传false
const submit = () => {
  emit('submitTips', false)
}
</script>

<style lang="less" scoped>
.pagination-control-button {
  height: 100%;
  background: #fff;
  border-top: 1px solid #dcdcdc;
  color: #666;
  font-size: 17px;
  display: flex;
  .btn {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    &:not(:last-of-type) {
      border-right: 1px solid #f2f2f2;
    }
  }
  .forbid {
    color: #acacac;
    background: #f2f2f2;
    pointer-events: none;
  }
  .next, .submit {
    color: #fff;
    background: #3464e0;
  }
}
</style>
