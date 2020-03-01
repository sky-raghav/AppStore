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

//just a hack to redirecting can be improved
let referencer = (appId) =>{
  let url = 'http://localhost:3000/appdetails?pkg='
  return url + appId;
}

//Scrapper function used to scrapedata from playstore
let scrape = () => {
  return new Promise( (resolve,reject) => {
    gplay.list({
      collection: gplay.collection.TOP_FREE,
      country: 'in',
    })
    .then((data) => {
      console.log('Scrapped data: ', data.length);
      //appIdLogger(data);
      const bulkOps = data.map(doc => ({
        updateOne: {
          filter: {appId: doc.appId},
          update: doc,
          upsert: true
        }
      }))
      appModel.bulkWrite(bulkOps)
      .then( (bulkWriteResults) => {
        console.log('BULK upsert Done :', bulkWriteResults.result);
        resolve('Done!!');
      })
      .catch((err) => {
        console.error('BULK upsert error:', err)
        reject(err);
      });
    });
  });
}

//intialising express application
const app = express();

//bodyparser middleware to access data from request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname,'./static')))
app.set('views',path.join(__dirname,'./views'));
app.set('view engine','pug')

//default route
app.get('/', (req,res) => {
  appModel.find({}, (err, appData)=>{
    if(err){
      console.log(err);
    } else {
      console.log('Fetched From mongo: ',appData.length);
      res.render('index',{
        appData: appData,
        referencer: referencer
      });
      //appIdLogger(appData);
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
    res.render('details', {
      details: data
    })
  });
})

app.get('/rescrape',(req, res) => {
  scrape()
  .then( () => {
    res.redirect('/')
  })
  .catch((err) => {
    console.log(err)
    res.redirect('/');
  });
});

app.listen(3000, ()=>{
  console.log('Server is listening on port 3000..');
})
