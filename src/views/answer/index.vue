<template>
  <div class="answer-container">
    <!-- 答题进度 -->
    <progress-panel></progress-panel>
    <!-- 题目列表 -->
    <div id="exam-question-area" class="exam-con">
      <div class="question-item" v-for="item in currentPageQuestionList" :id="`question-${item.question_id}`" :key="item.question_id">
        <question-category-card :question-info="item" :use-scene="'answer'"></question-category-card>
        <!--练习试卷 和 答案解析 -->
        <div v-if="isShowPracticeAnalysisBtn">
          <div class="check-analysis-btn">
            <p class="split-line"></p>
            <span @click="checkAnalysis(item)">查看答案解析</span>
          </div>
          <!-- 题目有viewedResult属性表示查看了答案 -->
          <!-- <answer-analysis-card v-if="item.viewedResult" :analysis-info="item"></answer-analysis-card> -->
        </div>
      </div>
    </div>
    <!-- 背景小logo -->
    <div v-if="logoSrc" class="logo">
      <img :src="logoSrc" alt="背景logo">
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
  <!-- <van-empty v-else description="暂无数据" /> -->

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
  <!-- 倒计时强制提交弹窗提示 -->
  <!-- <AnswerFinishDialog
      v-model:show="finshShowDialog"
      @changeFinish="finshShowDialog = false"
      @submit="submit"
    /> -->
  <!-- 重新联系 -->
  <!-- <ResetPractiseDialog
      v-model:show="practiseShowDialog"
      @resetPractiseConfim="resetPractiseConfim"
    /> -->
  <!-- 弹框 end -->
  <!-- 添加水印 -->
  <!-- <Watermark :id-name="idName" /> -->
  <!-- 切屏和中断提示 -->
  <!-- <LeaveDialog v-if="leaveDialog" v-model:show="leaveDialog" :title="leaveTitle" :tips-content="leaveTipsContent" />
    <BreakDialog v-if="breakDialog" v-model:show="breakDialog" :title="breakTitle" :tips-content="breakTipsContent" /> -->
</template>

<script setup lang="ts">
import ProgressPanel from './component/ProgressPanel.vue'
import QuestionCategoryCard from '../components/questionCategory/QuestionCategoryCard.vue'
// import AnswerAnalysisCard from '../components/AnswerAnalysisCard.vue';
import PaginationContorlButton from '../components/PaginationContorlButton.vue';
import AnswerSituationPanel from './component/AnswerSituationPanel.vue';
import submitTipsDialog from './component/submitTipsDialog.vue';
import { ref, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Dialog } from 'vant';
import { examStore } from '@/store/index'
import { saveAnswerAPI } from '@/api/index'

const route = useRoute()
const router = useRouter()
const store = examStore()

let isShowSituationPopup = ref(false)
let isShowForcedSubmitDialog = ref(false)
let isShowSubmitTipsDialog = ref(false)

// const state = reactive({
//   isShowSubmitTipsDialog: false
// })

// 题目是否分页显示 一页all 分页page
const paperShowType = computed(() => {
  return store.examInfo?.setting?.paper_setting?.paper_show_type
})
//
// 当前页题目列表
const currentPageQuestionList = computed(() => {
  let questionArr: any = []
  const allQuestionList = ([] as any[]).concat(store.getExamQuestionList)
  // const pageSize = this.examInfo?.setting?.paper_setting?.page_size
  if (paperShowType.value === 'all') {
    questionArr = allQuestionList
  } else {
    // let allPageList = []
    // const totalPage = Math.ceil(this.getExamQuestionList.length / pageSize)
    // for (let i = 0; i < totalPage; i++) {
    //   const list = allQuestionList.splice(0, pageSize)
    //   allPageList.push(list)
    // }
    // questionArr = allPageList[this.currentQuestionIndex]
    questionArr.push(allQuestionList[store.currentQuestionIndex])
  }
  // console.log('提交后题目列表', questionArr)
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

// 练习题立即查看答题解析
const checkAnalysis = (questionInfo: any) => {
  store.examInfo.contents.forEach((item: any) => {
    item.sub_questions.forEach((q: any) => {
      if (q.question_id === questionInfo.question_id) {
        // 当练习时给题目添加viewedResult属性表示查看了答案
        // this.$set(q, 'viewedResult', true)
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
    // this.$store.commit('exam/clearExamInfo')
    // this.$store.commit('exam/saveCurrentQustionIndex', 0)
    // 提交考试最后清除防作弊功能
    // this.stopCameraEvent()
    // this.removeAntiCheat()
  })
}

// onMounted(() => {
//   $mittBus.on('showSituationPopup', (data) => {

//   });
// })

// onBeforeMount(() => {
//   $mittBus.off('showSituationPopup');
// });
// import {
//   AnswerTipsDialog,
//   AnswerFinishDialog,
//   // ConfirmVerify,
//   LeaveDialog,
//   BreakDialog,
//   PractiseAnalysis,
//   ResetPractiseDialog
// } from './children/index'
// import { AnswerArea, AnswerProgress, BottomContorl } from '../components/AnaswerPage/index'
// import CheckSituation from '../components/CheckSituationPopup/index.vue'
// import Watermark from '@/components/WaterMark'
// import ActiveLogo from '../components/ActiveLogo'
// import { saveAnswerAPI } from 'services/data.service'
// import { mapMutations, mapGetters, mapState } from 'vuex'
// import { forbidHideScreen, removeHideScreen, forbidCopyPaste, removeCopyPaste } from '@/utils/anti-cheating.js'
// import { Toast, Dialog } from 'vant'
// export default {
//   name: 'Answer',
//   components: {
//     // NavBar,
//     // CheckSituation,
//     // ConfirmVerify,
//     AnswerProgress,
//     // BottomContorl,
//     AnswerArea,
//     // AnswerFinishDialog,
//     // AnswerTipsDialog,
//     // Watermark,
//     ActiveLogo,
//     // PractiseAnalysis,
//     // ResetPractiseDialog,
//     // LeaveDialog,
//     // BreakDialog
//   },
//   data() {
//     return {
//       showTipsDialog: false,
//       showPopup: false,
//       showVerifyDialog: false,
//       finshShowDialog: false,
//       practiseShowDialog: false,
//       idName: 'answer',
//       leaveDialog: false,
//       leaveTitle: '',
//       leaveTipsContent: '',
//       breakDialog: false,
//       breakTitle: '',
//       breakTipsContent: '',
//       submitToast: ''
//     }
//   },
//   computed: {
//     // ...mapState(['examResult']),
//     // ...mapGetters([
//     //   'getSubQuestion',
//     //   'getExamNumber',
//     //   'getExamResult',
//     //   'getQuestionItem',
//     //   'getName',
//     //   'getPageSet',
//     //   'getReturnData'
//     // ]),
//     // ...mapState(['practiseRecordList']),
//     title() {
//       const { exam_name } = this.$route.query
//       return exam_name
//     },
//     // 练习情况下的答题--并且已经查看答案了
//     isPractise() {
//       return this.getPageSet?.enable_practice && this.practiseRecordList.includes(this.getQuestionItem?.question_id)
//     },
//     paper_show() {
//       return this.getPageSet?.paper_setting?.paper_show_type
//     },
//     // 分页
//     pageList() {
//       let list = []
//       const setPageSize = this.getPageSet?.paper_setting?.page_size
//       const subQuestion = [].concat(this.getSubQuestion)
//       if (this.getPageSet?.paper_setting?.paper_show_type === 'all') {
//         list = subQuestion
//       } else if (this.getPageSet?.paper_setting?.paper_show_type === 'page') {
//         const pageSize = Math.ceil(this.getSubQuestion.length / setPageSize)
//         for (let i = 0; i < pageSize; i++) {
//           const data = subQuestion.splice(0, setPageSize)
//           list.push(data)
//         }
//       }
//       return list
//     }
//   },
//   // beforeRouteLeave (to, from, next) {
//   //   this.removeAntiCheat()
//   //   next()
//   // },
//   mounted() {
//     this.handleSessionData()
//     this.addAntiCheat()
//     this.closeBrowserEnter()
//   },
//   methods: {
//     // ...mapMutations([
//     //   'REST_DATA',
//     //   'PRACTISE_RECORD',
//     //   'EXAM_NUMBER'
//     // ]),
//     // 交卷弹窗
//     tipsClick() {
//       this.showTipsDialog = true
//     },
//     popupClick() {
//       this.showPopup = true
//     },
//     cancel() {
//       this.showTipsDialog = false
//     },
//     // 重新练习
//     resetPractiseConfim() {
//       const forceHand = false
//       const type = 'practise'
//       this.submit(forceHand, type)
//     },
//     // 验证弹窗
//     confirmVerifyClick() {
//       this.showVerifyDialog = true
//     },
//     // 提交答卷
//     submit(forceHand = false, type) {
//       const toast1 = Toast.loading({
//         duration: 0,
//         forbidClick: true,
//         message: '正在交卷中...'
//       })
//       const { exam_id, record_id, exam_duration } = this.$route.query
//       const userSet = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`))
//       // 考试花费的时间
//       const duration = exam_duration - (userSet?.countDownTime / 1000)
//       // 跳转来源信息
//       const { from_act_id = '', from_system = '', from_type = '' } = this.getReturnData
//       const answerList = []
//       this.getSubQuestion.forEach((item) => {
//         answerList.push({
//           question_id: item.question_id,
//           answer: item.answer || []
//         })
//       })
//       const params = {
//         record_id,
//         exam_id,
//         is_submit: true, // 交卷还是定时保存
//         force_hand: forceHand, // 是否强制交卷
//         answers: answerList,
//         duration,
//         from_act_id,
//         from_system,
//         from_type
//       }
//       saveAnswerAPI(params).then((res) => {
//         toast1.clear()
//         // 练习
//         if (type === 'practise') {
//           this.$router.replace({
//             path: '/explain',
//             query: {
//               exam_id
//             }
//           })
//           return
//         }
//         // 考试
//         this.$router.replace({
//           path: '/result',
//           query: {
//             exam_id
//           }
//         })
//       }).catch((resError) => {
//         const { message } = resError
//         if (message === '当前试卷已提交，请勿重复提交！') {
//           Dialog.alert({
//             title: '提示',
//             message: '当前试卷已提交，请勿重复提交！'
//           }).then(() => {
//             this.$router.replace({
//               path: '/result',
//               query: {
//                 exam_id
//               }
//             })
//           })
//         }
//       }).finally(() => {
//         // 提交考试最后清除防作弊功能， 清除所有数据
//         this.removeAntiCheat()
//         this.REST_DATA()
//       })
//     },
//     async handleSessionData() {
//       const { exam_id, record_id } = this.$route.query
//       // 存用户答题的所有数据
//       const info = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`)) || {}
//       let infoResult = {
//         examId: exam_id,
//         currentTime: new Date().getTime(),
//         number: this.getExamNumber,
//         userName: this.getName
//       }
//       if (info.examId) {
//         if (exam_id === info.examId) {
//           infoResult = {
//             ...infoResult,
//             ...info,
//             exam_id: info.examId

//           }
//           return
//         }
//         infoResult.examId = info.examId
//         // 如若用户更改exam_id跳转
//         this.$router.push({
//           path: 'errorPage',
//           query: {
//             exam_id: info.examId,
//             record_id
//           }
//         })
//       }
//       localStorage.setItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`, JSON.stringify(infoResult))
//     },
//     // 增加防作弊功能
//     addAntiCheat () {
//       this.removeAntiCheat()
//       const { exam_id, record_id } = this.$route.query
//       const {
//         // 拍照
//         // enabled_capture,
//         // 切屏
//         limit_switch_screen,
//         switch_allow_num,
//         switch_allow_length,
//         // 中断
//         limit_interrupt,
//         interrupt_allow_num,
//         interrupt_allow_length,
//         // 粘贴复制
//         copy_limit
//       } = this.examResult.base_anti_cheat || {}
//       // 是否开启禁止切屏和中断考试
//       if (limit_switch_screen || limit_interrupt) {
//         const leaveConfig = {
//           interval: switch_allow_length * 1000,
//           times: switch_allow_num,
//           request: {
//             url: '/training-portal-common/api/v1/portal/user/common/antiCheat/screenSwitch/upload',
//             data: {
//               item_type: 'exam',
//               item_id: record_id,
//               item_from_id: exam_id,
//               switch_duration: '0',
//               app_id: 'QLearningService',
//               tencent_code: 'tencent'
//             }
//           },
//           callback: (n) => { // 切屏
//             this.handleLeaveTips(n, switch_allow_num)
//           }
//         }
//         const breackConfig = {
//           interval: interrupt_allow_length * 1000,
//           times: interrupt_allow_num,
//           request: {
//             url: '/training-portal-common/api/v1/portal/user/common/antiCheat/screenSuspend/upload',
//             data: {
//               item_type: 'exam',
//               item_id: record_id,
//               item_from_id: exam_id,
//               switch_duration: '0',
//               app_id: 'QLearningService',
//               tencent_code: 'tencent'
//             }
//           },
//           callback: (n) => { // 中断
//             this.handleBreakTips(n, interrupt_allow_num)
//           }
//         }
//         const config = {}
//         if (limit_switch_screen) {
//           config.leaveConfig = leaveConfig
//         }
//         if (limit_interrupt) {
//           config.breackConfig = breackConfig
//         }
//         forbidHideScreen(config)
//       }
//       // 是否开启禁止复制粘贴
//       if (copy_limit) {
//         forbidCopyPaste(() => {
//           Toast('禁止复制粘贴~')
//         })
//       }
//     },
//     // 关闭浏览器再次进入
//     closeBrowserEnter() {
//       const {
//         // 切屏
//         switch_allow_num,
//         switch_allow_length,
//         // 中断
//         interrupt_allow_num,
//         interrupt_allow_length
//       } = this.examResult.base_anti_cheat || {}
//       const info = JSON.parse(localStorage.getItem('cheatInfo')) || {}
//       let { leaveTimes = 0, breakTimes = 0, hideTime } = info
//       // 关闭浏览器时间和打开浏览器时间
//       const gapTime = Date.now() - hideTime
//       // 切屏----hideTime必须有切屏的动作后才会有以下提示
//       if (hideTime && gapTime > switch_allow_length * 1000) {
//         leaveTimes += 1
//         if (switch_allow_num) {
//           this.handleLeaveTips(leaveTimes, switch_allow_num)
//         }
//       }
//       // 中断
//       if (hideTime && gapTime > interrupt_allow_length * 1000) {
//         breakTimes += 1
//         if (interrupt_allow_num) {
//           this.handleBreakTips(breakTimes, interrupt_allow_num)
//         }
//       }
//       localStorage.setItem('cheatInfo', JSON.stringify({
//         ...info,
//         leaveTimes,
//         breakTimes
//       }))
//     },
//     // 中断
//     handleBreakTips(n, interrupt_allow_num) {
//       if (n > interrupt_allow_num) {
//         Toast(`考试中断超过${interrupt_allow_num}次，系统强制交卷中...`)
//         setTimeout(() => {
//           this.submit(true) // 强制交卷
//         }, 2000)
//         return
//       }
//       this.breakDialog = true
//       this.breakTitle = '考试中断警告'
//       this.breakTipsContent = `
//         <P>您已中断考试<span>${n}</span>次,</p>
//         <p>考试中断超过<span>${interrupt_allow_num}</span>次系统将强制交卷，请认真作答！</p>
//       `
//     },
//     // 切屏
//     handleLeaveTips(n, switch_allow_num) {
//       if (n > switch_allow_num) {
//         Toast(`切屏超过${switch_allow_num}次，系统强制交卷中...`)
//         setTimeout(() => {
//           this.submit(true) // 强制交卷
//         }, 2000)
//         return
//       }
//       this.leaveDialog = true
//       this.leaveTitle = '切屏警告'
//       this.leaveTipsContent = `
//         <P>您已切屏离开考试页面<span>${n}</span>次,</p>
//         <p>切屏超过<span>${switch_allow_num}</span>次系统将强制交卷，请认真作答！</p>
//       `
//     },
//     // 移除防作弊
//     removeAntiCheat () {
//       // 移除切屏和中断
//       removeHideScreen()
//       // 移除粘贴复制
//       removeCopyPaste()
//     },
//     delRedirect() {
//       const { exam_id } = this.$route.query
//       // 岗前
//       if (this.getReturnData?.redirect_url) {
//         window.location = this.getReturnData.redirect_url
//         return
//       }
//       this.$router.push({
//         path: '/explain',
//         query: {
//           exam_id
//         }
//       })
//     }
//   }
// }
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
      margin: 16px auto;
    }
  }
  .logo {
    padding: 5px 0;
    display: flex;
    justify-content: center;
    & > img {
      width: 56px;
    }
  }
  .footer-button {
    width: 100%;
    height: 48px;
    background: #ccc;
  }
}
</style>
