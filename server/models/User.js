const mongoose = require('mongoose'); // 몽구스 모듈 가져오기
const bcrypt = require('bcrypt');
const saltRounds = 10 // salt가 몇 글자 인지
const jwt = require('jsonwebtoken')

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

userSchema.pre('save',function(next){ //유저 모델의 유저 정보를 저장('save')하기 전에  ~~것을 한다. 이게 다 끝나면 회원가입을 위한 라우트 중에서 user.save~로 들어가는 것.
    var user = this; //userScheme 안 name~~tokenEXp를 가르킴
    if(user.isModified('password')){ //모델 안에 field 중 password가 변화할 때만 bcrypt를 이용해서 암호화
        //비밀번호를 암호화 시킨다.
        bcrypt.genSalt(saltRounds, function(err, salt) { //bcrypt가져와서 salt를 만드는데 saltRounds가 필요하고 err가 나면 error를 가져오고 아니면 salt를 가져옴
            if(err) return next(err) //error가 나면 index.js의 회원가입 라우트 안의 if(err)~~로 보내줌
            bcrypt.hash(user.password, salt, function(err, hash) { //salt가 제대로 생성을 했다면 다시 bcrypt가져오고 hash. 이때 user.password 회원이 순수하게 넣은 그대로의 비밀번호(myPlaintextPassword). hash는 암호화된 비밀번호
                if(err) return next(err) //error가 나면 index.js의 회원가입 라우트 안의 if(err)~~로 보내줌
                // Store hash in your password DB.
                user.password = hash //hash(암호화된 비밀번호)를 만드는데 성공했다고 하면 이걸로 바꿔줌.
                next() //완성이 됐으면 index.js user.save~~뒤쪽?으로 돌아가야함
            });
        });
    } else{ //만약 비밀번호를 바꾸는게 아니라 다른걸 바꿀 때는 그냥 next()를 해줘야지 바로 user.save(index.js에 있는)로 나갈 수 있음.(이게 없으면 그냥 이 코드에서 머뭄)
        next()
    }
}
)
userSchema.methods.comparePassword = function(plainPassword, cb){ //cb는 콜백 function의 약자의 의미로 써놓은 것.
    //plainPassword 1234567, 암호화된 비밀번호 $2b$10$Lz58A97HFz7S4ZWzMfHlKevwPAZeAwebrzSwLJGJFkB8d.YuEWFxC
    bcrypt.compare(plainPassword,this.password, function(err, isMatch){
        if(err) return cb(err); //만약 비밀번호가 같지않으면 리턴을 cb(err)
        cb(null, isMatch) //만약 비밀번호가 같으면 에러가 없고(null), 비밀번호가 같다(isMatch)
    })
}
userSchema.methods.generateToken = function(cb){
    var user = this;
    //jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken')

    // user._id + 'secretToken' = token
    // -> 
    // 'secretToken' -> user._id

    user.token = token
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user)
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    // user._id + '' = token
    //토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded){ //userSchema.methods.generateToken에서 쓴게 secretToken이니까 이 이름 그대로 넣어주기!
        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id": decoded, "token": token}, function(err, user){ //findOne은 몽고db에 이미 있는 method
            if(err) return cb(err) //만약 에러가 있다면 콜백으로 에러 전달
            cb(null, user) //만약 에러가 없다면 유저 정보 전달
        })
    }) 
}
const User = mongoose.model('User',userSchema) //Schema를 model로 감싸줌. User은 model명 userSchema는 Schema명
module.exports = { User } //이 모델을 다른 파일에서도 쓸 수 있게 하도록