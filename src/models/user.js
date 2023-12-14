const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt  = require('jsonwebtoken')
const Task = require('./task')


// the reason we created schema is to use middleware
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true,
        trim : true

    },
    email:{
        type: String,
        unique : true,
        required : true,
        trim : true,
        lowercase : true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid')
            }

        }
    },
    password:{
        type : String,
        required : true,
        minlength : 7,
        trim : true,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cannot contain itself')
            }
        }

    },

    age:{
        type: Number,
        default : 0,
        validate(value){
            if(value < 0){
                throw new Error('Age must be a +ve num')
            }
        }

    },
    tokens:[{
        token:{
            type: String,
            required :true
        }
    }]
})

userSchema.virtual('tasks',{
    ref : 'Task',
    localField :'_id',
    foreignField : 'owner'
})


userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}


userSchema.methods.generateAuthToken = async function(){
     const user = this
     const token = jwt.sign({_id:user._id.toString()},'thisismynewcourse')
     user.tokens = user.tokens.concat({token})
     await user.save()
     return token
}

userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})

    if(!user){
        throw new Error('unable to login')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error('unable to login')
    }
    return user
}

//hashing password
userSchema.pre('save',async function(next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})


//delete the user tasks when user is removed
userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User