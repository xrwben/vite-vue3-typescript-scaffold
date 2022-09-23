<template>
  <div class="personInfo-container">
    <van-form class="form-container" ref="form" @submit="onSubmit">
      <div class="form-box">
        <div class="form-title">填写个人信息</div>
          <van-field
            v-model="form.user_chinese_name"
            label="真实姓名"
            name="validatorName"
            placeholder="真实姓名"
            :rules="[{ required:true, trigger:'onSubmit', validator:validatorName, message: '请输入有效姓名' }]"
          />
          <van-field
            v-model="form.id_card"
            label="身份证号"
            name="validatorIdCard"
            placeholder="身份证号"
            :rules="[{ required:true, trigger:'onSubmit', validator:validatorIdCard, message: '请输入有效身份证号' }]"
          />  
        </div>
      <div class="bottom-btn-box">
        <van-button block type="info" native-type="submit">下一步</van-button>
      </div>
    </van-form> 
  </div>
</template>
<script>
  export default {
    data() {
      return {
        form: {
          user_chinese_name: '',
          id_card: ''
        }
      }
    },
    methods: {
      validatorName(val) {
        return /^[\u4e00-\u9fa5]{1,10}$|^(?![\u4e00-\u9fa5]+$)[\u4e00-\u9fa5A-Za-z]{1,20}$/.test(val)
      },
      validatorIdCard(val) {
        return /^[1-9]\d{5}(19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(val)
      },
      onSubmit() {
        this.$refs.form.validate().then(() => {
          this.$emit('handleNextStep', this.form)
        })
      }
    }
  }
</script>
<style lang="less" scoped> 
.personInfo-container {
  .form-container {
    background: #F5F7F9;
    border-radius: 5px;
  }
  .form-box {
    background: white;
    margin: 0 16px;
    padding: 16px
  }
  .form-title {
    font-size: 17px;
    font-weight: 500;
    color:#333333;
    margin-bottom: 16px;
  }
  .van-cell {
    padding-left: unset;
  }
}
</style>
