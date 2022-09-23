<template>
  <div class="authorize-container">
    <NavBar title="身份验证"/>
    <div class ="step-container">
      <div class="item-step">
        <van-icon class-prefix="van-icon" :name="active === 0 ? 'clock' : 'checked'" />
        <p :class="[active === 0 ? 'activeLabel' : '', 'step-label']">填写个人信息</p>
      </div>
      <div class="step-line"></div>
      <div class="item-step">
        <van-icon class-prefix="van-icon" :name="active === 1 ? 'clock' : active === 0 ?  'number-two' : 'checked'" />
        <p :class="[active === 1 ? 'activeLabel' : '', 'step-label']">个人照片采集</p>
      </div>
      <div class="step-line"></div>
      <div class="item-step">
        <van-icon class-prefix="van-icon" :name="active !== 2  ? 'number-three' : verificationForm.pass_check ?  'checked' : 'clear'" />
        <p :class="[active === 2 ? 'activeLabel' : '', 'step-label']">身份验证结果</p>
      </div>
    </div>
    <PersonInfo v-show="active === 0" @handleNextStep='handleNextStep'/>
    <PersonPhoto v-show="active === 1" :paramsForm="paramsForm" @handleBackStep="handleBackStep" @handleNextVerify='handleNextVerify' />
    <AuthorizeResult v-show="active === 2" :verificationForm="verificationForm" @resetVerify="resetVerify"/>
  </div>
</template>
<script>
import { NavBar } from '@/components/index'
import AuthorizeResult from './children/AuthorizeResult'
import PersonPhoto from './children/PersonPhoto'
import PersonInfo from './children/PersonInfo'
export default {
  components: {
    AuthorizeResult,
    PersonPhoto,
    PersonInfo,
    NavBar
  },
  data() {
    return {
      active: 0,
      paramsForm: {},
      verificationForm: {}
    }
  },
  mounted() {
    this.active = 0
    this.paramsForm = {}
    this.verificationForm = {}
  },
  methods: {
    handleNextStep(row) {
      const { record_id, exam_id } = this.$route.query
      this.active += 1
      this.paramsForm = {
        ...row,
        exam_id,
        record_id
      }
    },
    handleNextVerify(row) {
      this.active += 1
      this.verificationForm = row
    },
    handleBackStep() {
      this.active -= 1 
    },
    resetVerify() {
      this.active = 0
    }
  }
}
</script>
<style lang="less">
.authorize-container {
  .step-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 66px 16px 18px;
    font-size: 14px;
    .step-line {
      width: 30px;
      height: 2px;
      background-color: #DCDCDC;
    }
    .item-step {
      text-align: center;
      .step-label {
        margin-top: 8px;
        color:#999999
      }
      .activeLabel {
        color:#333333
      }
      .van-icon {
        font-size: 20px;
      }
      .van-icon-clock {
        color: @color-theme;
      }
      .van-icon-checked {
        color:#0AD0B6
      }
      .van-icon-clear {
        color:#FF7548
      }
      .van-icon-number-two,.van-icon-number-three {
        display: inline-block;
        line-height: 20px;
        text-align: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background:#DCDCDC;
        color: white;
        font-size: 14px;
      }
      .van-icon-number-two::before {
        content: '2';
      }
      .van-icon-number-three::before {
        content: '3';
      }
    }
  }
  .bottom-btn-box {
    position: fixed;
    bottom:0px;
    width: 100%;
    .van-button {
      width: 100%;
      border:unset;
      border-radius:unset;
      height: 48px;
    }
    .van-button--plain {
      background: #F5F7F9;
      color: #666666
    }
  }
}
</style>
