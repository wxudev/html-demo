var fs = require('fs');
var express = require('express');
var multer  = require('multer')

var app = express();

app.use('/static', express.static('upload'))
app.use('/static/js', express.static('static/js'))
app.use('/', express.static('html'))

var uploadFolder = './upload/';

// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        const index = file.originalname.lastIndexOf('.');
        let ext;
        if(index > -1){
            ext = file.originalname.substr(index, file.originalname.length - 1)
        }
        cb(null, file.fieldname  +'-' + Date.now() + ext);  
    }
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ 
    storage: storage,
    fileFilter: function(req, file, cb){
        // 限制文件上传类型，仅可上传png/jpg格式图片
        if(file.mimetype == 'image/png' || file.mimetype == 'image/jpeg'  || file.mimetype == 'image/jpg'){
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
 })

 
let singleUpload = upload.single('file');

// 单图上传
app.post('/uploadImg', function(req, res, next){
    
    singleUpload(req,res,(err)=>{
        if(!!err){
            console.log(err.message)
            res.json({
                code: '2',
                originalname: '',
                msg: err.message
            })
            return;
        }
        if(!!req.file){console.log(req.file)
            res.json({
                code: '0',
                filename: req.file.filename,
                msg: ''
            })
        } else {
            res.json({
                code: '1',
                originalname: '',
                msg: ''
            })
        }
    });
});

app.get('/sendImg', function(req, res, next){
    const request = require('request');
    const path = require('path');

    const stream = fs.createReadStream(path.join(__dirname, './static/a.jpg'));
    const formData = {
        file: {
          value:  stream,
          options: {
            filename: 'a.jpg',
            contentType: 'image/jpeg'
          }
        }
      };
    request.post({
        url: 'http://localhost:3000/uploadImg',
        formData: formData
    }, function(error, response, body) {
        const data = JSON.parse(body)
        if(error){
            res.send({
                code: '1',
                msg: error
            });
        }
        else if (data.code === '0') {
            res.send({
                code: '0',
                msg: '发送成功'
            });
        }
    });
});

app.get('/form', function(req, res, next){
    const html = fs.readFileSync('./static/form.html', {encoding: 'utf8'});
    res.send(html);
});
app.get('/view', function(req, res, next){
    const html = fs.readFileSync('./static/view.html', {encoding: 'utf8'});
    res.send(html);
});

app.get('/getImg', function(req, res, next){
    const file = req.query ? req.query.file : '';

    res.send({
        url:  '/static/' + file
    });
});

app.listen(3000);