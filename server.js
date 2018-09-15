var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override')
var cors = require('cors');
/*var bitcore = require("bitcore-lib");*/
var bitcoin = require("bitcoinjs-lib");
/*var https = require("https");
const request = require('request'); //npm install request --save
const mysql = require('mysql'); //npm install mysql --save
const nodemailer = require('nodemailer'); //npm install nodemailer --save*/
///const Worker = require('webworker-threads').Worker; //npm install webworker-threads --save --python=python2.7
var Worker = require("tiny-worker");  //npm install tiny-worker --save

const window = require('window'); //npm install --save window

///const mINtxfEE = 1000;  //per kB
///const mAXtxfEE = 20000; //per kB
///////var lastFeeratePaid = null;
///////var aLLaCTIVEpARAMS = [];
var serverlIVEdATA = {
  lastFeerate: null,
  workers: [],
  params: [],
  liveData_unknown_01: null,  //future, to avoid stopping server
  liveData_unknown_02: null,  //future, to avoid stopping server
  liveData_unknown_03: null //future, to avoid stopping server
}
///const bitcoin_dONATEaDDRESS = null; //my public wallet address. //AKM-finish-off***** - change to -> 14s7wouBVEDGnDk8hhTzKUMhZurVjtpUwe (Donate) & 15DWHkYYHTMYsKyASSnr7ZrzuvMtbvzGqd (InApp Purchase) NOT APPLICABLE

///////const TestNet = bitcoin.networks.testnet;

'use strict';

var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());


/* TUTORIALS - keep?
app.get('/posts', function(req, res) {
    res.json({"success": true});
    ///console.log("..akeem posts!");
});

//youtube tutorial
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});*/




/*let conParams = {
  host: "heron.whogohost.com",  //website: localhost  //my laptop ip: 105.112.68.19
  user: "appcedar_wp001",//"appcedar_chiemek",
  password: "paab$3419",//"82PuSlm56b",
  database: "appcedar_wp001"
};
let connection = mysql.createConnection(conParams);
///var sql = "UPDATE wp001_tblActionsPending SET status='COMPLETE',action_required='{\"output_as_input\":{\"key\":\"cRHcnB6yfG9c5VL9QHGCToUbBQKthh8Lc7iFEkRBE1J8R7s9GW7c\",\"address\":\"mnrtRmNetQ191UeaELA2jzA9i2o1H7QqXz\"},\"receiver\":\"myYS1PXqePfxF1V8xvhBrkzs47TZaLkwTG\",\"type\":\"Donate\",\"lastFeerate\":\"1043\",\"last_success_run\":\"2018-07-29 02:28:46\",\"amount\":\"26430\"}' WHERE UUID = 'F38CD507-ED6E-408E-81D2-37E537EEA777' AND date = '2018-07-29 02:08:51'";
var sql = "UPDATE wp001_tblActionsPending SET status='COMPLETE',action_required='{\"receiver\":\"myYS1PXqePfxF1V8xvhBrkzs47TZaLkwTG\",\"type\":\"Donate\",\"lastFeerate\":\"1043\",\"last_success_run\":\"2018-07-29 02:28:46\",\"amount\":\"26430\"}' WHERE UUID = 'F38CD507-ED6E-408E-81D2-37E537EEA777' AND date = '2018-07-29 02:08:51'";
connection.query(sql, function (err, result) {
  if(err){console.log('failed: ',err);}
  console.log('result: ',JSON.stringify(result));
});
return;*/



//get google translation.
app.post('/cronRun', function(req, res) {

        console.log('in server...');

                  let params = {
                    message: "start_bitcoinTransfer",
                    lastFeerate: serverlIVEdATA.lastFeerate, //for use by the workers, set by workers.
                  ///  uuid: req.body.uuid, //"F38CD507-ED6E-408E-81D2-37E537EEA777" can't know here.
                  ///  "privatePublic": req.body.privatePublic,
                    receiver: null, //set in worker
                  ///  email: req.body.email,
                  ///  facebook_id: req.body.facebook_id,
                  ///  app_name: req.body.app_name,
                    status: "STANDBY",  //RUN, STANDBY, COMPLETE, CLOSED
                    date: null, //dformatted, //14424038554 //"2018-07-25 17:52:03"
                  ///  type: req.body.type,
                    /*action_required: {
                      output_as_input: req.body.privatePublic,
                      receiver: null,
                  ///    type: req.body.type, /* //set in worker
                  ///    lastFeerate: null  //null until status COMPLETE* /
                      amount_set: req.body.amount_set
                    }*/
                  }

        var cronWorker = new Worker('bitcoin-transfer-cron-master.js'); //'../../providers/fetch-hidden-x.js'
        //cronWorker.name = 'cronNotification-1';

        cronWorker.onmessage = (event, handle) => {
            //this.result = event.data.join(',');
            if(typeof(event.data) === 'object'){
              console.log('object confirmed.., of event');
              if(event.data.terminatingWorker > ""){
                  if(event.data.terminatingWorker.indexOf('Worker initiate failed.') !== -1){
                    //call function to remove worker params..

                    //respond to client with original sent.
                    res.json({
                      "status": "Worker terminated. "+event.data.terminatingWorker
                    });
                  }else{
                                /*******************************/
                                res.json({
                                  translations: event.data.sql_machine_err,
                                  "status": "Worker terminated. "+event.data.terminatingWorker
                                });
                                /********************************
                                NodeJS continues running, but
                                you cannot set res.json() again..
                                ********************************
                                return;
                                /*****/
                  }
              }
              if(event.data.err !== undefined){
                //any other way to send message to client, other than res.json ???
              }
              if(event.data.message !== undefined){
                //respond to client with result.
                /////res.json(event.data);  //nothing to take back here.

                if(event.data.workerIsFinished){
                  //end things...
                  //handle[0].end();
                  //handle[0].close();
                  cronWorker.terminate();
                  console.log('worker terminated..');
                }

              }//if(event.data.complete_jsons - ENd
            }
            //console.log('called web worker, in onmessage: '+JSON.stringify(event.data,null,2));//.join(','));
        };
        ///console.log('initial params: ',JSON.stringify(params,null,2));
        cronWorker.postMessage({params: params, states: req.body});
        console.log('called web worker');

});


//timer things
/*(function () {
var nativeSetTimeout = window.setTimeout;
window.bindTimeout = function (listener, interval) {
    function setTimeout(code, delay) {
        var elapsed = 0,
            h;

        h = window.setInterval(function () {
                elapsed += interval;
                if (elapsed < delay) {
                    listener(delay - elapsed);
                } else {
                    window.clearInterval(h);
                }
            }, interval);
        return nativeSetTimeout(code, delay);
    }

    window.setTimeout = setTimeout;
    setTimeout._native = nativeSetTimeout;
};
}());
window.bindTimeout(function (t) {console.log(t + "ms remaining");}, 100);
window.setTimeout(function () {console.log("All done.");}, 1000);*/
//timer things 2
var kilmer = null;
if(kilmer == null){
  var timeWorker = new Worker('wakey-wakey.js');
  timeWorker.onmessage = (event, handle) => {
  };
  timeWorker.postMessage('start');
  ///console.log('called time worker');
}
app.get('/preventSleep', function(req, res) {
//app.post('/preventSleep', function(req, res) {

        console.log('in server... awake');
        ///////console.log('wake call from worker: ',req.data.workerName);

        //console.log('wake call from worker: ',req.data);  //wrong
        ///console.log('req.query: ',req.query);

        if(req.query.a === 'xyz'){
          if(kilmer == null){
            kilmer = setInterval(() => {
              //do the kilmer
              var timeWorker = new Worker('wakey-wakey.js');
              timeWorker.onmessage = (event, handle) => {
              };
              timeWorker.postMessage('start');
              ///console.log('teta.. 1');
            }, 1000*60*15); //check in 15mins **respond** back.
            ///console.log('check teta.. 1');
          }else{
            clearInterval(kilmer);
            kilmer = null;
            kilmer = setInterval(() => {
              //do the kilmer
              var timeWorker = new Worker('wakey-wakey.js');
              timeWorker.onmessage = (event, handle) => {
              };
              timeWorker.postMessage('start');
              ///console.log('teta.. 2');
            }, 1000*60*15); //check in 15mins **respond** back.
            ///console.log('check teta.. 2');
          }
        }else{
        }
                /*******************************/
                res.json({
                  "status": "AWAKE"
                });
                /********************************
                NodeJS continues running, but
                you cannot set res.json() again..
                ********************************
                return;
                /*****/
});


//save AppCedar live notification.
app.post('/setLiveNotification', function(req, res) {

        console.log('in server...');

        var liveWorker = new Worker('live-notification-set.js'); //'../../providers/fetch-hidden-x.js'
        liveWorker.name = 'liveNotification-1';

        liveWorker.onmessage = (event, handle) => {
            //this.result = event.data.join(',');
            if(typeof(event.data) === 'object'){
              console.log('object confirmed.., of event');
              if(event.data.terminatingWorker > ""){
                  if(event.data.terminatingWorker.indexOf('Worker initiate failed.') !== -1){
                    //call function to remove worker params..

                    //respond to client with original sent.
                    res.json({
                      "status": "Worker terminated. "+event.data.terminatingWorker
                    });
                  }else{
                                /*******************************/
                                res.json({
                                  translations: event.data.sql_machine_err,
                                  "status": "Worker terminated. "+event.data.terminatingWorker
                                });
                                /********************************
                                NodeJS continues running, but
                                you cannot set res.json() again..
                                ********************************
                                return;
                                /*****/
                  }
              }
              if(event.data.err !== undefined){
                //any other way to send message to client, other than res.json ???
              }
              if(event.data.message !== undefined){
                //respond to client with result.
                res.json(event.data);

                if(event.data.workerIsFinished){
                  //end things...
                  //handle[0].end();
                  //handle[0].close();
                  liveWorker.terminate();
                  console.log('worker terminated..');
                }

              }//if(event.data.complete_jsons - ENd
            }
            //console.log('called web worker, in onmessage: '+JSON.stringify(event.data,null,2));//.join(','));
        };
        liveWorker.postMessage(req.body);
        console.log('called web worker');

});

//get AppCedar live notification.
app.post('/liveNotification', function(req, res) {

        console.log('in server...');

        var liveWorker = new Worker('live-notification.js'); //'../../providers/fetch-hidden-x.js'
        liveWorker.name = 'liveNotification-1';

        liveWorker.onmessage = (event, handle) => {
            //this.result = event.data.join(',');
            if(typeof(event.data) === 'object'){
              console.log('object confirmed.., of event');
              if(event.data.terminatingWorker > ""){
                  if(event.data.terminatingWorker.indexOf('Worker initiate failed.') !== -1){
                    //call function to remove worker params..

                    //respond to client with original sent.
                    res.json({
                      "status": "Worker terminated. "+event.data.terminatingWorker
                    });
                  }else{
                                /*******************************/
                                res.json({
                                  translations: event.data.sql_machine_err,
                                  "status": "Worker terminated. "+event.data.terminatingWorker
                                });
                                /********************************
                                NodeJS continues running, but
                                you cannot set res.json() again..
                                ********************************
                                return;
                                /*****/
                  }
              }
              if(event.data.err !== undefined){
                //any other way to send message to client, other than res.json ???
              }
              if(event.data.message !== undefined){
                //respond to client with result.
                res.json(event.data);

                if(event.data.workerIsFinished){
                  //end things...
                  //handle[0].end();
                  //handle[0].close();
                  liveWorker.terminate();
                  console.log('worker terminated..');
                }

              }//if(event.data.complete_jsons - ENd
            }
            //console.log('called web worker, in onmessage: '+JSON.stringify(event.data,null,2));//.join(','));
        };
        liveWorker.postMessage(req.body);
        console.log('called web worker');

});


//get google translation.
app.post('/translateSentences', function(req, res) {

        console.log('in server...');

        var langWorker = new Worker('language-translate.js'); //'../../providers/fetch-hidden-x.js'
        langWorker.name = 'language-1';

        langWorker.onmessage = (event, handle) => {
            //this.result = event.data.join(',');
            if(typeof(event.data) === 'object'){
              console.log('object confirmed.., of event');
              if(event.data.terminatingWorker > ""){
                  if(event.data.terminatingWorker.indexOf('translation failed.') !== -1){
                    //call function to remove worker params..

                    //respond to client with original sent.
                    res.json({
                      translations: req.body,
                      "status": "Worker terminated. "+event.data.terminatingWorker
                    });
                  }else{
                                /*******************************/
                                res.json({
                                  translations: req.body,
                                  "status": "Worker terminated. "+event.data.terminatingWorker
                                });
                                /********************************
                                NodeJS continues running, but
                                you cannot set res.json() again..
                                ********************************
                                return;
                                /*****/
                  }
              }
              if(event.data.err !== undefined){
                //any other way to send message to client, other than res.json ???
              }
              if(event.data.translations !== undefined){
                //respond to client with result.
                res.json(event.data);

                if(event.data.workerIsFinished){
                  //end things...
                  //handle[0].end();
                  //handle[0].close();
                  langWorker.terminate();
                  console.log('worker terminated..');
                }

              }//if(event.data.complete_jsons - ENd
            }
            //console.log('called web worker, in onmessage: '+JSON.stringify(event.data,null,2));//.join(','));
        };
        langWorker.postMessage({sentences: req.body});
        console.log('called web worker');

});



//check client's public keys & revert quick.
app.post('/confirmTransferWorkers', function(req, res) {

        console.log('in server...');

        var cWorker = new Worker('bitcoin-transfer-confirm.js'); //'../../providers/fetch-hidden-x.js'

        cWorker.onmessage = (event, handle) => {
            //this.result = event.data.join(',');
            if(typeof(event.data) === 'object'){
              console.log('object confirmed.., of event');
              if(event.data.terminatingWorker > ""){
                  console.log('worker state: ',cWorker.state);  //installing, installed, activating, activated, or redundant.
                  if(event.data.terminatingWorker !== 'Worker initiate failed.'){
                    //call function to remove worker params..
                    console.log('calling removeParams... ',JSON.stringify(event.data,null,2));
                    try{
                      removeParams(event.data.params.privatePublic.address);
                    }
                    catch(e){}
                  }else{
                                /*******************************/
                                res.json({
                                  "status": "Worker terminated. "+event.data.terminatingWorker
                                });
                                /********************************
                                NodeJS continues running, but
                                you cannot set res.json() again..
                                ********************************
                                return;
                                /*****/
                  }
              }
              if(event.data.err !== undefined){
                //any other way to send message to client, other than res.json ???
              }
              if(event.data.workerIsFinished){  //(event.data.complete_jsons !== undefined){
                //remove redeemed sets from global
                for (var i = 0; i < event.data.redeemed_jsons.length; i++) {
                  let redeemed = event.data.redeemed_jsons[i];
                  removeParams(redeemed.address);
                };

                //respond to client with result.
                res.json({
                  complete_jsons: event.data.complete_jsons
                });

                if(event.data.workerIsFinished){
                  //end things...
                  //handle[0].end();
                  //handle[0].close();
                  cWorker.terminate();
                  console.log('worker terminated..');
                }

              }//if(event.data.complete_jsons - ENd
            }
            //console.log('called web worker, in onmessage: '+JSON.stringify(event.data,null,2));//.join(','));
        };
        cWorker.postMessage({
          global: serverlIVEdATA,
          addresses: req.body
        });  //'start_confirm'
        console.log('called web worker');

});






function removeParams(remove_params){
  //remove item from Array

  var array_w = serverlIVEdATA.workers;
  var array_p = serverlIVEdATA.params;

  var index_w = array_w.indexOf(remove_params);
  if (index_w > -1) {
    array_w.splice(index_w, 1);
    serverlIVEdATA.workers = array_w;
    console.log('removed params from global..w');
  }

  for (var i = 0; i < array_p.length; i++) {
    //array_p[i]
    if(array_p[i].privatePublic.address === remove_params){
      array_p.splice(i, 1);
      serverlIVEdATA.params = array_p;
      console.log('removed params from global..p');
      break;
    }
  }

}


app.post('/transactionWorkers', function(req, res) {

  ///////console.log('posted: ',req.body.privatePublic); //NEVER LOG KEYS
    //request
    /*request('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      console.log(body.url);
      console.log(body.explanation);
    });*/
    //request.post({url:'http://service.com/upload', form: {key:'value'}}, function(err,httpResponse,body){ /* ... */ })

          //set timestamp in mysql datetime format..
          Number.prototype.padLeft = function(base,chr){
            var  len = (String(base || 10).length - String(this).length)+1;
            return len > 0? new Array(len).join(chr || '0')+this : this;
          }

          let d = (new Date()),
              dformatted = [d.getFullYear(),
                           (d.getMonth()+1).padLeft(),
                            d.getDate().padLeft()].join('-') +' ' +
                           [d.getHours().padLeft(),
                            d.getMinutes().padLeft(),
                            d.getSeconds().padLeft()].join(':');
          console.log('time: ',dformatted);
          // usage
          //=> 3..padLeft() => '03'
          //=> 3..padLeft(100,'-') => '--3'
          //=> dformat => '05/17/2012 10:52:21'

///return;
          /*/hijack to clean test account
          req.body.privatePublic =  {
            "key": "cTfYXCdq2jt4fZjL24DAar1NenvGvTMEf2EDdNXdy4EnHXcScg8M",
            "address": "mmxqjp2AvoY8RJsXsGzyDHbnfRUiyprHXu"
          };/*/

          let params = {
            message: "start_bitcoinTransfer",
            lastFeerate: serverlIVEdATA.lastFeerate, //for use by the workers, set by workers.
            uuid: req.body.uuid, //"F38CD507-ED6E-408E-81D2-37E537EEA777"
            "privatePublic": req.body.privatePublic,
            receiver: null, //set in worker
            email: req.body.email,
            facebook_id: req.body.facebook_id,
            app_name: req.body.app_name,
            status: "RUN",  //RUN, STANDBY, COMPLETE, CLOSED
            date: dformatted, //14424038554 //"2018-07-25 17:52:03"
            type: req.body.type,
            action_required: {
              output_as_input: req.body.privatePublic,
              receiver: null,
              type: req.body.type, /*//set in worker
              lastFeerate: null  //null until status COMPLETE*/
              amount_set: req.body.amount_set
            }
          }

///return;

      var fetchWorker = new Worker('bitcoin-transfer.js'); //'../../providers/fetch-hidden-x.js'
      fetchWorker.name = req.body.privatePublic.address;

      /*var fetchWorker = new Worker(function(){
        console.log('worker running..............');
        //postMessage("I'm working before postMessage('ali').");
        /*this.onmessage = function(event) {
          *postMessage('Hi ' + event.data);
          *self.close();
        };//*
        self.addEventListener('message', function(e) {
            self.postMessage('returned from worker');
          console.log('worker: '+e.data);
        }, false);

      });*/
      console.log('fetchWorker is type: '+typeof(fetchWorker));

      /*fetchWorker.addEventListener('message', function(e) {
        console.log('worker: '+e.data);
      }, false);*/

      fetchWorker.onmessage = (event) => {
          //this.result = event.data.join(',');
          if(typeof(event.data) === 'object'){
            console.log('object confirmed.., of event');
            if(event.data.terminatingWorker > ""){
                if(event.data.terminatingWorker !== 'Worker initiate failed.'){
                  //call function to remove worker params..
                  console.log('calling removeParams... ',JSON.stringify(event.data,null,2));
                  try{
                    removeParams(event.data.params.privatePublic.address);
                  }
                  catch(e){}
                }else{
                              /*******************************/
                              res.json({
                                "status": "Worker terminated. "+event.data.terminatingWorker
                              });
                              /********************************
                              NodeJS continues running, but
                              you cannot set res.json() again..
                              ********************************
                              return;
                              /*****/
                }
            }
            if(event.data.lastFeerate > ""){
              serverlIVEdATA.lastFeerate = event.data.lastFeerate; //sent ONLY on status COMPLETE
              ///////serverlIVEdATA.fee = lastFeeratePaid;
            }
            if(event.data.global_params > ""){
              ///aLLaCTIVEpARAMS.push(event.data.global_params);
              serverlIVEdATA.params.push(event.data.global_params.parameters);
              serverlIVEdATA.workers.push(event.data.global_params.address);
              /***** the preceeding means that worker data is successfully lodged in database.
              * Proceed with due acknowledgement for client. *****/
              /*******************************/
              res.json({
                "status": "Worker initiated."
              });
              /********************************
              NodeJS continues running, but
              you cannot set res.json() again..
              ********************************
              return;
              /*****/
            }
            if(event.data.err !== undefined){
              //any other way to send message to client, other than res.json ???
            }
            if(event.data.liveData_unknown_01 > ""){
              serverlIVEdATA.liveData_unknown_01 = event.data.liveData_unknown_01;
            }
            if(event.data.liveData_unknown_02 > ""){
              serverlIVEdATA.liveData_unknown_02 = event.data.liveData_unknown_02;
            }
            if(event.data.liveData_unknown_03 > ""){
              serverlIVEdATA.liveData_unknown_03 = event.data.liveData_unknown_03;
            }
          }
          //console.log('called web worker, in onmessage: '+JSON.stringify(event.data,null,2));//.join(','));
      };
      fetchWorker.postMessage(params);//'start_fetch'
      //console.log('initial params: ',JSON.stringify(params,null,2));
      console.log('called web worker');


                /********************************
                res.json({
                  "failed": "lie! we did not fail."
                });
                /********************************
                NodeJS continues running, but
                you cannot set res.json() again..
                ********************************/
                return;
                /*****/
});


function bitcoinJSWallet(){
      var keyPair = bitcoin.ECPair.makeRandom();  //AKM-finish-off***** - remove ({ network: TestNet }) DONE
      var address = keyPair.getAddress();
      ///console.log("Address: "+address);  //NEVER LOG KEYS //AKM-finish-off***** DONE
      var pkey = keyPair.toWIF();
      ///console.log("Key: "+pkey);         //NEVER LOG KEYS //AKM-finish-off***** DONE

      return [pkey,address];
}

app.get('/randKeyPair', function(req, res) {  //randKeyPair is an end point.
    //bitcoinJS
    let keys = bitcoinJSWallet();

    res.json({
      "key": keys[0],
      "address": keys[1]
    });
});

/*  //DELETE, i think
app.get('/transaction', function(req, res) {
    //bitcoinJS
    let hex = bitcoinJSxaction();

    res.json({
      "hex": hex
    });
});*/

/*  //KEEP THIS.
function brainWallet(uinput, callback){
    var input = new Buffer(uinput);
    var hash = bitcore.crypto.Hash.sha256(input);
    var bn = bitcore.crypto.BN.fromBuffer(hash);
    var pk = new bitcore.PrivateKey(bn).toWIF();  //WIF - Wallet Import Format
    var addy = new bitcore.PrivateKey(bn).toAddress();
    callback(pk, addy);
}

app.post('/brainWallet', function(req, res) {
    //bitcore
    var brainsrc = req.body.brainsrc;
    console.log(brainsrc);
    brainWallet(brainsrc, function(priv, addr){
      res.send("The Brain wallet of: " + brainsrc + "<br>Addy: "
      + addr + "<br>Private Key: " + priv);
    });
    //res.send("complete" + brainsrc);
});*/

//**********
//var app = require('express')(),
//    server = require('http').createServer(app);
//**********
//app.listen(port, callback);
app.listen(process.env.PORT || 5000, function() {
///app.listen(8500, function() {
    console.log('ready to go! Akeem.');
    ///tempFunc();
});
//**********


function deriveChecksumBits (entropyBuffer) {
    var ENT = entropyBuffer.length * 8
    var CS = ENT / 32
    var hash = createHash('sha256').update(entropyBuffer).digest()
    return bytesToBinary([].slice.call(hash)).slice(0, CS)
}
function entropyToMnemonic (entropy, wordlist) {  //entropy is derived from the desired phrase length minus one word.
  if (!Buffer.isBuffer(entropy)) entropy = Buffer.from(entropy, 'hex')
  wordlist = wordlist || DEFAULT_WORDLIST

  // 128 <= ENT <= 256
  if (entropy.length < 16) throw new TypeError(INVALID_ENTROPY)
  if (entropy.length > 32) throw new TypeError(INVALID_ENTROPY)
  if (entropy.length % 4 !== 0) throw new TypeError(INVALID_ENTROPY)

  var entropyBits = bytesToBinary([].slice.call(entropy))
  var checksumBits = deriveChecksumBits(entropy)

  var bits = entropyBits + checksumBits
  var chunks = bits.match(/(.{1,11})/g)
  var words = chunks.map(function (binary) {
    var index = binaryToByte(binary)
    return wordlist[index]
  })

  return wordlist === JAPANESE_WORDLIST ? words.join('\u3000') : words.join(' ')
}








/*
app.listen(process.env.PORT || 8080);

//helpers???
app.listen = function(){
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};*/


//other notes..
//NODE_ENV=production node server.js
//process.env.NODE_ENV
/*var env = process.env.NODE_ENV || 'dev';
loadConfigFile(env + '.json', doStuff);*/
