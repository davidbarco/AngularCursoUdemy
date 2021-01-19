"use strict"
const express = require("express");
const articleControllers = require("../controllers/article")

const router= express.Router();

const multiparty = require('connect-multiparty');
const middleware_upload= multiparty({uploadDir:"./upload/articles"})


router.get("/test-de-controlador", articleControllers.test );
router.post("/datos-curso", articleControllers.datosCurso );
router.post("/save", articleControllers.save);
router.get("/articles/:last?", articleControllers.getArticles);
router.get("/article/:id", articleControllers.getArticle);
router.put("/article/:id", articleControllers.update);
router.delete("/article/:id", articleControllers.delete);
router.post("/upload-image/:id?", middleware_upload, articleControllers.upload);
router.get("/get-image/:image", articleControllers.getImage);
router.get("/search/:search", articleControllers.search);


module.exports = router;