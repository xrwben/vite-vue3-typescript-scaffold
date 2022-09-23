<template>
  <div class="multiple-choice-container">
    <van-checkbox-group v-model="currentValue" :disabled="disabledEdit" @change="changeCheckbox">
      <van-checkbox
        v-for="(option, index) in questionDetails.options"
        :key="option.option_title"
        :name="option.option_value"
        shape="square">
        <div class="option-text">
          <span>{{ enIndex(index) }}. </span>
          <div v-html="option.option_text"></div>
        </div>
        <!-- 图片 -->
        <!-- 图片 -->
        <div class="option-img" v-if="option.richImgList && option.richImgList.length">
          <img
            class="pic"
            v-for="(item, i) in option.richImgList"
            :key="i"
            :src="item"
            @click.stop="previewImg(item)">
        </div>
      </van-checkbox>
    </van-checkbox-group>
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

let currentValue = ref([])
currentValue.value = props.questionDetails.answer && props.questionDetails.answer || []
// console.log(props.questionDetails)

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
const changeCheckbox = (val: string[]) => {
  if (val) {
    const list = store.examInfo
    list.contents.forEach((item: any) => {
      item.sub_questions.forEach((ele: any) => {
        if (ele.question_id === props.questionDetails.question_id) {
          ele.answer = val
          ele.choiceValue = val
          // 计算练习得分
          if (isShowPracticeResult.value && ele.correct_answer.length) {
            const errArr = val.filter(e => !ele.correct_answer.includes(e)) // 错题
            const trueArr = ele.correct_answer.filter((e: any) => ele.answer.find((v: any) => e === v)) // 对题
            ele.correct = trueArr.length === ele.correct_answer.length
            ele.score = errArr.length ? 0 : trueArr.length === ele.correct_answer.length ? ele.point : ele.missing_point
          }
        }
      })
    })
    // 更新考试信息
    // this.$store.commit('exam/saveExamInfo', list)
    store.$patch((state: any) => {
      localStorage.setItem(`Exam_Info_${state.userInfo.EnName}`, JSON.stringify(state.examInfo))
    })
  }
}
</script>

<style lang="less" scoped>
.multiple-choice-container {
  margin-bottom: 16px;
  :deep(.van-checkbox-group) {
    width: 100%;
    .van-checkbox {
      margin: 0 0 15px 0;
      display: flex;
      align-items: center;
      .van-checkbox__icon {
        font-size: 16px;
      }
      .van-checkbox__icon--checked .van-icon {
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
