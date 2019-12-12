//Requires : importancion de librerias

var expres = require('express');


// inicializar variables

var app = expres();


//ruta
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'peticion realiza correctamente'
    });
});


module.exports = app;