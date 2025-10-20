export interface ExamItem {
    examId: number;
    type: number;
    indentify: string;
    updateTime: string;
    startTime: number;
    endTime: number;
    status: number;
    paperName: string;
    expireTime: number;
    lastTime: number;
    teacherName: string;
    questionTotal: number;
    sign: string;
}

export interface QuestionItem {
    index: number;
    qid: number;
    type: number;
    level: number;
    content: string;
    metaId: number;
    meta: MetaItem;
    score: number;
    explan: string;
    questionAnswer: QuestionAnswerItem[];
    studentAnswer: StudentAnswerItem[];
}

export interface FinishQuestionItem {
    index: number;
    qid: number;
}

export interface MetaItem {
    id: number;
    metaType: number;
    content: string;
}

export interface QuestionAnswerItem {
    index: number;
    answerId: number;
    answerContent: string;
    qid: number;
    type: number;
    isCorrect: number;
}

export interface StudentAnswerItem {
    id: number;
    qid: number;
    answerId: number;
    answerContent: string;
    reviewContent: string;
    score: number;
}

export interface ApiResponse<T = any> {
    status: number;
    msg: string;
    data: T;
}

export interface headerCard {
    trend: number;
    count: number;
}
export interface errorTag {
    name: string;
    count: number;
}

export interface TeacherMsg {
    name: string;
    avatar: string;
    message: string;
    time: string;
}
