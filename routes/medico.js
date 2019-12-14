//Requires : importancion de librerias

var expres = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var Medico = require('../models/medico');

// inicializar variable express
var app = expres();


//==============================
// Obtener todos los medicos 
//==============================
//ruta
app.get('/', (req, res, next) => {

    // se crea variable para la paginacion para saber desde donde se quiere ver los numeros de medicos
    // si llega default que arranque en 0
    var desde = req.query.desde || 0;
    desde = Number(desde);


    Medico.find({})
        .skip(desde) //funcion del mongoose para que salte el numero
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error cargando medicos',
                    errors: err
                });
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });


        });
});

//==============================
// crear medico 
//==============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital, // se recibe solo el hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear medico',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });

});

//==============================
// Actualizar medico
//==============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar el medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese id' }
            });
        }

        // datos a actulizar
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital; //se recibe solo el hospital

        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });
});

//==============================
// Borrar un medico
//==============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un medico con ese ID',
                errors: { message: 'no existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;