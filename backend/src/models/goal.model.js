import mongoose, { mongo } from "mongoose";

const goalSchema  =  new mongoose.Schema({

    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'user',
        required : true
    },
    goal_title : String,
    goal_description : String,
    goal_category : String,
    startDate : Date,
    targetDate : Date,
    endDate: Date,
    goal_status: { type: String,  enum:['completed','paused','active'] , default:'active'},
    


}, {timestamps : true})

const GoalModel = mongoose.model('goal', goalSchema)

export default GoalModel