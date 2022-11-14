<template>
  <div class="exam"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { getHavaRecordAPI } from '@/api/index'
import { useRoute, useRouter } from 'vue-router'
import { examStore } from '@/store/index'

const route = useRoute()
const router = useRouter()
const store = examStore()

onMounted(() => {
  init()
})

// 学员从exam进来判断是否已经开始考试
// 动态用户跳转信息
const init = () => {
  let exam_id = route.query.exam_id as string
  // 判断跳转说明页还是去结果页 如果存在考试信息则表示可能考试没有提交 去说明页再判断考试记录是不是同一个
  if (store.examInfo) {
    router.replace({
      path: '/explain',
      query: {
        exam_id
      }
    })
  } else {
    // 本地没有考试信息则请求判断是否有考试记录 判断是考完了已清除信息还是没有考试过
    getHavaExamResult(exam_id)
  }
}
const getHavaExamResult = (exam_id: string) => {
  getHavaRecordAPI({ exam_id }).then((res: any) => {
    const { code, success, data } = res
    if (code === '200' && success && data) {
      // 如果data为true表示有结果就去结果页
      router.replace({
        path: '/result',
        query: {
          exam_id
        }
      })
    } else {
      // 接口报未查到对应的考试记录去说明页考试
      router.replace({
        path: '/explain',
        query: {
          exam_id
        }
      })
    }
  })
}
</script>