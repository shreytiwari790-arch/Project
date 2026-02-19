const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    username:String,
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
        minlength:6, 
    },
    image:{
        type:String,
        default:"",
    }
},{timestamps:true});

const User=mongoose.model('User',userSchema);
module.exports=User;

    /*"email":"shreyyy6590@gmail.com",
    "password":"12454556",
  "username": "shreyjkklyyyy"
  
  "title":"sjk",
  "caption":"dcae",
  "rating":"5"*/