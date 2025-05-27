import mongoose, { model } from "mongoose";

 const categoryModel =new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    description: {
        type:String,
        default: "not set"
    }
},
{timestamps: true})

export  default mongoose.model('Category',categoryModel)