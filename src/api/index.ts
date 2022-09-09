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