<template>
  <div class="question-type-panel" v-if="questionList.length">
    <div class="title">
      {{ title }} <span>(共{{ questionList.length }}题<span v-if="showQuestionScore">，合计{{ point }}分</span>)</span>
    </div>
    <div class="question-list">
      <div class="list-item" v-for="item in (questionList as any)" :key="item.question_id">
        <div class="rank" :class="statusClass(item)" @click="questionLocation(item.question_id)">{{ item.question_index + 1 }}</div>
        <!-- <sdc-svg-icon v-if="item.mark" name="star-fill" width="12px" height="12px"></sdc-svg-icon> -->
        <i class="mark" v-if="item.mark"></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { examStore } from '@/store/index';

const store = examStore()

const props = defineProps({
  // 类型名称
  title: {
    type: String,
    default: ''
  },
  // 合计分数
  point: {
    type: Number,
    default: 0
  },
  // 题目列表
  questionList: {
    type: Array,
    default: () => []
  },
  // 使用场景（答题面板、分析面板）
  useScene: {
    type: String,
    default: 'answer'
  }
})

// 只看错题 解析页才使用
const onlyShowWrong = computed(() => {
  return store.examResultInfo?.switch_only_look_wrong
})
// 题目排版类型（一页all 分页page）
const paperShowType = computed(() => {
  const _obj = props.useScene === 'answer' ? store.examInfo : store.examResultInfo
  return _obj?.setting?.paper_setting?.paper_show_type
})
// 是否显示每题分数
const showQuestionScore = computed(() => {
  const _obj = props.useScene === 'answer' ? store.examInfo : store.examResultInfo
  return _obj?.setting?.paper_setting?.show_question_score
})

// 定位到对应题目
const questionLocation = (questionId: string) => {
  console.log(paperShowType.value, questionId)
  const answerList = onlyShowWrong.value ? store.getExamAnswerList.filter((item: any) => !item.correct) : store.getExamAnswerList
  const allQuestionList = props.useScene === 'answer' ? store.getExamQuestionList : answerList
  if (paperShowType.value === 'all') {
    // 滚动容器 跟答题页的div id类名保持一直
    const examQuestionArea = document.querySelector('#exam-question-area') as HTMLDivElement
    const questionItem = document.querySelector('#question-' + questionId) as HTMLDivElement
    // console.log(parseInt(getComputedStyle(questionItem).marginTop))
    const _offsetTop = questionItem.offsetTop - parseInt(getComputedStyle(questionItem).marginTop)
    console.log(_offsetTop)
    examQuestionArea.scrollTo({
      top: _offsetTop,
      behavior: 'smooth'
    })
  } else {
    const questionIndex = allQuestionList.findIndex((item: any) => item.question_id === questionId)
    // console.log(questionIndex)
    store.$patch((state: any) => {
      state.currentQuestionIndex = questionIndex
    })
  }
}
// 题目索引类名判断
const statusClass = (item: any) => {
  if (props.useScene === 'analysis' && item.correct) {
    return 'correct'
  } else if (props.useScene === 'analysis' && !item.correct) {
    return 'wrong'
  } else if (item.answer && item.answer.length) {
    return 'finished'
  } else {
    return 'unfinished'
  }
}
</script>

<style lang="less" scoped>
.question-type-panel {
  .title {
    color: #333;
    font-size: 16px;
    font-weight: 500;
    & > span {
      color: #666;
      font-size: 14px;
    }
  }
  .question-list {
    display: flex;
    flex-wrap: wrap;
    padding: 16px 0 10px;
    .list-item {
      height: 42px;
      margin: 0 17px 10px 0;
      text-align: center;
      &:nth-child(8n) {
        margin-right: 0;
      }
      .rank {
        width: 28px;
        height: 28px;
        border: 1px solid #dcdcdc;
        border-radius: 2px;
        color: #333;
        font-size: 14px;
        line-height: 28px;
        overflow: hidden;
        cursor: pointer;
      }
      .finished {
        color: #fff;
        background: #3464e0;
        border-color: #3464e0;
      }
      .correct {
        color: #fff;
        background: #0ad0b6;
        border-color: #0ad0b6;
      }
      .wrong {
        color: #fff;
        background: #ff7548;
        border-color: #ff7548;
      }
      .mark {
        width: 12px;
        height: 12px;
        background: url("@/assets/svg/star-fill.svg") no-repeat center / 100% 100%;
        display: block;
        margin: 2px auto 0;
      }
    }
  }
}
</style>
