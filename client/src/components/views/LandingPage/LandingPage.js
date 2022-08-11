import React,{useEffect} from 'react'
import axios from 'axios';
//import { response } from 'express';

function LandingPage() {
    useEffect(() => { //랜딩페이지에 들어오자마자 실행
        axios.get('/api/hello') //get request를 서버에다가 보냄
        .then(response => console.log(response.data)) //response를 받아서 console로 보여줌
    }, [])
    
  return (
    <div>LandingPage</div>
  )
}

export default LandingPage