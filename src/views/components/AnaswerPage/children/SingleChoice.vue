<template>
  <div
    :class="[
      getAnalysisList && getAnalysisList.length > 0 ? '' : 'mg-bt',
      'single-choice-container',
    ]"
  >
    <!-- 单选答案回显 start -->
    <div
      v-if="(getAnalysisList && getAnalysisList.length > 0) || isPractise"
      class="answer-status-box"
    >
      <div
        class="answer-group"
        v-for="(ele, index) in list"
        :key="ele.option_title"
      >
        <div class="group-box">
          <div class="d-a radio-icon-text">
            <van-icon
              :class="[handleName(ele.option_value, 'iconBg')]"
              :name="handleName(ele.option_value)"
              size="22"
            />
            <!-- <span class="item-text">{{
              `${CORRECT_LIST[index]}. ${ele.option_text}`
            }}</span> -->
            <div class="item-text d-fs">
              <span>{{ CORRECT_LIST[index] }}. </span>
              <div class="html-title" v-html="ele.option_text"></div>
            </div>
          </div>
        </div>
        <div
          class="reset-img-box"
          v-if="ele.richImgList && ele.richImgList.length > 0"
        >
          <img
            class="single-img"
            v-for="(item, index) in ele.richImgList"
            :key="index"
            :src="item"
            alt=""
            @click="imgShowClick(item)"
          />
        </div>
      </div>
    </div>
    <!-- 单选答案回显 end -->
    <div v-else>
      <van-radio-group
        class="radio-box"
        v-for="(ele, index) in list"
        :key="ele.option_title"
        v-model="initData.choiceValue"
        @change="changeRaido"
      >
        <div class="d-a group-box">
          <van-radio
            :checked-color="color"
            :name="ele.option_value"
          >
            <div class="single-text d-fs">
              <!-- <span class="choice-text">{{
                `${CORRECT_LIST[index]}. ${ele.option_text}`
              }}</span> -->
              <span>{{ CORRECT_LIST[index] }}. </span>
              <div class="html-title" v-html="ele.option_text"></div>
            </div>
          </van-radio>
        </div>
        <!-- 图片 -->
        <div
          v-if="ele.richImgList && ele.richImgList.length > 0"
          :class="[
            initData.choiceValue === ele.option_value
              ? 'active'
              : '',
            'radio-img-box',
          ]"
        >
          <img
            class="single-img"
            v-for="(item, index) in ele.richImgList"
            :key="index"
            :src="item"
            alt=""
            @click="imgShowClick(item)"
          />
        </div>
      </van-radio-group>
    </div>
  </div>
</template>
<script>
import { THEME_COLOR, CORRECT_LIST } from 'utils/constant'
import { mapMutations, mapGetters } from 'vuex'
import { ImagePreview } from 'vant'
export default {
  name: 'SingleChoice',
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
      'getName',
      'getQuestionItem'
    ])
  },
  methods: {
    ...mapMutations(['EXAM_RESULT']),
    changeRaido(val) {
      if (val) {
        const list = this.getExamResult
        list?.contents?.length > 0 && list.contents.forEach(item => {
          item.sub_questions.forEach((ele) => {
            if (ele.question_id === this.id) {
              ele.answer = [val]
              ele.choiceValue = val
              // 练习计算得分
              const score = ele.correct_answer?.length > 0 && ele.correct_answer.includes(val)
              ele.score = score ? ele.point : 0 
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
      }
    },
    handleName(val, stringLabel) {
      let color = ''
      let choiceList = []
      if (this.isPractise) {
        choiceList = this.getQuestionItem?.answer?.length > 0 ? this.getQuestionItem?.answer : [] // 用户的答案
      } else {
        const data = this.getAnalysisList.find((e) => e.question_id === this.id) // 用户的答案
        choiceList = data?.answer 
      }
      if (choiceList?.includes(val)) { // 展示用户选择
        color = stringLabel ? `checked-${stringLabel}` : 'checked'
      } else {
        color = stringLabel ? `circle-${stringLabel}` : 'circle'
      }
      return color
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
// // }
// .mg-btLogo {
//   margin-bottom: 130px;
// }
.single-choice-container {
  // padding: 16px 0;
  /deep/.van-radio__label {
    margin-left: 10px;
    line-height: unset;
  }
  /deep/.single-text {
    line-height: 22px;
    .html-title {
      word-break: break-all;
      img {
        display: none;
      }
    }
  }
  .single-img {
    width: 232px;
    height: 132px;
    border-radius: 4px;
  }
  .active {
    background: #ebf0fb;
  }
  .radio-box {
    .group-box {
      display: flex;
      .van-radio {
        width: 100%;
        padding-top: 12px;
      }
    }
    .radio-img-box {
      padding-bottom: 20px;
      text-align: center;
    }
  }

  .answer-status-box {
    .answer-group {
      .group-box {
        .radio-icon-text {
          padding-top: 12px;
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
      .reset-img-box {
        text-align: center;
        padding-bottom: 20px;
      }
    }
    .checked-iconBg {
      color: @color-theme;
    }
    .clear-iconBg {
      color: #ff7548;
    }
    .circle-iconBg {
      color: #c8c9cc;
    }
    .checked-boxBg {
      // background: #ebf0fb;
    }
    .clear-boxBg {
      background: #feede5;
    }
  }
}
</style>
