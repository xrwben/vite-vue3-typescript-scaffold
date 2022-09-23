<template>
  <div class="answer-analysis-card">
    <div class="result-score">
      <p v-if="!isWait" :class="['result', analysisInfo.correct ? 'correct' : 'wrong']">
        <sdc-svg-icon class="status" :name="analysisInfo.correct ? 'success-fill-green' : 'wrong-fill'" width="20px" height="20px"></sdc-svg-icon>
        {{ analysisInfo.correct ? "正确" : "错误" }}
      </p>
      <p v-if="showQuestionScore"><span class="score">得分：</span>{{ isWait ? '批阅中，暂无得分' : `${analysisInfo.score || 0}分` }}</p>
    </div>
    <!-- 用户答案 -->
    <div class="item my-answer" v-if="['1','2','3'].includes(analysisInfo.question_type)">
      <span>您的答案：</span>{{ handleCorrect(analysisInfo.answer, analysisInfo.question_type) || "未答题" }}
    </div>
    <div class="item my-answer" v-if="['4'].includes(analysisInfo.question_type)">
      <span>您的答案：</span>{{ handleSelf(analysisInfo.answer) }}
    </div>
    <div class="item my-answer" v-if="['5'].includes(analysisInfo.question_type)">
      <span>您的答案：</span>
      <div class="text" v-html="handleSelf(analysisInfo.answer)"></div>
    </div>
    <!-- 正确答案 -->
    <div class="item correct-answer" v-if="showAnswer && analysisInfo.question_type !== '5'">
      <span>正确答案：</span>{{ handleCorrect(analysisInfo.correct_answer, analysisInfo.question_type) }}
    </div>
    <div class="item analysis" v-if="showAnalysis">
      <span>题目解析：</span>
      <div v-if="analysisInfo.answer_analysis" class="text" v-html="analysisInfo.answer_analysis"></div>
      <div v-else class="text" >当前题目暂无详细解析</div>
      <div class="img-con" v-for="(ele, index) in analysisInfo.answer_analysisImg" :key="index">
        <el-image class="pic" :src="ele" :preview-src-list="[ele]"></el-image>
      </div>
    </div>
    <!-- question_type值是5为主观题才有评语 -->
    <div class="item review" v-if="analysisInfo.question_type === '5'">
      <span>批阅评语：</span>
      <div class="text">{{ analysisInfo.remark || '暂无评语' }}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  props: {
    // 解析详情
    analysisInfo: {
      type: Object,
      default: null
    }
  },
  computed: {
    ...mapState('exam', ['examInfo', 'examResultInfo']),
    // 主观题还未批阅
    isWait () {
      return this.analysisInfo.question_type === '5' && !this.analysisInfo.reviewed
    },
    // 是否显示题目具体分数
    showQuestionScore () {
      const _obj = this.analysisInfo.viewedResult ? this.examInfo : this.examResultInfo
      return _obj?.setting?.paper_setting?.show_question_score
    },
    // 是否显示答案 judge在练习立即查看了用到
    showAnswer () {
      const judge = this.examInfo?.setting?.judge?.show_answer
      const review = this.examResultInfo?.setting?.review?.show_anwer
      return this.isShowPracticeResult ? judge : review
    },
    // 是否显示答案解析
    showAnalysis () {
      const judge = this.examInfo?.setting?.judge?.show_answer_analysis
      const review = this.examResultInfo?.setting?.review?.show_answer_analysis
      return this.isShowPracticeResult ? judge : review
    },
    // 是否是练习已点击查看答案
    isShowPracticeResult () {
      return this.analysisInfo.viewedResult
    }
  },
  // created () {
  //   console.log('>>>>', this.analysisInfo)
  // },
  methods: {
    handleCorrect(list, type) {
      list = list || []
      // console.log('>>>>>>>', list, type)
      const CORRECT_LIST = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U']
      let correct = ''
      let correctValue = ''
      if (['1', '2'].includes(type)) { // 单选多选
        this.analysisInfo.options.forEach((v, i) => {
          if (list.includes(v.option_value)) {
            correct += CORRECT_LIST[i]
          }
        })
      } else {
        list?.length > 0 && list.forEach((e) => {
          if (type === '3') { // 判断
            // 这里后端返回的是0-错误，1-正确
            correct = e === '1' ? '正确' : e === '0' ? '错误' : ''
          } else { // 填空
            // 去除最后一个','
            correctValue += `${e},`
            correct = correctValue.substring(0, correctValue.length - 1)
          }
        })
      }
      return correct
    },
    handleSelf(answer) {
      // console.log(answer)
      answer = answer || []
      let str = ''
      if (answer.length > 1) {
        const val = answer.filter((e) => !e)
        if (val.length === answer.length) return '未答题'
        answer.forEach((e) => {
          str += `${e || '" "'},` 
        })
        return str.substring(0, str.length - 1)
      }
      return answer.join() ? answer.join() : '未答题'
    }
  }
}
</script>

<style lang="less" scoped>
.answer-analysis-card {
  color: #333;
  background: #fff;
  margin-bottom: 24px;
  .result-score {
    font-size: 15px;
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    .result {
      display: flex;
      align-items: center;
      margin-right: 16px;
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
    line-height: 24px;
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
