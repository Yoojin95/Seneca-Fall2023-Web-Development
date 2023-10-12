/********************************************************************************
* WEB322 – Assignment 03
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: Yoojin Lee     Student ID: 188162218     Date: October 12, 2023
*
********************************************************************************/

// legoSets.js: provide easy access to the Lego data for other files

// automatically read both files and generate two arrays of objects: "setData" and "themeData"
const setData = require("../data/setData");
const themeData = require("../data/themeData");

// initialize an empty array
let sets = []

// fill the "sets" array, by adding copies of all the setData obj
function initialize() {
  /* TODO: Fill the "sets" array with objects from setData,
           such that tehre is an extra property for each object called Theme
           HINT: Consider using the .find() and .forEach() Array methods for your solution
  */
  return new Promise((resolve, reject) => {
    try {
      // Initialize the sets array by adding the 'theme' property
      sets = setData.map((set) => {
        const theme = themeData.find((theme) => theme.id === set.theme_id);
        if (theme) {
          return {
            ...set,
            theme: theme.name,
          };
        }
        return set;
      });

      // Resolve the promise once initialization is complete
      resolve(sets);
    } catch (error) {
      // If an error occurs, reject the promise with an error message
      reject("Error initializing Lego data: " + error);
    }
  });
}

//  returns the complete "sets" array
function getAllSets() {
  return new Promise((resolve) => {
    resolve(sets);
  });
}

//  return a specific "set" object from the "sets" array, whose "set_num" value matches the value of the "setNum" parameter
function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const foundSet = sets.find((set) => set.set_num === setNum);
    if (foundSet) {
      resolve(foundSet);
    } else {
      reject("Unable to find requested set");
    }
  });
}

// return an array of objects from the "sets" array whose "theme" value matches the "theme" parameter.
function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    const matchingSets = sets.filter((set) =>
      set.theme.toLowerCase().includes(theme.toLowerCase())
    );
    if (matchingSets.length > 0) {
      resolve(matchingSets);
    } else {
      reject("Unable to find requested sets");
    }
  });
}

// export the functions as a module
module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme
};


// Testing the functions
initialize()
  .then(() => {
    // console.log('Initialization successful');
    return getAllSets();
  })
  .then((allSets) => {
    // console.log('All Sets:', allSets);
    return getSetByNum('001-1');
  })
  .then((set) => {
    // console.log('Set by Num:', set);
    return getSetsByTheme('Technic');
  })
  .then((setsByTheme) => {
    // console.log('Sets by Theme:', setsByTheme);
  })
  .catch((error) => {
    console.error(error);
  });
