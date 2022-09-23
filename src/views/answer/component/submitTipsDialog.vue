<template>
  <Transition>
    <div v-if="visible" class="sumbit-tips-dialog">
      <div class="container">
        <div class="title">提交试卷</div>
        <div class="content">
          <p class="progress">答题进度：<span>{{ answeredList.length }}</span> / {{ store.getExamQuestionList.length }}</p>
          <p class="tips" v-if="unansweredNumber"><span class="unfinished">剩余{{ unansweredNumber }}题未作答</span>，现在提交试卷会影响您的考试成绩，确认交卷吗？</p>
          <p class="tips" v-else><span class="finished">题目已全部作答</span>，点击“确认交卷”按钮完成提交</p>
        </div>
        <div class="footer-btn">
          <template v-if="unansweredNumber">
            <div class="btn cancel" @click="close('confirm')">确认交卷</div>
            <div class="btn confirm" @click="close('cancel')">继续作答</div>
          </template>
          <template v-else>
            <div class="btn cancel" @click="close('cancel')">取消</div>
            <div class="btn confirm" @click="close('confirm')">确认交卷</div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { examStore } from '@/store/index';

const store = examStore()

defineProps({
  visible: {
    type: Boolean,
    default: () => false
  }
})
const emit = defineEmits(['update:visible', 'submit'])

// 已作答问题列表
const answeredList = computed(() => {
  return store.getExamQuestionList.filter((item: any) => item.answer?.length)
})
// 未作答题目数量
const unansweredNumber = computed(() => {
  return store.getExamQuestionList.length - answeredList.value.length
})

const close = (type: string) => {
  if (type === 'confirm') {
    emit('submit', false)
  }
  emit('update:visible', false)
}
</script>

<style lang="less" scoped>
.sumbit-tips-dialog {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  .container {
    width: 320px;
    background: #fff;
    border-radius: 8px;
    color: #666;
    font-size: 16px;
    overflow: hidden;
    transition: all 1s ease;
    transform: translate3d(0, -10%, 0);
    .title {
      color: #333;
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      padding: 24px 20px 0;
    }
    .content {
      padding: 10px 20px;
      font-size: 14px;
      color: #666666;
      text-align: center;
      .progress {
        color: #666;
        font-size: 17px;
        margin: 12px 0;
        & > span {
          color: #3464e0;
        }
      }
      .tips {
        color: #666;
        font-size: 16px;
        margin: 15px 0;
        .unfinished {
          color: #f81d22;
        }
        .finished {
          color: #0ad0b6;
        }
      }
    }
    .footer-btn {
      height: 56px;
      border-top: 1px solid #eaebf2;
      display: flex;
      .btn {
        flex: 1;
        color: #333;
        font-size: 18px;
        display: flex;
        justify-content: center;
        align-items: center;
        &:not(:last-of-type) {
          border-right: 1px solid #eaebf2;
        }
      }
      .confirm {
        color: #3464e0;
        font-weight: 500;
      }
    }
  }
}
// 弹窗过度动画
.v-enter-active, .v-leave-active {
  transition: opacity 0.3s ease;
}
.v-enter-from, .v-leave-to {
  opacity: 0;
}
</style>
