const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const gplay = require('google-play-scraper');
const mongoose = require('mongoose');
let appModel   = require('./models/appModel')

//Connecting to mongodb via mongoose
mongoose.connect('mongodb://localhost/appstore', { useNewUrlParser: true, useUnifiedTopology: true });
let db = mongoose.connection;
db.once('open', ()=>{
  console.log('Connected to db');
})
db.on('error', (err)=>{
  console.log(err)
})

//Logger for debugging
let appIdLogger = (array) =>{
  array.forEach((app, i) => {
    console.log(i + ' : ' + app.appId);
  });
}

//Scrapper function used to scrapedata from playstore
let scrape = () => {
  gplay.list({
    collection: gplay.collection.TOP_FREE,
    country: 'in',
  })
  .then((data) => {
    console.log('Scrapped data: ', data.length);
    appIdLogger(data);
    const bulkOps = data.map(doc => ({
      updateOne: {
        filter: {appId: doc.appId},
        update: doc,
        upsert: true
      }
    }))
    appModel.bulkWrite(bulkOps)
    .then(bulkWriteResults => console.log('BULK upsert Done :', bulkWriteResults.result))
    .catch(err => console.error('BULK upsert error:', err));
  });
}

//intialising express application
const app = express();

//bodyparser middleware to access data from request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//default route
app.get('/', (req,res) => {
  appModel.find({}, (err, appData)=>{
    if(err){
      console.log(err);
    } else {
      console.log('Fetched From mongo: ',appData.length);
      appIdLogger(appData);
    }
  });
})

//route to detailed app info page
app.use('/appdetails', (req,res) =>{
  console.log('Req: ', req.query.pkg)
  var appId = req.query.pkg;
  gplay.app({
    appId: appId
  })
  .then( (data) => {
    console.log(data)
  });
})

app.listen(3000, ()=>{
  console.log('Server is listening on port 3000..');
  scrape();
})
