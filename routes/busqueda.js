//Requires : importancion de librerias

var expres = require('express');


// inicializar variables

var app = expres();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//==============================
// busquedad por coleccion 
//==============================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regexp = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regexp);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regexp);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regexp);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'los tipos de busquedad solo son : usuarios, hospitales, medicos',
                errors: { message: 'los tipos de busquedad son invalidos' }
            });
    }

    promesa.then(data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});





//==============================
// busquedad general 
//==============================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    var regexp = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regexp), buscarMedicos(busqueda, regexp), buscarUsuarios(busqueda, regexp)]).then(respuesta => {
        res.status(200).json({
            ok: true,
            hospitales: respuesta[0],
            medicos: respuesta[1],
            usuario: respuesta[2]
        });
    });




});

function buscarHospitales(busqueda, regexp) {

    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }
            });
    });



}

function buscarMedicos(busqueda, regexp) {

    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regexp })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('error al cargar medicos');
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(busqueda, regexp) {

    return new Promise((resolve, reject) => {
        Usuario.find()
            .or([{ 'nombre': regexp }, { 'email': regexp }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('error al cargar usuarios');
                } else {
                    resolve(usuarios);
                }
            });
    });
}


module.exports = app;