//esto es para traer los datos de mi api key guardados en .env
require("dotenv").config();
const { YOUR_API_KEY } = process.env;
//para poder usaar los mmodelos de db
const { Dog, Temperament } = require("../db");
const axios = require("axios").default;
console.log(YOUR_API_KEY);

let getApiData = async () => {
  //llamamos con un get a la api
  let apiData = await axios.get(
    `https://api.thedogapi.com/v1/breeds?api_key=${YOUR_API_KEY}`
  );
  //armamos el objeto de lo que queremos de la api, recorriendo con un map los datos de la api
  let apiDog = apiData.data.map((el) => {
    //los tempéramentos los transformo en un array de objetos,
    //para que se guarden igual que los de la db y los pueda recorrer a todos por igual
    let temperaments = el.temperament?.toString().split(",");
    let tempObj = [];
    temperaments?.map((el) => {
      tempObj.push({ name: el.trim() });
    });
    //retorno el objeto de lo que quiero que me traiga de la api
    return {
      id: el.id,
      name: el.name,
      //en weight tenia algunos perros con NaN, por eso se agrego este default Value
      weight: el.weight.metric.includes("NaN")
        ? "20 kg"
        : el.weight.metric + " kg",
      height: el.height.metric + " cm",
      life_span: el.life_span,
      temperaments: tempObj,
      image: el.image.url,
      origin: el.origin,
      //cargue estos datos para filtrar en front de donde eran originarios
      apiDog: true,
      dogDbCreated: false,
    };
  });

  return apiDog;
};

let getTemperaments = async () => {
  let apiDogs = await axios.get(
    `https://api.thedogapi.com/v1/breeds?api_key=${YOUR_API_KEY}`
  );

  //recorro la api y me guardo solo los temperamentos
  let temp = apiDogs.data.map((el) => el.temperament);
  //convierto el string de temp en un array separados a partir de las ,
  let tempArr = temp.toString().split(",");

  //recorro ese nuevo arreglo de temp y con el findorCreate de sequilize
  //agrego los objetos a la base de datos.
  tempArr.forEach((el) => {
    let t = el.trim();
    Temperament.findOrCreate({
      where: { name: t },
    });
  });

  const allTemp = await Temperament.findAll();
  return allTemp;
};

let getDbData = async () => {
  //para traer los datos de la base de datos hacemos un findAll (sequelize)
  // y con el include hacemos un join a los temperamentos que tiene asociados
  return await Dog.findAll({
    include: {
      model: Temperament,
    },
  });
};

let getAllData = async () => {
  // let apiData = await getApiData();
  // let dbData = await getDbData();
  // para obtener toda la info llamo a las dos funciones de datos
  let prom = await Promise.all([getApiData(), getDbData()]);
  let [apiData, dbData] = prom;
  //concateno lo que devuelven en un solo arreglo para recibir todo junto
  let allData = [...apiData, ...dbData];
  return allData;
};

//exporto todos las funciones
module.exports = {
  getApiData,
  getTemperaments,
  getDbData,
  getAllData,
};
