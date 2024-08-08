const mongoose = require("mongoose")
const bcrypt = require('bcrypt')

const accountSChema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    name: {
        type: String,
        required: [true, "Name is required"]
    },
    age: {
        type: Number,
        required: [true, "Age is required"]
    },
    profile_pic: {
        type: String,
    },
    cnic: {
        type: String,
        required: [true, "Cnic is required"],
        // validate: {
        //     validator: function (v) {
        //         return /^\d{13}$/.test(v);
        //     },
        //     message: props => `${props.value} is not a valid CNIC number! CNIC must be 13 digits long.`
        // }
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true
    },
}, { timestamps: true }
)

// accountSChema.pre("save", async function (next) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
// })

const Account = mongoose.model('burakAccount', accountSChema)

module.exports = Account