const { Router } = require("express");
const { Dog, Temperament } = require("../db");
const { getAllData, getTemperaments } = require("./data.js");

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);
const router = Router();

//Routes//
router.get("/dogs", async (req, res) => {
  //hago el get y consulto si me pueden enviar name por query
  let { name } = req.query;
  //guardo toda la data
  let data = await getAllData();
  //si mme pasan name lo filtro, esto lo use en el buscador en el front
  if (name) {
    let filterByName = data.filter((el) =>
      el.name.toLowerCase().includes(name.toLowerCase())
    );
    data.length === 0
      ? res.status(404).json({ message: "dog not found" })
      : res.send(filterByName);
    // si no me pasan name traigo toda la info, esto se usa para renderizar todos los perros en el front
  } else {
    res.send(data);
  }
});

router.get("/dogs/:idRaza", async (req, res) => {
  //esta rura es con id por params
  let { idRaza } = req.params;
  let data = await getAllData();
  //aca diferencia los id de la api con los de la db para que me los pueda identificar
  //esto se usa para el detail en front
  if (idRaza.length <= 3) {
    let findByIdNumber = data.find((el) => el.id === Number(idRaza));
    return res.send(findByIdNumber);
  } else {
    let findById = data.find((el) => el.id === idRaza);
    return res.send(findById);
  }
});

router.get("/temperament", async (req, res) => {
  // en esta ruta simplemente llamo a todos los temperamentos
  //esto se usa en front para poder acceder a los temperamentos cada vez que los necesite
  let allTemp = await getTemperaments();
  res.send(allTemp);
});

router.post("/dog", async (req, res) => {
  //en el post paso por body todos los datos para crear al perro, estos vienen del form del front
  try {
    const {
      name,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
      life_span,
      temperament,
      image,
    } = req.body;

    if (!name || !minHeight || !maxHeight || !minWeight || !maxWeight) {
      res.status(404).send("mandatory data is missing");
    }
    //convierto en un string los datos de height y de weight
    let arrHeight = [];
    arrHeight.push(minHeight, maxHeight);
    let strH = arrHeight.join(" - ");
    let strHeight = strH + " cm";

    let arrWeight = [];
    arrWeight.push(minWeight, maxWeight);
    let strW = arrWeight.join(" - ");
    let strWeight = strW + " kg";
    //creo el perro nuevo con el created de sequelize pasando los datos de todo lo enviado por body
    let dogCreated = await Dog.create({
      name,
      height: strHeight,
      weight: strWeight,
      life_span: life_span + " years",
      image: image
        ? image
        : "https://nupec.com/wp-content/uploads/2020/07/Captura-de-pantalla-2020-07-24-a-las-17.33.44.png",
    });
    //busco los temperamentos y filtro por los que vienen por body
    const ListTemperaments = await Temperament.findAll({
      where: { name: temperament },
    });
    //aca con el addTemperaments(para que no me pise los que ya tenia como el set)
    // agrego los temperamentos pasados a la tabla intermedia para que los relacione con el nuevo perro
    await dogCreated.addTemperaments(ListTemperaments);

    res.status(201).send("dog created successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/dogs/:idRaza", async (req, res) => {
  try {
    let { idRaza } = req.params;

    const { name, minHeight, maxHeight, minWeight, maxWeight, life_span } =
      req.body;

    if (!name || !minHeight || !maxHeight || !minWeight || !maxWeight) {
      res.status(404).send("mandatory data is missing");
    }

    let arrHeight = [];
    let minH = minHeight;
    let maxH = maxHeight;
    arrHeight.push(minH, maxH);
    let strH = arrHeight.join(" - ");
    let strHeight = strH + " cm";

    let arrWeight = [];
    let minW = minWeight;
    let maxW = maxWeight;
    arrWeight.push(minW, maxW);
    let strW = arrWeight.join(" - ");
    let strWeight = strW + " kg";
    // la primer parte del put es similar al post, traigo los datos de body desde el form de update en el front
    //busco el perro por el id que paso por params, en el front siempre estoy en el componente detail que es el que
    //tiene el id
    let updateDog = await Dog.findByPk(idRaza);
    //actualizo todos los datos del perro
    updateDog.name = name;
    updateDog.height = strHeight;
    updateDog.weight = strWeight;
    updateDog.life_span = life_span + " years";
    //esta operacion de sequelize requiere un save para que se impacten los datos
    await updateDog.save();

    res.status(200).send("dog updated successfully");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/dogs/:idRaza", async (req, res) => {
  try {
    let { idRaza } = req.params;
    //en el delete sigo estando en el copmponente detail para poder seguir teniendo el dato id por params
    // y con el metodo destry de sequelize busco con el where ese elemento y lo elimina
    await Dog.destroy({
      where: {
        id: idRaza,
      },
    });
    return res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/origin", async (req, res) => {
  //esta ruta me la pideron hacer en la revision del PI, en donde gregaba una data nueva los perros y
  //este dato nuevo tenia que mostrarlo
  let data = await getAllData();
  //una vez traida la data lo recorria y devolvia un objeto de cada una
  //si tenia dato lo mostraba y si no mostraba un mensaje default
  let ori = data.map((el) => {
    return {
      origin: el.origin ? el.origin : "dogs from World",
    };
  });
  res.json(ori);
});

module.exports = router;
