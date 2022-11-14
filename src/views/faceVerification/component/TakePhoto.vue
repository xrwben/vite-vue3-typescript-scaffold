<template>
  <div class="person-photo-container">
    <div class="face-photo">
      <div class="tips">
        <i class="icon" name="tips"></i>
        <span>请保证周围光线充足，面部完整且五官清晰可见！</span>
      </div>
      <div class="avatar">
        <img v-if="!picId" src="@/assets/img/avatar.svg" alt="">
        <img v-else :src="picSrc" alt="">
        <p v-if="picId" class="needsclick" @click="takePhoto">重新拍照</p>
      </div>
      <input class="camera-input" ref="inputRef" type="file" accept="image/*" capture="user" @change="changeInput($event)">
    </div>
    <div class="footer-btn">
      <div class="btn gray" type="info" @click="prevStep" plain>返回上一步</div>
      <div v-if="picId" class="btn" type="info" @click="nextStep">下一步</div>
      <div v-else class="btn needsclick" type="info" @click="takePhoto">拍照</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRefs } from 'vue'
import { uploadImageToCenter } from '@/utils/anti-cheating.js'
import { faceIdVerfiyAPI } from '@/api/index'
import { Toast } from 'vant'

const props = defineProps({
  paramsForm: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['next-verify-result', 'prev-step'])

const inputRef = ref<HTMLInputElement>()
const state = reactive({
  picId: '',
  picSrc: '',
})
const { picId, picSrc }  = toRefs(state)

// 点击拍照和重新拍照
const takePhoto = () => {
  (inputRef.value as HTMLInputElement).click()
}
// 拍照上传头像
const changeInput = (e: any) => {
  Toast.loading({
    duration: 0,
    forbidClick: true,
    message: '上传中...'
  })
  var file = e.target.files[0] // 获取文件对象
  const config = {
    file,
    oa: {
      appId: 'QLearningService',
      operateAuthUrl: '/training-portal-common/api/v1/portal/user/common/uploadOperateSignature'
    },
    callBack: (file: any) => {
      Toast.clear()
      state.picId = file.picId
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file.file)
      fileReader.onload = () => {
        state.picSrc = fileReader.result as string
      }
    }
  }
  uploadImageToCenter(config)
}

// 下一步
const nextStep = () => {
  Toast.loading({
    duration: 0,
    forbidClick: true,
    message: '核验中...'
  })
  const params = {
    face_img_file_id: state.picId,
    ...props.paramsForm
  }
  faceIdVerfiyAPI(params).then((res: any) => {
    Toast.clear()
    const formInfo = {
      ...res.data,
      avatarUrl: state.picSrc
    }
    emit('next-verify-result', formInfo)
  })
}
const prevStep = () => {
  emit('prev-step')
}
</script>

<style lang="less" scoped>
  .person-photo-container {
    display: flex;
    .face-photo {
      width: 343px;
      height: 468px;
      background: #fff;
      border-radius: 5px;
      padding: 16px;
      margin: 0 auto;
      .tips {
        width: 100%;
        color:#666;
        font-size: 12px;
        background: #ebf0ff;
        border-radius: 4px;
        padding: 6px 8px;
        display: flex;
        align-items: center;
        .icon {
          width: 16px;
          height: 16px;
          background: url("@/assets/svg/tips-fill-blue.svg") no-repeat center / 100% 100%;
          margin-right: 4px;
        }
      }
      .avatar {
        margin-top: 30px;
        text-align: center;
        & > img {
          width: 150px;
          height: 150px;
          border-radius: 50%;
        }
        & > p {
          margin-top: 16px;
          font-size: 15px;
          font-weight: 500;
          color: #3464e0;
        }
      }
      .camera-input {
        display: none;
      }
    }
    .footer-btn {
      width: 100%;
      position: fixed;
      bottom: 0;
      .btn {
        width: 100%;
        height: 48px;
        background: #3464e0;
        color: #fff;
        font-size: 17px;
        display: flex;
        justify-content: center;
        align-items: center;
        &.gray {
          color: #666;
          font-size: 14px;
          background: #f5f7f9;
        }
      }
    }
  }
</style>
