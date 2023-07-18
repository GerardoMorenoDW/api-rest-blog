const fs = require("fs");
const { validarArticulos } = require("../helpers/validar");
const Articulo = require("../modelos/Articulo");
const path = require("path");
const { error } = require("console");

const prueba = (req, res) => {
  return res.status(200).json({
    mensaje: "Soy una accion de prueba en mi controlador",
  });
};

const curso = (req, res) => {
  console.log("se ejecuto el endppoint probando");

  return res.status(200).json([
    {
      curso: "Master en React",
      autor: "Gianfranco Greco",
      url: "yahoo.com",
    },
    {
      curso: "Master en React",
      autor: "Gianfranco Greco",
      url: "yahoo.com",
    },
  ]);
};

const crear = async (req, res) => {
  try {
    //Recoger parametros por post a guardar
    let parametros = req.body;

    //Validar datos
    validarArticulos(parametros);

    //Crear el objeto a guardar basado en el modelo
    const articulo = new Articulo(parametros);

    //Asignar valores a objeto (manual o automatico)
    // MANERA MANUAL   articulo.titulo = parametros.titulo;

    //Guardar el articulo en la base de datos utilizando promesas
    let articuloGuardado = await articulo.save();

    //Devolver resultado
    return res.status(200).json({
      status: "success",
      articulo: articuloGuardado,
      mensaje: "Articulo creado con exito",
    });
  } catch (error) {
    return res.status(400).json({
      status: "error",
      mensaje: "Faltan datos por enviar",
    });
  }
};

const listar = async (req, res) => {
  try {
    let consulta = await Articulo.find({}).sort({ fecha: -1 }).exec();

    if (req.params.ultimos) {
      consulta = await Articulo.find({}).sort({ fecha: -1 }).limit(3);
    }

    return res.status(200).send({
      status: "success",
      contador: consulta.length,
      consulta,
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      mensaje: error.message,
    });
  }
};

const uno = async (req, res) => {
  // Recoger id por la url
  let id = req.params.id;

  // Buscar el articulo
  try {
    // Si existe devolver resultado
    let articulo = await Articulo.findById(id);

    return res.status(200).json({
      status: "success",
      articulo,
    });
    // Si no existe devolver error
  } catch (error) {
    return res.status(404).json({
      status: "error",
      mensaje: "No se ha encontrado el articulo",
    });
  }
};

const borrar = async (req, res) => {
  try {
    let id = req.params.id;

    let articuloBorrado = await Articulo.findOneAndDelete({ _id: id });

    return res.status(200).json({
      status: "success",
      articuloBorrado,
      mensaje: "Articulo borrado",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al borrar",
    });
  }
};

const editar = async (req, res) => {
  try {
    let id = req.params.id;

    //recoger datos del body
    let parametros = req.body;

    //Validar datos
    try {
      validarArticulos(parametros);
    } catch (error) {
      return res.status(400).json({
        status: "error",
        mensaje: "Faltan datos por enviar",
      });
    }
    //Buscar y actualizar articulo
    let actualizado = await Articulo.findOneAndUpdate({ _id: id }, parametros, {
      new: true,
    });

    // Devolver respuesta
    return res.status(200).json({
      status: "success",
      actualizado,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      mensaje: "Error al actualizar",
    });
  }
};

const subir = async (req, res) => {
  // Configurar multer

  // Recoger el fichero de imagen subido
  if (!req.file && !req.files) {
    return res.status(404).json({
      status: "error",
      mensaje: "Peticion invalida",
    });
  }

  // conseguir Nombre del archivo
  let nombreArchivo = req.file.originalname;

  // extension del archivo
  let archivoSplit = nombreArchivo.split(".");
  let extension = archivoSplit[1];

  // Comprobar extension correcta
  if (
    extension != "png" &&
    extension != "jpg" &&
    extension != "jpeg" &&
    extension != "gif"
  ) {
    // Borrar archivo y dar respuesta
    fs.unlink(req.file.path, (error) => {
      return res.status(400).json({
        status: "error",
        mensaje: "Imagen invalida",
      });
    });
  } else {
    // Si todo va bien, actualizar el articulo

    let id = req.params.id;

    //Buscar y actualizar articulo
    try {
      let actualizado = await Articulo.findOneAndUpdate(
        { _id: id },
        { imagen: req.file.filename },
        { new: true }
      );

      // Devolver respuesta
      return res.status(200).json({
        status: "success",
        actualizado,
        fichero: req.file,
      });
    } catch (error) {
      return res.status(500).json({
        status: "error",
        mensaje: "Error al actualizar",
      });
    }
  }
};

const imagen = (req, res) => {
  let fichero = req.params.fichero;
  let rutaImagen = "./imagenes/articulos/" + fichero;

  fs.stat(rutaImagen, (error, existe) => {
    if (existe) {
      return res.sendFile(path.resolve(rutaImagen));
    } else {
      return res.status(404).json({
        status: "error",
        mensaje: "La imagen no existe",
      });
    }
  });
};

const buscar = async (req, res) => {
  // Sacar el string de busqueda
  let busqueda = req.params.busqueda;

  try {
    // Find OR

    let articuloBuscado = await Articulo.find({
      $or: [
        { titulo: { $regex: busqueda, $options: "i" } },
        { contenido: { $regex: busqueda, $options: "i" } },
      ],
    }).sort({ fecha: -1 });

    if (!articuloBuscado || articuloBuscado.length <= 0) {
      throw new Error();
    }

    return res.status(200).json({
      status: "success",
      articulo: articuloBuscado,
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      mensaje: "No se han encontrado articulos",
    });
  }
};

module.exports = {
  prueba,
  curso,
  crear,
  listar,
  uno,
  borrar,
  editar,
  subir,
  imagen,
  buscar,
};
