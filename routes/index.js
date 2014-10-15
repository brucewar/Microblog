
/*
 * GET home page.
 */
var ejs = require('ejs');
var fs = require('fs');
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
//var templateString=null;


function index(req,res){
    Post.get(null,function(err,posts){
       if(err){
           posts = [];
       }
       res.render('index',{
           'title':'首页',
           'user':req.session.user,
           'success':req.flash('success').toString(),
           'error':req.flash('error').toString(),
           'posts':posts
       });
    });
}

function reg(req,res){
    checkNotLogin(req,res);
    //templateString = fs.readFileSync("views/reg.ejs", 'utf-8');
    res.render('reg',{
        'title':'用户注册',
        'user':req.session.user,
        'success':req.flash('success').toString(),
        'error':req.flash('error').toString()});
}

function doReg(req,res){
    checkNotLogin(req,res);
    //检验用户两次输入的口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
        req.flash('error', '两次输入的口令不一致');
        return  res.redirect('/reg');
    }

    //生成口令的散列值
    var  md5 = crypto.createHash('md5');
    var  password = md5.update(req.body.password).digest('base64');

    var  newUser =  new  User({
        name: req.body.username,
        password: password
    });

    //检查用户名是否已经存在
    User.get(newUser.name, function (err, user) {
        if (user)
            err = 'Username already exists.';
        if (err) {
            req.flash('error', err);
            return res.redirect('/reg');
        }
        // 如果不存在则新增用户
        newUser.save(function (err) {
            if (err) {
                req.flash('error', err);
                return  res.redirect('/reg');
            }
            req.session.user = newUser;
            req.flash('success', ' 注册成功');
            res.redirect('/');
        });
    });
}

function login(req,res){
    checkNotLogin(req,res);
    //templateString = fs.readFileSync("views/login.ejs", 'utf-8');
    res.render('login',{
        'title':'用户登录',
        'user':req.session.user,
        'success':req.flash('success').toString(),
        'error':req.flash('error').toString()});
}

function doLogin(req,res){
    checkNotLogin(req,res);
    var  md5 = crypto.createHash('md5');
    var  password = md5.update(req.body.password).digest('base64');

    User.get(req.body.username, function (err, user) {
        if (!user) {
            req.flash('error', ' 用户不存在');
            return  res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', ' 用户口令错误');
            return  res.redirect('/login');
        }
        req.session.user = user;
        req.flash('success', ' 登入成功');
        res.redirect('/');
    });
}

function logout(req,res){
    // 这个checkLogin，在这里会不会有问题？
    checkLogin(req,res);
    req.session.user =  null;
    req.flash('success', '登出成功');
    return res.redirect('/');
}

function post(req,res){
    User.get(req.params.user,function(err,user){
        if(!user){
            req.flash('error','用户不存在');
            return res.redirect('/');
        }
        Post.get(user.name,function(err,posts){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            res.render('user',{
                title:user.name,
                user:req.session.user,
                posts:posts,
                'success':req.flash('success').toString(),
                'error':req.flash('error').toString()
            });
        });
    });
}

function doPost(req,res){
    checkLogin(req,res);
    var currentUser = req.session.user;
    var post = new Post(currentUser.name,req.body.post);
    post.save(function(err){
        if(err){
            req.flash('error',err);
            return res.redirect('/');
        }
        req.flash('success','发表成功');
        res.redirect('/u/' + currentUser.name);
    });
}

function  checkLogin(req, res) {
    if (!req.session.user) {
        req.flash('error', '未登入');
        return  res.redirect('/login');
    }
}

function checkNotLogin(req, res) {
    if (req.session.user) {
        req.flash('error', '已登入');
        return res.redirect('/');
    }
}

exports.index = index;
exports.reg = reg;
exports.doReg = doReg;
exports.login = login;
exports.doLogin = doLogin;
exports.logout = logout;
exports.doPost = doPost;
exports.post = post;
