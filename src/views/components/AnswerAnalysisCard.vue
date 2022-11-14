<template>
  <div class="answer-analysis-card">
    <div class="result-score">
      <p v-if="!isWait" :class="['result', analysisInfo.correct ? 'correct' : 'wrong']">
        <i class="status" :name="analysisInfo.correct ? 'success-fill-green' : 'wrong-fill'"></i>
        {{ analysisInfo.correct ? "正确" : "错误" }}
      </p>
      <p v-if="showQuestionScore"><span class="score">得分：</span>{{ isWait ? '批阅中，暂无得分' : `${analysisInfo.score || 0}分` }}</p>
    </div>
    <!-- 用户答案 -->
    <div class="item my-answer" v-if="['1', '2', '3', '4'].includes(analysisInfo.question_type)">
      <span>您的答案：</span>{{ answerFormat(analysisInfo.answer, analysisInfo.question_type) }}
    </div>
    <div class="item my-answer" v-if="['5'].includes(analysisInfo.question_type)">
      <span>您的答案：</span>
      <div class="text" v-html="answerFormat(analysisInfo.answer, analysisInfo.question_type)"></div>
    </div>
    <!-- 正确答案 -->
    <div class="item correct-answer" v-if="showAnswer && analysisInfo.question_type !== '5'">
      <span>正确答案：</span>{{ answerFormat(analysisInfo.correct_answer, analysisInfo.question_type) }}
    </div>
    <div class="item analysis" v-if="showAnalysis">
      <span>题目解析：</span>
      <div v-if="analysisInfo.answer_analysis" class="text" v-html="analysisInfo.answer_analysis"></div>
      <div v-else class="text">当前题目暂无详细解析</div>
      <div class="img-con" v-for="(ele, index) in analysisInfo.answer_analysisImg" :key="index">
        <img class="pic" :src="ele" @click.stop="previewImg(ele)">
      </div>
    </div>
    <!-- question_type值是5为主观题才有评语 -->
    <div class="item review" v-if="analysisInfo.question_type === '5'">
      <span>批阅评语：</span>
      <div class="text">{{ analysisInfo.remark || '暂无评语' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ImagePreview } from 'vant';
import { examStore } from '@/store/index'

const store = examStore()

const props = defineProps({
  // 解析详情
  analysisInfo: {
    type: Object,
    default: null
  }
})
// console.log(props.analysisInfo)
// 主观题还未批阅
const isWait = computed(() => {
  return props.analysisInfo.question_type === '5' && !props.analysisInfo.reviewed
})
// 是否显示题目具体分数
const showQuestionScore = computed(() => {
  const _obj = props.analysisInfo.viewedResult ? store.examInfo : store.examResultInfo
  return _obj?.setting?.paper_setting?.show_question_score
})
// 是否显示答案 judge在练习立即查看了用到
const showAnswer = computed(() => {
  const judge = store.examInfo?.setting?.judge?.show_answer
  const review = store.examResultInfo?.setting?.review?.show_anwer
  return isShowPracticeResult.value ? judge : review
})
// 是否显示答案解析
const showAnalysis = computed(() => {
  const judge = store.examInfo?.setting?.judge?.show_answer_analysis
  const review = store.examResultInfo?.setting?.review?.show_answer_analysis
  return isShowPracticeResult.value ? judge : review
})
// 是否是练习已点击查看答案
const isShowPracticeResult = computed(() => {
  return props.analysisInfo.viewedResult
})

// 实例图片预览
const previewImg = (url: string) => {
  ImagePreview({
    images: [url],
    showIndex: false,
    loop: false
  });
}
// 答案格式化 （1-单选 2-多选 3-判断 4-填空 5-问答）
const answerFormat = (answer: string[] = [], type: string) => {
  const enIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
  let formatStr = ''
  if (['1', '2'].includes(type)) {
    props.analysisInfo.options.forEach((item: any, i: number) => {
      if (answer.includes(item.option_value)) {
        formatStr += enIndex[i]
      }
    })
  } else if (type === '3') {
    formatStr = !answer.length ? '未答题' : answer[0] === '0' ? '错误' : '正确'
  } else if (type === '4') {
    const isSome = answer.some(item => !!item)
    const str = answer.map(item => {
      return item || '" "'
    }).join(', ')
    formatStr = isSome ? str : '未答题'
  } else if (type === '5') {
    formatStr = answer[0]
  }
  return formatStr || '未答题'
}
</script>

<style lang="less" scoped>
.answer-analysis-card {
  color: #333;
  background: #fff;
  padding: 16px;
  .result-score {
    font-size: 15px;
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    .result {
      display: flex;
      align-items: center;
      margin-right: 16px;
      .status {
        width: 20px;
        height: 20px;
        margin-right: 2px;
        &[name="success-fill-green"] {
          background: url("@/assets/svg/success-fill-green.svg") no-repeat center / 100% 100%;
        }
        &[name="wrong-fill"] {
          background: url("@/assets/svg/wrong-fill.svg") no-repeat center / 100% 100%;
        }
      }
    }
    .correct {
      color: #0ad0b6;
    }
    .wrong {
      color: #ff7548;
    }
    .score {
      color: #666;
    }
  }
  .item {
    color: #333;
    font-size: 14px;
    margin-bottom: 12px;
    & > span {
      color: #666;
    }
    .text {
      display: inline;
      word-break: break-all;
    }
  }
  .analysis {
    /deep/.text {
      p {
        display: inline;
      }
      img {
        display: none;
      }
    }
    .img-con {
      display: flex;
      flex-wrap: wrap;
      .pic {
        width: 205px;
        height: 140px;
        border-radius: 4px;
        margin: 0 10px 10px 0;
      }
    }
  }
}
</style>
