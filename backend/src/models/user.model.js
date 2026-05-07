import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say']
    },
    height: {
        type: Number
    },
    weight: {
        type: Number
    },
    onboarded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const userModel = mongoose.model('user', userSchema)

export default userModel