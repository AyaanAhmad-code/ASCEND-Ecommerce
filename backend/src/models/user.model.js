import mongoose from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: function() {
            return !this.googleId;
        }
    },
    contact: {
        type: String,
        required: false
    },
    address: {
        fullName: { type: String },
        email: { type: String },
        contact: { type: String },
        line1: { type: String },
        line2: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
    },
    fullname: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [ "buyer", "seller" ],
        default: "buyer"
    },
    googleId: {
        type: String
    }
})

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
})

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const userModel = mongoose.model('user', userSchema)

export default userModel