//Requires : importancion de librerias

var expres = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


//Usuario models
var Usuario = require('../models/usuario');


// inicializar variables

var app = expres();


//metodo del login

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas -email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'credenciales incorrectas -password',
                errors: err
            });
        }

        usuarioDB.password = ':)'; // esto es para mostrar la contraseña con un :)

        // crear token!!
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //4 horas dura el token : 4 horas = 14400




        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });
    });


});





module.exports = app;