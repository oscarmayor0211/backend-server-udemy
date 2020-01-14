//Requires : importancion de librerias

var expres = require('express');

var mdAutenticacion = require('../middleware/autenticacion');

var Hospital = require('../models/hospital');

// inicializar variable express
var app = expres();


//==============================
// Obtener todos los hospitales 
//==============================
//ruta
app.get('/', (req, res, next) => {


    // se crea variable para la paginacion para saber desde donde se quiere ver los numeros de medicos
    // si llega default que arranque en 0
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde) //funcion del mongoose para que salte el numero
        .limit(5)
        .populate('usuario', 'nombre email') // funciona para traer datos de otra tabla 
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'error cargando hospitales',
                    errors: err
                });
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: conteo
                });
            });


        });
});

// ========================================== 
//  Obtener Hospital por ID 
// ========================================== 
app.get('/:id', (req, res) => {

    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: { message: 'No existe un hospital con ese ID' }


                });
            }


            res.status(200).json({
                ok: true,
                hospital: hospital
            });
        });
});

//==============================
// crear hospital 
//==============================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'error al crear hospital',
                errors: err
            });
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

//==============================
// Actualizar hosppital
//==============================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'error al buscar el hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }

        // datos a actulizar
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalActualizado
            });
        });
    });
});

//==============================
// Borrar un hospital
//==============================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'no existe un hospital con ese ID',
                errors: { message: 'no existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;