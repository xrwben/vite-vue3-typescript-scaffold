<template>
  <div class="antiCheating-dialog">
    <van-dialog
      v-model="showDialog"
      :show-cancel-button="false"
      :show-confirm-button="true"
      confirmButtonText="我知道了"
      :title="title"
      :beforeClose="beforeclose"
    >
      <div class="antiCheating-content">
        <div v-html="tipsContent"></div>
      </div>
    </van-dialog>
  </div>
</template>
<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    tipsContent: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showDialog: true
    }
  },
  watch: {
    show(val) {
      this.showDialog = val
    }
  },
  methods: {
    beforeclose(name, down) {
      down()
      this.$emit('update:show', false)
    }
  }
}

</script>
<style lang="less" scoped>
.antiCheating-dialog {
  font-size: 18px;
  /deep/.antiCheating-content {
    padding: 20px;
    text-align: center;
    p:first-child {
      margin-bottom: 12px;
    }
    p {
      font-size: 17px;
      color: #666666;
      font-weight: 400;
      span {
        color:red;
      }
    }
  }
}
</style>
