var authenticateController = require('./api/controllers/authenticate-controller');
var adminController = require('./api/controllers/admin/admin-controller');
var countryController = require('./api/controllers/admin/country-controller');

// For Backend Controllers
var provinceController = require('./api/controllers/admin/province-controller');
var languageController = require('./api/controllers/admin/language-controller');
var timezoneController = require('./api/controllers/admin/timezone-controller');
var colorController = require('./api/controllers/admin/color-controller');

// For Frontend Controllers
var homeController = require('./api/controllers/home-controller');
var customerController = require('./api/controllers/customer-controller');
var commonController = require('./api/controllers/common-controller');

// Validation Helper used for validation
var validate = require('./api/helpers/validation-helper');

// Validation Configuration for controller
var customerValidation = require('./api/validation/customer-validation');
var homeValidation = require('./api/validation/home-validation');
var adminValidation = require('./api/validation/admin/admin-validation');


module.exports = {
  configure: function(app, router) {

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/api-docs/index.html');
    });    

    app.post('/admin/create', authenticateController.isAuthenticated, validate(adminValidation.create), function(req, res) {
        adminController.create(req, res);
    });

    app.post('/admin/login', validate(adminValidation.login), function(req, res) {
        adminController.login(req, res);
    });

    app.get('/admin/getUser/:id', authenticateController.isAuthenticated, function(req, res) {
        adminController.getUser(req, res);
    });

    app.put('/admin/updateProfile', authenticateController.isAuthenticated, function(req, res) {
        adminController.updateProfile(req, res);
    });

    app.post('/admin/changePassword', authenticateController.isAuthenticated, function(req, res) {
        adminController.changePassword(req, res);
    });

    app.delete('/admin/deleteUser', authenticateController.isAuthenticated, function(req, res) {
        adminController.deleteUser(req, res);
    });

    app.post('/admin/getAllUsers', authenticateController.isAuthenticated, function(req, res) {
        adminController.getAllUsers(req, res);
    });

    app.post('/admin/forget', function(req, res) {
        adminController.forgetPassword(req, res);
    });    

    app.post('/admin/reset/:key', function(req, res) {
        adminController.resetPassword(req, res);
    });        

    app.get('/common/countries', function(req, res) {
        commonController.countries(req, res);
    });
    
    app.get('/common/province/:country_id', function(req, res) {
        commonController.province(req, res);
    });
    
    app.get('/common/allprovince', function(req, res) {
        commonController.allprovince(req, res);
    });

    app.get('/common/countrieslist/:limit', function(req, res) {
        commonController.countrieslist(req, res);
    });

    app.get('/common/countrylanguage/:langauge_code', function(req, res) {
        commonController.countrylanguage(req, res);
    });
    
    /************** Country **********/
    
    app.post('/admin/country/list', authenticateController.isAuthenticated, function(req, res) {
        countryController.list(req, res);
    });

    app.post('/admin/country/create', authenticateController.isAuthenticated, function(req, res) {
        countryController.create(req, res);
    });

    app.get('/admin/country/view/:id', authenticateController.isAuthenticated, function(req, res) {
        countryController.view(req, res);
    });

    app.put('/admin/country/update', authenticateController.isAuthenticated, function(req, res) {
        countryController.update(req, res);
    });    

    app.delete('/admin/country/delete', authenticateController.isAuthenticated, function(req, res) {
        countryController.delete(req, res);
    });
    
    /************** Country End **********/

    /************************* START language *****************/

    app.post('/admin/getlanguages', authenticateController.isAuthenticated, function(req, res) {
        languageController.getlanguages(req, res);
    });
    
    app.post('/admin/createlanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.createlanguage(req, res);
    });
    
    app.post('/admin/getlanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.getlanguage(req, res);
    });
    
    app.post('/admin/updatelanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.updatelanguage(req, res);
    });
    
    app.delete('/admin/deletelanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.deletelanguage(req, res);
    });
    
    /************************* END of language *****************/

    /************************* START timezone *****************/

    app.post('/admin/gettimezones', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.gettimezones(req, res);
    });
    
    app.post('/admin/gettimezone', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.gettimezone(req, res);
    });
    
    app.post('/admin/updatetimezone', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.updatetimezone(req, res);
    });
    
    app.delete('/admin/deletetimezone', authenticateController.isAuthenticated, function(req, res) {
        timezoneController.deletetimezone(req, res);
    });
    
    /************************* END of timezone *****************/
    
    /************************* START colors *****************/

    app.post('/admin/getcolors', authenticateController.isAuthenticated, function(req, res) {
        colorController.getcolors(req, res);
    });
    
    app.post('/admin/createcolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.createcolor(req, res);
    });
    
    app.post('/admin/getcolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.getcolor(req, res);
    });
    
    app.post('/admin/updatecolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.updatecolor(req, res);
    });
    
    app.delete('/admin/deletecolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.deletecolor(req, res);
    });
    
    /************************* END of colors *****************/    

    /************************* Home Page Routes ************************/

    app.get('/curriencies', function(req, res) {
        homeController.curriencies(req, res);
    });

    app.get('/languages', function(req, res) {
        homeController.languages(req, res);
    });

    app.post('/subscribe/newsletter', validate(homeValidation.subscribe), function(req, res) {
        homeController.subscribe(req, res);
    });

/*    app.get('/homeoffer', function(req, res) {
        homeController.homeoffer(req, res);
    });*/

    // Load all home page data.
    app.get('/home/:langauge_code', function(req, res){
        homeController.home(req, res);
    });
 

    /************************* END of Home Page *****************/    
    /********************* Customer Routes ************************/

    app.post('/customer/register', validate(customerValidation.register), function(req, res) {
        customerController.register(req, res);
    });
    
    app.post('/customer/login', validate(customerValidation.login), function(req, res) {
        customerController.login(req, res);
    });

    // Use to send forget password link to customer.
    app.post('/customer/forgetPassword', validate(customerValidation.forgetPassword), function(req, res) {
        customerController.forgetPassword(req, res);
    });    

    // Use to validate verification code for forget password sent by customer.
    app.post('/customer/verifyCode', validate(customerValidation.verifyCode), function(req, res) {
        customerController.verifyCode(req, res);
    });

    // Use to reset password send by customer and send confirmation email.
    app.put('/customer/resetPassword', validate(customerValidation.resetPassword), function(req, res) {
        customerController.resetPassword(req, res);
    });

    /************************* END of Customer *****************/

    /************************ START Admin Provinces/States ************************/
    app.post('/admin/province/getprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.getprovince(req, res);
    });

    app.post('/admin/province/createprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.createprovince(req, res);
    });

    app.get('/admin/province/viewprovince/:id', authenticateController.isAuthenticated, function(req, res) {
        provinceController.viewprovince(req, res);
    });

    app.put('/admin/province/updateprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.updateprovince(req, res);
    });    

    app.delete('/admin/province/deleteprovince', authenticateController.isAuthenticated, function(req, res) {
        provinceController.deleteprovince(req, res);
    });
    /************************ END Admin Provinces/States ************************/
   }
}