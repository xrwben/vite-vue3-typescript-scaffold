<template>
  <div
    :class="[
      getAnalysisList && getAnalysisList.length > 0 ? '' : 'mg-bt',
      'multiple-choice-container',
    ]"
  >
    <!-- 多选答案回显  start -->
    <div
      v-if="(getAnalysisList && getAnalysisList.length > 0) || isPractise"
      class="answer-analysis"
    >
      <div
        class="group-box"
        v-for="(item, index) in list"
        :key="item.option_title"
      >
        <div class="d-a check-icon-text">
          <span :class="[handleName(item.option_value, 'iconBg'), 'diy-check']">
            <van-icon :name="handleName(item.option_value)" size="16" />
          </span>
          <!-- <span class="item-text">{{
            `${CORRECT_LIST[index]}. ${item.option_text}`
          }}</span> -->
          <div class="item-text d-fs">
            <span>{{ CORRECT_LIST[index] }}. </span>
            <div class="html-title" v-html="item.option_text"></div>
          </div>
        </div>
        <!-- 图片 -->
        <div
          class="reset-img-box d-j"
          v-if="item.richImgList && item.richImgList.length > 0"
        >
          <img
            class="single-img"
            v-for="(ele, index) in item.richImgList"
            :key="index"
            :src="ele"
            alt=""
            @click="imgShowClick(ele)"
          />
        </div>
      </div>
    </div>
    <!-- 多选答案回显 end -->
    <div v-else>
      <van-checkbox-group
        class="check-box"
        v-for="(item, index) in list"
        :key="item.option_title"
        v-model="initData.choiceValue"
        @change="changeCheck"
      >
        <div class="content-box d-a">
          <van-checkbox
            :name="item.option_value"
            shape="square"
            :checked-color="color"
            class="check-box"
          >
            <div class="check-text d-fs">
              <span>{{ CORRECT_LIST[index] }}. </span>
              <div class="html-title" v-html="item.option_text"></div>
            </div>
            <!-- <span>{{
              `${CORRECT_LIST[index]}. ${item.option_text}`
            }}</span> -->
          </van-checkbox>
        </div>
        <!-- 图片 -->
        <div
          v-if="item.richImgList && item.richImgList.length > 0"
          :class="[
            isFindOptionValue(item.option_value) ? 'bg-active' : '',
            'check-img-box',
          ]"
        >
          <img
            class="single-img"
            v-for="(ele, index) in item.richImgList"
            :key="index"
            :src="ele"
            alt=""
            @click="imgShowClick(ele)"
          />
        </div>
      </van-checkbox-group>
    </div>
  </div>
</template>
<script>
import { THEME_COLOR, CORRECT_LIST } from 'utils/constant'
import { mapGetters, mapMutations } from 'vuex'
import { ImagePreview } from 'vant'
export default {
  name: 'MultipleChoice',
  props: {
    list: {
      type: Array,
      default: () => ([])
    },
    id: { // 此处id用来做判断，不能动
      type: String,
      default: ''
    },
    isPractise: {
      type: Boolean,
      default: false
    },
    initData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      color: THEME_COLOR,
      CORRECT_LIST: CORRECT_LIST
    }
  },
  computed: {
    ...mapGetters([
      'getExamNumber',
      'getAnalysisList',
      'getExamResult',
      'getPageSet',
      'getName',
      'getQuestionItem'
    ])
  },
  methods: {
    ...mapMutations(['EXAM_RESULT']),
    changeCheck(val) {
      const list = this.getExamResult
      list?.contents?.length > 0 && list.contents.forEach(item => {
        item.sub_questions.forEach((ele) => {
          if (ele.question_id === this.id) {
            ele.answer = val
            ele.choiceValue = val
            // 练习计算得分
            if (ele.correct_answer?.length > 0) {
              const errTips = val.filter(e => !ele.correct_answer.includes(e)) // 错题
              const trueTips = ele.correct_answer.filter((e) => ele.answer.find((v) => e === v)) // 对题
              ele.score = errTips.length > 0 ? 0 : trueTips.length === ele.correct_answer.length ? ele.point : ele.missing_point
            }
          }
        })
      })
      this.EXAM_RESULT(list) // 更新所有数据
      // 存用户答题的所有数据
      const info = JSON.parse(localStorage.getItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`)) || {}
      if (info.examId) {
        const infoResult = {
          ...info,
          number: this.getExamNumber,
          currentTime: new Date().getTime()
        }
        localStorage.setItem(`Tencent_ExamEvalution_CurrentExam_Info_${this.getName}`, JSON.stringify(infoResult))
      }
    },
    handleName(val, stringLabel = '') {
      let choiceList = []
      if (this.isPractise) {
        choiceList = this.getQuestionItem?.answer?.length > 0 ? this.getQuestionItem?.answer : [] // 用户的答案
      } else {
        const data = this.getAnalysisList.find((e) => e.question_id === this.id) // 用户的答案
        choiceList = data?.answer 
      }
      if (choiceList?.includes(val)) {
        const icon = stringLabel ? `success-${stringLabel}` : 'success'
        return icon
      }
    },
    isFindOptionValue(val) {
      return (this.initData?.choiceValue || []).includes(val)
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
// .mg-bt {
//   margin-bottom: 50px;
// }
// .mg-btLogo {
//   margin-bottom: 130px;
// }
.multiple-choice-container {
  // padding: 16px 0;
  .single-img {
    width: 232px;
    height: 132px;
    border-radius: 4px;
  }
  .bg-active {
    background: #ebf0fb;
  }
  // /deep/ .van-checkbox__label {
  //   word-break: break-all;
  // }
  .check-box {
    // padding-bottom: 20px;
    // text-align: center;
    .content-box {
      .van-checkbox__label {
        margin-left: 10px;
      }
      .check-box {
        width: 100%;
        padding-top: 12px;
        .check-text {
          line-height: 22px;
          /deep/.html-title {
            word-break: break-all;
            img {
              display: none;
            }
          }
        }
      }
    }
    .check-img-box {
      text-align: center;
      padding-bottom: 20px;
    }
  }
  .answer-analysis {
    // 背景色
    .success-boxBg {
      // background: #ebf0fb;
    }
    .cross-boxBg {
      background: #feede5;
    }
    // .success-boxBgError {
    //   background: #ebf0fb;
    // }
    .group-box {
      .reset-img-box {
        padding-bottom: 20px;
      }
      .check-icon-text {
        padding-top: 12px;
      }
      .diy-check {
        width: 16px;
        height: 16px;
        border: 1px solid #c8c9cc;
        display: inline-block;
        text-align: center;
        border-radius: 4px;
        .van-icon::before {
          line-height: 16px;
          color: white;
        }
        i {
          width: 16px;
          height: 16px;
        }
      }
      // icon背景色
      .cross-iconBg {
        background: #ff7548;
        border-color: #ff7548;
      }
      // .success-iconBgError {
      //   background: @color-theme;
      //   border-color: @color-theme;
      // }
      .success-iconBg {
        background: @color-theme;
        border-color: @color-theme;
        // background: #0ad0b6;
        // border-color: #0ad0b6;
      }
      .item-text {
        margin-left: 10px;
        line-height: 22px;
        /deep/.html-title {
          word-break: break-all;
          img {
            display: none;
          }
        }
      }
    }
  }
}
</style>
