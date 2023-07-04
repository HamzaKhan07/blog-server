const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const UserSchema = Schema({
    username: {type: String, required: true, unique: true, min: true},
    password: {type: String, required: true}
});

const UserModel = model('User', UserSchema);

module.exports = UserModel;