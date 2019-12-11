//Requires : importancion de librerias

var expres = require('express');
var mongoose = require('mongoose');


// inicializar variables

var app = expres();

//conexion a la bd
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', function(err, res) {

    if (err) throw err;

    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');

});


//rutas
app.get('/', function(request, response, next) {
    response.status(200).json({
        ok: true,
        mensaje: 'peticion realiza correctamente'
    });
});


// escuchar peticiones

app.listen(3000, function() {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});