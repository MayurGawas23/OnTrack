import express from 'express'
import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


export const RegisterUser = async (req, res) => {
    const { username, email, password } = req.body

    const isUserExists = await userModel.findOne({ email })

    if (isUserExists) {
        return res.status(409).json({
            message: "User already exists"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign({
        id: user._id
    }, process.env.JWT_SECRET)

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });

    res.status(201).json({
        message: "User registered successfully",
        user,
    })

}

export const loginUser = async (req, res) => {
    const { email, username, password } = req.body

    const user = await userModel.findOne({
        $or: [
            { username }, { email }
        ]
    })

    if (!user) {
        return res.status(401).json({ message: "Invalid Credentials" })
    }

    const isPassValid = await bcrypt.compare(password, user.password)

    if (!isPassValid) {
        return res.status(401).json({ message: "Invalid Credentials" })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

    res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    });

    res.status(200).json({
        message: "User logged in successfully",
        user
    })

}

export const updateUser = async (req, res) => {
    try {
        const userId = req.userId;
        const updates = req.body;

        // Exclude fields that shouldn't be directly updated
        delete updates.password;
        delete updates.email;
        delete updates._id;

        const updatedUser = await userModel.findByIdAndUpdate(userId, updates, { returnDocument: 'after' }).select('-password');

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const logout = (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(0)
    });
    res.status(200).json({ message: "Logged out successfully" });
}