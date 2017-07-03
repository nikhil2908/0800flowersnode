var authenticateController = require('./api/controllers/authenticate-controller');
var adminController = require('./api/controllers/admin/admin-controller');
var countryController = require('./api/controllers/admin/country-controller');
var provinceController = require('./api/controllers/admin/province-controller');
var userController = require('./api/controllers/user-controller');
var languageController = require('./api/controllers/admin/language-controller');
var commonController = require('./api/controllers/common-controller');
var homeController = require('./api/controllers/frontend/home-controller');
var timezoneController = require('./api/controllers/admin/timezone-controller');
var colorController = require('./api/controllers/admin/color-controller');

module.exports = {
  configure: function(app, router) {

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/api-docs/index.html');
    });    

    app.post('/admin/create', authenticateController.isAuthenticated, function(req, res) {
        adminController.create(req, res);
    });

    app.post('/admin/login', function(req, res) {
        adminController.login(req, res);
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

    app.get('/admin/:id[0-9]/', authenticateController.isAuthenticated, function(req, res) {
        userController.getUser(req.params.id, res);
    });

    app.get('/dashboard', authenticateController.isAuthenticated, function(req, res){
        console.log(req.decoded.id);
        res.send(req.decoded);
        //res.send('Token Verified');
    });

    app.get('/common/countries/', function(req, res) {
        commonController.countries(req, res);
    });
    app.post('/common/province/', function(req, res) {
        commonController.province(req, res);
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

    /************************* Home Routes ************************/

    app.get('/curriencies/', function(req, res) {
        homeController.curriencies(req, res);
    });

    app.get('/languages/', function(req, res) {
        homeController.languages(req, res);
    });

    app.post('/customer/register', function(req, res) {
        userController.register(req, res);
    });
    
    app.post('/customer/login', function(req, res) {
        userController.login(req, res);
    });

    app.post('/customer/forget', function(req, res) {
        userController.forget(req, res);
    });    

    app.post('/customer/verifyCode', function(req, res) {
        userController.verifyCode(req, res);
    });        

    app.put('/customer/resetPassword', function(req, res) {
        adminController.resetPassword(req, res);
    });    

    /************************* END of Home *****************/
    /************************* START language *****************/

    app.post('/admin/getlanguages', authenticateController.isAuthenticated, function(req, res) {
        languageController.getlanguages(req, res);
    });
    app.post('/admin/createlanguage', authenticateController.isAuthenticated, function(req, res) {
        languageController.createlanguage(req, res);
    });
    app.post('/admin/getlanguage/', authenticateController.isAuthenticated, function(req, res) {
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
    app.post('/admin/gettimezone/', authenticateController.isAuthenticated, function(req, res) {
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
    app.post('/admin/getcolor/', authenticateController.isAuthenticated, function(req, res) {
        colorController.getcolor(req, res);
    });
    app.post('/admin/updatecolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.updatecolor(req, res);
    });
    app.delete('/admin/deletecolor', authenticateController.isAuthenticated, function(req, res) {
        colorController.deletecolor(req, res);
    });
    /************************* END of colors *****************/

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
};