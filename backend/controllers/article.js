"use strict"
const validator =require("validator");
const Article = require("../models/article");
const fs = require("fs");
const path= require("path");
const article = require("../models/article");

const controller = {

  //metodo de prueba
  datosCurso: (req,res)=>{
    return res.status(200).send({
        curso: "master en frameworks js",
        autor: "david barco",
        url: "carlosbarco.com"
    })
  },

  //metodo de prueba
  test: (req,res)=>{
      return res.status(200).send({
        message: "soy la accion test de mi controlador de articulos"
      });
  },


  //metodo para guardar articulo o crear.
  //primer paso, me creo mi controlador mi metodo,luego creo mi ruta
  save: (req,res)=>{
    
    //recoger parametros
    const params= req.body
    //validar datos
    try{
      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.content);
    }catch(err){
      return res.status(404).send({
        status: "error",
        message: "faltan datos por enviar"
      });
    }
    if(validate_title && validate_content){

      //crear objeto a guardar
      var article = new Article();
      //asignamos valores
      article.title= params.title;
      article.content= params.content;
      
      //condicion para subir las imagenes desde el "crear articulo"
      if(params.image){
        article.image= params.image;
        
      }else{
       
        article.image = null;
      }
      
      //guardar articulo en base de datos
      article.save((err,articleStored)=>{
        if(err || !articleStored){
          return res.status(404).send({
            status: "error",
            message: "el articulo no se ha guardado"    
          });  
        }return res.status(200).send({
          status: "satisfactorio",
          article: articleStored
        });

      });


      
    }else{
      return res.status(404).send({
        status: "error",
        message: "los datos no son válidos"
      });
    }

    
  },


  //metodo para tomar todos los articulos, o sacar todos los articulos
  getArticles:(req,res)=>{
    //esto es solo para limitar y poder sacar los primeros 5 articulos
    var query= Article.find({});
    var last = req.params.last;
    
    
    if(last || last != undefined){
      query.limit(5);
      
    }

    //find para sacar los datos de la base de datos
    query.sort("-_id").exec((err,articles)=>{
      if(err){
        return res.status(500).send({
          status: "error",
          message: "error al devolver los datos"
        })
      }if(!articles){
        return res.status(404).send({
          status: "error",
          message: "error, no hay articulos"
        })
      }
      return res.status(200).send({
        status: "satisfactorio",
        articles
      })
    })
    
  },

  //metodo para sacar un unico articulo
  getArticle:(req,res)=>{
    //recoger el id de la url
    var articleId= req.params.id;
    //comprobar que existe
   if(!articleId || articleId== null || articleId== undefined){
    return res.status(404).send({
      status: "error",
      message: "no existe el articulos"
    })
   }
    //buscar el articulo
    Article.findById(articleId,(err,article)=>{
      if(err){
        return res.status(500).send({
          status: "error",
          message: "error al devolver los datos"
        })
      }if(!article){
        return res.status(404).send({
          status: "error",
          message: "no existe el articulo"
        })
      }//devolver el articulo
    return res.status(200).send({
      status: "satisfactorio",
      article
    });

    })

    
  },

  //metodo para actualizar un articulo
  update: (req,res)=>{
    //recoger el id del articulo que viene por la url
    var articleId= req.params.id
    //recoger los datos que llegan por put
    var params= req.body
    //validar datos
    try{
      var validate_title = !validator.isEmpty(params.title);
      var validate_content = !validator.isEmpty(params.content);
    }catch(err){
      return res.status(200).send({
        status: "error",
        message: "faltan datos por enviar"
      })
    }
    if(validate_content && validate_title){
         //hacer un find and update(me encuentra el dato y loactualiza)
         Article.findOneAndUpdate({_id:articleId},params, {new:true},(err,artcileUpdate)=>{
            if(err){
              return res.status(500).send({
                status: "error",
                message: "error al actualizar"
              })
            }
            if(!artcileUpdate){
              return res.status(404).send({
                status: "error",
                message: "no existe el articulo"
              })
            }
            return res.status(200).send({
              status: "satisfactorio",
              article: artcileUpdate
            })
         });
    }else{
        //devolver respuesta
        return res.status(200).send({
          status: "error",
          message: "la validacion no es correcta"
        })
    }

    


    
  },

  //metodo para borrar un articulo
  delete: (req,res)=>{
    //recoger el id de la url
    var articleId= req.params.id;
    // hacer in find and delete
    Article.findOneAndDelete({_id:articleId},(err,articleRemove)=>{
      if(err){
        return res.status(500).send({
          status: "error",
          message: "error al borrar"
        })
      }
      if(!articleRemove){
        return res.status(404).send({
          status: "error",
          message: "no se ha borrado el articulo o no existe"
        })
      }else{
        return res.status(200).send({
          status: "satisfactorio",
          article: articleRemove
        })
      }

    })

    
  },


  //metodo para subir archivos o imagenes(en este caso imagenes)
  upload:(req,res)=>{
    //configurar connect multiparty en la carpeta de routes.  router/article.js
    
    //recoger el fichero de la peticion
    var file_name= "imagen no subida";
    if(!req.files){
      return res.status(404).send({
        status: "error",
        message: file_name
      })
    } 
    
    //conseguir el nombre y la extension del archivo 
    //(el file 0, es como el valor que se envia por el body params, form-data)
    var file_path= req.files.file0.path;
    
    var file_split= file_path.split("\\");
    /* advertencia para split en linux o mac */
    /* var file_split= file_path.split("/") */
    
    //nombre del archivo
    var file_name= file_split[2]
    //extension del archivo
    
    var extension= file_name.split(".")
    var file_extension= extension[1]
    //comprobar la extension, solo imagenes,si no es valida borrar el fichero.
    if(file_extension != "png" && file_extension != "jpg" && file_extension != "jpeg" && file_extension != "gif" ){
       //borar archivo subido(esto se hace con file sistem)
       fs.unlink(file_path, (err)=>{
        return res.status(200).send({
          status: "error",
          message: "la extension de la imagen no es valida"
        })
       })
    }else{
       //si todo es valido,busca el archivo y lo actualiza, sacando el id de la url
       var articleId= req.params.id
       
       if(articleId){
         
         //buscar el articulo, asignarle el nombre de la imagen y actualizarlo.
         Article.findOneAndUpdate({_id: articleId }, {image: file_name}, {new: true},(err,articleUpdated)=>{
           if(err || !articleUpdated){
            return res.status(404).send({
              status: "error",
              message: "error al guardar la imagen de articulo"
            })
           }
          return res.status(200).send({
            status: "satisfactorio",
            article: articleUpdated
          });     
         });  
       }else{
        return res.status(200).send({
          status: "satisfactorio 1",
          image: file_name
        });     
       }
       
      }
    
  },

  //metodo para sacar la imagen guardada
  getImage: (req,res)=>{
    var file= req.params.image  // aqui está guardado el nombre de la imagen con la extension
    
    var path_file = "./upload/articles/" + file;
    fs.exists(path_file, (exists)=>{
      if(exists){
        return res.sendFile(path.resolve(path_file))
      }else{
        return res.status(404).send({
          status: "error",
          message: "el archivo no existe. aqui"
        });
      }
    });
    
  },

  //metodo para buscar
  search:(req,res)=>{
    //sacar el string a buscar
  var searchString=  req.params.search;
    //find or
    Article.find({"$or":[
        {"title": {"$regex": searchString, "$options": "i"}},
        {"content": {"$regex": searchString, "$options": "i"}},

    ]})
    //ordenar por fecha
    .sort([["date", "descending"]])
    .exec((err,articles)=>{
       if(err){
        return res.status(500).send({
          status: "error",
          message: "error en la peticion"
        }) 
       }if(!articles || articles.length<=0){
        return res.status(404).send({
          status: "error",
          message: "No hay articulos que coincidan con tu busqueda"
        }) 
       }
      return res.status(200).send({
        status: "satisfactorio",
        articles
      });
    })



    
  }





}; //fin de controler

module.exports=controller