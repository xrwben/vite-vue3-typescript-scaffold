<template>
  <div class="face-verification-container">
    <div class="steps-container">
      <div class="step">
        <i :name="[currentStep === 0 ? 'is-current' : 'is-success']">1</i>
        <p :class="{'active': currentStep === 0}">填写个人信息</p>
      </div>
      <div class="split-line"></div>
      <div class="step">
        <i :name="[currentStep === 1 ? 'is-current' : currentStep > 1 ? 'is-success' : '']">2</i>
        <p :class="{'active': currentStep === 1}">个人照片采集</p>
      </div>
      <div class="split-line"></div>
      <div class="step">
        <i :name="[currentStep === 2 ? (verifyResult.pass_check ? 'is-success' : 'is-fail') : '']">3</i>
        <p :class="{'active': currentStep === 2}">身份核验结果</p>
      </div>
    </div>
    <!-- 个人信息 -->
    <person-info v-show="currentStep === 0" @next-step="infoNextStep"></person-info>
    <!-- 照片采集 -->
    <take-photo v-show="currentStep === 1" :paramsForm="paramsForm" @prev-step="currentStep=0" @next-verify-result="nextVerify"></take-photo>
    <!-- 验证结果 -->
    <verification-result v-if="currentStep === 2" :verificationForm="verifyResult" @reset-verify="currentStep=0"></verification-result>
  </div>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import PersonInfo from './component/PersonInfo.vue'
import TakePhoto from './component/TakePhoto.vue'
import VerificationResult from './component/VerificationResult.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const state: any = reactive({
  currentStep: 0,
  paramsForm: null,
  verifyResult: null
})
const { currentStep, paramsForm, verifyResult }  = toRefs(state)

// 个人信息下一步
const infoNextStep = (row: any) => {
  const { record_id, exam_id } = route.query
  state.currentStep += 1
  state.paramsForm = {
    ...row,
    exam_id,
    record_id
  }
}
// 验证下一步
const nextVerify = (data: any) => {
  state.currentStep = 2
  state.verifyResult = data
}
</script>

<style lang="less">
.face-verification-container {
  .steps-container {
    height: 82px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      & > i {
        width: 20px;
        height: 20px;
        background: #dcdcdc;
        border-radius: 50%;
        font-style: normal;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        &[name="is-current"] {
          font-size: 0;
          background: url('@/assets/svg/icon-clock.svg') no-repeat center / 100% 100%;
        }
        &[name="is-success"] {
          font-size: 0;
          background: url('@/assets/svg/success-fill-green.svg') no-repeat center / 100% 100%;
        }
        &[name="is-fail"] {
          font-size: 0;
          background: url('@/assets/svg/wrong-fill.svg') no-repeat center / 100% 100%;
        }
      }
      & > p {
        color: #999;
        font-size: 14px;
        margin-top: 8px;
        &.active {
          color: #333;
        }
      }
    }
    .split-line {
      width: 30px;
      height: 2px;
      background: #dcdcdc;
    }
  }
}
</style>
