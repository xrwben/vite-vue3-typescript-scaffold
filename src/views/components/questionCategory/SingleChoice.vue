<template>
  <div class="single-choice-container">
    <van-radio-group v-model="currentValue" :disabled="disabledEdit" @change="changeRaido">
      <van-radio
        v-for="(option, index) in questionDetails.options"
        :key="option.option_title"
        :name="option.option_value">
        <div class="option-text">
          <span>{{ enIndex(index) }}. </span>
          <div v-html="option.option_text"></div>
        </div>
        <!-- 图片 -->
        <div class="option-img" v-if="option.richImgList && option.richImgList.length">
          <img
            class="pic"
            v-for="(item, i) in option.richImgList"
            :key="i"
            :src="item"
            @click.stop="previewImg(item)">
        </div>
      </van-radio>
    </van-radio-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ImagePreview } from 'vant';
import { examStore } from '@/store/index'

const store = examStore()

const props = defineProps({
  // 题目详情
  questionDetails: {
    type: Object,
    default: null
  },
  // 题目是否可编辑
  disabledEdit: {
    type: Boolean,
    default: true
  }
})

let currentValue = ref('')
currentValue.value = props.questionDetails.answer && props.questionDetails.answer[0]

// 是否显示练习结果
const isShowPracticeResult = computed(() => {
  return store.examInfo?.setting?.enable_practice && store.examInfo?.setting?.judge?.enabled
})
const enIndex = computed(() => {
  return (index: number) => {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'][index]
  }
})

// 实例图片预览
const previewImg = (url: string) => {
  ImagePreview({
    images: [url],
    showIndex: false,
    loop: false
  });
}
// 点击选择
const changeRaido = (val: string) => {
  if (val) {
    const list = store.examInfo
    list.contents.forEach((item: any) => {
      item.sub_questions.forEach((ele: any) => {
        if (ele.question_id === props.questionDetails.question_id) {
          ele.answer = [val]
          ele.choiceValue = val // 这个好像不需要，暂时留着吧
          // 计算练习得分
          if (isShowPracticeResult.value && ele.correct_answer.length) {
            const isCorrect = ele.correct_answer.includes(val)
            ele.correct = isCorrect
            ele.score = isCorrect ? ele.point : 0
          }
        }
      })
    })
    // 更新考试信息
    // this.$store.commit('exam/saveExamInfo', list)
    store.$patch((state: any) => {
      console.log(state)
      localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(state.examInfo))
    })
  }
}
</script>

<style lang="less" scoped>
.single-choice-container {
  margin-bottom: 16px;
  :deep(.van-radio-group) {
    width: 100%;
    .van-radio {
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      .van-radio__icon {
        font-size: 16px;
      }
      .van-radio__icon--checked .van-icon {
        border-color: #3464e0;
        background: #3464e0;
      }
    }
    .option-text {
      color: #333;
      font-size: 14px;
      line-height: 24px;
      display: inline;
      white-space: pre-wrap;
      word-break: break-all;
      div, p {
        display: inline;
      }
      img {
        display: none;
      }
    }
    .option-img {
      display: flex;
      flex-wrap: wrap;
      .pic {
        width: 200px;
        height: 140px;
        border-radius: 4px;
        margin: 0 10px 10px 0;
      }
    }
  }
}
</style>
