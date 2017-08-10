var jwt=require('jsonwebtoken');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var async = require('async');
var Sync = require('sync');
/*var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');*/
var handlebars = require('handlebars');
var fs = require('fs');

var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
//var userHelper = require('./../helpers/user-helper');
var commonHelper = require('./../../helpers/common-helper');
var fileHelper = require('./../../helpers/file-helper');
var base64Img = require('base64-img');
//var userModel = require('./../../../user-model');

var confirmed = status = 1;

function VendorController() {

  // Create New Vendor
  this.add = function(req, res, next){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You don't have permission to create user!"
      });       
    }else{

      var parent_id=req.body.parent_id ? req.body.parent_id : 0;
      var name = req.body.name;
      var email=req.body.email;
      var password=req.body.password;
      //var confirm_password=req.body.confirm_password;
      var phone_no = req.body.phone_no;
      var country_id = req.body.country_id;
      var surcharge = (req.body.surcharge) ? req.body.surcharge: '0.00';
      var status = req.body.status;

      //var confirmation_code = crypto.createHash('sha512').update(email).digest('hex');

      // Checking if vendor email already exist in database
      var sql = "SELECT id,name FROM vendor WHERE email = '"+email+"' OR name='"+name+"' LIMIT 1";
      
      dbModel.rawQuery(sql, function(err, result){
        if (err) {
          res.status(config.HTTP_SERVER_ERROR).send({
            status: config.ERROR, 
            code : config.HTTP_SERVER_ERROR, 
            message : "Unable to create vendor!", 
            errors : err
          });
        }else{
          if(result.length > 0 && result[0].id > 0){
            if(result[0].name == name){
              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The name has already been taken."
              });
            }else{              
              res.status(config.HTTP_ALREADY_EXISTS).send({
                status: config.ERROR, 
                code : config.HTTP_ALREADY_EXISTS, 
                message: "The specified account already exists."
              });
            }
          }else{

            var hashedPassword = bcrypt.hashSync(password, config.SALT_ROUND);              

            var data = {
              "parent_id": parent_id,
              "name": name,
              "email": email,
              "password": hashedPassword,
              "phone_number": phone_no,
              "status": status,
              "surcharge": parseFloat(surcharge).toFixed(2),
              "vendor_login_id": parent_id
            };              

            // Store hash in your password DB.
            dbModel.save("vendor", data, '', function (err, vendorRes) {
              if (err) {
                //console.log(err);
                res.status(config.HTTP_SERVER_ERROR).send({
                  status: config.ERROR, 
                  code : config.HTTP_SERVER_ERROR, 
                  message: "Unable to create vendor!"
                });
              }else{

                if(vendorRes.insertId > 0){
                  
                  var sql = "SELECT id FROM country_vendor WHERE vendor_id = ";
                  var vendor_id = '';
                  if(parent_id == 0){
                    sql += vendorRes.insertId;
                    vendor_id = vendorRes.insertId;
                  }else{
                    sql += parent_id;
                    vendor_id = parent_id;
                  }

                  // Check if Vendor exist in country table
                  dbModel.rawQuery(sql, function(err, result){
                    if (err) {
                      res.status(config.HTTP_SERVER_ERROR).send({
                        status: config.ERROR, 
                        code : config.HTTP_SERVER_ERROR, 
                        message : "Unable to create vendor!", 
                        errors : err
                      });
                    }else{

                      if(result.length > 0 && result[0].id > 0){
                        // Vendoer already exist no need to do anyting.
                      }else{
                        
                        // Create Vendor entry in country vendor table if parent vendor.
                        //if(parent_id == 0){
                          var countryData = {
                            "country_id": country_id,
                            "vendor_id": vendor_id
                            //"vendor_id": vendorRes.insertId
                          };

                          dbModel.save("country_vendor", countryData, '', function (err, countryVendorRes) {
                            if(err){
                              res.status(config.HTTP_SERVER_ERROR).send({
                                status: config.ERROR, 
                                code : config.HTTP_SERVER_ERROR, 
                                message: "Unable to create vendor!"
                              });                        
                            }

                          });
                        //}

                      }

                    }
                  });

                  res.status(config.HTTP_SUCCESS).send({
                    status: config.SUCCESS, 
                    code : config.HTTP_SUCCESS, 
                    message: 'Vendor created successfully!'
                  });

                }else{
                  res.status(config.HTTP_SERVER_ERROR).send({
                      status: config.ERROR, 
                      code : config.HTTP_SERVER_ERROR,          
                      message: "Unable to create vendor!"
                  });                  
                }
              }
            });
          }
        }
      });
    }    
  }

  // List All Vendors
  this.list = function(req, res, next){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You don't have permission to list vendor!"
      });       
    }else{

      var name = req.body.name;
      var email = req.body.email;

      var sql = "SELECT `v`.`id`, `v1`.`name` as 'vendor', `v`.`name` as 'sub_vendor', `v`.`email`, `v`.`phone_number`, `v`.`surcharge`, `v`.`profile_image`, CASE WHEN `v`.`status` = 1 THEN 'Active' WHEN `v`.`status` = 0 THEN 'De-active' END AS 'status' FROM vendor v LEFT JOIN vendor v1 ON v.parent_id = v1.id WHERE `v`.`status` > 0";

      if(name != "" && name != undefined){
        sql += " AND `v`.`name` LIKE '%"+name+"%'";
      }
      if(email != "" && email != undefined){
          sql += " AND `v`.`email` LIKE '%"+email+"%'";
      }
      
      //console.log(sql);

      dbModel.rawQuery(sql, function (error, vendorList) {
        if (error) {              
            res.status(config.HTTP_SERVER_ERROR).send({
              status:config.ERROR,
              code: config.HTTP_SERVER_ERROR,
              message:'Unable to process result!'
            });
        }else{
          if(vendorList.length > 0){
            res.status(config.HTTP_SUCCESS).send({
                status: config.SUCCESS,
                code: config.HTTP_SUCCESS,
                message: vendorList.length+" vendors found",
                result:vendorList
            });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST, 
                message:"No vendors found"
            }); 
          }
        }
      });
    }
  }

  // Delete Vendor
  this.delete = function(req, res, next) {
    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You don't have permission to delete vendor!"
      });
    }else{
      
      var id = req.body.id;

      // Select vendor based on Id
      dbModel.rawQuery('SELECT id FROM vendor WHERE id = '+id, function (error, vendorRes) {
        if (error) {
            res.status(config.HTTP_SERVER_ERROR).send({
              status:config.ERROR,
              code: config.HTTP_SERVER_ERROR,
              message:'Unable to process result!'
            });
        }else{

          if(vendorRes.length > 0 && vendorRes[0].id > 0){

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

                // Delete vendor form table if found 
                dbModel.beginTransaction(con, 'DELETE FROM vendor WHERE id ='+id, function(error, result){
                  if(error){
                    res.status(config.HTTP_SERVER_ERROR).send({
                      status:config.ERROR,
                      code: config.HTTP_SERVER_ERROR,
                      message:'Unable to delete User.',
                      error: error
                    });                    
                  }else{

                    if(result.affectedRows > 0){

                      // Delete vendor specific entries form country vendor,group_vendor,method_vendor and vendor_secondary_contact tables.
                     
                      var sql = "DELETE FROM country_vendor WHERE vendor_id ="+vendorRes[0].id+";";
                      sql += "DELETE FROM group_vendor WHERE vendor_id ="+vendorRes[0].id+";";
                      sql += "DELETE FROM method_vendor WHERE vendor_id ="+vendorRes[0].id+";";
                      sql += "DELETE FROM vendor_secondary_contact WHERE vendor_id ="+vendorRes[0].id+";";

                      // Delete vendor specific entries form group_vendor table
                      dbModel.transactionQuery(con, sql, function (error, result) {
                        if (error) {
                          res.status(config.HTTP_SERVER_ERROR).send({
                            status:config.ERROR,
                            code: config.HTTP_SERVER_ERROR,
                            message:'Unable to delete User.',
                            error: error
                          });
                        }else{

                          dbModel.commit(con, function(err, response){
                            if (error) {
                              res.status(config.HTTP_SERVER_ERROR).send({
                                status:config.ERROR,
                                code: config.HTTP_SERVER_ERROR,
                                message:'Unable to delete User.',
                                error: error
                              });
                            }else{
                              res.status(config.HTTP_SUCCESS).send({
                                status:config.SUCCESS,
                                code: config.HTTP_SUCCESS,
                                message:'Vendor deleted successfully.'
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
            
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST, 
                message:"Vendor not found"
            });
          }          
        }
      });
    }
  }

  // Get Vendor Data
  this.view = function(req, res, next){

    if(req.decoded.role != config.ROLE_ADMIN){
      res.status(config.HTTP_FORBIDDEN).send({
        status: config.ERROR, 
        code : config.HTTP_FORBIDDEN, 
        message: "You dont have permission to view vendor!"
      });     
    }else{
      var id = req.params.id;

      Sync(function(){

        var sql = "SELECT * FROM `vendor` WHERE `vendor`.`id` = "+id+" LIMIT 1";


      });

      var sql = "SELECT * FROM `vendor` WHERE `vendor`.`id` = "+id+" LIMIT 1";
      var sql = "SELECT `timezones`.* FROM `timezones` INNER JOIN `provinces` ON `provinces`.`timezone_id` = `timezones`.`id` WHERE `provinces`.`country_id` = 8 GROUP BY `provinces`.`timezone_id`";

      var sql = "SELECT * FROM `group_vendor` WHERE `vendor_id` = 46 and `country_id` = 8 AND `timezone_id` = 79 LIMIT 1";
      
      dbModel.rawQuery(sql, function(err, result) {
        if (err) {
          res.status(config.HTTP_NOT_FOUND).send({
            status:config.ERROR,
            code: config.HTTP_NOT_FOUND,             
            message:"No records found"
         });
        } else {
          if(result.length > 0 && result[0].id > 0){
            result[0].profile_image = '/uploads/profile_image/'+result[0].profile_image;

            res.status(config.HTTP_SUCCESS).send({
              status: config.SUCCESS,
              code: config.HTTP_SUCCESS,
              message:"User found",
              result: result[0]                    
            });
          }else{
            res.status(config.HTTP_BAD_REQUEST).send({
                status:config.ERROR,
                code: config.HTTP_BAD_REQUEST, 
                message:"Failed to get Customer Information"
            }); 
          }
        }        
        con.release();
      });
      
    }
  }

}

function timezones(country_id, callback){

}

module.exports = new VendorController();