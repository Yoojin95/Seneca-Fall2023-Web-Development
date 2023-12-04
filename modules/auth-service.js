const mongoose = require('mongoose');
let Schema = mongoose.Schema;
require('dotenv').config();
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{
      dateTime: Date,
      userAgent: String
    }]
  });
  let User; 
  function initialize() {
    return new Promise((resolve, reject) => {
        let db = mongoose.createConnection(process.env.MONGODB_URI);
        db.on('error', err => reject(err));
      db.once('open', () => {
        User = db.model("users", userSchema);
        resolve();
      });
    });
  }
  
  function registerUser(userData) {
    return new Promise((resolve, reject) => {
      if (userData.password !== userData.password2) {
        reject("Passwords do not match");
      } else {
        bcrypt.hash(userData.password, 10) // 10 is the number of salt rounds
          .then(hash => {
            let newUser = new User({
              userName: userData.userName,
              password: hash, // Store the hashed password
              email: userData.email,
              loginHistory: []
            });
  
            newUser.save()
              .then(() => resolve())
              .catch(err => {
                if (err.code === 11000) {
                  reject("User Name already taken");
                } else {
                  reject(`There was an error creating the user: ${err}`);
                }
              });
          })
          .catch(err => reject(`Error hashing password: ${err}`));
      }
    });
  }
  
  function checkUser(userData) {
    return new Promise((resolve, reject) => {
      User.findOne({ userName: userData.userName })
        .then(user => {
          if (!user) {
            reject(`Unable to find user: ${userData.userName}`);
          } else {
            bcrypt.compare(userData.password, user.password)
              .then(isMatch => {
                if (!isMatch) {
                  reject(`Incorrect Password for user: ${userData.userName}`);
                } else {
                  // If password matches, update the login history
                  if (user.loginHistory.length === 8) {
                    user.loginHistory.pop(); // Remove the oldest entry if there are 8 entries
                  }
                  user.loginHistory.unshift({ dateTime: new Date().toString(), userAgent: userData.userAgent });
  
                  User.updateOne({ userName: user.userName }, { $set: { loginHistory: user.loginHistory } })
                    .then(() => resolve(user))
                    .catch(err => reject(`There was an error verifying the user: ${err}`));
                }
              })
              .catch(err => reject(`Error verifying password: ${err}`));
          }
        })
        .catch(err => reject(`Unable to find user: ${userData.userName}`));
    });
  }
  
  module.exports = {
    initialize,
    registerUser,
    checkUser
  };
      