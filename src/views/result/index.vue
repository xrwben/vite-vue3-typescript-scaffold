<template>
  <div class="result-container">
    <div class="result-con" v-if="examResult">
      <div class="user-name">{{ store.userInfo.FullName }}</div>
      <div class="exam-info">
        <div class="exam-result">
          <!-- 整个逻辑：先判断作弊、判断批阅中、判断练习、判断结果 -->
          <div class="cheated" v-if="isCheated">
            <p class="score">{{ examResult.result.score }}<small>分</small></p>
            <p class="status">
              <i class="icon" name="icon-warning"></i>本次考试存在作弊行为，成绩无效
            </p>
          </div>
          <div class="wait" v-else-if="isWait">
            <!-- <sdc-svg-icon name="success-fill-green" width="56px" height="56px"></sdc-svg-icon> -->
            <i class="icon" name="success-fill-green"></i>
            <p class="status">试卷中包含主观题，请耐心等待批阅</p>
          </div>
          <div class="success" v-else-if="isPractice">
            <p class="score">{{ examResult.result.score }}<small>分</small></p>
            <p class="status">
              <!-- <sdc-svg-icon class="icon" name="success-fill-blue" width="20px" height="20px"></sdc-svg-icon> -->
              <i class="icon" name="success-fill-blue"></i>练习已完成
            </p>
          </div>
          <div :class="[!isShowPassFlag ? 'default' : examResult.result.passed ? 'success' : 'fail']" v-else>
            <p class="score">{{ isShowScore ? examResult.result.score : '**' }}<small>分</small></p>
            <p class="status" v-if="isShowPassFlag">
              <!-- <sdc-svg-icon class="icon" :name="examResult.result.passed? 'success-fill-blue' : 'tips-fill'" width="20px" height="20px"></sdc-svg-icon> -->
              <i class="icon" :name="examResult.result.passed? 'success-fill-blue' : 'tips-fill'"></i>
              {{ examResult.result.passed ? '恭喜你，成功通过本次考试' : '您未能通过本次考试' }}
            </p>
          </div>
        </div>
        <div class="list-vertical">
          <div class="item">
            <span>{{ examResult.paper_point }}</span>
            <p>试卷总分</p>
          </div>
          <div class="item" v-if="isShowPassFlag">
            <span>{{ examResult.pass_score }}</span>
            <p>通过分数</p>
          </div>
          <div class="item">
            <span>{{ Math.ceil(examResult.duration / 60) }}</span>
            <p>用时(分钟)</p>
          </div>
        </div>
        <div class="list-horizontal">
          <p class="time-start"><span>开始时间：</span>{{ examResult.start_time }}</p>
          <p class="time-end"><span>结束时间：</span>{{ examResult.end_time }}</p>
        </div>
        <div class="btn-group">
          <div class="btn" v-if="enableCanSendCertificate" @click="getCertificate(examResult, 'result-page')">
            <i class="icon" name="icon-certificate"></i><span>获取证书</span>
          </div>
          <div class="btn" v-if="showCustomButton.redirect_text" @click="goReturnLink">
            <i class="icon" name="icon-custom"></i><span>{{ showCustomButton.redirect_text }}</span>
          </div>
        </div>
      </div>
      <div class="footer-btn">
        <div class="btn" @click="goHome">
          <i class="icon" name="icon-home"></i><span>首页</span>
        </div>
        <div class="btn" @click="goExamRecord">
          <i class="icon" name="icon-record"></i><span>记录</span>
        </div>
        <div class="btn" v-if="isLookAnalysis" @click="lookAnalysis">
          <i class="icon" name="icon-details"></i><span>详情</span>
        </div>
        <div class="re-exam-btn" v-if="isAgainExam" @click="reExam">
          再次考试<span v-if="examResult.remain_testing_count!==-1">(剩余{{ examResult.remain_testing_count }}次)</span>
        </div>
      </div>
    </div>
    <van-empty
      v-else
      class="empty-con"
      :image="getImageUrl('img/empty.svg')"
      description="暂无数据">
    </van-empty>

    <!-- 查看证书弹窗 -->
    <!-- <certificate-dialog
      v-if="certificateDialog"
      v-model:show="certificateDialog"
      :examResult="examResult">
    </certificate-dialog> -->
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { examStore } from '@/store/index';
import { getExamResultAPI } from '@/api/index';
import { getImageUrl } from '@/utils/getImageUrl'
import getCertificate from '@/hooks/getCertificate'

// const emptySvg = new URL('../../assets/img/empty.svg', import.meta.url).href

const route = useRoute()
const router = useRouter()
const store = examStore()

const state: any = reactive({
  examResult: null,
  certificateDialog: false
})

const { examResult, certificateDialog } = toRefs(state)

// 是否作弊 系统判定或者后台管理判定
const isCheated = computed(() => {
  return state.examResult?.result?.have_cheated_by_system || state.examResult?.result?.have_cheated_by_admin
})
// 是否主观题已阅卷 passed=null表示等待阅卷 且 没有判定作弊
const isWait = computed(() => {
  return (state.examResult?.have_subjective_question && !state.examResult?.is_reviewed_paper) || state.examResult?.result?.passed === null
})
// 是否是练习
const isPractice = computed(() => {
  return state.examResult?.setting?.enable_practice
})
// 是否展示分数
const isShowScore = computed(() => {
  return state.examResult?.setting?.review?.show_score
})
// 是否显示通过标志 （设置了及格线 且 设置显示通过标志）
const isShowPassFlag = computed(() => {
  return state.examResult?.has_pass_score && state.examResult?.setting?.review?.show_result
})
// 是否允许查看证书 设置了能看且没有作弊
const enableCanSendCertificate = computed(() => {
  return state.examResult?.result?.enable_can_send_certificate && !isCheated.value
})
// 是否能再次考试 (再考条件：通过后能再考false且剩余次数不为0, 或通过后不能再考true且考试未通过次数不为0)
const  isAgainExam = computed(() => {
  if (state.examResult?.setting?.re_exam_after_pass) {
    return !state.examResult.result.passed && state.examResult.remain_testing_count !== 0
  } else {
    return state.examResult.remain_testing_count !== 0
  }
})
// 是否配置了自定义按钮内容 (与其它系统跳转过来的考试链接参数一致，例如中干专区，如果存在其它系统考试链接则优先使用链接参数)
const showCustomButton = computed(() => {
  const externalUrlInfo = {
    redirect_url: route.query.redirect_url,
    redirect_text: route.query.redirect_text,
    from_act_id: route.query.from_act_id,
    from_system: route.query.from_system,
    from_type: route.query.from_type
  }
  if (externalUrlInfo.redirect_url && externalUrlInfo.redirect_text) {
    return externalUrlInfo
  }
  return state.examResult?.setting?.extend
})
// 能否查看答题页详情
const isLookAnalysis = computed(() => {
  return state.examResult?.setting?.review?.show_page_details
})

onMounted(() => {
  getExamResult()
})

// 获取考试结果
const getExamResult = () => {
  const exam_id = route.query.exam_id as string
  getExamResultAPI({ exam_id }).then((res: any) => {
    const { code, success, data } = res
    if (code === '200' && success) {
      state.examResult = data
      // this.$store.commit('exam/saveExamResult', state.examResult)
    }
  })
}
// 返回按钮（第三方页面）
const goReturnLink = () => {
  if (showCustomButton.value.redirect_url && showCustomButton.value.redirect_text) {
    window.open(showCustomButton.value.redirect_url)
  }
}
// 返回首页 跟再次考试一样
const goHome = () => {
  reExam()
}
// 跳转考试记录
const goExamRecord = () => {
  const { exam_id } = state.examResult
  router.push({
    path: '/record',
    query: {
      exam_id
    }
  })
}
// 查看详情
const lookAnalysis = () => {
  const { exam_id, record_id } = state.examResult
  router.push({
    path: '/analysis',
    query: {
      exam_id,
      record_id
    }
  })
}
// 再次考试
const reExam = () => {
  const { exam_id } = state.examResult
  router.push({
    path: '/explain',
    query: {
      exam_id
    }
  })
}
</script>

<style lang="less" scoped>
.result-container {
  width: 100%;
  min-height: 100%;
  overflow: hidden;
  .result-con {
    width: 100%;
    background: url("@/assets/img/result/result_banner.png") no-repeat center top / 100% 125px;
    display: flex;
    flex-direction: column;
    .user-name {
      height: 85px;
      color: #fff;
      font-size: 20px;
      font-weight: 500;
      padding: 0 16px;
      display: flex;
      align-items: center;
    }
    .exam-info {
      width: 343px;
      background: #fff;
      border-radius: 5px;
      margin: 0 auto;
      padding: 16px;
      .exam-result {
        text-align: center;
        .cheated, .wait, .default, .success, .fail {
          .score {
            font-size: 40px;
            font-weight: 500;
            line-height: 56px;
            & > small {
              font-size: 12px;
            }
          }
          .status {
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            .icon {
              width: 16px;
              height: 16px;
              margin-right: 4px;
              &[name="icon-warning"] {
                background: url("@/assets/svg/icon-warning.svg") no-repeat center / 100% 100%;
              }
              &[name="success-fill-blue"] {
                background: url("@/assets/svg/success-fill-blue.svg") no-repeat center / 100% 100%;
              }
              &[name="tips-fill"] {
                background: url("@/assets/svg/tips-fill.svg") no-repeat center / 100% 100%;
              }
            }
          }
        }
        .cheated {
          color: #f81d22;
        }
        .success {
          color: #3464e0;
        }
        .fail {
          color: #ff7548;
        }
        .wait {
          color: #0ad0b6;
          .icon {
            width: 56px;
            height: 56px;
            display: inline-block;
            &[name="success-fill-green"] {
              background: url("@/assets/svg/success-fill-green.svg") no-repeat center / 100% 100%;
            }
          }
        }
        .default {
          color: #333;
        }
      }
      .list-vertical {
        margin-top: 24px;
        display: flex;
        justify-content: space-between;
        .item {
          text-align: center;
          & > span {
            color: #333;
            font-size: 18px;
            font-weight: 500;
          }
          & > p {
            color: #999;
            font-size: 14px;
            margin-top: 5px;
          }
        }
      }
      .list-horizontal {
        font-size: 14px;
        margin-top: 16px;
        & > p {
          color: #333;
          margin-bottom: 8px;
          & > span {
            color: #999;
          }
        }
      }
    }
    .btn-group {
      display: flex;
      justify-content: center;
      margin: 32px auto 0;
      .btn {
        width: 150px;
        height: 36px;
        background: #fff;
        border: 1px solid #3464e0;
        border-radius: 40px;
        color: #3464e0;
        font-size: 14px;
        padding: 0 6px;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        .icon {
          width: 16px;
          height: 16px;
          margin-right: 2px;
          &[name='icon-certificate'] {
            background: url("@/assets/svg/icon-certificate.svg") no-repeat center / 100% 100%;
          }
          &[name='icon-custom'] {
            background: url("@/assets/svg/icon-custom.svg") no-repeat center / 100% 100%;
          }
        }
        & > span {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
    .footer-btn {
      width: 100%;
      height: 57px;
      background: #fff;
      border-top: 1px solid #eee;
      padding: 0 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      .btn {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        .icon {
          width: 20px;
          height: 20px;
          &[name='icon-home'] {
            background: url("@/assets/svg/icon-home.svg") no-repeat center / 100% 100%;
          }
          &[name='icon-record'] {
            background: url("@/assets/svg/icon-record-gray.svg") no-repeat center / 100% 100%;
          }
          &[name='icon-details'] {
            background: url("@/assets/svg/icon-details-gray.svg") no-repeat center / 100% 100%;
          }
        }
        & > span {
          color: #666;
          font-size: 12px;
          margin-top: 4px;
        }
      }
      .re-exam-btn {
        width: 180px;
        height: 40px;
        background: #3464e0;
        border-radius: 40px;
        color: #fff;
        font-size: 14px;
        text-align: center;
        line-height: 40px;
      }
    }
  }
  .empty-con {
    margin-top: 200px;
  }
}
</style>
