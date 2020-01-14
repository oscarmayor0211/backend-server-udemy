//Requires : importancion de librerias

var expres = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middleware/autenticacion');




//Usuario models
var Usuario = require('../models/usuario');


// inicializar variables

var app = expres();

//==============================
// Obtener todos los usuarios 
//==============================
//ruta
app.get('/', (request, response, next) => {


    // se crea variable para la paginacion para saber desde donde se quiere ver los numeros de usuarios
    // si llega default que arranque en 0
    var desde = request.query.desde || 0;
    desde = Number(desde);

    //query para solo traer el nombre email img y role
    Usuario.find({}, 'nombre email img role google')
        .skip(desde) //funcion del mongoose para que salte el numero
        .limit(5)
        .exec((err, usuarios) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });
            }

            // funcion para saber cuantos usuarios hay en la bd
            Usuario.count({}, (err, conteo) => {
                response.status(200).json({
                    ok: true,
                    usuarios: usuarios,
                    total: conteo
                });
            });



        });

});


//==============================
// Crear un nuevo usuario
//==============================
app.post('/', (req, res) => {

    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario

        });
    });



});

//==============================
// Actualizar usuario
//==============================

app.put('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verifica_ADMIN_O_MISMOUSUARIO], (req, res) => {

    var id = req.params.id;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        var body = req.body;
        // datos a actualizar
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actulizar usuario',
                    errors: err
                });
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });

    });


});

//==============================
// Borrar un usuario
//==============================
app.delete('/:id', [mdAutenticacion.verificaToken, mdAutenticacion.verifica_AMINROLE], (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar usuario',
                errors: err
            });
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});



module.exports = app;