import { defineStore } from 'pinia'

export const examStore = defineStore({
  id: 'exam',
  state: () => {
    return {
      userInfo: {
        name: 'daben'
      }
    }
  }
})