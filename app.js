const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const user = require('./model');
const { resolveSoa } = require('dns');

const app = express();


//middleware
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.set('view engine', 'ejs')

//create mongo connectionr

// const mongoURI = ();
const conn = mongoose.createConnection('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })

//init gfs
let gfs;

conn.once('open', function () {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads')
})

//create storage engine
const storage = new GridFsStorage({
    url: 'mongodb://localhost:27017',
    file: (req, file) => {
        return new Promise((resolve, reject) => {

            const filename = (file.originalname);
            const fileInfo = {
                filename: filename,
                bucketName: 'uploads'
            };
            resolve(fileInfo);
        });
    }
})

const upload = multer({ storage });

//routes
// get, desc:- uploads file tp db
app.get('/', (req, res) => {
    res.render('index')
})

//@route- post, it uploads to  
app.post('/upload', upload.single('file'), (req, res) => {
    // const data=await user.create(req.body)
    var myData = new user(req.body);
    myData.save()
    res.json({
        file: req.file,
        data:myData
    })
})


// app.post('/upload',(req,res)=>{

// })

//@route -get, it display all the data 
app.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            return res.status(404).json({
                err: 'No files exist'
            });
        }
        // Files exist
        return res.json(files);
    });
});


app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      // Check if image
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });


const port = 3000
app.listen(port, '127.0.0.1', () => { console.log(`server started at port: ${port}`) })