"use strict"
const mongoose = require("mongoose");
const schema = mongoose.Schema;



const ArticleSchema = schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now },
    image: String
});

module.exports = mongoose.model('article', ArticleSchema);
