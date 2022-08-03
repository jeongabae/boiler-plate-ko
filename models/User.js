const mongoose = require('mongoose') // 몽구스 모듈 가져오기

const userSchema = mongoose.Schema({ // 몽구스를 이용해서 Schema생성
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //john ahn@naver.com같은 예에서 스페이스 없애주는 역할을 trim이 함
        unique: 1 //unique하게. 똑같은 이메일 쓰지 못하게.
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        minlength: 5
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: { //토큰 이용해서 유효성 관리
        type: String
    },
    tokenExp: { //토큰 유효기간
        type: Number
    }
})

const User = mongoose.model('User',userSchema) //Schema를 model로 감싸줌. User은 model명 userSchema는 Schema명
module.exports = { User } //이 모델을 다른 파일에서도 쓸 수 있게 하도록