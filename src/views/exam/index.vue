<template>
  <div class="exam"></div>
</template>

<script setup lang="ts">
import { getHavaRecordAPI } from 'services/exam/exam.service.js'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState('exam', ['userInfo', 'examInfo'])
  },
  created () {
    // console.log(this.userInfo, this.examInfo)
    this.init()
  },
  methods: {
    // 学员从exam进来判断是否已经开始考试
    // 动态用户跳转信息
    init () {
      let exam_id = this.$route.query.exam_id
      // 判断跳转说明页还是去结果页 如果存在考试信息则表示可能考试没有提交 去说明页再判断考试记录是不是同一个
      if (this.examInfo) {
        this.$router.replace({
          path: '/user/explain',
          query: {
            exam_id
          }
        })
      } else {
        // 本地没有考试信息则请求判断是否有考试记录 判断是考完了已清除信息还是没有考试过
        this.getHavaExamResult(exam_id)
      }
    },
    getHavaExamResult (exam_id) {
      getHavaRecordAPI({ exam_id }).then((res) => {
        const { code, success, data } = res
        if (code === '200' && success && data) {
          // 如果data为true表示有结果就去结果页
          this.$router.replace({
            path: '/user/result',
            query: {
              exam_id
            }
          })
        } else {
          // 接口报未查到对应的考试记录去说明页考试
          this.$router.replace({
            path: '/user/explain',
            query: {
              exam_id
            }
          })
        }
      })
    }
  }
}
</script>