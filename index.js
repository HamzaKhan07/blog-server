const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const Post = require('./models/post');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const secretKey="afjasdklfj23987sdf";


app = express();
app.use(cors({credentials: true, methods: ["POST", "GET", "PUT", "DELETE"], origin: ['https://blogify-kohl-gamma.vercel.app', 'http://localhost:3000']}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname+'/uploads'));

mongoose.connect('mongodb+srv://hamzakhan48208:bXAbjJKrmQ4Wc0l4@cluster0.urcj6v8.mongodb.net/?retryWrites=true&w=majority');


app.get('/', function(req, res){
    res.json('Welcome to Blog Server-1');
});

//register
app.post('/register', async function(req, res){
    const {username, password} = req.body;
    //register
    try{
        const userDoc = await User.create({username: username, password: password});
        res.json(userDoc);
    }
    catch(e){
        res.status(400).json(e);
    }
    
});

//login
app.post('/login', async function(req, res){
    const {username, password} = req.body;
    console.log(username);

    const userDoc = await User.findOne({username: username});

    //check if user exists
    if (userDoc===null || Object.keys(userDoc).length === 0 || !userDoc){
        res.status(400).json("Invalid Credentials!");
        return;
    }

    //check password
    const isValid = password === userDoc.password // true
    if(isValid){
        //logged in
       res.json(userDoc);
    }
    else{
        res.status(400).json("Invalid Credentials!");
    }

    //session
});


//save post
app.post('/post',upload.single('file'), async function(req, res){
    const {originalname, path} = req.file;
    const ext = originalname.split('.')[1];
    
    //rename
    const newPath=path+"."+ext
    fs.renameSync(path, newPath);

    //store data
    const {userId, title, summary, content, category} = req.body;
    const postDoc=await Post.create({
        title: title,
        summary: summary,
        content: content,
        category: category,
        cover: newPath,
        author: new mongoose.Types.ObjectId(userId),
    });

    res.json(postDoc);

});

//update post
app.put('/post',upload.single('file'), async function(req, res){
    const newPath=null;
    if(req.file){
        const {originalname, path} = req.file;
        const ext = originalname.split('.')[1];
    
        //rename
        newPath=path+"."+ext
        fs.renameSync(path, newPath);
    }
    
    //update
    //grab information
    const {userId, id, title, summary, content, category} = req.body;
    const postDoc = await Post.findById(id);

    postDoc.title=title;
    postDoc.summary=summary;
    postDoc.content=content;
    postDoc.category=category;
    postDoc.cover= newPath ? newPath : postDoc.cover;

    await postDoc.save();
    
    res.json({postDoc});

});


//get posts
app.get('/getPosts/:category', async function(req, res){
    const {category} = req.params;
    console.log(category);

    let posts;

    if(category==='All'){
        posts=await Post.find().populate('author', ['username']).populate('comments.author', ['username']).sort({createdAt: -1}).limit(20);
    }
    else if(category!='All' && category!='Tech' && category!='Lifestyle' && category!='Finance' && category!='Education'){
        posts=await Post.find({ title: { $regex: category, $options: 'i' } }).populate('author', ['username']).populate('comments.author', ['username']).sort({createdAt: -1}).limit(20);
    }
    else{
        posts = await Post.find({'category' : category}).populate('author', ['username']).populate('comments.author', ['username']).sort({createdAt: -1}).limit(20);
    }
   
    res.json(posts);
});

//get specific post data
app.get('/posts/:id', async function(req, res){
    const {id}=req.params;

    const postDoc = await Post.findById(id).populate('author', ['username']).populate('comments.author', ['username']);
    res.json(postDoc);
});

//add comments
app.post('/comments/:id', async function(req, res){
    const {id}=req.params;
    const {comment, userId} = req.body;

    //prepare comment
    const commentDoc = {
        content: comment,
        author: new mongoose.Types.ObjectId(userId),
    };

    //get post 
    const PostDoc = await Post.findById(id);
    //add post
    PostDoc.comments.unshift(commentDoc);
    await PostDoc.save();

    const updatedPostDoc = await Post.findById(id).populate('author', ['username']).populate('comments.author', ['username']);
    
    res.json(updatedPostDoc);
});

//delete post
app.delete('/delete/:id', async function(req, res){
    const {id} = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);
    res.json(deletedPost);

});

app.listen(4000, function(){
    console.log('listening on port 4000');
})
//mongodb+srv://hamzakhan48208:bXAbjJKrmQ4Wc0l4@cluster0.urcj6v8.mongodb.net/?retryWrites=true&w=majority
//UrN78XmoymMc1ip3
//bXAbjJKrmQ4Wc0l4