import { defineStore } from 'pinia'

const currentExamInfo = () => {
  const userInfo = JSON.parse(localStorage.getItem('Tencent_Exam_User_Info') || 'null')
  const userEnName = userInfo ? userInfo.EnName : ''
  const ExamInfo = localStorage.getItem(`Exam_Info_${userEnName}`)
  if (ExamInfo === 'undefined') {
    localStorage.removeItem(`Exam_Info_${userEnName}`)
  }
  return JSON.parse(ExamInfo || 'null')
}

// 富文本文本过滤图片返回图片数组
const filterRichTextImg = (textVal: string) => {
  // 图片获取
  let imgList: any[] = []
  textVal.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/g, (match, capture): any => {
    // console.log(match, capture)
    imgList = imgList.concat(capture)
  })
  // console.log(imgList)
  return imgList
}

// interface State {
//   userInfo: any,
//   examInfo: any,
//   examResultInfo: any,
//   currentQuestionIndex: number,
//   cameraInfo: object | null,
// }

export const examStore = defineStore({
  id: 'exam',
  state: () => {
    return {
      userInfo: null, // 用户信息
      examInfo: currentExamInfo(), // 考试详情
      examResultInfo: null, // 考试结果记录
      currentQuestionIndex: 0, // 当前题目索引
      cameraInfo: null // 摄像头流信息
    } as any
  },
  getters: {
    // 考试题目列表
    getExamQuestionList (state) {
      const startTime = Date.now()
      console.log(startTime)
      console.log('getExamQuestionList>>>>', state.examInfo)
      const list: any[] = []
      let filterList = []
      if (state.examInfo?.contents?.length) {
        state.examInfo.contents.forEach((item: any) => {
          list.push(...item.sub_questions)
        })
        // 处理富文本，图片
        filterList = list.map((item) => ({
          ...item,
          options: item?.options?.length > 0 ? item.options.map((v: any) => ({
            ...v,
            richImgList: v.option_text ? filterRichTextImg(v.option_text) : []
          })) : [],
          questionImgList: item.question_text ? filterRichTextImg(item.question_text) : [],
          answer_analysisImg: item.answer_analysis ? filterRichTextImg(item.answer_analysis) : []
        }))
      }
      const endTime = Date.now()
      console.log(endTime)
      console.log(endTime - startTime)
      return filterList
    },
    // 考试答题列表
    getExamAnswerList (state) {
      console.log(state.examResultInfo)
      const list: any[] = []
      let filterList = []
      if (state.examResultInfo?.contents.length) {
        state.examResultInfo?.contents.forEach((item: any) => {
          list.push(...item.sub_questions)
        })
        // 处理富文本，图片
        filterList = list.map((item) => ({
          ...item,
          options: item?.options?.length > 0 ? item.options.map((v: any) => ({
            ...v,
            richImgList: v.option_text ? filterRichTextImg(v.option_text) : []
          })) : [],
          questionImgList: item.question_text ? filterRichTextImg(item.question_text) : [],
          answer_analysisImg: item.answer_analysis ? filterRichTextImg(item.answer_analysis) : []
        }))
      }
      return filterList
    }
  }
})