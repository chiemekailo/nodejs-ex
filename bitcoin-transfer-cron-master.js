/*var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override')
var cors = require('cors');
var bitcore = require("bitcore-lib");*/
var bitcoin = require("bitcoinjs-lib");
var https = require("https");
const request = require('request'); //npm install request --save
var mysql = require('mysql'); //npm install mysql --save
const nodemailer = require('nodemailer'); //npm install nodemailer --save

const Worker = require("tiny-worker");  //npm install tiny-worker --save

/*var URL = require('url'); //npm install url --save
const Blob = require('blob'); //npm install blob --save
const window = require('window'); //npm install --save window
const BlobBuilder = require('BlobBuilder'); //npm install BlobBuilder --save*/

/**************************************************************
* ************ UPDATE IN 2 (TWO) PLACES ********************* *
**************************************************************/
const bitcoinReceivers = {
  "DefaultDonate": "17FoGgzPqAgEc2YbYPfmd1bjsPKoZ1Qv7Y",
  "DefaultPurchase": "14PSY4WPWFGDD5wkYfaEqRKtp6KNGQU9dv",
  "FenceCalcDonate": "1CASXXz5ZJsMfKayumV3UGnb2EtyHDnwEm",
  "FenceCalcPurchase": "1BnbNiF7rkWuY1GffUubWVtofs8v6evXBa"
}
/**************************************************************
* ************ UPDATE IN 2 (TWO) PLACES ********************* *
**************************************************************/

var params = null;
let kEEPlIVEdATA = null;  //for messaging and possible inclusion into server variables.

const istosENDsUCCESSeMAIL = true;
const istosENDfAILUREeMAIL = true;
const pRIORITYlIMIT = 0;

/**************************************************************
* ************ UPDATE IN 4 PLACES, including mobile app *******
**************************************************************/
const nODEjssERVER = 'https://appcedar-solutions-bitcoin.herokuapp.com/';
/////const nODEjssERVER = 'http://localhost:5000/';
/**************************************************************
* ************ UPDATE IN 4 PLACES, including mobile app *******
**************************************************************/

///var isMysqlConnected = false;

//create a global connection Object
let conParams = {
  host: "heron.whogohost.com",  //website: localhost  //my laptop ip: 105.112.68.19
  user: "appcedar_wp001",//"appcedar_chiemek",
  password: "paab$3419",//"82PuSlm56b",
  database: "appcedar_wp001"
}


/********** QuotaGuard ****************
Your QuotaGuard IP addresses are 52.86.18.14 & 50.17.160.202
$ heroku config -s | grep QUOTAGUARDSTATIC_URL >> .env
$ more .env
exclude .env
$ echo .env >> .gitignore
******** Static IP stuff *************
mysql = require('mysql2');  //npm install mysql2 --save
//mysql declared a-top
var url = require('url'), //npm install url
    SocksConnection = require('socksjs'); //npm install socksjs

var remote_options = {
    host:'appcedar_wp001.eu-west-1.rds.amazonaws.com',  //'heron.whogohost.com', //
    port: 3306
};

var proxy = url.parse(process.env.QUOTAGUARDSTATIC_URL),
    auth = proxy.auth,
    username = auth.split(':')[0],
    pass = auth.split(':')[1];
    ///console.log('username: ',username,'; password: ',pass);

var sock_options = {
    host: proxy.hostname,
    port: 1080,
    user: username,
    pass: pass
};

var sockConn = new SocksConnection(remote_options, sock_options);
conParams = {
    user: 'appcedar_wp001',
    database: 'appcedar_wp001',
    password: 'paab$3419',
    stream: sockConn
};
/*var dbConnection = mysql.createConnection(conParams);
dbConnection.query('SELECT 1+1 as test1;', function(err, rows, fields) {
    if (err) throw err;

    console.log('Result: ', rows);
    sockConn.dispose();
});
dbConnection.end();*/
/******* Static IP stuff QuotaGuard *** - ENd
**************************************/


/********** Fixie Socks ****************
Your Fixie Socks IP addresses are 34.192.31.89, 34.192.37.108
$ heroku config:get FIXIE_SOCKS_HOST -s  >> .env
exclude .env
$ echo .env >> .gitignore
******** Static IP stuff **************
'use strict';

const SocksConnection = require('socksjs');
mysql = require('mysql2');  //declared a-top
const fixieUrl = process.env.FIXIE_SOCKS_HOST;
const fixieValues = fixieUrl.split(new RegExp('[/(:\\/@)/]+'));

const mysqlServer = {
  host: 'heron.whogohost.com',
  port: 3306
};

const dbUser = 'appcedar_wp001';
const dbPassword = 'paab$3419';
const db = 'appcedar_wp001';

const fixieConnection = new SocksConnection(mysqlServer, {
  user: fixieValues[0],
  pass: fixieValues[1],
  host: fixieValues[2],
  port: fixieValues[3],
});

conParams = {
  user: dbUser,
  password: dbPassword,
  database: db,
  stream: fixieConnection
}
/*const mysqlConnPool = mysql.createPool(conParams);

mysqlConnPool.getConnection(function gotConnection(err, connection) {

  if (err) throw err;

  queryVersion(connection);
});

function queryVersion(connection) {
  connection.query('SELECT version();', function (err, rows, fields) {

      if (err) throw err;

      console.log('MySQL/MariaDB version: ', rows);
      connection.release();
      process.exit();
  });
}*/
/******* Static IP stuff fixie ******** - ENd
**************************************/



let connectionFailedFunction = function(err) {
  console.log('db error (fatal error): ', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    ///isMysqlConnected = false;
    console.log('WE ARE DISCONNECTED NOW..');
    self.postMessage({terminatingWorker: params.action_required.error}); //-> 0.0 for slave to run ONCE exit proper
    ///mysql_handleDisconnect();                         // lost due to either server restart, or a
  } else {                                      // connnection idle timeout (the wait_timeout
    try{
      throw err;                                  // server variable configures this)
    }
    catch(err){
      //do nothing for now. The user needs not be perturbed.

      var json = {
        sql_machine_err: err,  //err === thrown error.
        terminatingWorker: "mysql Connection failed"
      }
      self.postMessage(json);

      console.log('terminating worker... ON ERROR: ',err);

      console.log('terminating worker...');
      self.close();
    }
    finally{}
  }
}
let queryFailedFunction = function(json) {
  console.log('db error (fatal error): ', json.sql_machine_err);
  try{
    throw err;                                  // server variable configures this)
  }
  catch(err){
    //do nothing for now.
    json.terminatingWorker = "mysql Query failed";
    self.postMessage(json);
  }
  finally{}
}

///let connection = mysql.createConnection(conParams);
///connection.on('error', conFailFunction(err)) ;
/*connection.on('error', function(err) {
  console.log('db error (fatal error): ', err);
  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    isMysqlConnected = false;
    console.log('WE ARE DISCONNECTED NOW..');
    ///mysql_handleDisconnect();                         // lost due to either server restart, or a
  } else {                                      // connnection idle timeout (the wait_timeout
    try{
      throw err;                                  // server variable configures this)
    }
    catch(err){
      //do nothing for now.
    }
    finally{}
  }
});*/


///////const TestNet = bitcoin.networks.testnet; //AKM-finish-off***** - comment out after test


/*self.onmessage = function(event) {
  if(event.data === 'start_bitcoinTransfer'){
      console.log('worker (started bitcoinTransfer): '+event.data);
      self.bitcoinTransfer();
      console.log('worker (started bitcoinTransfer): '+event.data);
  }
  ///self.startQuickSort();
};

self.startQuickSort = function() {
  self.postMessage('akeem');
};*/

self.addEventListener('message', function(e) {
  console.log('returned message from cron worker');
  console.log('worker: '+JSON.stringify(e.data,null,2));


    //update the param variable for the current worker.
    params = e.data.params;
    //check parent feerate.
    if(params.lastFeerate !== null){
      if(params.lastFeerate < mINtxfEE){
        lastFeeratePaid = params.lastFeerate;
      }
    }

    /***************************************
    * ***** payment data insert starts *****
    ***************************************/

    //prepare select filters..
    var filterInStatement = '';
    let filters = [] = e.data.states.states;
    for (var i = 0; i < filters.length; i++) {

      if(i == 0){
        filterInStatement = "status = '"+ filters[i] +"'"
      }else{
        filterInStatement = filterInStatement + " OR status = '"+ filters[i] +"'"
      }
    }
    /************************* //put slash above '?' to test desired additional query filter.
    //temporary, just to test.?
    filterInStatement = filterInStatement + " AND UUID = 'F38CD507-ED6E-408E-81D2-37E537EEA777'"
    /*************************/

    /*//insert record in dbase
    //prepare record
    ///console.log('b4 parse',JSON.stringify(params.action_required,null,2));
    let valueArray = [
      "'"+ params.uuid +"'",
      "'"+ params.email +"'",
      "'"+ params.app_name +"'",
      "'"+ params.date +"'",
      "'Bitcoin Payment'",
      "'"+ params.status +"'",  //RUN, STANDBY, COMPLETE, CLOSED
      "'"+ JSON.stringify(params.action_required) +"'"
    ];
    console.log('parse: ',valueArray);
    */

    ///////let conAsync = async function(){

      /***** this initializing connection will stand out
      * from global responses. *****/
      let con = mysql.createConnection(conParams);
      con.on('error', connectionFailedFunction);
      con.connect(function(err) {
        ///isMysqlConnected = true;

        if (err) {
          //send back error response to sender. //AKM-finish-off*****

          console.log('terminating worker... ON ERROR: ',err);
          self.postMessage({terminatingWorker: "Worker initiate failed."});

          console.log('terminating worker...');
          self.close();
          //throw err;
          return;
        }
        console.log("Connected!");
        ///var sql = "INSERT INTO wp001_tblActionsPending (UUID, email, app_name, date, type, status, action_required) VALUES ("+ valueArray.join(',') +")";
        var sql = "SELECT UUID, app_name, date, status, action_required FROM wp001_tblActionsPending WHERE "+ filterInStatement;
        con.query(sql, function (err, result) {
          if (err) {
            console.log('INSERT error at start: ',err);
            //send back error response to sender. //AKM-finish-off*****

            self.postMessage({terminatingWorker: "Worker initiate failed."});

            console.log('terminating worker...');
            self.close();
            //throw err;
            return;
          }
          console.log("number of records returned: ",result.length);

          //*************************************************************?
          /************************************************************ */ //put a slash under the '?' to prevent sleep.
          //we're carrying on with operations, so lets keep the app awake.
          setInterval(() => {
            /*https.get(nODEjssERVER +'preventSleep', function (result) {
              //doing nothing (really) with response.
              console.log('worker (',params.privatePublic.address,'), is still working, hence keeping.. ',result.status);
            });*/
            request(nODEjssERVER +'preventSleep'+'?a=abc', function (error, response, body) {
              if (!error && response.statusCode == 200) {
                //doing nothing (really) with response.
                console.log('worker (',params.privatePublic.address,'), is still working, hence keeping.. ',result.status);
              }
            });
          }, 1000*60*25); //call every 25 minutes.
          //************************************************************** - ENd
          //**************************************************************/

          let resultCount = result.length;
          var cronSlaveCount = 0;

          for (var i = 0; i < result.length; i++) {
            let select_result = result[i];
            let action_json = JSON.parse(select_result["action_required"]);
            ///console.log('whoooooooooooooo!: ',JSON.stringify(select_result,null,2));

            /*
            //call once before the intervals.
             //send value back to global(parent) active params.
             self.postMessage({global_params: {
                                  address: params.privatePublic.address,
                                  parameters: params
                                }});
             console.log('binding worked');
             ///return;
            bitcoinTransfer(params.privatePublic, params.receiver, params.uuid);
            */

            //xxxxxxxxxxxxxxxxxxxxxxxxxxx - take into the select results.
                //consolidate bitcoin receivers **************
                var addy = select_result.app_name.replace(" ", "");
                var type = (action_json.type == 'Donate') ? 'Donate' : 'Purchase';
                addy = addy+type;
                console.log('addy: ',addy)
                //********************************************

                //set key params members
                ///params.receiver = (params.type === 'Donate') ? bitcoin_dONATErECEIVER : bitcoin_InAppPURCHASErECEIVER;
                params.receiver = bitcoinReceivers[addy];
                if(params.receiver == null){
                  params.receiver = (action_json.type == 'Donate') ? bitcoinReceivers.DefaultDonate : bitcoinReceivers.DefaultPurchase;
                }
                var action_items = {
                  output_as_input: action_json.output_as_input,
                  receiver: params.receiver,
                  type: (action_json.type == 'Donate') ? 'Donate' : 'Purchase', /*//set in worker
                  lastFeerate: null  //null until status COMPLETE*/
                }
                if(action_json.hasOwnProperty('amount_set')){
                  action_items["amount_set"] = action_json.amount_set
                }
                params.action_required = action_items;
                params.privatePublic = action_json.output_as_input;
                params.uuid = select_result.UUID;
                params.date = select_result.date;
            //xxxxxxxxxxxxxxxxxxxxxxxxxxx

                      /*
                      let repeater = setInterval(() => {
                        if(V >= 1){//AKM-finish-off***** - V >= 1 FINISHED.
                          clearInterval(repeater);
                          //close out task and allow 24 hourly cron jobs to follow up.
                        }
                      }, (1000*60*5));  //AKM-finish-off***** - set to 5 mins DONE.
                      */

                      //spin-off slave..
                      /*function run(fn) {
                        return new Worker(URL.createObjectURL(new Blob(['('+fn+')()'])));
                      }*/
                      /****************************
                      * ***** JAVA JAVA JAVA *****
                      * ***** https://dzone.com/articles/html/gwt-style-configuration-and/gwt-style-configuration-and-2 *****
                      public native void doStuff () /*-{ $wnd.alert("Hello World"); }-* /;
                      * ***** JAVA JAVA JAVA *****
                      * **************************/

                      /*var cronSlaveWorker;
                      var blob;
                      try {
                          // URL.createObjectURL
                          URL = window.URL || window.webkitURL;
                          cronSlaveWorker = new Worker(URL.createObjectURL(new Blob(['('+bitcoinTransfer(params.privatePublic, params.receiver, params.uuid)+')()'], {type: 'application/javascript'})));
                      } catch (e) { // Backwards-compatibility
                          window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                          blob = new BlobBuilder();
                          cronSlaveWorker = new Worker(URL.createObjectURL(blob.append('('+bitcoinTransfer(params.privatePublic, params.receiver, params.uuid)+')()').getBlob()));
                      }*/

                      /*var fs = require('file-system');  //npm install file-system --save
                      var options = {
                          url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Hubble2005-01-barred-spiral-galaxy-NGC1300.jpg/1920px-Hubble2005-01-barred-spiral-galaxy-NGC1300.jpg",
                          method: "get",
                          encoding: null
                      };
                      console.log('Requesting image..');
                      request(options, function (error, response, body) {

                          if (error) {
                              console.error('error:', error);
                          } else {
                              console.log('Response: StatusCode:', response && response.statusCode);
                              console.log('Response: Body: Length: %d. Is buffer: %s', body.length, (body instanceof Buffer));
                              fs.writeFileSync('test.jpg', body);
                          }
                      });*/


                      var cronSlaveWorker = new Worker('bitcoin-transfer-cron-slave.js');
                      console.log('cron slave called.. ',params.privatePublic.address);
                      cronSlaveWorker.onmessage = (event, handle) => {

                        console.log('slave worker finished. terminating.. ',event.data.terminatingWorker);
                        cronSlaveWorker.terminate();
                        console.log('slave worker terminated..');

                        cronSlaveCount++
                        console.log('slave count: ',cronSlaveCount);
                        console.log('result length: ',resultCount);
                        if(cronSlaveCount === resultCount){
                          console.log('closing Master cron, all slave terminated.');
                          con.end();
                          self.close();
                        }

                      };
                                  console.log('params is: ',params);

                      ///console.log('initial params: ',JSON.stringify(params,null,2));
                      cronSlaveWorker.postMessage({params: params, args: [params.privatePublic, params.receiver, params.uuid]});
                      console.log('called slave web worker');
                      ///console.log('check params for date: ',params);

          }
          //see if will end this using a timer... YES. Give 20mins after all calls.
          setTimeout(() => {
              con.end();
              console.log('closing Master cron, 2mins after last slave call.');
              self.close();
          }, 1000*60*2);

        });//.bind({params:params}));
      });//.bind({params:params}));

    ///////}//async - ENd
    ///////conAsync();

    /***************************************
    * ***** payment data insert starts ***** - ENd
    ***************************************/

}, false);
