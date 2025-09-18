export interface ExamItem {
    id: number
    examId: number,
    indentify:string
    updateTime: string
    score: number,
    paperName: string,
    startEnd: string,
    expireTime: string,
    teacherName: string,
    lastTime :string ,
}

export interface QuestionItem{
    qid: string
    type: string
    content: string
    audio: string
    parent_id: string
}

export interface AnswerItem{
    id: string
    type: string
    content: string
    audio: string
    parent_id: string
}