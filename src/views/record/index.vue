<template>
  <div class="record-container">
    <van-list
      class="record-list"
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getRecordList">
      <div class="record-card" v-for="item in recordList" :key="item.record_id">
        <div class="head">
          <p class="time">
            <i class="icon" name="icon-time"></i>考试时间：{{ item.start_time }}
          </p>
          <i v-if="(item.pass_score && item.show_result) || item.have_cheated || item.passed===null" class="icon" :name="svgIcon(item)"></i>
        </div>
        <div class="card-info">
          <div class="result">
            <p class="wait" v-if="(item.have_subjective_question && !item.is_reviewed_paper) || item.passed === null">待定</p>
            <p :class="['score','success']" v-else-if="item.enable_practice">{{ item.score }}<sub>分</sub></p>
            <p :class="['score', !(item.pass_score && item.show_result) ? 'default' : item.passed ? 'success' : 'fail']" v-else>{{ item.show_score ? item.score : '**' }}<sub>分</sub></p>
          </div>
          <div class="item">
            <span>{{ item.total_point }}</span>
            <p>试卷总分</p>
          </div>
          <div class="item" v-if="item.pass_score && item.show_result">
            <span>{{ item.pass_score }}</span>
            <p>通过分数</p>
          </div>
          <div class="item">
            <span>{{ item.duration }}</span>
            <p>用时(分钟)</p>
          </div>
        </div>
        <div class="link" v-if="item.show_page_details" @click="lookAnalysis(item)">查看答卷详情 ></div>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getExamRecordListAPI } from '@/api/index'

const route = useRoute()
const router = useRouter()

const state: any = reactive({
  recordList: [],
  page: {
    current: 1,
    size: 10
  },
  loading: false,
  finished: false,
})
const { recordList, loading, finished } = toRefs(state)

// 考试标志判断
const svgIcon = computed(() => {
  return (info: any) => {
    let iconName = ''
    if (info.have_cheated) {
      iconName = 'exam-status-zb'
    } else if ((info.have_subjective_question && !info.is_reviewed_paper) || info.passed === null) {
      iconName = 'exam-status-pyz'
    } else if (info.passed) {
      iconName = 'exam-status-ytg'
    } else {
      iconName = 'exam-status-wtg'
    }
    return iconName
  }
})

// 获取记录列表
const getRecordList = () => {
  const exam_id = route.query.exam_id as string
  getExamRecordListAPI(exam_id, {
    size: state.page.size,
    current: state.page.current
  }).then((res: any) => {
    state.loading = false
    if (res.code === '200' && res.success) {
      state.recordList = state.recordList.concat(res.data.records)
      state.page.current++
    }
    if (state.recordList.length >= res.data.record_count) {
      state.finished = true
    } else {
      state.finished = false
    }
  })
}
// 查看答案解析
const lookAnalysis = (info: any) => {
  const { exam_id, record_id } = info
  router.push({
    path: '/analysis',
    query: {
      exam_id,
      record_id
    }
  })
}
</script>

<style lang="less" scoped>
.record-container {
  height: 100%;
  .record-list {
    overflow: hidden;
  }
  .record-card{
    width: 343px;
    background: #fff;
    border-radius: 5px;
    padding: 16px;
    margin: 16px auto;
    .head {
      display: flex;
      justify-content: space-between;
      .time {
        font-size: 13px;
        color: #999;
        display: flex;
        align-items: center;
        .icon {
          width: 16px;
          height: 16px;
          background: url("@/assets/svg/icon-starttime.svg") no-repeat center / 100% 100%;
        }
      }
      .icon {
        width: 72px;
        height: 24px;
        &[name="exam-status-zb"] {
          background: url("@/assets/svg/exam-status-zb.svg") no-repeat center / 100% 100%;
        }
        &[name="exam-status-pyz"] {
          background: url("@/assets/svg/exam-status-pyz.svg") no-repeat center / 100% 100%;
        }
        &[name="exam-status-ytg"] {
          background: url("@/assets/svg/exam-status-ytg.svg") no-repeat center / 100% 100%;
        }
        &[name="exam-status-wtg"] {
          background: url("@/assets/svg/exam-status-wtg.svg") no-repeat center / 100% 100%;
        }
      }
    }
    .card-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      .result {
        .score {
          font-size: 30px;
          font-weight: 500;
          & > sub {
            font-size: 12px;
            font-weight: 400;
            vertical-align: baseline;
          }
        }
        .success {
          color: #3464e0;
        }
        .default{
          color: #333;
        }
        .fail {
          color: #ff7548;
        }
      }
      .item {
        text-align: center;
        & > span {
          color: #333;
          font-size: 16px;
          font-weight: 500;
        }
        & > p {
          color: #999;
          font-size: 13px;
          margin-top: 2px;
        }
      }
    }
    .link {
      color: #3464e0;
      font-size: 14px;
      text-align: center;
      margin-top: 20px;
    }
  }
}
</style>
