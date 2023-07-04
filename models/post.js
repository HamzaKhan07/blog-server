const mongoose = require('mongoose');
const {Schema, model} = mongoose;

const CommentSchema = new Schema({
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  });

const PostSchema = new Schema({
    title: String,
    summary: String,
    content: String,
    category: {type: 'String', default: 'All'},
    cover: String,
    author: {'type': Schema.Types.ObjectId, 'ref': 'User'},
    comments: [CommentSchema]
}, {
    timestamps: true,
});

const PostModel = new model('Post', PostSchema);

module.exports = PostModel;