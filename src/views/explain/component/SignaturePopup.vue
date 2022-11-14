<template>
  <van-popup
    class="signature-popup"
    v-model:show="visibleState"
    closeable
    close-icon-position="top-left"
    round
    position="bottom"
    :style="{ height: '80%' }"
    safe-area-inset-bottom
    @click-overlay="close"
    @click-close-icon="close">
    <div class="popup-content">
      <div class="head-title">考前签名</div>
      <div class="sign-con">
        <div class="tips">本场考试开启了“签名确认”，请在下面签名框内进行签名。</div>
        <div class="canvas-area">
          <canvas id="canvas" ref="canvasRef"></canvas>
        </div>
        <div class="clear" @click="clear">
          <i name="clear"></i>
          <p>清除重签</p>
        </div>
        <div class="footer-btn" @click="submit">确认</div>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Toast } from 'vant'
import { examSignatureAPI } from '@/api/index'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  recordId: {
    type: String,
    default: ''
  }
})
const emit = defineEmits(['update:visible', 'reload'])

let visibleState = ref(props.visible)
const canvasRef = ref<any>(null)
const state: any = reactive({
  canvasRect: null, // canvas元素大小
  startX: 0,
  startY: 0,
  endX: 0,
  endY: 0,
  isEmpty: true
})

onMounted(() => {
  init()
})

// 初始化画布
const init = () => {
  const canvas = canvasRef.value
  state.canvasRect = canvas.getBoundingClientRect()
  // 设置canvas画布大小
  canvas.setAttribute('width', state.canvasRect.width)
  canvas.setAttribute('height', state.canvasRect.height)

  const ctx = canvas.getContext('2d')

  canvas.addEventListener('touchstart', (e: TouchEvent) => {
    e.preventDefault()
    state.startX = e.targetTouches[0].clientX - state.canvasRect.left
    state.startY = e.targetTouches[0].clientY - state.canvasRect.top
  }, false)
  canvas.addEventListener('touchmove', (e: TouchEvent) => {
    e.preventDefault()
    state.endX = e.targetTouches[0].clientX - state.canvasRect.left
    state.endY = e.targetTouches[0].clientY - state.canvasRect.top
    draw(ctx)
    state.startX = state.endX
    state.startY = state.endY
  }, false)
}
const draw = (ctx: CanvasRenderingContext2D) => {
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(state.startX, state.startY)
  ctx.lineTo(state.endX, state.endY)
  ctx.closePath()
  ctx.stroke()
  state.isEmpty = false
}
// 清空
const clear = () => {
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  const W = state.canvasRect.width
  const H = state.canvasRect.height
  ctx.clearRect(0, 0, W, H)
  state.isEmpty = true
}
// 确认签名
const submit = () => {
  if (state.isEmpty) {
    Toast('请先在签名框内签名，然后点击确认按钮')
    return false
  }
  // console.log(canvasRef.value.toDataURL('image/png'))
  examSignatureAPI({
    record_id: props.recordId,
    sign_content: canvasRef.value.toDataURL('image/png')
  }).then(() => {
    Toast({
      message: '签名完成，请开始考试',
      duration: 1200,
      forbidClick: true,
      onClose: () => {
        close()
        emit('reload')
      }
    })
  })
}
const close = () => {
  emit('update:visible', false)
}
</script>

<style lang="less" scoped>
.popup-content {
  height: 100%;
  .head-title {
    height: 50px;
    border-bottom: 1px solid #dcdcdc;
    color: #333;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
    line-height: 50px;
  }
  .sign-con {
    height: calc(100% - 50px);
    padding: 16px 16px 30px;
    display: flex;
    flex-direction: column;
    .tips {
      color: #999;
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 16px;
    }
    .canvas-area {
      flex: 1;
      height: 240px;
      & > canvas {
        width: 100%;
        height: 100%;
        background: #f5f7f9;
        border-radius: 4px;
      }
    }
    .clear {
      display: flex;
      align-items: center;
      margin: 12px 0 28px 0;
      & > i {
        width: 16px;
        height: 16px;
        background: url("@/assets/img/clear.png") no-repeat center / 100% 100%;
      }
      & > p {
        color: #666;
        font-size: 15px;
        margin-left: 4px;
      }
    }
    .footer-btn {
      width: 300px;
      height: 48px;
      background: #3464e0;
      border-radius: 40px;
      color: #fff;
      font-size: 17px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
    }
  }
}
</style>
