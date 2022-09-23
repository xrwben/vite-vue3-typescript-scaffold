<template>
  <div class="authorize-result-container">
    <div class="authorize-content">
      <div class="item-flag">
        <p><van-icon :name="status ? 'checked' : 'clear'" :color="status ? '#0AD0B6' : '#FF7548'" /></p>
        <p :class="[status ? 'item-flag-success' : 'item-flag-error','item-flag-result']">{{status?'核验成功':'核验失败'}}</p>
      </div>
      <div class="item-gradient-bottom">
        <div class="item-error" v-if="!status">
          <span class="la">失败原因：</span>
          <span class="lv">{{verificationForm.error_msg}}</span>
        </div>
        <div class="item-info d-a">
          <img :src="imgUrl" alt="">
          <div>
            <p>
              <span class="la">真实姓名：</span>
              <span class="lv">{{verificationForm.user_chinese_name}}</span>
            </p>
            <p>
              <span class="la">身份证号：</span>
              <span class="lv">{{verificationForm.id_card}}</span>
            </p>
          </div>
        </div>
      </div>
     
    </div>
    <div v-if="!status" class="fail-tips"><van-icon name="warning-o" />如果多次认证失败，请联系考试管理员进行处理</div>
    <div v-if="status" class="bottom-btn-box result-btn">
      <van-button type="info" @click="handleStart" >完成核验</van-button>
    </div>
    <div v-else class="bottom-btn-box result-btn">
      <!-- <van-button type="info" @click="handleBack" plain >刷新结果</van-button> -->
      <van-button type="info" @click="resetVerify" >重新核验</van-button>
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
  computed: {
    status() {
      return this.verificationForm?.pass_check
    },
    imgUrl() {
      return this.verificationForm.avatarUrl || require('@/assets/img/avatar.svg')
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
.authorize-result-container {
  .authorize-content {
    height: 400px;
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
  .fail-tips {
    position: fixed;
    bottom: 48px;
    width:100%;
    font-size: 12px;
    background:#FDF6EC;
    color: #FF7548;
    padding: 9px 10px;
    .van-icon {
      margin-right: 4px;
    }
  }
  .result-btn {
    display: flex;
    .van-button--plain { 
      background: white;
    }
  }
}
</style>
