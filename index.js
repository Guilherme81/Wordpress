const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

const session = require("express-session");
app.use(session({
    secret: "dilera", 
    cookie: {maxAge: 30000000}
}));

const categoriesController = require("./categories/CategoriesController");
const articlesController = require("./articles/ArticlesController");
const usersController = require("./users/UsersContriller");

const Article = require("./articles/Article");
const Category  = require("./categories/Category");
const users = require("./users/User");

app.use(express.static("public")); 

const connection = require("./database/database");
connection
       .authenticate()
       .then(() =>{
           console.log("safe");
       }).catch((error) => {
           console.log(error);
       });

app.use("/",categoriesController);
app.use("/",articlesController);
app.use("/",usersController);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    Article.findAll({
        order:[
            ["id", "DESC"]
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", {articles: articles, categories: categories});
        });   
    });
});

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("article", {article: article, categories: categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch( err => {
        res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) =>{
       var slug = req.params.slug;
       Category.findOne({
           where:{
               slug: slug
           }, 
           include: [{model: Article}]
       }).then( category => {
           if (category != undefined) {
               Category.findAll().then(categories => {
                   res.render("index", {articles: category.articles, categories: categories});
               });
           } else {
               res.redirect("/");
           }
       }).catch(err => {
           res.redirect("/")
       });
});

app.listen(8080, () =>{
   console.log("sevidor rodando")
});