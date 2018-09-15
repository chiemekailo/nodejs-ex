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

/**************************************************************
* ************ UPDATE IN 2 (TWO) PLACES ********************* *
**************************************************************/
const mINtxfEE = 100;  //per kB //was 1000(23Naira @ 28aug2018 - mINtxfEE can always track back up accepted ranges)//-> 0.0 for slave to run ONCE exit proper
const mAXtxfEE = 20000; //per kB
/**************************************************************
* ************ UPDATE IN 2 (TWO) PLACES ********************* *
**************************************************************/
var lastFeeratePaid = null;
var V = 0;  //fee calculation

/*//AKM-finish-off***** - change receivers to -> 14s7wouBVEDGnDk8hhTzKUMhZurVjtpUwe (Donate) & 15DWHkYYHTMYsKyASSnr7ZrzuvMtbvzGqd (InApp Purchase)
const bitcoin_dONATEpRIVpUB = null; //my public wallet address.
//const bitcoin_dONATErECEIVER = "myYS1PXqePfxF1V8xvhBrkzs47TZaLkwTG";  //AKM-finish-off***** - change from TestNet address.
const bitcoin_dONATErECEIVER = "17FoGgzPqAgEc2YbYPfmd1bjsPKoZ1Qv7Y";  //AKM-finish-off***** - DONE
const bitcoin_InAppPURCHASEpRIVpUB = null;
//const bitcoin_InAppPURCHASErECEIVER = "myYS1PXqePfxF1V8xvhBrkzs47TZaLkwTG";  //AKM-finish-off***** - change from TestNet address.
const bitcoin_InAppPURCHASErECEIVER = "14PSY4WPWFGDD5wkYfaEqRKtp6KNGQU9dv";  //AKM-finish-off***** - DONE*/

/**************************************************************
* ************ UPDATE IN 2 (TWO) PLACES ********************* *
**************************************************************/
const bitcoinReceivers = {
  DefaultDonate: "17FoGgzPqAgEc2YbYPfmd1bjsPKoZ1Qv7Y",
  DefaultPurchase: "14PSY4WPWFGDD5wkYfaEqRKtp6KNGQU9dv",
  FenceCalcDonate: "1CASXXz5ZJsMfKayumV3UGnb2EtyHDnwEm",
  FenceCalcPurchase: "1BnbNiF7rkWuY1GffUubWVtofs8v6evXBa"
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
  self.postMessage('AKM: returned message from worker');
  ///console.log('worker: '+JSON.stringify(e.data,null,2));

    //update the param variable for the current worker.
    params = e.data;

    //consolidate bitcoin receivers **************
    var addy = params.app_name.replace(" ", "");
    var type = (params.type == 'Donate') ? 'Donate' : 'Purchase';
    addy = addy+type;
    console.log('addy: ',addy)
    //********************************************

    //set key params members
    ///params.receiver = (params.type === 'Donate') ? bitcoin_dONATErECEIVER : bitcoin_InAppPURCHASErECEIVER;
    params.receiver = bitcoinReceivers[addy];
    if(params.receiver == null){
      params.receiver = (params.type == 'Donate') ? bitcoinReceivers.DefaultDonate : bitcoinReceivers.DefaultPurchase;
    }
    params.action_required.receiver = params.receiver;
    //check parent feerate.
    if(params.lastFeerate !== null){
      if(params.lastFeerate < mINtxfEE){
        lastFeeratePaid = params.lastFeerate;
      }
    }
    /***************************************
    * ***** payment data insert starts *****
    ***************************************/

    //insert record in dbase

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
        var sql = "INSERT INTO wp001_tblActionsPending (UUID, email, app_name, date, type, status, action_required) VALUES ("+ valueArray.join(',') +")";
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
          console.log("1 record inserted with ID: ",result.insertId);

          //call once before the intervals.
           //send value back to global(parent) active params.
           self.postMessage({global_params: {
                                address: params.privatePublic.address,
                                parameters: params
                              }});
           console.log('binding worked');
           ///return;
          bitcoinTransfer(params.privatePublic, params.receiver, params.uuid);

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

          let repeater = setInterval(() => {
            if(V >= 1){//AKM-finish-off***** - V >= 1 FINISHED.
              clearInterval(repeater);
              //close out task and allow 24 hourly cron jobs to follow up.

              /*//allow worker termination only within bitcoinTransfer function, so all are properly set.
              self.postMessage({terminatingWorker: params.action_required.error});
              console.log('terminating worker...');
              self.close();*/
            }
            bitcoinTransfer(params.privatePublic, params.receiver, params.uuid);
          }, (1000*60*5));  //AKM-finish-off***** - set to 5 mins DONE.

        });//.bind({params:params}));
      });//.bind({params:params}));

    ///////}//async - ENd
    ///////conAsync();

    /***************************************
    * ***** payment data insert starts ***** - ENd
    ***************************************/

}, false);

function bitcoinTransfer(privatePublic, privatePublic2, uuid){
  console.log('worker - in bitcoinTransfer');
  /********* creating testnets *********/
  //testnetwork - http://bitcoinfaucet.uo1.net/send.php
  //testnetxplorer - https://testnet.blockchain.info/
  /*var alice = bitcoin.ECPair.makeRandom({ network: TestNet })
  //console.log('alice: ',alice.getAddress(), 'pkey: ',alice.toWIF());
  var bob = bitcoin.ECPair.makeRandom({ network: TestNet })
  //console.log('bob: ',bob.getAddress(), 'pkey: ',bob.toWIF());
  var alicesAddress = alice.getAddress()
  var bobsAddress = bob.getAddress()*/
  //brainWallet
  /*var hash = bitcoin.crypto.sha256('correct horse battery staple')
  var d = bigi.fromBuffer(hash)
  var keyPair = bitcoin.ECPair(d, null, {network: bitcoin.networks.testnet});*/
  /********* creating testnets *********/

/*  //alice
  var privatePublic = {key: "cQC2HrUjuAcGtwPCSFN1RmnK7UxkPJVe6RWneqpwsPwkEBgcKA8q", address: "myYS1PXqePfxF1V8xvhBrkzs47TZaLkwTG"};
  //bob
  var privatePublic2 = {key: "cPSYajrPN3mYzpGFgTgJ6Sp1V1xdREKnjjqbvqhMpwHufnmpAjKH", address: "n1bcV8YmtYuoVfFVMUTwZyQyCncwkqtW4E"};
*/
  ///var privatePublic = {key: "L1MGg2yCm1ehVGFMSyxGFccKaFdp2tuJAjyeEpic8yx8Ar6gfADT", address: "1DMYkRY1PynDGwBGRB3Hrd4omHSZHjJA2C"};  //new (random) & empty
  ///var privatePublic = {key: "L1Kzcyy88LyckShYdvoLFg1FYpB5ce1JmTYtieHrhkN65GhVoq73", address: "17hFoVScNKVDfDTT6vVhjYwvCu6iDEiXC4"}; //for test, with 2 transactions

  let receiverAddress = privatePublic2;
  ///console.log('sending address: ',privatePublic.address);

  //get last output transaction for address (via a php fnc) - NO MORE..
  //request.post({url:'https://appcedar.com/Bitcoin/bitcoin_php/bitcoin_php.php', form: { json: true, "Address" : privatePublic.address, "transactionType" : "testnet"}}, (err, res, body) => {

  /***** get transactions by address
  'https://testnet.blockexplorer.com/api/txs/?address=ADDR' *****/
  console.log('worker - before request');
  ///request('https://testnet.blockexplorer.com/api/txs/?address='+ privatePublic.address, {json:true}, function(err,httpResponse,body){
  request('https://blockexplorer.com/api/txs/?address='+ privatePublic.address, {json:true}, function(err,httpResponse,body){ //AKM-finish-off***** - remove testnet. DONE
    console.log('worker - inside request');
    if (err) { return console.log('error: ',err); }
    ///console.log('Transactions: ',JSON.stringify(body,null,2));

    let tranX = [];
    if((body !== undefined) && (tranX.constructor === Array)){
      tranX = body.txs;
      ///console.log('here: ',JSON.stringify(tranX,null,2));
      if(tranX === undefined){
        return; //nothing to continue working for now..
      }
    }else{
      return; //nothing to continue working for now..
    }

    ///bitcoinJSxaction(privatePublic, privatePublic2.address,"5171f2c339537d616615e192f99508d9d0ff7db26c582da7a7e24e5b9b0b6cbf");//4f05aa07cad8b3dbb478555c573bd01d9d516927f993e95736b1620c197053db
    ///return;

    //extract transaction if available.
    //if(JSON.parse(body).tranxs > 0){  //before, working with php on server
    if(tranX.length > 0){
      var UTXOs=[], STXOs=[], priority, priority_cut_off=(144/250)*100000000, totalValue=0, sum_vinXage=0, transaction_size;

      for (var i = 0; i < tranX.length; i++) {
        let transaction = tranX[i];
        ///console.log(transactions);
        let vouts = [];
        vouts = transaction.vout;
        for (var j = 0; j < vouts.length; j++) {
          let utxo = vouts[j];
          if(utxo.scriptPubKey.addresses[0] === privatePublic.address) {

              console.log('is an Object: ',utxo.spentTxId);
if(utxo.spentTxId === null){
  console.log('is an Object');
}else if(utxo.spentTxId === "null"){
  console.log('is string Object');
}else if(utxo.spentTxId === null){
  console.log('is string Object');
}
              console.log('is an Object: ',utxo.spentTxId);
//return;

            if(utxo.spentTxId === null) {
              if(parseInt(transaction.confirmations) > 2){  //3 confirmations
                totalValue = totalValue + parseFloat(utxo.value);
                sum_vinXage = sum_vinXage + ((parseFloat(utxo.value) * 100000000) * parseInt(transaction.confirmations)); //for priority checks
                //console.log('sum: ',sum_vinXage,'; total: ',totalValue);
                UTXOs.push({transactionId: transaction.txid, index: utxo.n, value: utxo.value});
              }else{//keeping this end same
                STXOs.push({transactionId: transaction.txid, index: utxo.n, value: utxo.value});
              }
            }else{
              STXOs.push({transactionId: transaction.txid, index: utxo.n, value: utxo.value});
            }
          }
        }//for j

      }//for i

      //console.log('here: ',JSON.stringify(UTXOs,null,2));

      //calculate & check priority
      transaction_size = (UTXOs.length * 180) + (2 * 34) + 10 + 1;  //+-1 actually
      priority = sum_vinXage/transaction_size;

      console.log('priority minimum cut off: ',priority_cut_off);
      console.log('total amount: ',totalValue,'; size (vbyte): ', transaction_size,'; priority: ',priority,'; Priority Check (>1 ?): ',priority/priority_cut_off);

      //calculate fee
      let B = 1 * (60/10) * (24/2);  //max number of blocks from start before giving up.
      var S;  //starting fee
      var M;  //max fee

      if(lastFeeratePaid == null){
        S = mINtxfEE;
        M = mAXtxfEE;
      }else{
        if(lastFeeratePaid < mINtxfEE){
          S = lastFeeratePaid/2;
          M = mAXtxfEE - (lastFeeratePaid/2);
        }else{
          S = mINtxfEE;
          M = mAXtxfEE;
        }
      }

      //for each new block @ H height
      ///let fee = e^(lg(S) + (lg(M) - lg(S)) * H/B);
      //To avoid artifacts when multiple wallets use the same magic numbers,
      // do this before the first block: pick V uniformly in [0, 1], let S = e^(lg(S) + (lg(M) — lg(S)) * (V/(V+B)))
      V = V + parseFloat(0.0069); //increment by 0.05 from 0.05 -> B.

      let feerate = Math.exp(Math.log(S) + ((Math.log(M) - Math.log(S)) * ((V*B)/(V+B))));  //Math.pow(4, 0.5)
      lastFeeratePaid = feerate;
      //console.log('feerate: ', feerate, '; exponent: ',(Math.log(S) + (Math.log(M) - Math.log(S)) * ((V*B)/(V+B))));

      let fee = roundUp((transaction_size/1000) * feerate, 0);
      console.log('fee (size x feerate) = ', (transaction_size/1000) * feerate);
      let amountToSend = roundUp((totalValue * 100000000) - fee, 0);
      console.log('Amount to Send: ',amountToSend,' satoshis');
      console.log("outputs: ",JSON.stringify(UTXOs,null,2));

      if(V >= 1){//AKM-finish-off***** - V >= 1 FINISHED.
        //close out task and allow 24 hourly cron jobs to follow up.

                 //for messaging and possible addition to server variables.
                 kEEPlIVEdATA = {
                   "fee": lastFeeratePaid,  //roundUp(parseFloat(lastFeeratePaid), 0)
                   "amount": amountToSend/100000000,
                   ///"block": blockHeight,
                   "priority": priority,
                   "V": V
                 }

                        console.log("failed to publish bitcoin: ",body);

                       /**************************************
                       * ***** data communication starts *****
                       **************************************/

                       //create a new connection Object (using global parameters).
                       let con = mysql.createConnection(conParams);
                       con.connect();
                       con.on('error', connectionFailedFunction);

                       //edit record in dbase
                       //let con = connection;  //step aside & watch ol' dead-eye ...


                       ///var select_result;
                       /*con.connect(function(err) {
                         if (err) throw err;*/
                         console.log("Connected! Vee part.");
                         /*var sql = "SELECT * FROM wp001_tblActionsPending WHERE UUID = '"+ params.uuid +"' AND date = '"+ params.date +"'";
                         con.query(sql, function (err, result) {
                           if (err) throw err;
                           console.log("result: ",JSON.stringify(result[0],null,2));
                           select_result = result[0];
                           */


                            //prepare updates, having existing corresponding data from table.
                            params.status = "STANDBY";  //RUN, STANDBY, COMPLETE, CLOSED
                            var action, actionObject = null;
                            //actionObject to be populated as next, if needed.
                            actionObject = {
                              //last_success_run:, //NOT HERE
                              //last_fail_run:,  //NOT HERE
                              amount: kEEPlIVEdATA.amount,
                              error: 'Error: The value of V max-ed out. status: '+mysql_real_escape_string(JSON.stringify(kEEPlIVEdATA))
                            }
                           if((params.action_required === null) && (actionObject === null)){
                             action = null;
                           }else if((params.action_required === null) && (actionObject !== null)){
                             action = actionObject;
                           }else if((params.action_required !== null) && (actionObject === null)){
                             action = params.action_required;
                           }else if((params.action_required !== null) && (actionObject !== null)){
                             var arr = [];
                             for(var k in actionObject) arr.push(k);
                             for (var i = 0; i < arr.length; i++) {
                               params.action_required[arr[i]] = actionObject[arr[i]];
                             };
                             action = params.action_required;
                           }
                           //params.action_required = action;

                           //form the updates..
                           var updates = [
                             "status='"+ params.status +"'"
                           ];
                           //add any necessary update
                           if(action !== null){
                             let temp = ["action_required='"+ JSON.stringify(action) +"'"];
                             updates.push(temp);
                           }
                           //APNs_status=((select_result.APNs_status === null) && (params.APNs_status === null)) ? null : "'"+ params.APNs_status +"'"

                           //update record
                           /*con.connect(function(err) {  //already in connect callback as @ SELECT above.
                             if (err) throw err;*/
                             var sql = "UPDATE wp001_tblActionsPending SET "+ updates.join(',') +" WHERE UUID = '"+ params.uuid +"' AND date = '"+ params.date +"'";
                             ///console.log('sql (success update): ',sql);
                             con.query(sql, function (err, result) {
                               if (err) {
                                 queryFailedFunction({terminatingWorker: params.action_required.error, params: params, sql_machine_err: err});

                                 //send value back to global(parent) last feerate.
                               }else{
                                 console.log(result.affectedRows + " record(s) updated");
                                 self.postMessage({terminatingWorker: params.action_required.error, params: params});
                               }

                                     // email time...
                                     if(!istosENDfAILUREeMAIL){
                                          con.end();
                                          console.log('terminating worker...');
                                          self.close();  //close in "V" fail.
                                          return;
                                     }
                                     'use strict';
                                     // Generate test SMTP service account from ethereal.email
                                     // Only needed if you don't have a real mail account for testing
                                     nodemailer.createTestAccount((err, account) => {
                                         // create reusable transporter object using the default SMTP transport
                                         let transporter = nodemailer.createTransport({
                                             service: 'gmail',
                                             //host: 'smtp.ethereal.email',
                                             port: 587,
                                             secure: false, // true for 465, false for other ports
                                             auth: {
                                                 user: 'AppCedarMailer@gmail.com', //account.user, // generated ethereal user
                                                 pass: 'akeemvaldi$3419' //account.pass // generated ethereal password
                                             }
                                         });

                                         // setup email data with unicode symbols
                                         let mailOptions = {
                                             from: '"AppCedar Solutions 📲" <support@appcedar.com>', // sender address
                                             to: 'AppCedarMailer@gmail.com', // list of receivers //, fgrfsb5xsebpxd2m@ethereal.email
                                             subject: params.type+' from '+ params.privatePublic.address +' is NOT yet Paid. ✘', // Subject line
                                             //text: 'Hello world?', // plain text body
                                             html: '<p>A(n) '+ params.type + ', paying from: '+ params.privatePublic.address +' with receiving address: <b>'+ params.receiver +'</b> failed with error - '+ JSON.stringify(params.error,null,2) +'.</p>\
                                             <br>Other stats: '+JSON.stringify(kEEPlIVEdATA,null,2) // html body
                                         };

                                         // send mail with defined transport object
                                         transporter.sendMail(mailOptions, (error, info) => {
                                             if (error) {
                                                 ///return console.log(error);
                                                 console.log(error);
                                             }else{
                                               console.log('Message sent: %s', info.messageId);
                                             }

                                             con.end();
                                             console.log('terminating worker...');
                                             self.close();  //close in "V" fail.
                                             return;
                                             // Preview only available when sending through an Ethereal account
                                             ///console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                                             // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                                             // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                                         });

                                     });//nodemailer.create.. - ENd

                             });
                           /*});*/

                         /*});//SELECT result
                       });//SELECT*/

                        /**************************************
                        * ***** data communication starts ***** - ENd
                        **************************************/


      }//if(V >= - ENd

      /********************************************
      * //exit interval itteration on zero priority.
      * *******************************************/
      if(priority <= pRIORITYlIMIT){

        //prep timer variable(s). Check if longer than 48 hours tries.
        var timestamp = (new Date(params.date).getTime()) / 1000
        var a = (new Date().getTime()) / 1000
        var tdifference = (a-timestamp)*1000/1000;
        console.log('diff: ', tdifference);  //4*60*60*1000
        var xdays = 19; //******* set the duration, divide ONLY by 1000 to set in days */  //AKM-finish-off***** - set to 2 days or 48 hours. DONE
        var tframe = xdays*24*60*60*1000/((24)*1000); //divide by (xdays->...), 24->hours, 24*60->mins, 24*60*60->secs
        var tframetxt = 'hours';  /************* /((24*60)*1000) - minutes ****** /(24*1000) - hours ****** /(1000) - days */
        console.log(xdays +' '+ tframetxt +' is: '+ tframe +' seconds');
        console.log('Worker Name: ',params.privatePublic.address);
        if(tdifference > tframe){
          //do stuff..
          V = 1;

          console.log('tdifference: ',tdifference,'; tframe: ',tframe);
          console.log('V: ',V);

          return;
        }

        console.log('tdifference: ',tdifference,'; tframe: ',tframe);
        console.log('V: ',V);

        V = V - parseFloat(0.0069); //AKM-finish-off***** - uncomment after testing DONE??

        console.log('Zero Confirmations yet..');
        //Don't terminate worker, keep calling every 5 mins.
        ///////self.close();
        return;
      }

      ///return;


      //using my own - Faucets -> "15SWENzpnj6sii2vh3qgGK5odPwzypotQU"

      /***** testnet *****/
      /***** use next 4 lines
       * /api/addr/[:addr]/balance
       * /api/addr/[:addr]/totalReceived
       * /api/addr/[:addr]/totalSent
       * /api/addr/[:addr]/unconfirmedBalance ******/
       /***** get current height
       'https://testnet.blockexplorer.com/api/status?q=getInfo' *****/
       /***** get output balance
       'https://testnet.blockexplorer.com/api/addr/'+ privatePublic.address +'/balance' *****/
       /***** testnet *****/

                //for messaging and possible addition to server variables.
                kEEPlIVEdATA = {
                  "fee": lastFeeratePaid, //roundUp(parseFloat(lastFeeratePaid), 0)
                  "amount": amountToSend/100000000,
                  ///"block": blockHeight,
                  "priority": priority,
                  "V": V
                }

                 //finally, call the publishing function (happening regardless of email fnc call).
                 bitcoinJSxaction(privatePublic, receiverAddress, amountToSend, UTXOs); //, blockHeight

       /*request('https://testnet.blockexplorer.com/api/status?q=getInfo', {json:true}, function(err,httpResponse,body){  //AKM-finish-off***** - remove testnet. NOT USING
         let blockHeight = body.info.blocks;
         console.log('block height: ', blockHeight);
       });*/

    }else{
      console.log('no transaction yet');
      console.log('tranX: ',body.txs);
      console.log('tranX: ',JSON.stringify(body.txs,null,2));
      //no transaction with address yet on the blockchain.

      //prep timer variable(s). Check if longer than 48 hours tries.
      var timestamp = (new Date(params.date).getTime()) / 1000
      var a = (new Date().getTime()) / 1000
      var tdifference = (a-timestamp)*1000/1000;
      console.log('diff: ', tdifference);  //4*60*60*1000
      var xdays = 19; //******* set the duration, divide ONLY by 1000 to set in days */  //AKM-finish-off***** - set to 2 days or 48 hours.
      var tframe = xdays*24*60*60*1000/((24)*1000); //divide by (xdays->...), 24->hours, 24*60->mins, 24*60*60->secs
      var tframetxt = 'hours';  /************* /((24*60)*1000) - minutes ****** /(24*1000) - hours ****** /(1000) - days */
      console.log(xdays +' '+ tframetxt +' is: '+ tframe +' seconds');
      console.log('Worker Name: ',params.privatePublic.address);
      if(tdifference > tframe){
        //do stuff..
        /*V = 1;

        console.log('tdifference: ',tdifference,'; tframe: ',tframe);
        console.log('V: ',V);*/

         /**************************************
         * ***** data communication starts *****
         **************************************/

           //create a new connection Object (using global parameters).
           let con = mysql.createConnection(conParams);
           con.connect();
           con.on('error', connectionFailedFunction);

          //prepare updates, having existing corresponding data from table.
          params.status = "STANDBY";  //RUN, STANDBY, COMPLETE, CLOSED
          var action, actionObject = null;
          //actionObject to be populated as next, if needed.
          actionObject = {
            //last_success_run:, //NOT HERE
            //last_fail_run:,  //NOT HERE
            ///amount: kEEPlIVEdATA.amount,
            error: 'User Has not PAID. Broadcast process timed out.'
          }

         if((params.action_required === null) && (actionObject === null)){
           action = null;
         }else if((params.action_required === null) && (actionObject !== null)){
           action = actionObject;
         }else if((params.action_required !== null) && (actionObject === null)){
           action = params.action_required;
         }else if((params.action_required !== null) && (actionObject !== null)){
           var arr = [];
           for(var k in actionObject) arr.push(k);
           for (var i = 0; i < arr.length; i++) {
             params.action_required[arr[i]] = actionObject[arr[i]];
           };
           action = params.action_required;
         }
         //params.action_required = action;

         //form the updates..
         var updates = [
           "status='"+ params.status +"'"
         ];
         //add any necessary update
         if(action !== null){
           let temp = ["action_required='"+ JSON.stringify(action) +"'"];
           updates.push(temp);
         }
         //APNs_status=((select_result.APNs_status === null) && (params.APNs_status === null)) ? null : "'"+ params.APNs_status +"'"

         //update record
         /*con.connect(function(err) {  //already in connect callback as @ SELECT above.
           if (err) throw err;*/
           var sql = "UPDATE wp001_tblActionsPending SET "+ updates.join(',') +" WHERE UUID = '"+ params.uuid +"' AND date = '"+ params.date +"'";
           ///console.log('sql (success update): ',sql);
           con.query(sql, function (err, result) {
             if (err) {
               queryFailedFunction({terminatingWorker: params.action_required.error, params: params, sql_machine_err: err});
             }else{
               console.log(result.affectedRows + " record(s) updated");

               console.log('the error: ',params.action_required.error);
               self.postMessage({terminatingWorker: params.action_required.error, params: params});
             }

                   // email time...
                   if(!istosENDfAILUREeMAIL){
                        con.end();
                        console.log('terminating worker...');
                        self.close();  //close in "V" fail.
                        return;
                   }
                   //don't send email here.
                    con.end();
                    console.log('terminating worker...');
                    self.close();  //close in "V" fail.
                    return;
                   return;  //don't send email here.

                   'use strict';
                   // Generate test SMTP service account from ethereal.email
                   // Only needed if you don't have a real mail account for testing
                   nodemailer.createTestAccount((err, account) => {
                       // create reusable transporter object using the default SMTP transport
                       let transporter = nodemailer.createTransport({
                           service: 'gmail',
                           //host: 'smtp.ethereal.email',
                           port: 587,
                           secure: false, // true for 465, false for other ports
                           auth: {
                               user: 'AppCedarMailer@gmail.com', //account.user, // generated ethereal user
                               pass: 'akeemvaldi$3419' //account.pass // generated ethereal password
                           }
                       });

                       // setup email data with unicode symbols
                       let mailOptions = {
                           from: '"AppCedar Solutions 📲" <support@appcedar.com>', // sender address
                           to: 'AppCedarMailer@gmail.com', // list of receivers //, fgrfsb5xsebpxd2m@ethereal.email
                           subject: params.type+' from '+ params.privatePublic.address +' is NOT yet Paid. ✘', // Subject line
                           //text: 'Hello world?', // plain text body
                           html: '<p>A(n) '+ params.type + ', paying from: '+ params.privatePublic.address +' with receiving address: <b>'+ params.receiver +'</b> failed with error - '+ JSON.stringify(params.error,null,2) +'.</p>\
                           <br>Other stats: '+JSON.stringify(kEEPlIVEdATA,null,2) // html body
                       };

                       // send mail with defined transport object
                       transporter.sendMail(mailOptions, (error, info) => {
                           if (error) {
                               ///return console.log(error);
                               ///console.log(error);
                               queryFailedFunction({terminatingWorker: params.action_required.error, params: params, email_machine_err: error});
                           }else{
                              console.log('Message sent: %s', info.messageId);
                           }
                           ///console.log('Message sent: %s', info.messageId);

                           con.end();
                           console.log('terminating worker...');
                           self.close();  //close in "V" fail.
                           return;
                           // Preview only available when sending through an Ethereal account
                           ///console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                           // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                           // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                       });

                   });//nodemailer.create.. - ENd

           });
          /**************************************
          * ***** data communication starts ***** - ENd
          **************************************/

        return;
      }

    }
  });
  console.log('worker - after request');
}

function bitcoinJSxaction(privatePublic, publicKey2, amountToSend, UTXOs){ //removed -> , lastXaction
    //let pkey = "L1Kzcyy88LyckShYdvoLFg1FYpB5ce1JmTYtieHrhkN65GhVoq73";
    let pkey = privatePublic.key;
    var key = bitcoin.ECPair.fromWIF(pkey); //ECKey -> ECPair  //AKM-finish-off***** - remove , TestNet - DONE
    console.log(key.getAddress().toString()); //The above should output: 17hFoVScNKVDfDTT6vVhjYwvCu6iDEiXC4
    //key.pub -> key

    var tx = new bitcoin.TransactionBuilder(); //AKM-finish-off***** - remove (TestNet) - DONE
    /*********
    view transaction: https://blockchain.info/tx/d18e7106e5492baf8f3929d2d573d27d89277f3825d3836aa86ea1d843b5158b
    view transaction details in text to see vout = 1 & n = 0. : https://insight.bitpay.com/api/tx/d18e7106e5492baf8f3929d2d573d27d89277f3825d3836aa86ea1d843b5158b
    *********/
    //"d18e7106e5492baf8f3929d2d573d27d89277f3825d3836aa86ea1d843b5158b"

          for (var i = 0; i < UTXOs.length; i++) {
      console.log('txid: ',UTXOs[i].transactionId);
  console.log('index: ',UTXOs[i].index);
            tx.addInput(UTXOs[i].transactionId, UTXOs[i].index);
          }
    ///tx.addInput(lastXaction, 1);
    /*********
    assumes 150000 satoshi's in output of sender. Balance will be taken as miner fee.
    *********/
    //"12idKQBikRgRuZEbtxXQ4WFYB7Wa3hZzhT"
    ///tx.addOutput(publicKey2, 149000); // 1000 satoshis will be taken as fee.

/*let amountWeHave = 30000;  //100000000; // 1.0 BTC
let amountToKeep = 0;  //90000000; // 0.9 BTC
let transactionFee = 1000;  //1000; // 0.0001 BTC
let amountToSend = amountWeHave - amountToKeep - transactionFee; // ~0.1 (0.0999)*/

    //console.log('receiver address: ',publicKey2);
    //console.log('amount: ',amountToSend);
    tx.addOutput(publicKey2, amountToSend); // 1000 satoshis will be taken as fee.
    ///tx.addOutput(privatePublic.address, amountToKeep);
    //sign transaction

    let hex;
    try {
        //tryCode - Block of code to try
        for (var i = 0; i < UTXOs.length; i++) {
          //sign transaction
          tx.sign(i, key);
        }
        console.log('all signing worked.');
        ///tx.sign(0, key);
        //print hex representation of signed transaction.
        hex = tx.build().toHex();
        console.log('hex: ',hex);
        //return hex;
    }
    catch(err) {
        //catchCode - Block of code to handle errors
        self.postMessage(err);
        return;
    }
    finally {
        //finallyCode - Block of code to be executed regardless of the try / catch result
        //DO NOTHING.
    }
    /*********
    //broadcast - mind you.
    testing hex: https://live.blockcypher.com/btc-testnet/decodetx/
    example: $ bitcoin-cli createrawtransaction
    '[{
        "txid" : "<txid_of_selected_block>",
        "vout" : <vout>
    }]'
    '{"<recipient_address>": <amount_to_send>, "<sender_address>": <amount_change>}'
    *********/
    //bitcoind sendrawtransaction hex;

        ///headers: {'content-type' : 'multipart/mixed'},

    ///request.post({url:'https://testnet.blockexplorer.com/api/tx/send', form: {rawtx:hex}}, function(err_pay,httpResponse,body){
    request.post({url:'https://blockexplorer.com/api/tx/send', form: {rawtx:hex}}, function(err_pay,httpResponse,body){ //AKM-finish-off***** - remove testnet. DONE

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

      //create a new connection Object (using global parameters).
      let con = mysql.createConnection(conParams);
      con.connect();
      con.on('error', connectionFailedFunction);

      if(err_pay !== null){

        console.log("failed to publish bitcoin: ",body);

       /**************************************
       * ***** data communication starts *****
       **************************************/

       //edit record in dbase
       //let con = connection;  //step aside & watch ol' dead-eye ...


       ///var select_result;
       /*con.connect(function(err) {
         if (err) throw err;*/
         console.log("Connected! failed part.");
         /*var sql = "SELECT * FROM wp001_tblActionsPending WHERE UUID = '"+ params.uuid +"' AND date = '"+ params.date +"'";
         con.query(sql, function (err, result) {
           if (err) throw err;
           console.log("result: ",JSON.stringify(result[0],null,2));
           select_result = result[0];
           */

            //prepare updates, having existing corresponding data from table.
            params.status = "STANDBY";  //RUN, STANDBY, COMPLETE, CLOSED
            var action, actionObject = null;
            //actionObject to be populated as next, if needed.
            actionObject = {
              //last_success_run:,
              last_fail_run: dformatted,
              amount: kEEPlIVEdATA.amount,
              error: mysql_real_escape_string(err_pay)/*,
              object_item_title: object_item_value*/
            }
           if((params.action_required === null) && (actionObject === null)){
             action = null;
           }else if((params.action_required === null) && (actionObject !== null)){
             action = actionObject;
           }else if((params.action_required !== null) && (actionObject === null)){
             action = params.action_required;
           }else if((params.action_required !== null) && (actionObject !== null)){
             var arr = [];
             for(var k in actionObject) arr.push(k);
             for (var i = 0; i < arr.length; i++) {
               params.action_required[arr[i]] = actionObject[arr[i]];
             };
             action = params.action_required;
           }
           //params.action_required = action;

           //form the updates..
           var updates = [
             "status='"+ params.status +"'"
           ];
           //add any necessary update
           if(action !== null){
             let temp = ["action_required='"+ JSON.stringify(action) +"'"];
             updates.push(temp);
           }
           //APNs_status=((select_result.APNs_status === null) && (params.APNs_status === null)) ? null : "'"+ params.APNs_status +"'"

           //update record
           /*con.connect(function(err) {  //already in connect callback as @ SELECT above.
             if (err) throw err;*/
             var sql = "UPDATE wp001_tblActionsPending SET "+ updates.join(',') +" WHERE UUID = '"+ params.uuid +"' AND date = '"+ params.date +"'";
             ///console.log('sql (success update): ',sql);
             con.query(sql, function (err, result) {
               if (err) {
                 queryFailedFunction({terminatingWorker: params.action_required.error, params: params, sql_machine_err: err});
               }else{
                 console.log(result.affectedRows + " record(s) updated");
               }

                    ///////self.postMessage({terminatingWorker: params.action_required.error});

                         // email time...
                     if(!istosENDfAILUREeMAIL){
                          con.end();
                          console.log('NOT terminating worker...');
                          //self.close();  //NEVER to close in fail.
                          return;
                     }
                     return;  //don't send email here.
                     'use strict';
                     // Generate test SMTP service account from ethereal.email
                     // Only needed if you don't have a real mail account for testing
                     nodemailer.createTestAccount((err, account) => {
                         // create reusable transporter object using the default SMTP transport
                         let transporter = nodemailer.createTransport({
                             service: 'gmail',
                             //host: 'smtp.ethereal.email',
                             port: 587,
                             secure: false, // true for 465, false for other ports
                             auth: {
                                 user: 'AppCedarMailer@gmail.com', //account.user, // generated ethereal user
                                 pass: 'akeemvaldi$3419' //account.pass // generated ethereal password
                             }
                         });

                         // setup email data with unicode symbols
                         let mailOptions = {
                             from: '"AppCedar Solutions 📲" <support@appcedar.com>', // sender address
                             to: 'AppCedarMailer@gmail.com', // list of receivers //, fgrfsb5xsebpxd2m@ethereal.email
                             subject: params.type+' from '+ params.privatePublic.address +' is NOT yet Paid. ✘', // Subject line
                             //text: 'Hello world?', // plain text body
                             html: '<p>A(n) '+ params.type + ', paying from: '+ params.privatePublic.address +' with receiving address: <b>'+ params.receiver +'</b> failed with error - '+ JSON.stringify(params.error,null,2) +'.</p>\
                             <br>Other stats: '+JSON.stringify(kEEPlIVEdATA,null,2) // html body
                         };

                         // send mail with defined transport object
                         transporter.sendMail(mailOptions, (error, info) => {
                             if (error) {
                                 ///return console.log(error);
                                 console.log(error);
                             }
                             console.log('Message sent: %s', info.messageId);

                             ///////transport.close();//causing crash.
                             con.end();
                             console.log('NOT terminating worker...');
                             ///self.close();
                             // Preview only available when sending through an Ethereal account
                             ///console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                             // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                             // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                         });

                         /*var messages = [...'list of messages'];
                         transporter.on('idle', function(){
                             // send next messages from the pending queue
                             while(transporter.isIdle() && messages.length){
                                 transporter.send(messages.shift());
                             }
                         });*/
                         // verify connection configuration
                     });//nodemailer.create.. - ENd

             });
           /*});*/

         /*});//SELECT result
       });//SELECT*/

        /**************************************
        * ***** data communication starts ***** - ENd
        **************************************/

        return;

      }//ENd if error broadcasting**************************************************
      console.log("published bitcoin: ",body);


     /**************************************
     * ***** data communication starts *****
     **************************************/

     //edit record in dbase
     //let con = connection;  //step aside & watch ol' dead-eye ...


     /*params = { //NOT IN USE*****
       message: "start_bitcoinTransfer",
       lastFeerate: lastFeeratePaid,
       uuid: "F38CD507-ED6E-408E-81D2-37E537EEA777", //"F38CD507-ED6E-408E-81D2-37E537EEA777"
       "privatePublic": privatePublic,
       receiver: privatePublic2.address,
       email: "chiemekailo@yahoo.com",
       app_name: "Fence Calc",
       status: "COMPLETE",  //RUN, STANDBY, COMPLETE, CLOSED
       date: "2018-07-25 17:52:03" //14424038554
     }*/
     ///var select_result;
     /*con.connect(function(err) {
       if (err) throw err;*/
       console.log("Connected! Success part.");
       /*var sql = "SELECT * FROM wp001_tblActionsPending WHERE UUID = '"+ params.uuid +"' AND date = '"+ params.date +"'";
       con.query(sql, function (err, result) {
         if (err) throw err;
         console.log("result: ",JSON.stringify(result[0],null,2));
         select_result = result[0];
         */

         //prepare updates, having existing corresponding data from table.
         params.status = "COMPLETE";  //RUN, STANDBY, COMPLETE, CLOSED
         params.action_required.lastFeerate = kEEPlIVEdATA.fee; //'"'+ kEEPlIVEdATA.fee +'"';
         var action, actionObject = null;
         //actionObject to be populated as next, if needed.
         actionObject = {
           last_success_run: dformatted,
           //last_fail_run:,
           amount: kEEPlIVEdATA.amount/*,
           object_item_title: object_item_value*/
         }
         if((params.action_required === null) && (actionObject === null)){
           console.log('after select 1');
           action = null;
         }else if((params.action_required === null) && (actionObject !== null)){
           console.log('after select 2');
           action = actionObject;
         }else if((params.action_required !== null) && (actionObject === null)){
           console.log('after select 3');
           action = params.action_required;
         }else if((params.action_required !== null) && (actionObject !== null)){
           console.log('after select 4');
           var arr = [];
           for(var k in actionObject) arr.push(k);
           console.log('arr: ',JSON.stringify(arr,null,2));
             console.log('incoming: ',actionObject[arr[0]]);
             console.log('params: ',params.action_required[arr[0]]);
           for (var i = 0; i < arr.length; i++) {
             params.action_required[arr[i]] = actionObject[arr[i]];
           };
           action = params.action_required;
         }
         //params.action_required = action;

         //form the updates..
         var updates = [
           "status='"+ params.status +"'"
         ];
         //add any necessary update
         if(action !== null){
           let temp = ["action_required='"+ JSON.stringify(action) +"'"];
           updates.push(temp);
         }
         //APNs_status=((select_result.APNs_status === null) && (params.APNs_status === null)) ? null : "'"+ params.APNs_status +"'"

         //update record
         /*con.connect(function(err) {  //already in connect callback as @ SELECT above.
           if (err) throw err;*/
           var sql = "UPDATE wp001_tblActionsPending SET "+ updates.join(',') +" WHERE UUID = '"+ params.uuid +"' AND date = '"+ params.date +"'";
           ///console.log('sql (success update): ',sql);
           con.query(sql, function (err, result) {
             if (err) {
               queryFailedFunction({
                 terminatingWorker: (parseInt(params.action_required.amount)/100000000) +' BTC sent.',
                 lastFeerate: params.action_required.lastFeerate,
                 params: params,
                 sql_machine_err: err
               });

                //send value back to global(parent) last feerate.
             }else{
               console.log(result.affectedRows + " record(s) updated");

               console.log('the error: ',params.action_required.error);
                //send value back to global(parent) last feerate.
                self.postMessage({
                  terminatingWorker: (parseInt(params.action_required.amount)/100000000) +' BTC sent.',
                  lastFeerate: params.action_required.lastFeerate,
                  params: params
                });
             }

                  // email time...
                  if(!istosENDsUCCESSeMAIL){
                       con.end();
                       console.log('terminating worker...');
                       self.close();
                       return;
                  }
                   'use strict';
                   // Generate test SMTP service account from ethereal.email
                   // Only needed if you don't have a real mail account for testing
                   nodemailer.createTestAccount((err, account) => {
                       // create reusable transporter object using the default SMTP transport
                       let transporter = nodemailer.createTransport({
                           service: 'gmail',
                           //host: 'smtp.ethereal.email',
                           port: 587,
                           secure: false, // true for 465, false for other ports
                           auth: {
                               user: 'AppCedarMailer@gmail.com', //account.user, // generated ethereal user
                               pass: 'akeemvaldi$3419' //account.pass // generated ethereal password
                           }
                       });

                       // setup email data with unicode symbols
                       let mailOptions = {
                           from: '"AppCedar Solutions 📲" <support@appcedar.com>', // sender address
                           to: 'AppCedarMailer@gmail.com', // list of receivers //, fgrfsb5xsebpxd2m@ethereal.email
                           subject: params.type+' is Paid. ✔', // Subject line
                           //text: 'Hello world?', // plain text body
                           html: '<p>A(n) '+ params.type + ', paying from: '+ params.privatePublic.address +' with receiving address: <b>'+ params.receiver +'</b> has been paid.</p>\
                           <br>Awaiting Confirmations..\
                           <br>Other stats: '+JSON.stringify(kEEPlIVEdATA,null,2) // html body
                       };

                       // send mail with defined transport object
                       transporter.sendMail(mailOptions, (error, info) => {
                           if (error) {
                               ///return console.log(error);
                               console.log(error);
                           }else{
                              console.log('Message sent: %s', info.messageId);
                           }

                           ///////transport.close();//causing crash.
                           con.end();
                           console.log('terminating worker...');
                           self.close();
                           // Preview only available when sending through an Ethereal account
                           ///console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

                           // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
                           // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                       });

                       /*var messages = [...'list of messages'];
                       transporter.on('idle', function(){
                           // send next messages from the pending queue
                           while(transporter.isIdle() && messages.length){
                               transporter.send(messages.shift());
                           }
                       });*/
                       // verify connection configuration
                   });//nodemailer.create.. - ENd

           });
         /*});*/

       /*});//SELECT result
     });//SELECT*/

      /**************************************
      * ***** data communication starts ***** - ENd
      **************************************/

    });

}

/**
 * @param num The number to round
 * @param precision The number of decimal places to preserve
 */
function roundUp(num, precision) {
  precision = Math.pow(10, precision)
  return Math.ceil(num * precision) / precision
}

function  mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; // prepends a backslash to backslash, percent,
                                // and double/single quotes
        }
    });
  }
