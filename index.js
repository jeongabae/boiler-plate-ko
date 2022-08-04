const express = require('express') //express 모듈 가져옴
const app = express()  // 새로운 express앱을 만들고
const port = 5000 //port는 4000으로해도 되고 5000으로해도 되고..맘대로..
const bodyParser = require('body-parser') //bodyparser을 가져옴
const { User } = require("./models/User"); //이렇게해서 유저를 가져옴

const config = require('./config/key');

//application/x-www-form-urlencoded 이렇게 된 데이터를 분석해서 가져올 수 있게해주는 것
app.use(bodyParser.urlencoded({extended: true})); //bodyparser 옵션
//application/json 이렇게 된 데이터를 분석해서 가져올 수 있게해주는 것
app.use(bodyParser.json());//bodyparser 옵션
const mongoose = require('mongoose')
mongoose
.connect(config.mongoURI)
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/', (req, res) => { //루트 디렉터리에 오면 Hello World!가 출력되게 해줌
  res.send('Hello World! by cleveryellowduck') 
})

app.post('/register', (req, res) => { //회원가입을 위한 라우트
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
app.listen(port, () => { //포트에서 이 앱을 실행
  console.log(`Example app listening on port ${port}`)
})