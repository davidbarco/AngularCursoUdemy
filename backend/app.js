"use strict"

//cargar modulos de node para crear el servidor
const express =require("express");
const bodyParser= require ("body-parser");


//ejecutar express (http)
const app = express()

//cargar ficheros rutas
const article_routes = require ("./routes/article")


//cargar middelwares
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());


//CORS
// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

//añadir prefijos a rutas / cargar rutas
app.use("/api", article_routes);

//ruta o metodo de prueba



//exportar modulo (fichero actual)
module.exports=app;