var config = require('./../../../config');
var connection = require('./../../../database');
var dbModel = require('./../../models/db-model');
var table_name = "flower_types";
function flowerModel(){	
	this.getFlowerTypes = function(flower_type, callback) {

	    var sql = "SELECT ft.id, ft.created_at, ft.updated_at, CASE WHEN ft.status = 1 THEN 'Active' WHEN ft.status = 0 THEN 'In-Active' END AS 'status' FROM "+table_name+" ft INNER JOIN language_types lt ON(ft.id = lt.type_id) WHERE lt.type='flower'";
	    if(flower_type != "" && flower_type != undefined){
	        sql += " AND lt.name like '%"+flower_type+"%'";
	    }

	    sql += " GROUP BY ft.id";

		dbModel.rawQuery(sql, function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}
	  	});
	}

	this.getFlowerType = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT * FROM "+table_name+" WHERE id = "+id, function(err, result){            	
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			
	}	

	this.checkFlowerType = function(flower_type, id, callback) {

		var sql = "SELECT id FROM "+table_name+" WHERE flower_type = '"+flower_type+"' AND id <> "+id;
		//console.log(sql);
    	dbModel.rawQuery(sql, function(err, result){
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			    
	}

	this.createFlowerType = function(data, callback) {

		dbModel.save("language_types", data, "", function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}			          	
	  	});
	}

/*	this.createFlowerType = function(data, callback) {
		//console.log(data);
		// Checking if user email already exist in database
		dbModel.save(table_name, data, "", function (err, results) {
	      	if (err) {
	      		callback(err);
	      	}else{
	      		callback(null, results);
	      	}			          	
	  	});
	}*/

	this.updateFlowerType = function(data, type_id, language_id, callback) {

		dbModel.getConnection(function(err, con){
			if (err) {
				callback(err);
			}
			else {
				con.query('UPDATE language_types SET ? WHERE type_id = ? AND language_id = ?', [data, type_id, language_id], function (err, results) {
					con.release();
		          	if (err) {
		          		callback(err);
		          	}else{
		          		callback(null, results);
		          	}			          	
		      	});
			}
		});		
	}	

/*
	this.updateFlowerType = function(data, id, callback) {
		
		// Checking if user email already exist in database
		dbModel.save(table_name, data, id, function (err, results) {
          	if (err) {
          		callback(err);
          	}else{
          		callback(null, results);
          	}			          	
      	});

	}
*/
	this.checkDeleteFlowerType = function(id, callback) {

		// Checking if user email already exist in database
    	dbModel.rawQuery("SELECT id FROM "+table_name+" WHERE id = "+id, function(err, result){
          if (err) {
            callback(err);
          }else{
          	callback(null,result);
          }
        });
			
	}

	this.deleteFlowerType = function(id, callback) {

		// Delete flower types
		dbModel.getConnection(function(error, con){
          if (error) {
            callback(error);
          }else{

            // Delete vendor form table if found 
            dbModel.beginTransaction(con, 'DELETE FROM '+table_name+' WHERE id ='+id, function(error, result){
              if(error){
                callback(error);                   
              }else{

                if(result.affectedRows > 0){

                  // Delete vendor specific entries form country vendor,group_vendor,method_vendor and vendor_secondary_contact tables.
                  var sql = "DELETE FROM language_types WHERE type='flower' AND type_id="+id;
                  //console.log(sql);

                  // Delete vendor specific entries form group_vendor table
                  dbModel.transactionQuery(con, sql, function (error, result) {
                    if (error) {
                      callback(error);
                    }else{

                      dbModel.commit(con, function(err, response){
                        if (error) {
                          callback(error);
                        }else{
                          callback(null, response);                                   
                        }                                  

                      });

                    }    
                  });
               
                }else{
                  callback(error);
                }

              }

            });

          }

        });

	}

/*	this.deleteFlowerType = function(id, callback) {

		// Delete sympathy types
		dbModel.delete(table_name, "id="+id, function (err, results) {
          	if (err) {
          		callback(err);
          	}else{
          		callback(null, results);
          	}			          	
      	});
	}*/	

	this.getLanguageData = function(type_id, callback){

	    $sql = "SELECT language_id,name from `language_types` WHERE type='flower' AND type_id="+type_id;
	    dbModel.rawQuery($sql, function(err, $result) {
	        if (err) callback(err);
	        else callback(null,$result);
	    });

	}	
}

module.exports = new flowerModel();
