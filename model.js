const mongoose=require('mongoose');



const schema=new mongoose.Schema({
    nameOfProduct:{
        type:String
    },
    quantity:{
        type:String
    },
    price:{
        type:Number
    }
})

module.exports=mongoose.model('uploads.files',schema)