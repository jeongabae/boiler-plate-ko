const express = require('express') //express 모듈 가져옴
const app = express()  // 새로운 express앱을 만들고
const port = 5000 //port는 4000으로해도 되고 5000으로해도 되고..맘대로..

const mongoose = require('mongoose')
mongoose
.connect('mongodb+srv://cleveryellowduck:2124@boilerplate.i9zgtku.mongodb.net/?retryWrites=true&w=majority')
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err))
app.get('/', (req, res) => { //루트 디렉터리에 오면 Hello World!가 출력되게 해줌
  res.send('Hello World!') 
})

app.listen(port, () => { //포트에서 이 앱을 실행
  console.log(`Example app listening on port ${port}`)
})