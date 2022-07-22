require('dotenv').config();


let userID="";
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose=require('mongoose');
const _ = require('lodash');
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/blogPostDB");

blogPostSchema=new mongoose.Schema({
  title:String,
  body:String,
  username:String
});

userSchema=new mongoose.Schema({
  email:String,
  username:String,
  password:String,
})

userSchema.plugin(passportLocalMongoose);

const BlogPost=mongoose.model("userblog",blogPostSchema);
const User=mongoose.model("User",userSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";




app.get("/",function(req,res){
  BlogPost.find({},function(err,arr){
    if(err)
      console.log(err);
    else
    {
       console.log(arr);
      if(userID==="")
        res.render("home",{link:"/login",login:"LOGIN",homeContent:homeStartingContent, posts:arr});
      else
        res.render("home",{login:"<i class='fa-solid fa-user'></i>",link:"/account",homeContent:homeStartingContent, posts:arr});
    }
  });

})

app.get("/about",function(req,res){
  if(userID==="")
    res.render("about",{link:"/login",login:"LOGIN",aboutContent:aboutContent});
  else
    res.render("about",{login:"<i class='fa-solid fa-user'></i>",link:"/account",aboutContent:aboutContent});
})

app.get("/contact",function(req,res){
  if(userID==="")
    res.render("contact",{link:"/login",login:"LOGIN",contactContent:contactContent});
  else
    res.render("contact",{login:"<i class='fa-solid fa-user'></i>",link:"/account",contactContent:contactContent});
})

app.get("/compose",function(req,res){
  res.render("compose",{login:"<i class='fa-solid fa-user'></i>",link:"/account",title:"", input:""});
})

app.get("/login",function(req,res){
  res.render("login",{link:"/login",login:"LOGIN"});
});

app.post("/login",passport.authenticate('local', { failureRedirect: '/login' }),function(req,res){
  // const username=req.body.username;
  // const password=req.body.password;
  //
  // User.findOne({username:username},function(err,found){
  //   if(err)
  //     console.log(err);
  //   else
  //   {
  //     if(found)
  //     {
  //       userID=found.username;
  //       res.redirect("/account");
  //     }
  //     else
  //       console.log("Not found");
  //   }
  // })
  userID=req.body.username;

    res.redirect('/account');
});

app.get("/register",function(req,res){
  res.render("register",{link:"/login",login:"LOGIN"});
});

app.post("/register",function(req,res){
  // const email=req.body.email;
  // const username=req.body.username;
  // const password=req.body.password;
  //
  // const newUser=new User({
  //   email:email,
  //   username:username,
  //   password:password
  // });
  // newUser.save(function(err){
  //   if(err)
  //     console.log(err);
  //   else
  //   {
  //     userID=username;
  //     res.redirect("/");
  //   }
  // });

  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err)
      console.log(err);
    else
    {
      passport.authenticate("local")(req,res,function(){ //from passport-local-mongoose
        userID=req.body.username;
        res.redirect("/account");
      })
    }
  })
});

app.get("/account",function(req,res){
  // console.log(userID);
  // BlogPost.find({username:userID},function(err,arr){
  //   if(err)
  //     console.log(err);
  //   else
  //   {
  //     console.log(arr);
  //     res.render("account",{link:"/account",login:"<i class='fa-solid fa-user'></i>",username:userID, posts:arr});
  //   }
  // })

  if(req.isAuthenticated()){
    BlogPost.find({username:userID},function(err,arr){
      if(err)
        console.log(err);
      else
      {
        console.log(arr);
        res.render("account",{link:"/account",login:"<i class='fa-solid fa-user'></i>",username:userID, posts:arr});
      }
    })
  }
  else
  {
    userID="";
    res.redirect("/login");
  }

})

app.post("/account",function(req,res){
  userID="";
  req.session.destroy(function(err){
    if(err)
      console.log(err);
    else
    {
      res.clearCookie('connect.sid');
      res.redirect("/");
    }
  })
})




app.get("/posts/:id",function(req,res){
  const id=(req.params.id);
  console.log(id);
  BlogPost.findOne({_id:id},function(err,found){
    if(err)
      console.log(err);
    else
    {
      console.log(found);
      // console.log(found.title);
      // console.log(found.body);
      if(userID==="")
        res.render("post",{link:"/login",login:"LOGIN",title: found.title, input:found.body, id:found._id});
      else
        res.render("post",{link:"/account",login:"<i class='fa-solid fa-user'></i>",title: found.title, input:found.body, id:found._id});
    }
  })
})

app.get("/userposts/:id",function(req,res){
    const id=req.params.id;
    BlogPost.findOne({_id:id},function(err,found){
      if(err)
        console.log(err);
      else
      {
        if(found)
          res.render("userpost",{link:"/account",login:"<i class='fa-solid fa-user'></i>",title:found.title,input:found.body,id:found._id});
      }
    })
});

app.post("/compose",function(req,res){
  // console.log("huh");
  const post=new BlogPost({
    title:_.capitalize(req.body.title),
    body:req.body.input,
    username:userID
  });
  post.save();
  //posts.push(post);
  res.redirect("/account");

});


app.post("/delete",function(req,res){
  const id=req.body.delete;
  BlogPost.deleteOne({_id:id},function(err){
    if(err)
      console.log(err);
    else {
      console.log("deleted successfully!");
      res.redirect("/account");
    }
  })
});

app.post("/update",function(req,res){
  const id=req.body.update;
  BlogPost.findOneAndDelete({_id:id},function(err,found){
    if(err)
      console.log(err);
    else
    {
      res.render("compose",{link:"/account",login:"<i class='fa-solid fa-user'></i>",title:found.title, input:found.body})
    }
  })
})







app.listen(3000, function() {
  console.log("Server started on port 3000");
});
