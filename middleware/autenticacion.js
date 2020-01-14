//require librerias
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

//==============================
// Verificar Token!!!
//==============================
exports.verificaToken = function(req, res, next) {
    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token invalido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
};

//==============================
// Verfica admin 
//==============================

exports.verifica_AMINROLE = function(req, res, next) {

    var usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token invalido',
            errors: { message: 'No es administrador' }
        });
    }

};

//==============================
// Verifica admin o mismo usuario 
//==============================

exports.verifica_ADMIN_O_MISMOUSUARIO = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token invalido',
            errors: { message: 'No es administrador' }
        });
    }

};