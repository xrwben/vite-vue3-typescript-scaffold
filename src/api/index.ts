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
// 统一签署隐私协议
export const saveAnswerAPI = (params: object) => {
  return new Promise((resolve, reject) => {
    http.post(api.saveAnswer, params).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err)
    })
  })
}
