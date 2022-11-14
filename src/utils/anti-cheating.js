import axios from 'axios'
let cheatInfo = {
  hideTime: 0,
  showTime: 0,
  leaveTimes: 0,
  breakTimes: 0
}
let captureImageTimer = null

// 上传拍照、切屏、中断记录
const _uploadRecord = (url, data, config) => {
  // console.log(url, data)
  axios.post(url, data, { withCredentials: true }).finally(() => {
    if (config && config.request.interval) {
      captureImageTimer = setTimeout(() => {
        startCaptureImage(config)
      }, config.request.interval)
    }
  })
}
// 获取相机列表
const getCamera = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log('浏览器不支持摄像头 enumerateDevices() 方法，请更换浏览器')
      reject('浏览器不支持摄像头功能~')
    }
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputList = []
      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          videoInputList.push({
            label: device.label || 'Default Camera',
            id: device.deviceId
          })
        }
      })
      resolve(videoInputList)
    }).catch((err) => {
      reject(err)
    })
  })
}

// 打开摄像头
const openCamera = async (camera) => {
  // const videoInputList = await getCamera()
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        deviceId: camera && camera.id
      }
    }).then(stream => {
      resolve(stream)
    }).catch(err => {
      reject(err)
    })
  })
}

// 关闭摄像头
const stopCamera = (stream) => {
  captureImageTimer && clearTimeout(captureImageTimer)
  console.log(stream)
  const tracks = stream.getTracks()
  tracks.forEach(track => {
    track.stop()
  })
}

// base64转图片文件
const _dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(',')
  let mime = arr[0].match(/:(.*?);/)[1]
  let bstr = atob(arr[1])
  let len = bstr.length
  let u8arr = new Uint8Array(len)
  while (len--) {
    u8arr[len] = bstr.charCodeAt(len)
  }
  return new File([u8arr], filename, { type: mime })
}

// canvas生成base64
const _createCanvasImg = (videoNode, picture = { width: 600, height: 300, name: 'pic' }) => {
  const canvas = document.createElement('canvas')
  canvas.width = picture.width
  canvas.height = picture.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(videoNode, 0, 0, canvas.width, canvas.height)
  const dataURL = canvas.toDataURL('image/jpeg', 1)
  return _dataURLtoFile(dataURL, `${picture.name}-exam.jpg`)
}

// const configData = {
//   videoNode: 'node',
//   picture: {
//     width: 900, height: 600, name: 'liudehua'
//   },
//   cos: {
//     appId: '',
//     operateAuthUrl: 'http://test.portal.learn.oa.com/training-portal-common/api/v1/portal/user/common/uploadOperateSignature'
//   },
//   request: {
//     url: '/training-portal-common/api/v1/portal/user/common/antiCheat/photograph/upload',
//     data: {
//       item_type: 'exam',
//       item_id: 'xiecnhFg',
//       item_from_id: '8LeUTmMS',
//       img_file_id: '',
//       app_id: 'QLearningService',
//       tencent_code: 'tencent'
//     },
//     interval: 60000
//   }
// }
const startCaptureImage = (config) => {
  // console.log(config)
  captureImageTimer && clearTimeout(captureImageTimer)
  _uploadContentCenter(config)
}
// 上传图片到内容中心
const _uploadContentCenter = (config) => {
  const { videoNode, picture, cos, request } = config
  const file = _createCanvasImg(videoNode, picture)
  console.log('上传', file)
  const uplaodIns = new contentCenter.uploadFile({
    isEncrypt: true,
    file: file,
    type: 0, // 0表示上传图片，1视频 2音频 3文档
    appId: cos.appId,
    operateAuthUrl: cos.operateAuthUrl,
    onSuccess (res) {
      const { url, data } = request
      data.img_file_id = res[0].content_id
      _uploadRecord(url, data, config)
    },
    onError (err) {
      console.error(err)
    },
    onProgress (info) {
      var percent = parseInt(info.percent * 10000) / 100
      console.log('正在上传>>>>', percent)
    }
  })
  // console.log(uplaodIns)
}
// uploadContentCenter(configData)
const uploadImageToCenter = (config) => {
  const {file, oa, callBack} = config
  console.log('22222222')
  const uplaodIns = new contentCenter.uploadFile({
    isEncrypt:true,
    file: file,
    type: 0, // 0表示上传图片，1视频 2音频 3文档
    appId: oa.appId,
    operateAuthUrl: oa.operateAuthUrl,
    onSuccess (res) {
      console.log('333333333')
      callBack && callBack({
        picId: res[0].content_id,
        file: file
      })
    },
    onError (err) {
      console.error(err)
    },
    onProgress (info) {
      var percent = parseInt(info.percent * 10000) / 100
      console.log('正在上传>>>>', percent)
    }
  })
}
// 粘贴复制
let copyPasteCallback = null
const copyPasteEvent = (e) => {
  e.preventDefault()
  console.log(e)
  if (e.type === 'copy' || e.type === 'paste') {
    copyPasteCallback && copyPasteCallback()
  }
}
// 禁止粘贴复制
const forbidCopyPaste = (callback) => {
  document.addEventListener('copy', copyPasteEvent)
  document.addEventListener('paste', copyPasteEvent)
  copyPasteCallback = callback
}
// 移除粘贴复制
const removeCopyPaste = () => {
  document.removeEventListener('copy', copyPasteEvent)
  document.removeEventListener('paste', copyPasteEvent)
  copyPasteCallback = null
}

// 切屏
let visibilityConfig = null
const visibilityEvent = () => {
  const { leaveConfig, breackConfig } = visibilityConfig
  const info = JSON.parse(localStorage.getItem('cheatInfo'))
  if (document.visibilityState === 'hidden') {
    cheatInfo.hideTime = Date.now()
    localStorage.setItem('cheatInfo', JSON.stringify({
      ...info,
      hideTime: cheatInfo.hideTime
    }))
  }
  if (document.visibilityState === 'visible') {
    cheatInfo.showTime = Date.now()
    const gapTime = cheatInfo.showTime - cheatInfo.hideTime
    // 切屏处理
    if (leaveConfig && gapTime > leaveConfig.interval) {
      console.log('考试切屏')
      if(info?.leaveTimes) {
        cheatInfo.leaveTimes =  info.leaveTimes + 1
      } else {
        cheatInfo.leaveTimes += 1
      }
      leaveConfig.callback && leaveConfig.callback(cheatInfo.leaveTimes)
      const { url, data } = leaveConfig.request
      data.switch_duration = gapTime
      _uploadRecord(url, data)
      localStorage.setItem('cheatInfo', JSON.stringify(cheatInfo))
    }
    // 中断处理
    if (breackConfig && gapTime > breackConfig.interval) {
      console.log('考试中断')
      if(info?.breakTimes) {
        cheatInfo.breakTimes = info.breakTimes + 1
      } else {
        cheatInfo.breakTimes += 1
      }
      breackConfig.callback && breackConfig.callback(cheatInfo.breakTimes)
      const { url, data } = breackConfig.request
      data.switch_duration = gapTime
      _uploadRecord(url, data)
      localStorage.setItem('cheatInfo', JSON.stringify(cheatInfo))
    }
  }
}
// 切屏和中断函数参数格式 leaveConfig、breakConfig 根据功能传
// const config = {
//   leaveConfig: {
//     interval: 5000,
//     times: 5,
//     request: {
//       url: '/training-portal-common/api/v1/portal/user/common/antiCheat/screenSwitch/upload',
//       data: {
//         item_type: 'exam',
//         item_id: 'xiecnhFg',
//         item_from_id: '8LeUTmMS',
//         switch_duration: '10000',
//         app_id: 'QLearningService',
//         tencent_code: 'tencent'
//       }
//     },
//     callback (a) {
//       console.log('离开回调')
//       alert(`切屏了${a}次, 总共能切屏5次`)
//     }
//   },
//   breackConfig: {
//     interval: 10000,
//     times: 5,
//     request: {
//       url: '/training-portal-common/api/v1/portal/user/common/antiCheat/screenSuspend/upload',
//       data: {
//         item_type: 'exam',
//         item_id: 'xiecnhFg',
//         item_from_id: '8LeUTmMS',
//         switch_duration: '10000',
//         app_id: 'QLearningService',
//         tencent_code: 'tencent'
//       }
//     },
//     callback (a) {
//       console.log('中断回调')
//       alert(`切屏了${a}次, 总共能切屏5次`)
//     }
//   }
// }
// 禁止切屏和考试中断
const forbidHideScreen = (config) => {
  document.addEventListener('visibilitychange', visibilityEvent)
  visibilityConfig = config
}
// forbidHideScreen(config)
// 移除切屏禁止
const removeHideScreen = () => {
  document.removeEventListener('visibilitychange', visibilityEvent)
  visibilityConfig = null
  cheatInfo = {
    hideTime: 0,
    showTime: 0,
    leaveTimes: 0,
    breakTimes: 0
  }
}

export {
  getCamera,
  openCamera,
  stopCamera,
  startCaptureImage,
  forbidCopyPaste,
  removeCopyPaste,
  forbidHideScreen,
  removeHideScreen,
  uploadImageToCenter
}
