<template>
  <div class="analysis-container" v-if="examResult">
    <!-- 分页错题控制面板 -->
    <analysis-control-panel></analysis-control-panel>
    <!-- 题目列表 -->
    <div id="exam-question-area" class="exam-con">
      <div class="question-item" v-for="item in currentPageQuestionList" :id="`question-${item.question_id}`" :key="item.question_id">
        <question-category-card :question-info="item" :use-scene="'analysis'"></question-category-card>
        <answer-analysis-card :analysis-info="item"></answer-analysis-card>
      </div>
    </div>
    <!-- 底部控制按钮 -->
    <div class="footer-button">
      <pagination-contorl-button
        useScene="analysis"
        @show-situation-popup="showSituationPopup">
      </pagination-contorl-button>
    </div>
  </div>
  <van-empty v-else description="暂无数据"></van-empty>

  <!-- 答题状态面板弹窗 注:添加v-if是为了让子组件每次能监听到数据流的变化而不需用watch -->
  <analysis-situation-panel v-model:visible="isShowSituationPopup"></analysis-situation-panel>
</template>

<script setup lang="ts">
import AnalysisControlPanel from './component/AnalysisControlPanel.vue'
import QuestionCategoryCard from '../components/questionCategory/QuestionCategoryCard.vue'
import AnswerAnalysisCard from '../components/AnswerAnalysisCard.vue';
import PaginationContorlButton from '../components/PaginationContorlButton.vue';
import AnalysisSituationPanel from './component/AnalysisSituationPanel.vue';
import { reactive, toRefs, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { examStore } from '@/store/index'
import { getExamAnalysisAPI } from '@/api/index'

const route = useRoute()
const store = examStore()

const state = reactive({
  examResult: null,
  isShowSituationPopup: false
})
const { examResult, isShowSituationPopup } = toRefs(state)

// 只看错题
const onlyShowWrong = computed(() => {
  return store.examResultInfo?.switch_only_look_wrong
})
// 题目是否分页显示 一页all 分页page
const paperShowType = computed(() => {
  return store.examResultInfo?.setting?.paper_setting?.paper_show_type
})
// 当前页题目列表
const currentPageQuestionList = computed(() => {
  let questionArr = []
  let allQuestionList = store.getExamAnswerList
  if (onlyShowWrong.value) {
    allQuestionList = allQuestionList.filter((item: any) => !item.correct)
  }
  if (paperShowType.value === 'all') {
    questionArr = allQuestionList
  } else {
    questionArr.push(allQuestionList[store.currentQuestionIndex])
  }
  return questionArr
})


onMounted(() => {
  getExamAnalysis()
})

// 获取答案解析
const getExamAnalysis = () => {
  const record_id = route.query.record_id as string
  getExamAnalysisAPI({ record_id }).then((res: any) => {
    const { code, data, success } = res
    if (code === '200' && success) {
      const { contents, user_answers } = data
      let question_index = 0
      contents.forEach((item: any) => {
        item.sub_questions.forEach((q: any) => {
          q.question_index = question_index++
          user_answers.forEach((a: any) => {
            if (q.question_id === a.question_id) {
              Object.assign(q, a)
            }
          })
        })
      })
    }
    state.examResult = data
    store.$patch((state: any) => {
      state.examResultInfo = data
      state.currentQuestionIndex = 0
    })
  })
}
// 考试状态面板弹窗
const showSituationPopup = () => {
  isShowSituationPopup.value = true
}
</script>

<style lang="less" scoped>
.analysis-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .exam-con {
    flex: 1;
    padding: 0 16px;
    overflow: auto;
    position: relative;
    .question-item {
      margin: 16px auto;
    }
  }
  .footer-button {
    width: 100%;
    height: 48px;
    background: #ccc;
  }
}
</style>
