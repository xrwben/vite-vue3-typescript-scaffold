import http from '@/utils/http';
import api from './api.config';

// 用户信息
export const getUserInfoAPI = () => {
  return new Promise((resolve, reject) => {
    http.get(api.userInfo).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 考试说明
export const getExplainInfoAPI = (params: { exam_id: string }) => {
  return new Promise((resolve, reject) => {
    http.get(api.examExplain, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 判断是否需要签署隐私协议
export const getProtocolInfoAPI = (params: { examId: string }) => {
  return new Promise((resolve, reject) => {
    http.get(api.policy, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 统一签署隐私协议
export const agreeProtocolAPI = (params: { exam_id: string }) => {
  return new Promise((resolve, reject) => {
    http.post(api.policyAgreement, params).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 考前签名
export const examSignatureAPI = (params: { record_id: string, sign_content: string }) => {
  return new Promise((resolve, reject) => {
    http.post(api.signature, params).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 人脸身份核验
export const faceIdVerfiyAPI = (params: any) => {
  return new Promise((resolve, reject) => {
    http.post(api.faceVerify, params).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 获取考试试卷题
export const getExamPaperAPI = (params: object) => {
  return new Promise((resolve, reject) => {
    http.get(api.examPaper, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 提交答案
export const saveAnswerAPI = (params: object) => {
  return new Promise((resolve, reject) => {
    http.post(api.saveAnswer, params).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 获取考试最新结果
export const getExamResultAPI = (params: { exam_id: string }) => {
  return new Promise((resolve, reject) => {
    http.get(api.examResult, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 考试是否签名
export const isSignedAPI = (params: { exam_id: string }) => {
  return new Promise((resolve, reject) => {
    http.get(api.isSigned, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 生成证书
export const certificateRebuildAPI = (params: { recordId: string }) => {
  return new Promise((resolve, reject) => {
    http.get(api.certificateRebuild, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 获取考试记录列表
export const getExamRecordListAPI = (exam_id: string, params: object) => {
  return new Promise((resolve, reject) => {
    http.get(api.recordList.replace(/{examId}/, exam_id), { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 获取考试答案详情
export const getExamAnalysisAPI = (params: { record_id: string }) => {
  return new Promise((resolve, reject) => {
    http.get(api.examAnalysis, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
// 考试是否有记录
export const getHavaRecordAPI = (params: { exam_id: string }) => {
  return new Promise((resolve, reject) => {
    http.get(api.ishaveRecords, { params }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}