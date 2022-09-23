<template>
  <div class="savePicture_wrapper" @click="close">
    <div class="content">
      <div class="text_wrapper">
        <div>感谢您的承诺</div>
        <div>同心同行，行稳致远。</div>
      </div>
      <div id="img_wrapper">
        <!-- 绘制 -->
        <canvas
          id="canvas"
          :width="styles.width"
          :height="styles.height"
          :style="styles.style"
          v-show="false"
        ></canvas>
        <!-- 显示图片 移动端长按可保存 -->
        <img :src="imgUrl" alt="" :style="styles.style" v-if="imgUrl" />
      </div>
      <div class="btn_wrapper">长按保存图片</div>
      <van-button v-if="isShowCallMini"
        class="btn_miniprogram"
        type="info"
        round
        @click="callMiniProgram">
        领取专属数字藏品
      </van-button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // 证书内容
    info: {
      type: Object,
      required: true
    },
    imgSrc: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      url: '',
      styles: {
        style: {
          width: '90vw',
          height: '65vw'
        },
        width: 300,
        height: 213
      },
      ratio: 2,
      imgUrl: '',
      type: false
    }
  },
  computed: {
    // 是否显示【领取专属数字藏品】按钮 - 调小程序
    isShowCallMini () {
      const { exam_id } = this.$route.query
      return ['wa1ySI9g', '4wcAT4xU'].includes(exam_id)
    }
  },
  mounted() {
    // this.ratio = window.devicePixelRatio || 1
    // this.initCancas()
  },
  methods: {
    getInitData(val, type) {
      this.type = type
      this.info = val
      this.initCancas()
    },
    // 取消
    close() {
      let c = document.getElementById('canvas')
      let cxt = c.getContext('2d')
      cxt.clearRect(0, 0, c.width, c.height)
      this.$emit('close')
    },
    async initCancas() {
      this.ratio = window.devicePixelRatio || 1
      if (this.type) {
        this.styles.style = {
          width: '80vw',
          height: '102vw'
        }
      }
      let canvas = document.getElementById('canvas')
      let { width, height } = this.info.backgroundImg
      this.styles.width = width * this.ratio
      this.styles.height = height * this.ratio
      let context = canvas.getContext('2d')
      let image = new Image()
      // 解决跨域 Canvas 污染问题
      // image.setAttribute('crossOrigin', 'anonymous')
      image.onload = () => {
        context.drawImage(image, 0, 0, canvas.width, canvas.height)

        this.info.textList.forEach(async (item, index) => {
          context.font = `${item.bold ? 'bold' : ''} ${
            item.fontSize * this.ratio
          }px ${item.fontFamily}`
          context.fillStyle = item.fill
          // 文字自适应
          let textWidth = context.measureText(item.text).width
          let fontW = canvas.width - textWidth
          let fontS = null
          if (fontW < 0) fontS = (canvas.width - 20) / item.text.length
          else fontS = item.fontSize * this.ratio
          context.font = `${item.bold ? 'bold' : ''} ${fontS}px ${
            item.fontFamily
          }`
          // 文字居中
          let le = item.left
            ? item.left
            : (canvas.width - context.measureText(item.text).width) / 2
          this.toFormateStr(
            context,
            item.text,
            canvas.width,
            100,
            le,
            item.top * this.ratio,
            item.fontSize * this.ratio
          )
        })

        // 生成图片
        this.imgUrl = canvas.toDataURL('image/jpeg')
        // canvas.toBlob((blob) => {
        //   let fd = new FormData()
        //   fd.append('file', blob)
        //   let file = fd.get('file')
        //   file['file_name'] = 'cert.jpg'
        //   this.imgUrl = window.URL.createObjectURL(blob)
        //   this.$emit('uploadCertificate', file)
        // }, 'image/jpeg')
      }
      image.crossOrigin = 'Anonymous'
      image.src = this.imgSrc
    },
    toFormateStr(ctx, str, draw_width, lineNum, startX, startY, steps) {
      // 检测是否是富文本换行
      if (/\n/g.test(str)) {
        let textArr = str.split('\n')
        textArr.forEach((item, index) => {
          let y = startY + steps * index
          ctx.fillText(item, startX, y)
        })
      } else {
        // 测量文本源尺寸信息（宽度）
        let strWidth = ctx.measureText(str).width
        let keyStr = ''
        let startpoint = startY
        let sreLN = strWidth / draw_width
        // 计算文本源一共能生成多少行
        let liner = Math.ceil(sreLN)
        // 等比缩放测量一行文本显示多少个字符
        let strlen = ''
        if (str) {
          strlen = parseInt(str.length / sreLN)
        }
        // 若文本不足一行，则直接绘制，反之大于传入的最多行数（lineNum）以省略号（...）代替
        if (strWidth < draw_width) {
          ctx.fillText(str, startX, startpoint)
        } else {
          for (let i = 1; i < liner + 1; i++) {
            let startPoint = strlen * (i - 1)
            if (i < lineNum || lineNum === -1) {
              keyStr = str.substr(startPoint, strlen)
              ctx.fillText(keyStr, startX, startpoint)
            } else {
              keyStr = str.substr(startPoint, strlen - 5)
              ctx.fillText(keyStr, startX, startpoint)
              break
            }
            startpoint = startpoint + steps
          }
        }
      }
    },
    // 跳转调小程序页面
    callMiniProgram () {
      const { exam_id } = this.$route.query
      const devUrl = '//cloud1-3g55dqwg3c3bdb5a-1305335834.tcloudbaseapp.com/gotoMp/jump-mp.html?album_id=junbo_nft_test3&app_id=wallet'
      const prodUrl = `//cloud1-3g55dqwg3c3bdb5a-1305335834.tcloudbaseapp.com/gotoMp/jump-mp.html?activity_id=zhiyuan_${exam_id === 'wa1ySI9g' ? '2' : '1'}&app_id=wallet&activity_flag=1`
      window.open(process.env.NODE_ENV === 'production' ? prodUrl : devUrl)
    }
  }
}
</script>

<style lang='less' scoped>
@import "./index.less";
</style>
