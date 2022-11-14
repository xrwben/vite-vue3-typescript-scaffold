<template>
  <div class="verify-result-container">
    <div class="result-content">
      <div class="item-flag">
        <p><van-icon :name="status ? 'checked' : 'clear'" :color="status ? '#0AD0B6' : '#FF7548'" /></p>
        <p :class="[status ? 'item-flag-success' : 'item-flag-error','item-flag-result']">{{ status?'核验成功':'核验失败' }}</p>
      </div>
      <div class="item-gradient-bottom">
        <div class="item-error" v-if="!status">
          <span class="la">失败原因：</span>
          <span class="lv">{{ verificationForm.error_msg }}</span>
        </div>
        <div class="item-info">
          <img :src="imgUrl" alt="">
          <div>
            <p>
              <span class="la">真实姓名：</span>
              <span class="lv">{{ verificationForm.user_chinese_name }}</span>
            </p>
            <p>
              <span class="la">身份证号：</span>
              <span class="lv">{{ verificationForm.id_card }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-btn">
      <div v-if="!status" class="tips"><van-icon name="warning-o" />如果多次认证失败，请联系考试管理员进行处理</div>
      <div v-if="status" class="btn" @click="handleStart">完成核验</div>
      <div v-else class="btn" @click="resetVerify">重新核验</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    verificationForm: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['resetVerify'],
  computed: {
    status() {
      return this.verificationForm?.pass_check
    },
    imgUrl() {
      return this.verificationForm.avatarUrl
    }
  },
  methods: {
    handleStart() {
      const { exam_id } = this.$route.query
      this.$router.replace({
        path: '/explain',
        query: {
          exam_id
        }
      })
    },
    handleBack() {
      this.$router.replace({
        path: '/test'
      })
    },
    resetVerify() {
      this.$emit('resetVerify')
    }
  }
}
</script>

<style lang="less" scoped>
.verify-result-container {
  .result-content {
    height: 460px;
    margin:0 16px;
    border-radius: 5px;
    font-size: 14px;
    background: white;
    .la {
      color:#999999
    }
    .lv {
      color: #333333
    }
    .item-gradient-bottom {
      padding: 0px 16px;
    }
    .item-flag {
      background: linear-gradient(180deg, rgba(228,238,254,1) 0%, rgba(255,255,255,1) 100%);
      text-align: center;
      padding-top: 30px;
      border-radius: 5px;
      /deep/.van-icon {
        font-size: 37.5px;
        margin-bottom: 18px;
      }
      &-result {
        font-size: 18px;
        font-weight: 500;
      }
      &-success {
        color:#0AD0B6;
      }
      &-error {
        color:#FF7548;
      }
    }
    .item-error {
      margin: 32px 0 24px;
    }
    .item-info {
      display: flex;
      align-items: center;
      img {
        width: 80px;
        height: 80px;
        margin-right: 12px;
      }
      p:first-of-type {
        margin-bottom: 16px;
      }
    }
  }
  .footer-btn {
    width: 100%;
    position: fixed;
    bottom: 0;
    .tips {
      width: 100%;
      height: 36px;
      background:#fdf6ec;
      font-size: 12px;
      color: #ff7548;
      padding: 0 8px;
      display: flex;
      align-items: center;
      .van-icon {
        margin-right: 4px;
      }
    }
    .btn {
      width: 100%;
      height: 48px;
      background: #3464e0;
      color: #fff;
      font-size: 17px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
