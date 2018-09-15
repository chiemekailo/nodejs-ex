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


const mINtxfEE = 1000;  //per kB
const mAXtxfEE = 20000; //per kB
var lastFeeratePaid = null;
var V = 0;  //fee calculation

//AKM-finish-off***** - change receivers to -> 14s7wouBVEDGnDk8hhTzKUMhZurVjtpUwe (Donate) & 15DWHkYYHTMYsKyASSnr7ZrzuvMtbvzGqd (InApp Purchase)
const bitcoin_dONATEpRIVpUB = null; //my public wallet address
const bitcoin_dONATErECEIVER = "myYS1PXqePfxF1V8xvhBrkzs47TZaLkwTG";
const bitcoin_InAppPURCHASEpRIVpUB = null;
const bitcoin_InAppPURCHASErECEIVER = null;
var params = null;
let kEEPlIVEdATA = null;  //for messaging and possible inclusion into server variables.

const istosENDsUCCESSeMAIL = true;
const istosENDfAILUREeMAIL = true;
const pRIORITYlIMIT = 0;

///var isMysqlConnected = false;

//create a global connection Object
var conParams = {
  host: "heron.whogohost.com",  //website: localhost  //my laptop ip: 105.112.68.19
  user: "appcedar_wp001",//"appcedar_chiemek",
  password: "paab$3419",//"82PuSlm56b",
  database: "appcedar_wp001"
};


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

var transaction_amounts = [];


const TestNet = bitcoin.networks.testnet; //AKM-finish-off***** - comment out after test







self.addEventListener('message', function(e) {
  self.postMessage('returned message from worker');
  console.log('worker: '+JSON.stringify(e.data,null,2));

    /***************************************
    * ********* data fetch starts **********
    ***************************************/

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

      let forAsync = async () => {

        console.log('device id: ',uuid);

          ///for (var i = 0; i < uuid.length; i++) {
            ///let address = uuid[i];

                //let uuid = e.data.uuid;

            let valueArray =  [e.data.uuid, e.data.date, e.data.status, JSON.stringify(e.data.message)];
            var sql = "INSERT INTO wp001_tblAppCedarLiveNotification (uuid, date, status, message) VALUES ("+ valueArray.join(',') +")";
            con.query(sql, (err, result) => { //let res = await
              if (err) {
                queryFailedFunction({
                  sql_machine_err: err,  //err === thrown error.
                  terminatingWorker: 'Worker initiate failed.'
                });
                //end things..., can't try .close() because it may run before postMessage ends.
                con.end();
                console.log('terminating worker...');
                self.close();
              }else{
                //do the success stuff
                let res = result;
                console.log('Insert Successful (count is..): ',res.length);

                self.postMessage({
                  message: 'Insert Successful (count is..): '+res.length, //result can be typed in directly as json object.
                  workerIsFinished: true
                });
                con.end();
              }

            });

          ///}//for..
          ///console.log('got to last_complete (sql): ',JSON.stringify(complete_jsons,null,2));

      };
      forAsync();


    });

    /***************************************
    * ********* data fetch starts ********** - ENd
    ***************************************/

}, false);
