<template>
  <div class="person-photo-container">
    <div class="face-box">
      <div class="item-tips"><van-icon name="warning" /><span>请保证周围光线充足，面部完整且五官清晰可见！</span></div>
      <!-- <div class="item-avatar">
        <img :src="imgUrl" alt="">
        <div v-if="picId" class="reset-takePhoto">
          <span>重新拍照</span>
          <input class="camera-input" type="file" accept="image/*" capture="user" @change="takePhoto($event)">
        </div>
      </div> -->
      <div class="item-avatar">
        <img :src="imgUrl" alt="">
        <div v-if="picId" class="needsclick" @click="handleTakePhoto">重新拍照</div>
      </div>
    </div>
    <input class="camera-input" ref="takePhotoRef" type="file" accept="image/*" capture="user" @change="takePhoto($event)" />
    <div class="bottom-btn-box">
      <van-button type="info" @click="handleBackStep" plain >返回上一步</van-button>
      <van-button v-if="picId" type="info" @click="handleNextStep" >下一步</van-button>
      <!-- <div class="takePhoto-btn" v-else>
        <span>拍照</span>
        <input class="camera-input" type="file" accept="image/*" capture="user" @change="takePhoto($event)">
      </div> -->
      <van-button v-else type="info" class="needsclick" @click="handleTakePhoto" >拍照</van-button>
    </div>
  </div>
</template>
<script>
import { uploadImageToCenter } from '@/utils/anti-cheating'
import { mapState } from 'vuex'
import { getFaceVerify } from '@/services/user.service'
import { Toast } from 'vant'
export default {
  props: {
    paramsForm: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      avatarUrl: '',
      picId: ''
    }
  },
  computed: {
    ...mapState(['userInfo']),
    imgUrl() {
      return this.avatarUrl || require('@/assets/img/avatar.svg')
    }
  },
  methods: {
    takePhoto(e) { // 拍照功能---上传头像
      console.log('takePhoto')
      const toast1 = Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '上传中...'
      })
      var file = e.target.files[0]// 获取文件对象
      const config = {
        file,
        oa: {
          appId: 'QLearningService',
          operateAuthUrl: '/training-portal-common/api/v1/portal/user/common/uploadOperateSignature'
        },
        callBack: (file) => {
          toast1.clear()
          console.log('callBack')
          this.picId = file.picId
          const fileReader = new FileReader()
          fileReader.readAsDataURL(file.file)
          fileReader.onload = () => {
            this.avatarUrl = fileReader.result
          }
        }
      }
      uploadImageToCenter(config)
    },

    // 下一步
    handleNextStep() {
      const toast2 = Toast.loading({
        duration: 0,
        forbidClick: true,
        message: '核验中...'
      })
      const params = {
        face_img_file_id: this.picId,
        ...this.paramsForm
      }
      getFaceVerify(params).then((res) => {
        toast2.clear()
        const formInfo = {
         ...res.data,
          avatarUrl: this.avatarUrl
        }
        this.$emit('handleNextVerify', formInfo)
      })
    },
    handleTakePhoto() {
      console.log('handleTakePhotohandleTakePhotohandleTakePhoto')
      this.$refs.takePhotoRef.click()
    },
    handleBackStep() {
      this.$emit('handleBackStep')
    }
  }
}
</script>
<style lang="less" scoped>
  .person-photo-container {
    // .takePhoto-btn {
    //   position: relative;
    //   height: 48px;
    //   background:@color-theme;
    //   span {
    //     position: absolute;
    //     margin-top: 12px;
    //     font-size: 17px;
    //     color: white;
    //     left: calc(50% - 17px)
    //   }
    //   .camera-input {
    //     opacity: 0;
    //     height: 100%;
    //     width: 100%;
    //   }
    // }
    // .reset-takePhoto {
    //   position: relative;
    //   span {
    //     position: absolute;
    //   }
    //   .camera-input {
    //     opacity: 0;
    //     height: 20px;
    //     width: 60px
    //   }
    // }
    .camera-input {
      display: none;
    }
    .face-box {
      text-align: center;
      height: 468px;
      background:white;
      padding-top: 16px;
      margin-left: 16px;
      margin-right: 16px;
      border-radius: 5px;
      .item-tips {
        font-size: 12px;
        background: #EBF0FF;
        border-radius: 4px;
        display: inline-block;
        padding: 8px 6px;
        color:#666666;
        .van-icon {
          color:@color-theme
        }
        span {
          margin-left: 4px;
        }
      }
      .item-avatar {
        margin-top: 30px;
        img {
          width: 150px;
          height: 150px;
          border-radius: 50%;
        }
        div {
          margin-top: 16px;
          font-size: 15px;
          font-weight: 500;
          color:@color-theme;
        }
      }
    }
  }
</style>
