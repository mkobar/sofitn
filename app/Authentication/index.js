var moment = require('moment');
var request = require('request');
var jwt = require('jwt-simple');
var config = require('../../config.js');

module.exports = function (params) {

    // Internal dependencies
    var User = require('../User/Schema');

    /*
     |--------------------------------------------------------------------------
     | Login Required Middleware
     |--------------------------------------------------------------------------
     */
    function ensureAuthenticated(req, res, next) {
        if (!req.header('Authorization')) {
            return res.status(401).send({message: 'Please make sure your request has an Authorization header'});
        }
        var token = req.header('Authorization').split(' ')[1];

        var payload = null;
        try {
            payload = jwt.decode(token, config.TOKEN_SECRET);
        }
        catch (err) {
            return res.status(401).send({message: err.message});
        }

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({message: 'Token has expired'});
        }
        req.user = payload.sub;
        next();
    }

    /*
     |--------------------------------------------------------------------------
     | Check if the token is valid
     |--------------------------------------------------------------------------
     */
    function isValidToken(token, callback) {
        var payload = null;
        try {
            payload = jwt.decode(token, config.TOKEN_SECRET);
        }
        catch (err) {
            callback({message: err.message});
        }
        if (!payload || !payload.exp || !payload.sub) {
            callback({message: 'Invalid token'});
        } else if (payload.exp <= moment().unix()) {
            callback({message: 'Token has expired'});
        } else {
            callback(null, payload.sub);
        }
    }

    function ensureIsAdmin(req, res, next) {
        if (!req.user) {
            return res.status(401).send({message: 'Invalid User'});
        }
        User.findOne({_id: req.user, isAdmin: true}, function (err, user) {
            if (!user) {
                return res.status(401).send({message: 'Invalid Admin'});
            } else {
                next();
            }
        });
    }

    return {
        ensureAuthenticated: ensureAuthenticated,
        ensureIsAdmin: ensureIsAdmin,
        isValidToken: isValidToken
    };

};
