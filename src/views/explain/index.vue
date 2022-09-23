<template>
  <div class="explain-container">
    <div v-if="explainInfo" class="explain-details">
      <div class="exam-info-con">
        <div class="exam-name">
          <span class="name">{{ explainInfo.exam_name }}</span>
          <van-image :src="getStatus" height="24" fit="cover" />
        </div>
        <div v-if="explainInfo.exam_result" class="exam-result">
          <p v-if="explainInfo.exam_result.have_cheated" class="cheated">
            <van-icon name="warning" />
            考试作弊
          </p>
          <p v-else class="score"><span>历史最高分：</span>{{ explainInfo.exam_result.highest_score }}</p>
          <div class="slice-wrap">
            <p @click="toExamRecordList"><van-icon :name="getImageUrl('img/record.png')" size="14" /> 考试记录</p>
            <!-- <p v-if="explainInfo.exam_result.can_send_certificate" @click="checkCertificate(explainInfo)"><van-icon :name="require('@/assets/img/Slice-cert.png')" size="14" />领取证书</p> -->
          </div>
        </div>
        <div v-if="showBasicInfo" class="exam-info">
          <div class="t-b">
            <div v-if="explainInfo.testing_count_limit_type === 2" class="item">
              <span>{{ explainInfo.remain_testing_count }}</span>
              <p>剩余次数</p>
            </div>
            <div class="item">
              <span>{{ paper_question_count.totalCount }}</span>
              <p>题目数量</p>
            </div>
            <div class="item">
              <span>{{ explainInfo.total_point }}</span>
              <p>试卷总分</p>
            </div>
            <div v-if="explainInfo.pass_score" class="item">
              <span>{{ explainInfo.pass_score }}</span>
              <p>通过分数</p>
            </div>
          </div>
          <div class="l-r">
            <p><span>{{ isPractiseSet ? '开放时间：' : '开考时间：' }}</span>{{ !explainInfo.exam_start_time ? "不限制" : `${explainInfo.exam_start_time} - ${explainInfo.exam_end_time}` }}</p>
            <!-- exam_duration_type 1-独立时间  2-动态时间 -->
            <p><span>{{ isPractiseSet ? '答题限时：' : '考试限时：' }}</span>{{ explainInfo.exam_duration_type === 1 ? durationTime : `${durationTime} (考试时间结束后，强制交卷)` }}</p>
            <p>
              <span>{{ isPractiseSet ? '次数限制：' : '考试次数：' }}</span>
              {{ explainInfo.testing_count_limit_type === 1 ? "不限制 " : `${explainInfo.setting.allow_testing_count} 次` }}
              <template v-if="explainInfo.setting.re_exam_after_pass">({{ isPractiseSet ? '通过后可再次练习' : "通过考试后不可继续考试" }})</template>
            </p>
            <p><span>题目详情：</span>{{ paper_question_count.questionType }}</p>
            <p v-if="explainInfo.setting.anti_cheat && explainInfo.setting.anti_cheat.limit_switch_screen">
              <span>切屏限制：</span>切出考试页面超过<strong>{{ explainInfo.setting.anti_cheat.switch_allow_num }}</strong>次后将强制交卷
            </p>
            <p v-if="explainInfo.setting.anti_cheat && explainInfo.setting.anti_cheat.limit_interrupt">
              <span>中断限制：</span>考试中断超过<strong>{{ explainInfo.setting.anti_cheat.interrupt_allow_num }}</strong>次后将强制交卷
            </p>
          </div>
        </div>
        <van-empty
          v-else
          :image="emptySvg"
          image-size="128"
          description="暂无基础信息">
        </van-empty>
        <!-- <img src="@/assets/img/empty.svg" alt=""> -->
      </div>
      <div class="exam-explain-con">
        <div class="title">考试说明</div>
        <div class="con">
          <div v-if="explainInfo.exam_discription" class="item-html" v-html="explainInfo.exam_discription"></div>
          <p v-else>暂无说明</p>
        </div>
      </div>
      <div v-if="explainInfo.submit_button_status !== 4" class="footer-btn">
        <van-checkbox v-model="checked" class="checkbox" shape="square" icon-size="16px" checked-color="#3464e0">我已完整阅读考试信息，了解考试说明</van-checkbox>
        <div :class="['btn', {'active': checked}]" @click="startTest">{{ btnText }}</div>
      </div>
    </div>
    <van-empty
      v-if="false"
      :image="getImageUrl('img/empty.svg')"
      description="暂无考试信息">
    </van-empty>
    <verification-tips-dialog v-model:visible="isShowVerificationTips"></verification-tips-dialog>
    <!-- <autographPopup v-model:show-popup="autographPopupShow" :record_id="explainInfo.record_id" @relaod="relaod" /> -->
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'vant'
import VerificationTipsDialog from './component/VerificationTipsDialog.vue';
import { getExplainInfoAPI, getProtocolInfoAPI, getExamPaperAPI } from '@/api/index'
import { examStore } from '@/store/index'
import { getImageUrl } from '@/utils/getImageUrl'
import { formatSecond } from '@/utils/day'
// import emptySvg from '@/assets/img/empty.svg'
// console.log(getImageUrl('@/assets/img/record.png'))
const emptySvg = new URL('../../assets/img/empty.svg', import.meta.url).href

const route = useRoute()
const router = useRouter()

const store = examStore()

interface dataType {
  explainInfo: any,
  checked: boolean,
  isShowVerificationTips: boolean
}
const state: dataType = reactive({
  explainInfo: null,
  checked: false,
  isShowVerificationTips: false
})
// let explainInfo: any = reactive({})
// let checked = ref(false)
let { explainInfo, checked, isShowVerificationTips } = toRefs(state)
// console.log(state.explainInfo)

const getStatus = computed(() => {
  if (!state.explainInfo.exam_result || (state.explainInfo.exam_result && state.explainInfo.exam_result.passed === null)) {
    return getImageUrl('img/Slice-not.png')
  } else {
    if (state.explainInfo.exam_result.passed) {
      return getImageUrl('img/Slice-pass.png')
    } else {
      return getImageUrl('img/Slice-fail.png')
    }
  }
})
const durationTime = computed(() => {
  return formatSecond(state.explainInfo.exam_duration * 1000)
})
const showBasicInfo = computed(() => {
  return state.explainInfo?.setting?.show_basic_info
})
const isPractiseSet = computed(() => {
  return state.explainInfo?.setting?.enable_practice
})
// 题目数量和详情类型
const paper_question_count = computed(() => {
  const questionList = state.explainInfo.paper_question_count
  let totalCount = 0
  let questionType = ''
  questionList.forEach((item: any) => {
    totalCount += item.count
    questionType += `${item.question_name}(${item.count})，`
  })
  return {
    totalCount,
    questionType: questionType.substring(0, questionType.length - 1)
  }
})
const btnText = computed(() => {
  const textArr = ['开始考试', '继续考试', '再次考试', '隐藏按钮', '考试未开始', '人脸身份核验', '考试已结束']
  return textArr[state.explainInfo.submit_button_status - 1]
})

// 获取考试基本信息 - 先判断是否支持当前考试端，然后判断需要签署隐私协议
const getExplainInfo = () => {
  Toast.loading({
    duration: 0,
    forbidClick: true,
    message: '加载中...'
  })
  const exam_id = route.query.exam_id as string
  getExplainInfoAPI({ exam_id }).then((res: any) => {
    const { code, data, success } = res
    if (code === '200' && success) {
      // 1-全部，2-PC，3-mob
      if (Number(data.terminal_type) === 2) {
        router.replace({
          path: '/onlypc',
          query: {
            exam_id
          }
        })
      } else {
        getProtocol()
      }
      state.explainInfo = data
    }
  }).finally(() => {
    Toast.clear()
  })
}

// 判断隐私协议
const getProtocol  = () => {
  const exam_id = route.query.exam_id as string
  getProtocolInfoAPI({ examId: exam_id }).then((res: any) => {
    const { code, data, success } = res
    if (code === '200' && success) {
      if (data.need_sign_privacy) {
        router.replace({
          path: '/protocol',
          query: {
            exam_id: exam_id
          }
        })
      }
    }
  })
}

// 点击按钮事件
const startTest = () => {
  // 未勾选提示
  if (!state.checked) {
    Toast('请阅读考试说明，并勾选已阅读选项后，点击开始考试')
    return
  }
  // 人脸身份核验
  if (state.explainInfo.submit_button_status === 6) {
    state.isShowVerificationTips = true
    return
  }
  // 考前签名
  if (state.explainInfo.setting.anti_cheat.enabled_sign && !state.explainInfo.is_testing_sign) {
    // this.autographPopupShow = true
    return
  }
  getExamPapers()
}

// 获取考试试卷
const getExamPapers = () => {
  Toast.loading({
    duration: 0,
    forbidClick: true,
    message: '加载中...'
  })
  const params = { ...route.query }
  getExamPaperAPI(params).then((res: any) => {
    const { code, data, success } = res
    if (code === '200' && success) {
      const { exam_id, record_id } = data
      const { exam_id: examIdlocal, record_id: recordIdLocal } = store.examInfo || {}
      // 给所有题目添加序号
      let question_index = 0
      data.contents.forEach((item: any) => {
        item.sub_questions.forEach((q: any) => {
          q.question_index = question_index++
        })
      })
      // 判断是不是同一个考试（对比缓存的exam_id和record_id，如果是同一个考试则合并本地的缓存，不是则更新数据）
      let mergeDate: object | null = null
      if (exam_id === examIdlocal && record_id === recordIdLocal) {
        mergeDate = Object.assign({}, data, store.examInfo)
      } else {
        mergeDate = data
        store.$patch((state: any) => {
          state.examInfo = null
          localStorage.removeItem(`Exam_Info_${state.userInfo.EnName}`)
        })
        localStorage.removeItem('Exam_Cheat_Info')
      }
      // console.log('mergeDate>>>>>>>>>>>', mergeDate)
      store.$patch((state: any) => {
        console.log(state)
        state.examInfo = mergeDate || null
        localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(mergeDate))
      })
      router.push({
        path: '/answer',
        query: {
          exam_id,
          record_id
        }
      })
    }
  }).finally(() => {
    Toast.clear()
  })
}

// 签名后重新请求
// const relaod = () => {
//   getExplainInfo()
// }
// 跳转到考试记录列表页
const toExamRecordList = () => {
  const { exam_id } = route.query
  router.push({
    name: 'record',
    query: {
      exam_id
    }
  })
}

onMounted(() => {
  getExplainInfo()
})
</script>

<style lang="less" scoped>
.explain-container {
  min-height: 100%;
  background: url('@/assets/img/explain/explain-banner.png') no-repeat center top / 100% 125px;
  padding: 100px 0;
  .explain-details {
    .exam-info-con {
      width: 343px;
      background:#fff;
      border-radius: 5px;
      margin: 0 auto;
      padding: 16px;
      .exam-name {
        color:#333;
        font-size: 17px;
        font-weight: 500;
        display: flex;
        justify-content: space-between;
        .van-image {
          min-width: 72px;
          max-width: 72px;
          margin-left: 12px;
        }
      }
      .exam-result {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        font-size: 13px;
        .score{
          span{
            color: #999;
          }
        }
        .cheated{
          color: #F81D22;
        }
        .slice-wrap{
          display: flex;
          color: #3464E0;
          p{
            display: flex;
            align-items: center;
            i{
              margin-right: 2px;
            }
          }
          p:last-child{
            margin-left: 16px;
          }
        }
      }
      .exam-info {
        margin-top: 24px;
        .t-b {
          display: flex;
          justify-content: space-between;
          .item {
            text-align: center;
            & > span {
              color: #3464e0;
              font-size: 17px;
              font-weight: 500;
            }
            & > p {
              color: #999;
              font-size: 13px;
              margin-top: 6px;
            }
          }
        }
      }
      .l-r {
        margin-top: 16px;
        & > p {
          font-size: 12px;
          color: #333;
          line-height: 20px;
          margin-top: 6px;
          display: flex;
          & > span {
            color: #999;
            flex-shrink: 0;
          }
          & > strong {
            color:#3464E0
          }
        }
      }
    }
    .exam-explain-con {
      width: 343px;
      background:#fff;
      border-radius: 5px;
      margin: 10px auto 0;
      padding: 16px;
      .title {
        color: #333;
        font-size: 17px;
        font-weight: 500;
      }
      .con {
        color:#666;
        font-size: 14px;
        line-height: 24px;
        margin-top:12px;
        :deep(.item-html) {
          white-space: normal;
          word-break: break-all;
          &  * {
            white-space: normal;
            word-break: break-all;
            margin-bottom: 10px;
          }
        }
      }
    }
    .footer-btn {
      width: 100%;
      background: #f5f7f9;
      position: fixed;
      bottom: 0;
      left: 0;
      .checkbox {
        color: #333;
        font-size: 15px;
        padding: 12px 16px;
      }
      .btn {
        width: 100%;
        height: 48px;
        font-size: 17px;
        background:#f2f2f2;
        color: #acacac;
        display: flex;
        justify-content: center;
        align-items: center;
        &.active {
          color: #fff;
          background: #3464e0;
        }
      }
    }
  }
}
</style>