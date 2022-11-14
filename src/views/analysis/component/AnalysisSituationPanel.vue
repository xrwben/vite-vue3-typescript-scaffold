<template>
  <van-popup
    class="analysis-situation-panel"
    v-model:show="visibleState"
    closeable
    close-icon-position="top-left"
    round
    position="bottom"
    :style="{ height: '75%' }"
    @close="close">
    <div class="panel-content">
      <div class="head">答题卡</div>
      <div class="container">
        <div class="status">
          <p><i class="correct"></i>正确({{ `${resulStatus.correctCount}题` }})</p>
          <p><i class="error"></i>错误({{ resulStatus.wrongCount }}题)</p>
          <p class="rate">正确率：<span>{{ resulStatus.correctRate }}</span></p>
        </div>
        <div class="question-category">
          <question-type-panel
            v-for="item in questionCategoryList"
            :key="item.question_name"
            :title="item.question_name"
            :point="item.point"
            :questionList="item.sub_questions"
            :useScene="'analysis'">
          </question-type-panel>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import QuestionTypePanel from '@/views/components/QuestionTypePanel.vue';
import { ref, computed, watch } from 'vue'
import { examStore } from '@/store/index';

const store = examStore()

const emit = defineEmits(['update:visible'])

const props = defineProps({
  visible: {
    type: Boolean,
    default: () => false
  }
})
let visibleState = ref(props.visible)

// 父组件使用v-if 则不需要watch监听props的变化
watch(props, (val) => {
  visibleState.value = val.visible
})

// 只看错题
const onlyShowWrong = computed(() => {
  return store.examResultInfo?.switch_only_look_wrong
})
// 正确、错误数、正确率
const resulStatus = computed(() => {
  const correctCount = store.getExamAnswerList.filter((item: any) => item.correct).length
  const wrongCount = store.getExamAnswerList.length - correctCount
  const correctRate = ((correctCount / store.getExamAnswerList.length) * 100).toFixed(2) + '%'
  return {
    correctCount,
    wrongCount,
    correctRate
  }
})
// 题目类型列表
const questionCategoryList = computed(() => {
  const deep_copy = (obj: any) => {
    let _obj: any = Array.isArray(obj) ? [] : {}
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        _obj[key] = deep_copy(obj[key])
      } else {
        _obj[key] = obj[key]
      }
    }
    return _obj
  }
  // 拷贝一份，当只看错题时删除对的数据
  let contents = deep_copy(store.examResultInfo).contents
  if (onlyShowWrong.value) {
    contents.forEach((item: any) => {
      item.sub_questions = item.sub_questions?.filter((item: any) => !item.correct)
    })
  }
  return contents
})

// 关闭弹窗
const close = () => {
  emit('update:visible', false)
}
</script>

<style lang='less' scoped>
.analysis-situation-panel {
  height: 75%;
  border-radius: 10px 10px 0 0;
  .panel-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .head {
    height: 50px;
    border-bottom: 1px solid #dcdcdc;
    color: #333;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    line-height: 50px;
  }
  .container {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    .status {
      color: #333;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      padding: 15px 0 20px;
      & > p {
        display: flex;
        align-items: center;
        & > i {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          margin-right: 6px;
        }
        .correct {
          background: #0ad0b6;
        }
        .error {
          background: #ff7548;
        }
      }
      .rate {
        & > span {
          color: #3464e0;
        }
      }
    }
  }
}
</style>
