const { User } = require("../models/User"); //유저 모델을 불러옴.

let auth = (req, res, next) => {
    //인증 처리를 하는 곳
    
    //클라이언트 쿠키에서 토큰을 가져온다.
    let token = req.cookies.x_auth; //index.js에서 쿠키를 넣을 때 x_auth라는 이름으로 넣었으므로..

    //토큰을 복호화 한 후 유저를 찾늗다.
    User.findByToken(token, (err, user) =>{
        if(err) throw err;
        //유저가 없으면 인증 No!
        if(!user) return res.json({ isAuth: false, error: true})//유저가 없다면

        //유저가 있으면(유저가 있으면 인증 Okay)
        req.token = token; //두 줄은 index.js에서 app.get('/api/users/auth',auth, (req, res)~~에서 쓸 수 있도록 하려고.
        req.user = user;
        next(); //index.js에서 app.get('/api/users/auth',auth, (req, res)~부분에서 auth는 미들웨어인데 미들웨어에서 머무르지 않고 갈 수 있게
    })
    
}

module.exports = { auth }; //auth를 다른 파일에서도 쓸 수 있게