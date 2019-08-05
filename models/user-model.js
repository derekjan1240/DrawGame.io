const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    email: String,
    password: String,
    win: {
        type: Number,
        default: 0
    },
    lose: {
        type: Number,
        default: 0
    },
    googleId: String,
    lineId: String,
    thumbnail: {
        type: String,
        default: '/pic/defult-thumbnail.png'
    },
    timestamp: String,
    active:{
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('user', userSchema);

module.exports = User;