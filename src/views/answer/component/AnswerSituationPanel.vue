<template>
  <van-popup
    class="answer-situation-panel"
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
          <p><i class="unfinished"></i>未作答</p>
          <p><i class="finished"></i>已作答</p>
          <p><i class="flag"></i>标记</p>
        </div>
        <div class="question-category">
          <question-type-panel
            v-for="item in questionCategoryList"
            :key="item.question_name"
            :title="item.question_name"
            :point="item.point"
            :questionList="item.sub_questions"
            :useScene="'answer'">
          </question-type-panel>
        </div>
      </div>
      <div class="foot">
        <p class="progress">答题进度：<span>{{ answeredList.length }}</span> / {{ store.getExamQuestionList.length }}</p>
        <p :class="['state', !unansweredNumber ? 'finished' : 'unfinished']">
          <i></i>{{ !unansweredNumber ? '已全部作答' : `剩余${unansweredNumber}题未作答` }}
        </p>
        <div class="btn" @click="submit">提交</div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import QuestionTypePanel from '@/views/components/QuestionTypePanel.vue';
import { ref, computed, watch } from 'vue'
import { examStore } from '@/store/index';

const store = examStore()

const emit = defineEmits(['update:visible', 'submitTips'])

const props = defineProps({
  visible: {
    type: Boolean,
    default: () => false
  }
})
let visibleState = ref(props.visible)

// 父组件使用v-if 则不需要watch监听props的变化
watch(props, (val) => {
  console.log(val)
  visibleState.value = val.visible
})

// 题目类型分类列表
const questionCategoryList = computed(() => {
  return store.examInfo.contents
})
// 已作答问题列表
const answeredList = computed(() =>  {
  return store.getExamQuestionList.filter((item: any) => item.answer?.length > 0)
})
// 未作答题目数量
const unansweredNumber = computed(() => {
  return store.getExamQuestionList.length - answeredList.value.length
})

// 关闭弹窗
const close = () => {
  emit('update:visible', false)
}
// 提交试卷
const submit = () => {
  emit('submitTips', false)
  close()
}
</script>

<style lang='less' scoped>
.answer-situation-panel {
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
      padding: 15px 0 20px;
      & > p {
        display: flex;
        align-items: center;
        margin-right: 32px;
        & > i {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          margin-right: 8px;
        }
        .unfinished {
          background: #fff;
          border: 1px solid #dcdcdc;
        }
        .finished {
          background: #3464e0;
        }
        .flag {
          background: #ffa940;
        }
      }
    }
  }
  .foot {
    height: 48px;
    background: #fff;
    border-top: 1px solid #dcdcdc;
    font-size: 14px;
    display: flex;
    padding-left: 16px;
    align-items: center;
    .progress {
      color: #333;
      & > span {
        color: #3464e0;
      }
    }
    .state {
      flex: 1;
      padding: 0 10px;
      display: flex;
      align-items: center;
      & > i {
        width: 20px;
        height: 20px;
      }
      &.finished {
        color: #0ad0b6;
        & > i {
          background: url("@/assets/svg/tips-line.svg") no-repeat center / 100%  100%;
        }
      }
      &.unfinished {
        color: #ff7548;
        & > i {
          background: url("@/assets/svg/tips-line.svg") no-repeat center / 100%  100%;
        }
      }
    }
    .btn {
      width: 80px;
      height: 100%;
      color: #fff;
      font-size: 17px;
      background: #3464e0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
