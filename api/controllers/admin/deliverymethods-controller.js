var jwt = require('jsonwebtoken');
var Sync = require('sync');
var request = require('request');
var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');

function DeliveryMethodsController() {
//get list of all delivery methods
    this.getalldeliverymethods = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You don't have permission!"
            });       
        }else{
            dbModel.find('methods','','','','', function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                    if(result.length > 0){
                      // Append method language description
                      var methodData = []; 
                      Sync(function(){
                        for(var i=0;i < result.length; i++) {
                          var item = {};
                          var languagedata = getLanguage_entry.sync(null,result[i].id);
                          //console.log(price_filter);
                          if(languagedata.length > 0 && languagedata != undefined){
                              //item[key] = pfilter[key];
                              methodData.push({
                                  "id" : result[i].id,
                                  "delivery_method": result[i].delivery_method,
                                  "infotext": result[i].infotext,
                                  "delivery_within": result[i].delivery_within,
                                  "delivery_charge": result[i].delivery_charge,
                                  "delivery_days": result[i].delivery_days,
                                  "delivery_hour": result[i].delivery_hour,
                                  "delivery_minute": result[i].delivery_minute,
                                  "delivery_policy_id": result[i].delivery_policy_id,
                                  "substitution_policy_id": result[i].substitution_policy_id,
                                  "status": result[i].status,
                                  "atlas_order": result[i].atlas_order,
                                  "description" : languagedata
                              });
                          }          
                          
                        }
                      res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message:"methods found",
                        result: methodData
                      });
                      });
                    }
                    else {
                        res.status(config.HTTP_BAD_REQUEST).send({
                          status:config.ERROR,
                          code: config.HTTP_BAD_REQUEST, 
                          message:"Failed to get methods"
                      }); 
                    }
              }
            });
        }
    }

    // Get delivery method
    this.getmethod = function(req, res) {
      var id = req.body.id;
      dbModel.rawQuery('SELECT * FROM methods WHERE id ='+id, function(err, result){
        if (err) {
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to process request!", 
            errors : err
          });
        }else{
          //console.log( result[0].id);return;
          if(result.length > 0 && result[0].id > 0 ){
              Sync(function(){              
                  var languagedata = getLanguage_entry.sync(null,result[0].id);
                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    results : {
                        "id" : result[0].id,
                        "delivery_method": result[0].delivery_method,
                        "infotext": result[0].infotext,
                        "delivery_within": result[0].delivery_within,
                        "delivery_charge": result[0].delivery_charge,
                        "delivery_days": result[0].delivery_days,
                        "delivery_hour": result[0].delivery_hour,
                        "delivery_minute": result[0].delivery_minute,
                        "delivery_policy_id": result[0].delivery_policy_id,
                        "substitution_policy_id": result[0].substitution_policy_id,
                        "status": result[0].status,
                        "atlas_order": result[0].atlas_order,
                        "description" : languagedata                    
                    }
                  });
              });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
              status: config.ERROR, 
              code : config.HTTP_BAD_REQUEST, 
              message : "Something went wrong please check again.", 
            });          
          }
        }
      });
    }
    //add/edit delivery method
    this.addeditmethod = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission!"
            });       
        }else{  
            
            if(req.body.id == undefined) var id=0;
            else var id= req.body.id;                                  
            var descriptionArr= req.body.descriptionArr;
            var post = {
                delivery_method: req.body.delivery_method,
                infotext: req.body.infotext,
                delivery_within: req.body.delivery_within,
                delivery_charge: req.body.delivery_charge,
                delivery_days: req.body.delivery_days,
                delivery_hour: req.body.delivery_hour,
                delivery_minute: req.body.delivery_minute,
                delivery_policy_id: req.body.delivery_policy_id,
                substitution_policy_id: req.body.substitution_policy_id,
                status: req.body.status,
                atlas_order: req.body.atlas_order
            };  

            var queryString="SELECT * FROM methods WHERE delivery_method='"+req.body.delivery_method+"' AND id <> "+id;
            dbModel.rawQuery(queryString, function(err, result) {
              if (err) {
                res.status(config.HTTP_BAD_REQUEST).send({
                  status: config.ERROR, 
                  code : config.HTTP_BAD_REQUEST, 
                  message: err
                });
              }
              else{
                  if(result.length > 0){
                      res.status(config.HTTP_SUCCESS).send({
                        status: config.SUCCESS,
                        code: config.HTTP_SUCCESS,
                        message:"The methods is already exists.",
                        result: result
                      });
                  }
                  else {
                      dbModel.save('methods',post,id, function(err, result) {
                            if (err) {
                                res.status(config.HTTP_BAD_REQUEST).send({
                                  status: config.ERROR, 
                                  code : config.HTTP_BAD_REQUEST, 
                                  message: err
                                });
                            }
                            else{
                              if(id ==0) id=result.insertId;
                                if(descriptionArr.length > 0){
                                  Sync(function(){
                                    var jsonData = JSON.parse(descriptionArr);
                                    for (var i = 0; i < jsonData.length; i++) {
                                      var lang = jsonData[i];
                                      var response='';
                                      if(id !=0) response=checkLanguage_entry.sync(null,id,lang.language_id);                            
                                      updateLanguage_entry.sync(null,id, lang,response);
                                    } 
                                  }); 
                                }
                                res.status(config.HTTP_SUCCESS).send({
                                      status: config.SUCCESS, 
                                      code : config.HTTP_SUCCESS, 
                                      message: 'methods saved'
                                });               
                            }
                      });
                  }
              }
            });

            
        }
    }
   //delete delivery method
    this.deletemethod = function(req, res) {
        if(req.decoded.role != config.ROLE_ADMIN){
            res.status(config.HTTP_FORBIDDEN).send({
              status: config.ERROR, 
              code : config.HTTP_FORBIDDEN, 
              message: "You dont have permission."
            });       
        }else{
              var id= req.body.id;
              // Getting Connection Object
            dbModel.getConnection(function(error, con){
              if (error) {
                res.status(config.HTTP_SERVER_ERROR).send({
                  status:config.ERROR,
                  code: config.HTTP_SERVER_ERROR,
                  message:'Unable to process result!',
                  error : error
                });
              }else{

                // Delete methods form table if found 
                dbModel.beginTransaction(con, 'DELETE FROM methods WHERE id ='+id, function(error, result){
                  if(error){
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to delete methods.',
                      error: error
                    });                    
                  }else{

                    if(result.affectedRows > 0){

                      // Delete methods specific entries
                     
                      var sql = "DELETE FROM language_method WHERE method_id ="+id+";";

                      // Delete methods specific entries
                      dbModel.transactionQuery(con, sql, function (error, result) {
                        if (error) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to delete methods.',
                            error: error
                          });
                        }else{

                          dbModel.commit(con, function(err, response){
                            if (error) {
                              res.status(config.HTTP_SERVER_ERROR).send({
                                status:config.ERROR,
                                code: config.HTTP_SERVER_ERROR,
                                message:'Unable to delete methods.',
                                error: error
                              });
                            }else{
                              res.status(config.HTTP_SUCCESS).send({
                                status:config.SUCCESS,
                                code: config.HTTP_SUCCESS,
                                message:'methods deleted successfully.'
                              });                                    
                            }                                  

                          });

                        }    
                      });
                   
                    }else{
                      res.status(config.HTTP_NOT_FOUND).send({
                        status:config.ERROR,
                        code: config.HTTP_NOT_FOUND,
                        message:'Vendor not found.'
                      });
                    }

                  }

                });

              }

            });

        }
    }

}
//get all method language entry
function getLanguage_entry(method_id,callback){
    $sql = "SELECT * from `language_method` WHERE  method_id="+method_id;
    dbModel.rawQuery($sql, function(err, $result) {
        if (err) callback(err);
        else callback(null,$result);
    });
}

//check existing method language entry
function checkLanguage_entry(method_id,language_id,callback){
    $sql = "SELECT id from `language_method` WHERE  `language_id`="+language_id+" AND method_id="+method_id;
    //console.log($sql);
    dbModel.rawQuery($sql, function(err, $result) {
        if (err) callback(err);
        else {
          var id ='';
          if($result.length > 0 && $result != undefined) id=$result[0].id
          callback(null,id);
        } 
    });
}

//update/insert method language entry
function updateLanguage_entry(method_id,descriptionArr,record_id='',callback){     
      var language_methodData = {
          "method_id": method_id,
          "language_id": descriptionArr.language_id,
          "description":descriptionArr.description
      };
      //console.log(language_methodData);
      dbModel.save("language_method", language_methodData, record_id, function (err, $result) {
        if (err) callback(err);
        else callback(null,$result);
      });  

}


module.exports = new DeliveryMethodsController();