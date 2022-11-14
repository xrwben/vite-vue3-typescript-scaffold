<template>
  <div class="answer-container" v-if="store.examInfo">
    <!-- 答题进度 -->
    <progress-panel @submit-tips="submitTipsPopup"></progress-panel>
    <!-- 题目列表 -->
    <div id="exam-question-area" class="exam-con">
      <div :id="`question-${item.question_id}`" class="question-item" v-for="item in currentPageQuestionList" :key="item.question_id">
        <question-category-card :question-info="item" :use-scene="'answer'"></question-category-card>
        <!--练习试卷 和 答案解析 -->
        <div v-if="isShowPracticeAnalysisBtn">
          <div class="check-analysis-btn">
            <p class="split-line"></p>
            <span @click="checkAnalysis(item)">查看答案解析</span>
          </div>
          <!-- 题目有viewedResult属性表示查看了答案 -->
          <answer-analysis-card v-if="item.viewedResult" :analysis-info="item"></answer-analysis-card>
        </div>
      </div>
      <!-- 背景小logo -->
      <div v-if="logoSrc" class="logo">
        <img :src="logoSrc" alt="背景logo">
      </div>
    </div>
    <!-- 底部控制按钮 -->
    <div class="footer-button">
      <pagination-contorl-button
        useScene="answer"
        @show-situation-popup="showSituationPopup"
        @submit-tips="submitTipsPopup">
      </pagination-contorl-button>
    </div>
  </div>
  <!-- <van-empty
    v-else
    description="暂无数据">
  </van-empty> -->

  <!-- 答题状态面板弹窗 注:添加v-if是为了让子组件每次能监听到数据流的变化而不需用watch -->
  <answer-situation-panel
    v-model:visible="isShowSituationPopup"
    @submit-tips="submitTipsPopup">
  </answer-situation-panel>
  <!-- 交卷提示 -->
  <submit-tips-dialog
    v-model:visible="isShowSubmitTipsDialog"
    @submit="submit">
  </submit-tips-dialog>
  <!-- 倒计时强制提交提示 -->
  <forced-sumbit-dialog
    v-if="isShowForcedSubmitDialog"
    v-model:visible="isShowForcedSubmitDialog"
    @submit="submit">
  </forced-sumbit-dialog>
  <!-- 切屏和中断提示 -->
  <anti-cheat-tips-dialog
    v-if="leaveDialog"
    v-model:visible="leaveDialog"
    :title="'切屏警告'"
    :tips-content="leaveTipsContent">
  </anti-cheat-tips-dialog>
  <anti-cheat-tips-dialog
    v-if="breakDialog"
    v-model:visible="breakDialog"
    :title="'考试中断警告'"
    :tips-content="breakTipsContent">
  </anti-cheat-tips-dialog>
  <!-- 添加水印 -->
  <!-- <Watermark :id-name="idName" /> -->
</template>

<script setup lang="ts">
import { ref, reactive, toRefs, computed, onMounted } from 'vue';
import ProgressPanel from './component/ProgressPanel.vue'
import QuestionCategoryCard from '../components/questionCategory/QuestionCategoryCard.vue'
import AnswerAnalysisCard from '../components/AnswerAnalysisCard.vue';
import PaginationContorlButton from '../components/PaginationContorlButton.vue';
import AnswerSituationPanel from './component/AnswerSituationPanel.vue';
import SubmitTipsDialog from './component/SubmitTipsDialog.vue';
import ForcedSumbitDialog from './component/ForcedSubmitDialog.vue'
import AntiCheatTipsDialog from './component/AntiCheatTipsDialog.vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import { Dialog, Toast } from 'vant';
import { examStore } from '@/store/index'
import { saveAnswerAPI } from '@/api/index'
import { forbidHideScreen, removeHideScreen, forbidCopyPaste, removeCopyPaste } from '@/utils/anti-cheating.js'

const route = useRoute()
const router = useRouter()
const store = examStore()

// 是否显示提交弹窗
let isShowSubmitTipsDialog = ref(false)
// 是否显示强制提交提示
let isShowForcedSubmitDialog = ref(false)
// 是否显示答题状态面板
let isShowSituationPopup = ref(false)

const state = reactive({
  // isShowSubmitTipsDialog: false,
  AntiCheatTipsDialog: false,
  //       showPopup: false,
  //       showVerifyDialog: false,
  //       finshShowDialog: false,
  //       practiseShowDialog: false,
  //       idName: 'answer',
  leaveDialog: false,
  leaveTipsContent: '',
  breakDialog: false,
  breakTipsContent: '',
})
const { leaveDialog, leaveTipsContent, breakDialog, breakTipsContent }  = toRefs(state)

// 题目是否分页显示 一页all 分页page
const paperShowType = computed(() => {
  return store.examInfo?.setting?.paper_setting?.paper_show_type
})
//
// 当前页题目列表
const currentPageQuestionList = computed(() => {
  let questionArr: any = []
  const allQuestionList = ([] as any[]).concat(store.getExamQuestionList)
  if (paperShowType.value === 'all') {
    questionArr = allQuestionList
  } else {
    questionArr.push(allQuestionList[store.currentQuestionIndex])
  }
  return questionArr
})
// 背景logo
const logoSrc = computed(() => {
  return store.examInfo?.setting?.extend?.logo_url
})
// 是否显示练习答案解析按钮 练习且开启了逐题查看答案选项
const isShowPracticeAnalysisBtn = computed(() => {
  return store.examInfo?.setting?.enable_practice && store.examInfo?.setting?.judge?.enabled
})

onBeforeRouteLeave((to, from, next) => {
  removeAntiCheat()
  next()
})
onMounted(() => {
  // 如果直接复制答题页链接进来，但考试信息不存在或exam_id或record_id任何一个不一致则表示考试信息有变动跳转说明页
  const { exam_id, record_id } = route.query
  const { exam_id: examIdlocal, record_id: recordIdLocal } = store.examInfo || {}
  if (!store.examInfo || exam_id !== examIdlocal || record_id !== recordIdLocal) {
    router.push({
      path: '/explain',
      query: {
        exam_id
      }
    })
  }
  // 考试进来防作弊
  addAntiCheat()
  // 每次进来检验是否超过切屏和中断次数
  closeBrowserEnter()
})

// 练习题立即查看答题解析
const checkAnalysis = (questionInfo: any) => {
  store.examInfo.contents.forEach((item: any) => {
    item.sub_questions.forEach((q: any) => {
      if (q.question_id === questionInfo.question_id) {
        // 当练习时给题目添加viewedResult属性表示查看了答案
        q.viewedResult = true
      }
    })
  })
  // 更新到localStorage
  store.$patch((state: any) => {
    console.log(state)
    // state.examInfo = mergeDate || null
    localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(state.examInfo))
  })
}
// 考试状态面板弹窗
const showSituationPopup = () => {
  isShowSituationPopup.value = true
  console.log('显示状态面板', isShowSituationPopup.value)
}
// 交卷提示弹窗
const submitTipsPopup = (type: boolean) => {
  console.log('是否强制提交', type)
  // type为true表示强制提交
  if (type) {
    isShowForcedSubmitDialog.value = true
  } else {
    isShowSubmitTipsDialog.value = true
  }
}
// 提交答卷
const submit = (forceHand = false) => {
  const { exam_id, record_id } = route.query
  // 跳转来源信息 中干链接信息
  const externalUrlInfo = {
    from_act_id: route.query.from_act_id,
    from_system: route.query.from_system,
    from_type: route.query.from_type
  }
  const answerList = store.getExamQuestionList.map((item: any) => {
    return {
      question_id: item.question_id,
      answer: item.answer || []
    }
  })
  const params = {
    exam_id,
    record_id,
    is_submit: true, // 交卷还是定时保存
    force_hand: forceHand, // 是否强制交卷
    answers: answerList
  }
  const allParams = externalUrlInfo.from_act_id ? Object.assign({}, params, externalUrlInfo) : params
  saveAnswerAPI(allParams).then((res: any) => {
    const { code, message, success } = res
    if (code === '200' && success) {
      router.replace({
        path: '/result',
        query: {
          exam_id
        }
      })
    } else {
      if (message === '当前试卷已提交，请勿重复提交！') {
        Dialog.alert({
          title: '提示',
          message: '当前试卷已提交，请勿重复提交！'
        }).then(() => {
          router.replace({
            path: '/result',
            query: {
              exam_id
            }
          })
        })
      }
    }
  }).finally(() => {
    // 清除考试数据
    store.$patch((state: any) => {
      state.examInfo = null
      state.currentQuestionIndex = 0
      localStorage.removeItem(`Exam_Info_${state.userInfo.EnName}`)
    })
    // 提交考试最后清除防作弊功能
    removeAntiCheat()
    localStorage.removeItem('cheatInfo')
  })
}
// 增加防作弊功能
const addAntiCheat = () => {
  removeAntiCheat()
  const { exam_id, record_id } = route.query
  const {
    // 切屏
    limit_switch_screen,
    switch_allow_num,
    switch_allow_length,
    // 中断
    limit_interrupt,
    interrupt_allow_num,
    interrupt_allow_length,
    // 粘贴复制
    copy_limit
  } = store.examInfo.base_anti_cheat || {}
  // 是否开启禁止切屏和中断考试
  if (limit_switch_screen || limit_interrupt) {
    const leaveConfig = {
      interval: switch_allow_length * 1000,
      times: switch_allow_num,
      request: {
        url: '/training-portal-common/api/v1/portal/user/common/antiCheat/screenSwitch/upload',
        data: {
          item_type: 'exam',
          item_id: record_id,
          item_from_id: exam_id,
          switch_duration: '0',
          app_id: 'QLearningService',
          tencent_code: 'tencent'
        }
      },
      callback: (n: number) => {
        // 切屏回调
        showLeaveTips(n, switch_allow_num)
      }
    }
    const breackConfig = {
      interval: interrupt_allow_length * 1000,
      times: interrupt_allow_num,
      request: {
        url: '/training-portal-common/api/v1/portal/user/common/antiCheat/screenSuspend/upload',
        data: {
          item_type: 'exam',
          item_id: record_id,
          item_from_id: exam_id,
          switch_duration: '0',
          app_id: 'QLearningService',
          tencent_code: 'tencent'
        }
      },
      callback: (n: number) => {
        // 中断回调
        showBreakTips(n, interrupt_allow_num)
      }
    }
    const config = {} as { leaveConfig: object, breackConfig: object }
    if (limit_switch_screen) {
      config.leaveConfig = leaveConfig
    }
    if (limit_interrupt) {
      config.breackConfig = breackConfig
    }
    forbidHideScreen(config)
  }
  // 是否开启禁止复制粘贴
  if (copy_limit) {
    forbidCopyPaste(() => {
      Toast('禁止复制粘贴~')
    })
  }
}
// 关闭浏览器再次进入
const closeBrowserEnter = () => {
  const {
    // 切屏
    switch_allow_num,
    switch_allow_length,
    // 中断
    interrupt_allow_num,
    interrupt_allow_length
  } = store.examInfo.base_anti_cheat || {}
  const cheatInfo = JSON.parse(localStorage.getItem('cheatInfo') || '{}')
  let { leaveTimes = 0, breakTimes = 0, hideTime } = cheatInfo
  // 关闭浏览器时间和打开浏览器时间
  const gapTime = Date.now() - hideTime
  // 切屏----hideTime必须有切屏的动作后才会有以下提示
  if (hideTime && gapTime > switch_allow_length * 1000) {
    leaveTimes += 1
    if (switch_allow_num) {
      showLeaveTips(leaveTimes, switch_allow_num)
    }
  }
  // 中断
  if (hideTime && gapTime > interrupt_allow_length * 1000) {
    breakTimes += 1
    if (interrupt_allow_num) {
      showBreakTips(breakTimes, interrupt_allow_num)
    }
  }
  localStorage.setItem('cheatInfo', JSON.stringify({
    ...cheatInfo,
    leaveTimes,
    breakTimes
  }))
}
// 中断提示处理
const showBreakTips = (n: number, interrupt_allow_num: number) => {
  if (n > interrupt_allow_num) {
    Toast({
      message: `考试中断超过${interrupt_allow_num}次，系统强制交卷中...`,
      onClose: () => {
        // submit(true) // 强制交卷
      }
    })
  } else {
    state.breakDialog = true
    state.breakTipsContent = `
      <P>您已中断考试<span>${n}</span>次</p>
      <p>考试中断超过<span>${interrupt_allow_num}</span>次系统将强制交卷，请认真作答！</p>
    `
  }
}
// 切屏提示处理
const showLeaveTips = (n: number, switch_allow_num: number) => {
  if (n > switch_allow_num) {
    Toast({
      message: `切屏超过${switch_allow_num}次，系统强制交卷中...`,
      onClose: () => {
        // submit(true) // 强制交卷
      }
    })
  } else {
    state.leaveDialog = true
    state.leaveTipsContent = `
      <P>您已切屏离开考试页面<span>${n}</span>次</p>
      <p>切屏超过<span>${switch_allow_num}</span>次系统将强制交卷，请认真作答！</p>
    `
  }
}
// 移除防作弊
const removeAntiCheat = () => {
  // 移除切屏和中断
  removeHideScreen()
  // 移除粘贴复制
  removeCopyPaste()
}
</script>

<style lang="less" scoped>
.answer-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  .exam-con {
    flex: 1;
    padding: 0 16px;
    overflow: auto;
    position: relative;
    .question-item {
      background: #fff;
      margin: 16px auto;
      overflow: hidden;
      .check-analysis-btn {
        height: 20px;
        margin-bottom: 24px;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        .split-line {
          width: 300px;
          height: 1px;
          background:#dcdcdc;
        }
        & > span {
          width: 120px;
          height: 20px;
          background:#fff;
          color: #3464e0;
          font-size: 14px;
          text-align: center;
          line-height: 20px;
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          cursor: pointer;
        }
      }
    }
    .logo {
      margin-top: auto;
      padding: 5px 0;
      display: flex;
      justify-content: center;
      & > img {
        max-width: 100%;
      }
    }
  }
  .footer-button {
    width: 100%;
    height: 48px;
    background: #ccc;
  }
}
</style>
