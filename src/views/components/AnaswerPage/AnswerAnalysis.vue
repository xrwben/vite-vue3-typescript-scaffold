<template>
  <div :class="['mg-bt', 'answer-analysis-container']">
    <!-- <div class="item-title d-a">
      <van-image :src="require('@/assets/img/analysis.svg')" />
      答案解析
    </div> -->
    <div class="analysis-content">
      <div class="item-score">
        <van-icon v-if="(item.question_type=='5'&&userAnswer.reviewed) || item.question_type!=='5'" :name="userAnswer.correct?'checked':'clear'" :color="userAnswer.correct?'#0AD0B6':'#FF7548'" />
        <span
          v-if="(item.question_type=='5'&&userAnswer.reviewed) || item.question_type!=='5'"
          :class="[userAnswer.correct ? 'correct' : 'error', 'score-default']"
          >{{ userAnswer.correct ? "正确" : "错误" }}</span
        >
        <span v-if="show_score"><span class="label-gray">得分：</span>{{ item.question_type=='5'&&!userAnswer.reviewed?'批阅中，暂无得分':`${userAnswer.score}分` }}</span>
      </div>
       <div
        class="item-choice"
        v-if="['1','2','3'].includes(item.question_type)"
      >
      <span class="label-gray">您的答案：</span>
        {{
          `${
            handleCorrect(userAnswer.answer, item.question_type) || "未答题"
          }`
        }}
      </div>
      <div class="item-choice" v-if="['4'].includes(item.question_type)"><span class="label-gray">您的答案：</span>{{ handleSelf(userAnswer.answer) }}</div>
      <div class="item-choice" v-if="['5'].includes(item.question_type)"><span class="label-gray">您的答案：</span><span v-html="handleSelf(userAnswer.answer)"></span></div>
       <div class="item-true" v-if="showAnswer && item.question_type !== '5'">
        <span class="label-gray">正确答案：</span>{{ handleCorrect(item.correct_answer, item.question_type) }}
      </div>
      <div class="analysis" v-if="showAnalysis">
        <span class="label-gray">题目解析：</span>
        <span class="analysis-text" v-html="item.answer_analysis || '当前题目暂无详细解析'"></span>
        <div
          class="img-box" 
          v-for="(ele, index) in item.answer_analysisImg"
          :key="index"
        >
          <img
            class="analysis-img"
            :src="ele"
            alt=""
            @click="imgShowClick(ele)"
          />
        </div>
      </div>
      <div class="analysis" v-if="item.question_type == 5">
        <span class="label-gray">批阅评语：</span>
        <span v-html="userAnswer.remark||'暂无批阅'"></span>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import { CORRECT_LIST } from 'utils/constant'
import { ImagePreview } from 'vant'
export default {
  props: {
    userAnswer: { // 用户答题答案
      type: Object,
      default: () => ({})
    },
    item: { // 每题的数据
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'getPageSet'
    ]),
    showAnswer() {
      return this.getPageSet?.review?.show_anwer
    },
    showAnalysis() {
      return this.getPageSet?.review?.show_answer_analysis
    },
    show_score() {
      return this.getPageSet?.paper_setting?.show_question_score
    }

  },
  methods: {
    handleCorrect(list = [], type) {
      let correct = ''
      let correctValue = ''
      if (['1', '2'].includes(type)) { // 单选多选
       this.item.options.forEach((v, i) => {
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
    handleSelf(answer = []) {
     let str = ''
      if (answer?.length > 1) {
        const val = answer.filter((e) => !e)
        if (val.length === answer.length) return '未答题'
        answer.forEach((e) => {
          str += `${e || '" "'},` 
        })
        return str.substring(0, str.length - 1)
      }
      return answer.join() ? answer.join() : '未答题'
    },
    imgShowClick(item) {
      ImagePreview({
        images: [item],
        showIndex: true,
        loop: false,
        startPosition: 0
      })
    }
  }
}
</script>
<style lang="less" scoped>
.mg-bt {
  margin-bottom: 16px;
}
.answer-analysis-container {
  padding: 14.5px 16px 16px;
  margin-top: -20px;
  background: #fff;
  font-size: 16px;
  color: #333333;
  .item-title {
    font-family: TTTGBMedium;
    font-size: 18px;
    color: @color-theme;
    font-weight: 500;
    letter-spacing: 0;
    .van-image {
      width: 24px;
      margin-right: 10px;
    }
  }
  .analysis-content {
    // padding-left: 34px;
    /deep/.analysis-text {
      line-height: 22px;
      /deep/p{
        overflow-wrap: break-word;
      }
      img {
        display: none;
      }
    }
    .item-score {
      margin-top: 10px;
      .score-default {
        margin: 0 16px 0 2px;
      }
      .error {
        color: #ff7548;
      }
      .correct {
        color: #0AD0B6;
      }
    }
    .item-true,
    .item-choice {
      margin-top: 12px;
    }

    .analysis {
      margin-top: 15px;
      span:first-of-type {
        color: @color-theme;
      }
      &-text {
        margin-top: 5px;
        word-break: break-all;
      }
      .img-box {
        .analysis-img {
          width: 232px;
          height: 132px;
          border-radius: 4px;
          margin-top: 10px;
        }
      }
    }
  }
  .label-gray{
    color: #666 !important;
  }
}
</style>
