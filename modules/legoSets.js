/********************************************************************************
* WEB322 – Assignment 5
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Yoojin Lee     Student ID: 188162218     Date: November, 19, 2023
*
********************************************************************************/

require("dotenv").config();
const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
let sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

// Define "Theme" Model
const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING,
}, {
  createdAt: false,
  updatedAt: false
});

// Define "Set" Model
const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
}, {
  createdAt: false,
  updatedAt: false
});

/*
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });
*/

function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function getAllSets() {
  return new Promise(async(resolve, reject) => {
    try {
      let allSets = await Set.findAll({
        include: [Theme]
      });
      resolve(allSets);
    } catch (err) {
      reject(err);
   }
  });
}

function getSetByNum(setNum) {
  return new Promise(async (resolve, reject) => {
    try {
      let set = await Set.findOne({
        include: [Theme],
        where: {
          set_num: setNum
        }
      });
      resolve(set);
    } catch (err) {
      reject(`Unable to find set with set number: ${setNum}`);
    }
  });
}


const getSetsByTheme = async (theme) => {
  try {
    const sets = await Set.findAll({
      where: { "$Theme.name$": { [Sequelize.Op.iLike]: `%${theme}%` } },
      include: [Theme],
    });
    if (!sets || sets.length === 0) {
      throw new Error(`No sets found with the theme: ${theme}`);
    }
    return sets;
  } catch (err) {
    throw err; 
  }
};

const addSet = async (setData) => {
  return new Promise((resolve, reject) => {
    Set.create(setData)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err.message);
      });
  });
};

const getAllThemes = () => {
  return new Promise(async (resolve, reject) => {
      try {
          const themes = await Theme.findAll();
          resolve(themes);
      } catch (err) {
          reject(err.message);
      }
  });
};


function editSet(set_num, setData) {
  return new Promise((resolve, reject) => {
      Set.update(setData, { where: { set_num: set_num } })
          .then(result => {
              resolve();
          })
          .catch(err => {
              if (err && err.errors && err.errors.length > 0) {
                  reject(err.errors[0].message);
              } else {
                  reject('An unknown error occurred');
              }
          });
  });
}


function deleteSet(set_num) {
  return new Promise((resolve, reject) => {
      Set.destroy({ where: { set_num: set_num } })
          .then(() => {
              resolve();
          })
          .catch(err => {
              if (err && err.errors && err.errors.length > 0) {
                  reject(err.errors[0].message);
              } else {
                  reject('An unknown error occurred');
              }
          });
  });
}

Set.belongsTo(Theme, { foreignKey: "theme_id" });
module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, deleteSet, editSet, getAllThemes }
