const {connection} = require("./database/connection");
const serverless = require('serverless-http');
const express = require("express");
const cors  = require("cors");

// inicializar app
console.log("App de node Arrancada");

//Conectar a la base de datos
connection();

// Crear servidor de Node
const app = express();
const puerto = 3900;

// configurar cors
app.use(cors());

//Convertir body a objeto js
app.use(express.json()); // recibir datos con content-type qpp/json
app.use(express.urlencoded({extended: true})); // recibiendo datos por form - urlencoded

//Crear rutas
const rutas_articulos = require("./rutas/articulo");

//Cargar las rutas
app.use("/api", rutas_articulos);


app.get("/", (req, res) => {

    console.log("se ejecuto el endppoint probando");

    return res.status(200).send(`
        <h1>Probando las rutas de las APIS</h1>
    `);

});

//Crear servidor y escuchar peticiones http
app.listen(puerto, () => {
    console.log("servidor corriendo en el puerto "+puerto);
})

module.exports.handler = serverless(app);
