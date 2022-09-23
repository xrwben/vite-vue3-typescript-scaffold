<template>
  <div class="question-category-card">
    <div class="head">
      <div class="title">
        <i :class="['type', 'question-type-'+questionType]"></i>
        <span class="rank">{{ questionInfo.question_index + 1 }}.</span>
        <div class="text" v-html="questionInfo.question_text"></div>
        <span class="score" v-if="showQuestionScore">({{ `${questionInfo.point}分` }})</span>
      </div>
    </div>
    <!-- 图片示例 -->
    <div class="example-img" v-if="questionInfo.questionImgList && questionInfo.questionImgList.length">
      <span class="tips">示例</span>
      <div class="img-con">
        <img
          class="pic"
          :src="item"
          v-for="(item, index) in questionInfo.questionImgList"
          :key="index"
          @click="previewImg(item)">
      </div>
    </div>
    <!-- 单选题 -->
    <single-choice
      v-if="questionInfo.question_type === '1'"
      :questionDetails="questionInfo"
      :disabledEdit="disabledEdit">
    </single-choice>
    <!-- 多选题 -->
    <multiple-choice
      v-if="questionInfo.question_type === '2'"
      :key="questionInfo.question_id"
      :questionDetails="questionInfo"
      :disabledEdit="disabledEdit">
    </multiple-choice>
    <!-- 判断题 -->
    <judgment-question
      v-if="questionInfo.question_type === '3'"
      :questionDetails="questionInfo"
      :disabledEdit="disabledEdit">
    </judgment-question>
    <!-- 填空题 -->
    <completion-question
      v-if="questionInfo.question_type === '4'"
      :questionDetails="questionInfo"
      :disabledEdit="disabledEdit">
    </completion-question>
    <!-- 问答题 -->
    <essay-question
      v-if="questionInfo.question_type === '5'"
      :key="questionInfo.question_id"
      :questionDetails="questionInfo"
      :disabledEdit="disabledEdit">
    </essay-question>
    <div class="foot">
      <div class="mark" @click="mark" v-if="useScene==='answer'">
        <img v-if="questionInfo.mark" src="@/assets/svg/star-fill.svg" alt="">
        <img v-else src="@/assets/svg/star.svg" alt="">
        <span class="txt">标记一下</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SingleChoice from './SingleChoice.vue'
import MultipleChoice from './MultipleChoice.vue'
import JudgmentQuestion from './JudgmentQuestion.vue'
import CompletionQuestion from './CompletionQuestion.vue'
import EssayQuestion from './EssayQuestion.vue'
import { ImagePreview } from 'vant';

import { examStore } from '@/store/index'

const store = examStore()

const props = defineProps({
  // 题目详情
  questionInfo: {
    type: Object,
    default: null
  },
  // 使用场景 (answer、analysis) 解析页不显示标记功能
  useScene: {
    type: String,
    default: 'answer'
  }
})

// 类型
const questionType = computed(() => {
  const type = Number(props.questionInfo.question_type)
  // return ['单选题', '多选题', '判断题', '填空题', '问答题', '编程题', '组合题'][type - 1]
  return ['single', 'multiple', 'judgment', 'completion', 'essay', 'code', 'combination'][type - 1]
})
// 是否显示题目具体分数
const showQuestionScore = computed(() => {
  const _obj = props.useScene === 'answer' ? store.examInfo : store.examResultInfo
  return _obj?.setting?.paper_setting?.show_question_score
})
// 题目能否编辑  在答题解析或者练习题目加了viewedResult属性时不能答题
const disabledEdit = computed(() => {
  return props.useScene === 'analysis' || !!props.questionInfo.viewedResult
})

// 实例图片预览
const previewImg = (url: string) => {
  ImagePreview({
    images: [url],
    showIndex: false,
    loop: false
  });
}

// 标记
const mark = () => {
  store.examInfo.contents.forEach((item: any) => {
    item.sub_questions.forEach((subItem: any) => {
      if (subItem.question_id === props.questionInfo.question_id) {
        // this.$set(subItem, 'mark', !this.questionInfo.mark)
        subItem.mark = !props.questionInfo.mark
      }
    })
  })
  // store数据已修改 但还要提交目的是为了调用saveExamInfo方法时在localStorage中更新
  // this.$store.commit('exam/saveExamInfo', this.examInfo)
  store.$patch((state: any) => {
    console.log(state)
    // state.examInfo = mergeDate || null
    localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(state.examInfo))
  })
}
</script>

<style lang="less" scoped>
.question-category-card {
  background: #fff;
  padding: 16px;
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    .title {
      color: #333;
      font-size: 16px;
      line-height: 24px;
      .type {
        width: 44px;
        height: 18px;
        display: inline-block;
        vertical-align: text-bottom;
        &.question-type-single {
          background: url('@/assets/svg/question-type-single.svg') no-repeat center / 100% 100%;
        }
        &.question-type-multiple {
          background: url('@/assets/svg/question-type-multiple.svg') no-repeat center / 100% 100%;
        }
        &.question-type-judgment {
          background: url('@/assets/svg/question-type-judgment.svg') no-repeat center / 100% 100%;
        }
        &.question-type-completion {
          background: url('@/assets/svg/question-type-completion.svg') no-repeat center / 100% 100%;
        }
        &.question-type-essay {
          background: url('@/assets/svg/question-type-essay.svg') no-repeat center / 100% 100%;
        }
        &.question-type-code {
          background: url('@/assets/svg/question-type-code.svg') no-repeat center / 100% 100%;
        }
        &.question-type-combination {
          background: url('@/assets/svg/question-type-combination.svg') no-repeat center / 100% 100%;
        }
      }
      .rank {
        margin: 0px 4px 0 8px;
      }
      :deep(.text) {
        display: inline;
        word-break: break-all;
        p {
          display: inline;
        }
        img {
          display: none;
        }
      }
      .score {
        color: #999;
        margin-left: 8px;
      }
    }
  }
  .example-img {
    display: flex;
    margin-bottom: 20px;
    .tips {
      width: 45px;
      font-size: 16px;
      text-align: center;
      flex-shrink: 0;
    }
    .img-con {
      display: flex;
      flex-wrap: wrap;
      .pic {
        width: 200px;
        height: 120px;
        border-radius: 4px;
        margin: 0 10px 10px 0;
      }
    }
  }
  .foot {
    display: flex;
    justify-content: flex-end;
    .mark {
      display: flex;
      align-items: center;
      cursor: pointer;
      & > img {
        width: 20px;
        height: 20px;
      }
      .txt {
        color: #999;
        font-size: 14px;
        margin-left: 6px;
      }
    }
  }
}
</style>
