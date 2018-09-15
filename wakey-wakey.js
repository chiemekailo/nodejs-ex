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
* ************ UPDATE IN 3 PLACES, including mobile app *******
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
  ///console.log("tea n'ura",nODEjssERVER +'preventSleep');

  /* start at 15mins..
  request(nODEjssERVER +'preventSleep'+'?a=xyz', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //doing nothing (really) with response.
      ///console.log('skips all: '+body);
    }
  });*/

      //*************************************************************?
      /************************************************************ */ //put a slash under the '?' to prevent sleep.
      //we're carrying on with operations, so lets keep the app awake.
      setInterval(() => {
        /*https.get(nODEjssERVER +'preventSleep?a=xyz', function (result) {
          //doing nothing (really) with response.
          ///console.log('worker (',params.privatePublic.address,'), is still working, hence keeping.. ',result.status);
        });*/
        request(nODEjssERVER +'preventSleep'+'?a=xyz', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //doing nothing (really) with response.
          }
        });
        ///console.log('wakey-wakey..');
        ///self.close();
      }, 1000*60*10); //call every 15 minutes.., checked every 20mins on server & recreated if failed.
      //************************************************************** - ENd
      //**************************************************************/

}, false);
