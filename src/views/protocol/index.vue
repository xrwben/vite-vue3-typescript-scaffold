<template>
  <div class="protocol">
    <div class="tips">开始考试前，请仔细阅读《腾讯学堂考试平台隐私保护指引》，阅读完毕并确认同意后可进入考试页面。</div>
    <div class="content" v-html="content"></div>
    <div class="footer-btn">
      <van-checkbox v-model="checked" class="checkbox" shape="square" icon-size="16px" checked-color="#3464e0">我已阅读并同意以上隐私保护指引内容</van-checkbox>
      <div :class="['btn', {'active': checked}]" @click="agreeProtocol">进入考试页面</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { Toast } from 'vant';
import { getProtocolInfoAPI, agreeProtocolAPI } from '@/api/index'

const route = useRoute()
const router = useRouter()

const content = ref('')
const checked = ref(false)

// 获取隐私协议内容
const getProtocolInfo = () => {
  const { exam_id } = route.query as { exam_id: string }
  getProtocolInfoAPI({ examId: exam_id }).then((res: any) => {
    const { code, data, success } = res
    if (code === '200' && success) {
      content.value = data.privacy_policy_content
    }
  })
}
// 同意保存隐私然后进入考试页面
const agreeProtocol = () => {
  if (!checked.value) {
    Toast('请阅读隐式保护指引内容，并勾选已阅读选项后，点击开始考试')
    return
  }
  const { exam_id } = route.query as { exam_id: string }
  agreeProtocolAPI({ exam_id }).then((res: any) => {
    const { code, success } = res
    if (code === '200' && success) {
      router.replace({
        path: '/explain',
        query: {
          exam_id: exam_id
        }
      })
    }
  })
}

onMounted(() => {
  getProtocolInfo()
})
</script>

<style lang="less" scoped>
.protocol {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .tips {
    width: 100%;
    height: 48px;
    background: #fdf6ec;
    color: #ff7548;
    font-size: 12px;
    line-height: 18px;
    padding: 6px 12px;
  }
  .content {
    flex: 1 ;
    background: #fff;
    padding: 10px 12px 100px;
    overflow: auto;
  }
  .footer-btn {
    width: 100%;
    background: #f5f7f9;
    position: fixed;
    bottom: 0;
    left: 0;
    .checkbox {
      color: #333;
      font-size: 15px;
      padding: 12px 16px;
    }
    .btn {
      width: 100%;
      height: 48px;
      font-size: 17px;
      background:#f2f2f2;
      color: #acacac;
      display: flex;
      justify-content: center;
      align-items: center;
      &.active {
        color: #fff;
        background: #3464e0;
      }
    }
  }
}
</style>
