const express = require('express') //express 모듈 가져옴
const app = express()  // 새로운 express앱을 만들고
const port = 5000 //port는 4000으로해도 되고 5000으로해도 되고..맘대로..
const bodyParser = require('body-parser') //bodyparser을 가져옴
const { User } = require("./models/User"); //이렇게해서 유저를 가져옴
const cookieParser = require('cookie-parser')
const config = require('./config/key');
const { auth } = require('./middleware/auth'); //auth라는 미들웨어를 사용하기 위해 import 즉, 가져와야하므로


//application/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져올 수 있게해주는 것
app.use(bodyParser.urlencoded({extended: true})); //bodyparser 옵션
//application/json 이렇게 된 데이터를 분석해서 가져올 수 있게해주는 것
app.use(bodyParser.json());//bodyparser 옵션

app.use(cookieParser());

const mongoose = require('mongoose')
mongoose
.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => { //루트 디렉터리에 오면 Hello World!가 출력되게 해줌
  res.send('Hello World! by cleveryellowduck') 
})

app.post('/api/users/register', (req, res) => { //회원가입을 위한 라우트
  //회원 가입 할때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
 
  const user = new User(req.body) //인스턴스 만들기. 데이터베이스에 넣기 위해서 req.body (bodyparser이용해서 req.body로 client의 정보를 받아준다)
  user.save((err, userInfo) =>{//몽고db에서 오는 메소드. 정보들이 user모델에 저장됨
    if(err) return res.json({success: false, err}) //저장할 때 에러있으면, json형태로 클라이언트에다가 성공하지 못했다고 전달(에러메세지와 함께)
    return res.status(200).json({ //성공했을 경우. status(200)은 성공했다는 표시. 이것도 json형식으로 정보 전달
      success: true
    })
  }) 
})

app.post('/api/users/login',(req,res) => {
  //1. 요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({email: req.body.email}, (err, user) =>{
    if(!user){ //만약 유저 collection 안에 해당 이메일을 가지는 유저가 한 명도 없다면
      return res.json({ //json데이터로 loginSuccess을 false로 그리고 메세지는 "제공된~~"
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

    //2. 만약에 유저가 있다면
    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호 인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) =>{
      if(!isMatch) //비밀번호가 맞지 않았을 때
      return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다."
      })

      //3. 비밀번호까지 맞다면 토큰을 생성하기.
      user.generateToken((err,user) => {
        if(err) return res.status(400).send(err); //400은 에러가 있다는 뜻. 이걸 client에 전해주는 것.

        // 토큰을 저장한다. 어디에 ? 쿠키, 로컬스토리지...등 이번에는 쿠키에다가 저장하겠음.
        res.cookie("x_auth", user.token) //x_auth의 이름을 가진 쿠키가 Cookies에 들어감
        .status(200) //성공했다는 뜻
        .json({
          loginSuccess: true,
          userId: user._id
        })
      })
    })
  })
})

//role 1 : Admin role 2 : 특정 부서 Admin
//role 0 -> 일반 유저 role 0이 아니면 -> 관리자
app.get('/api/users/auth',auth, (req, res)=>{ //여기서 auth는 미들웨어 (중간에서 뭘 해주는..!) //middleware의 auth.js에 파일 안에 있는 auth를 의미
  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말.
  //그래서 True했다는걸 Client에다가 정보 전달해야.
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

app.get('/api/users/logout', auth, (req, res) => { //로그아웃 라우트
  //로그아웃하려는 유저를 db에서 찾아서 데이터들을 업데이트 시켜줌
  User.findOneAndUpdate({_id: req.user._id}, //id로 유저 찾음(미들웨어서 가져와서 찾음)
    {token: ""} //토큰을 지워줌
    ,(err, user) =>{ //콜백 function
      if(err) return res.jon({ success: false, err}); //에러나면 success는 false로 error 메세지 전달
      return res.status(200).send({//만약에 성공했다하면
        success: true
      }) 
    }) 
})

app.listen(port, () => { //포트에서 이 앱을 실행
  console.log(`Example app listening on port ${port}`)
})