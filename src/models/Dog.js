const { DataTypes } = require("sequelize");
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define(
    "dog",
    {//usamos el uuid para que me traiga id aleatorios y no se pise con los de la api
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      height: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      weight: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      life_span: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      //aca agregue esta info para usarla en los filtros de si era de base de datos o de api
      dogDbCreated: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      apiDog: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      image: {
        type: DataTypes.STRING(10000),
      },
    },
    {
      //esto es para eliminar el update y create que trae por defecto el modelo
      timestamps: false,
    }
  );
};
