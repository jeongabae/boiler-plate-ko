if(process.env.NODE_ENV === 'production'){ //만약 이게 production이면
    module.exports = require('./prod'); //module.exports를 prod.js 파일에서 가져오고
} else{ //development라면
    module.exports = require('./dev'); //module.exports를 dev.js 파일에서 가져오고
}