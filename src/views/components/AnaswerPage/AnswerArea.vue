<template>
  <div class="answer-content">
    <div class="header">
      <div class="exam-type">
        <span class="item-tag">{{handleType(item.question_type)}}</span>
        <span>{{ sortNum }}. </span>
        <span class="item-title" v-html="item.question_text"></span> 
        <span class="item-score" v-if="showScore">{{ `(${item.point}分)` }}</span>
      </div>
      <!-- 图片示例 -->
      <div
        v-if="item.questionImgList && item.questionImgList.length > 0"
        class="single-img-tips margin-tp"
      >
        <div
          class="img-box"
          v-for="(ele, index) in item.questionImgList"
          :key="index"
        >
          <span class="single-tips">{{ index === 0 ? "示例" : "" }}</span>
          <img
            class="single-img"
            :src="ele"
            alt=""
            @click="imgShowClick(ele)"
          />
        </div>
      </div>
    </div>
    <!-- 单选题 -->
    <SingleChoice
      v-if="item.question_type === '1'"
      :list="item.options"
      :id="item.question_id"
      :initData="item"
      :isPractise="isPractise"
    />
    <!-- 多选题 -->
    <MultipleChoice
      v-if="item.question_type === '2'"
      :list="item.options"
      :id="item.question_id"
      :initData="item"
      :isPractise="isPractise"
    />
    <!-- 判断题 -->
    <JudgmentQuestion
      :id="item.question_id"
      :initData="item"
      :list="item.options"
      v-if="item.question_type === '3'"
      :isPractise="isPractise"
    />
    <!-- 填空题 -->
    <Completion
      :list="item.options"
      :id="item.question_id"
      v-if="item.question_type === '4'"
      :isPractise="isPractise"
    />
    <!-- 问答题 -->
    <EssayQuestion
      :id="item.question_id"
      :initData="item"
      v-if="item.question_type === '5'"
      :isPractise="isPractise"
    />
    <div v-if="getPageSet && !getPageSet.enable_practice && !getAnalysisList.length" class="answer-flag-box" @click="handleFlag(item.question_id)">
      <img v-if="item.startFlag" src="@/assets/img/answer/flag_active.svg" alt="">
      <img v-else src="@/assets/img/answer/flag_default.svg" alt="">
      <span>标记一下</span>
    </div>
    <div v-if="showAnalysisBtn" @click="checkAnalysis" class="check_analsis"><span>查看答案解析</span></div>
  </div>
</template>
<script>
import { SingleChoice, MultipleChoice, JudgmentQuestion, Completion, EssayQuestion } from './children/index'
import { mapGetters, mapState, mapMutations } from 'vuex'
import { ImagePreview } from 'vant'
export default {
  components: {
    SingleChoice,
    MultipleChoice,
    JudgmentQuestion,
    Completion,
    EssayQuestion
  },
  props: {
    item: {
      type: Object,
      default: () => ({})
    },
    // number: {
    //   type: Number,
    //   default: 0
    // },
    isPractise: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'getPageSet',
      'getAnalysisList',
      'getSubQuestion',
      'getExamResult'
    ]),
    ...mapState(['practiseRecordList']),
    showScore() {
      return this.getPageSet?.paper_setting?.show_question_score
    },
    showAnalysisBtn() {
      return this.getPageSet?.enable_practice && this.getPageSet?.judge.enabled && !this.practiseRecordList.includes(this.item.question_id) && !this.getAnalysisList.length
    },
    sortNum() {
      const number = this.getSubQuestion.findIndex((e) => e.question_id === this.item.question_id)
      return number + 1
    }
  },
  methods: {
    ...mapMutations(['PRACTISE_RECORD', 'EXAM_RESULT']),
    // 标记
    handleFlag(id) {
      const arr = this.getExamResult
      arr?.contents?.length > 0 && arr.contents.forEach(item => {
        item.sub_questions.forEach((ele) => {
          if (ele.question_id === id) {
            ele.startFlag = !ele.startFlag
          }
        })
      })
      this.EXAM_RESULT(arr) // 更新所有数据
    },
    // 查看答题解析
    checkAnalysis() {
      this.practiseRecordList.push(this.item.question_id)
      this.PRACTISE_RECORD(this.practiseRecordList)
    },
    handleType(type) {
      switch (type) {
        case '1':
          return '单选题'
        case '2':
          return '多选题'
        case '3':
          return '判断题'
        case '4':
          return '填空题'
        case '5':
          return '问答题'
        case '6':
          return '编程题'
        case '7':
          return '组合题'
      }
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
<style lang="less">
.answer-content {
  padding: 16px;
  background: #fff;
  font-size: 16px;
  margin-bottom: 16px;
  .header {
    margin-bottom: 8px;
  }
  .exam-type {
    margin-bottom: 6px;
    flex-wrap: wrap;
    line-height: 30px;
    .item-tag {
      width: 44px;
      height: 18px;
      border-radius: 4px 0 4px 0;
      opacity: 1;
      background: rgba(52,100,224,1);
      color: white;
      font-family: "TencentSans";
      font-size: 12px;
      padding:4px;
      margin-right: 8px;
    }
    .item-title {
      p, div {
        display: inline;
      }
      /deep/img{
        width: 100% !important;
        height: 100% !important;
      }
    }
    .item-score {
      color: #999999;
      margin-left: 8px;
    }
  }
  .answer-flag-box {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-top: 16px;
    img {
      width: 20px;
      height: 20px;
      margin-right: 8.5px;
    }
    span {
      font-size: 14px;
      color:#999999;
    }
  }
  .single-img-tips {
    display: flex;
    flex-direction: column;
    .single-img {
      width: 232px;
      height: 132px;
      border-radius: 4px;
      margin-left: 12px;
    }
    .img-box {
      display: flex;
      margin-bottom: 20px;
      .single-tips {
        display: inline-block;
        width: 33px;
      }
    }
    .img-box:last-of-type {
      margin-bottom: unset;
    }
  }
  .check_analsis {
    background:#999999;
    height: 1px;
    width: calc(100% - 40px);
    margin: 0 auto;
    position: relative;
    margin: 20px;
    span {
      font-size: 12px;
      text-align: center;
      color: @color-theme;
      position: absolute;
      top: -10px;
      height: 20px;
      line-height: 20px;
      left: calc(50% - 60px);
      background:#fff;
      width: 120px;
    }
  }
}
</style>
