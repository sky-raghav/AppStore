const mongoose = require('mongoose');

let appSchema = mongoose.Schema({
title: {
 type: String
},
appId: {
 type: String,
},
url: {
 type: String
},
icon:{
 type: String
},
developer: {
 type: String
},
developerId: {
  type: String
},
priceText: {
 type: String
},
currency: {
 type: String
},
price: {
 type: Number
},
free: {
 type: Boolean
},
summary: {
 type: String
},
scoreText: {
 type: String
},
score: {
 type: String
}
})

let appModel = module.exports = mongoose.model('appModel',appSchema)
