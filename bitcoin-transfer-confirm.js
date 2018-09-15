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

/*//AKM-finish-off***** - change receivers to -> 14s7wouBVEDGnDk8hhTzKUMhZurVjtpUwe (Donate) & 15DWHkYYHTMYsKyASSnr7ZrzuvMtbvzGqd (InApp Purchase)
const bitcoin_dONATEpRIVpUB = null; //my public wallet address
const bitcoin_dONATErECEIVER = "myYS1PXqePfxF1V8xvhBrkzs47TZaLkwTG";
const bitcoin_InAppPURCHASEpRIVpUB = null;
const bitcoin_InAppPURCHASErECEIVER = null;*/
var params = null;
let kEEPlIVEdATA = null;  //for messaging and possible inclusion into server variables.

const istosENDsUCCESSeMAIL = true;
const istosENDfAILUREeMAIL = true;
const pRIORITYlIMIT = 0;

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

var scooped_action_required = [];
var transaction_amounts = [];


///////const TestNet = bitcoin.networks.testnet; //AKM-finish-off***** - comment out after test DONE


self.addEventListener('message', function(e) {
  self.postMessage('returned message from worker');
  console.log('worker: '+JSON.stringify(e.data,null,2));

    let addresses = e.data.addresses.chosen_addresses;
    var complete_jsons = [];
    var incomplete_jsons = [];
    let globalVars = e.data.global.params;
    var redeemed_jsons = [];

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
      //var sql = "SELECT status, action_required FROM wp001_tblActionsPending WHERE UUID = '"+ params.uuid +"' AND action_required = '"+ params.date +"'";
      /*
      SELECT * FROM mytable
      WHERE column1 LIKE '%word1%'
        AND column1 LIKE '%word2%'
        AND column1 LIKE '%word3%'
      */

      let forAsync = async () => {

        console.log('address count: ',addresses.length);

          for (var i = 0; i < addresses.length; i++) {
            let address = addresses[i];

            var sql = "SELECT status, action_required FROM wp001_tblActionsPending WHERE UUID = '"+ address.uuid +"' \
            AND action_required LIKE '%"+ address.address +"%'";
            ///console.log('sql select: ',sql);
            //address here is whole json set
            let res = await selectAwait(con, sql, address, complete_jsons, incomplete_jsons)
            .catch((error) => {
                queryFailedFunction(error);
                /***** in the above;
                error === {
                  sql_machine_err: err  //err === thrown error.
                }
                *                *****/
            });

            complete_jsons = res.complete_jsons;
            incomplete_jsons = res.incomplete_jsons;

          }//for..
          ///console.log('got to last_complete (sql): ',JSON.stringify(complete_jsons,null,2));

          //check the global server variable..
          /*var keys = [];
          for(var k in incomplete_jsons) keys.push(k);*/
          for (var i = 0; i < globalVars.length; i++) {
            let globalVar = globalVars[i];

            for (var j = 0; j < incomplete_jsons.length; j++) {
              let json = incomplete_jsons[j];
              if(json.address === globalVar.privatePublic.address){
                if(globalVar.status === "COMPLETE"){
                  //finalize only complete amounts
                  json["amount"] = globalVar.action_required.amount;
                  transaction_amounts.push({
                    address: globalVar.privatePublic.address,
                    amount: globalVar.action_required.amount
                  });
                  complete_jsons.push(json);
                  redeemed_jsons.push(json);
                  incomplete_jsons.splice(j, 1);
                }
              }
            }//for j
          }//for i
          ///console.log('got to last_complete (global): ',JSON.stringify(complete_jsons,null,2));

          /*  ********************************************
          * *********** Do Not adjust here **************/
          var ignoreBlockchain = false; //check blockchain.
          /* ********************************************/


          /*  *********************************
                  *** Adjust Here ***
            are we gonna check the blockchain ?
          * ********************************** //add slash under the question mark for ignore.
            ignoreBlockchain = true;
          /* *********************************/


          //***** CHECK THE BLOCKCHAIN ***** ...thorough.
          if(!ignoreBlockchain){

            for (var k = 0; k < incomplete_jsons.length; k++) {
              var redeem = incomplete_jsons[k];
              //address here is pure address json set
              let amount = await blockchainTransactionAwait(redeem.address)
              .catch((error) => {
                  //send value back to global(parent) last feerate.
                  self.postMessage({ //AKM-finish-off***** - send back existing is proper.
                    complete_jsons: complete_jsons,
                    redeemed_jsons: redeemed_jsons
                  });
                  console.log('blockchain query failed: ',error);

                  queryFailedFunction(error);
                  /***** in the above;
                  error === {
                    blockchain_machine_err: err  //err === thrown error.
                  }
                  *                *****/
              });

              if((amount !== undefined) && (amount.hasOwnProperty('amount'))){
                if(parseFloat(amount.amount) > 0){
                  var ajson = redeem;
                  ajson["amount"] = amount.amount;
                  complete_jsons.push(ajson);
                  redeemed_jsons.push(ajson);
                  incomplete_jsons.splice(k, 1);
                  //finalize only complete amounts
                  transaction_amounts.push({
                    address: redeem.address,
                    amount: amount.amount
                  });
                }
              }
            }//for - ENd

          }//if(!ignoreBlockchain) - ENd

          console.log('got to last_complete: ',JSON.stringify(complete_jsons,null,2));
          console.log('got to last_redeemed: ',JSON.stringify(redeemed_jsons,null,2));
          console.log('got to last_incomplete: ',JSON.stringify(incomplete_jsons,null,2));

          /*****************************************************
          * ALLOW ALL FINALIZATIONS TO BE DONE BY bitcoin-transfer.js
          * workers.
          *****************************************************
          //update database..
          for (var k = 0; k < complete_jsons.length; k++) {
            let update = complete_jsons[k];
            let sendItem = await updateAwait(con, update.address)
            .catch((error) => {
                queryFailedFunction(error);
                /***** in the above;
                error === {
                  sql_machine_err: err  //err === thrown error.
                }
                *                *****
            });
          }
          ******************************************************/

          //send value back to global(parent) last feerate.
          self.postMessage({ //AKM-finish-off***** - send back proper
            complete_jsons: complete_jsons,
            redeemed_jsons: redeemed_jsons,
            workerIsFinished: true
          });//, [con]);

          //end things..., can't try .close() because it may run before postMessage ends.
          con.end();

          /*******************************
          //MOVED TO CALLING SERVER.******
          //end things...
          con.end();
          console.log('terminating worker...');
          self.close();
          /*******************************/
      };
      forAsync();


    });

    /***************************************
    * ********* data fetch starts ********** - ENd
    ***************************************/

}, false);



function selectAwait(con, sql, address, complete_jsons, incomplete_jsons){
//address here is whole json set

  return new Promise((resolve, reject) => {
    con.query(sql, function (err, result) { //let res = await
      if (err) {
        reject({
            sql_machine_err: err
        });
      }else{
        //console.log(result.affectedRows + " record(s) updated");

                    let res = result;
                    console.log('res count: ',res.length);

                    for (var i = 0; i < res.length; i++) {
                      select_result = res[i];
                      console.log('list all dbase status: ',select_result["status"]);
                      scooped_action_required.push(JSON.parse(select_result["action_required"]));
                      if((select_result["status"] === 'COMPLETE') && (JSON.parse(select_result["action_required"]).output_as_input.address === address.address)){  //AKM-finish-off***** - change back RUN to COMPLETE - COMPLETE.
                        ///console.log('amount at select: ',JSON.parse(select_result["action_required"]).amount);
                        var ajson = address;
                        ajson["amount"] = JSON.parse(select_result["action_required"]).amount;
                        complete_jsons.push(ajson);
                      }else{
                        incomplete_jsons.push(address);
                      }
                    }
                    //console.log('complete (select): ',JSON.stringify(complete_jsons,null,2));
                    //console.log('incomplete (select): ',JSON.stringify(incomplete_jsons,null,2));
                    resolve({
                      complete_jsons: complete_jsons,
                      incomplete_jsons: incomplete_jsons
                    });


      }
    });//sql - ENd
  });//promise - ENd

}


function blockchainTransactionAwait(address){
//address here is pure address json set
  return new Promise((resolve, reject) => {
    request('https://blockexplorer.com/api/txs/?address='+ address, {json:true}, function(err,httpResponse,body){ //AKM-finish-off***** - remove testnet - REMOVED.
    ///request('https://testnet.blockexplorer.com/api/txs/?address='+ address, {json:true}, function(err,httpResponse,body){ //AKM-finish-off***** - remove testnet.
      console.log('worker - inside request');
      if (err) {
        reject({
            blockchain_machine_err: err
        });//return console.log('error: ',err);
      }
      ///console.log('Transactions: ',JSON.stringify(body,null,2));


          let tranX = [];
          if((body !== undefined) && (tranX.constructor === Array)){
            tranX = body.txs;
            ///console.log('here: ',JSON.stringify(tranX,null,2));
            if(tranX === undefined){
              reject({
                  blockchain_machine_err: err
              });//nothing to continue working for now..
              return;
            }
          }else{
            reject({
                blockchain_machine_err: err
            });//nothing to continue working for now..
            return;
          }

          //console.log("tranX: ",JSON.stringify(body,null,2));
          ///bitcoinJSxaction(privatePublic, privatePublic2.address,"5171f2c339537d616615e192f99508d9d0ff7db26c582da7a7e24e5b9b0b6cbf");//4f05aa07cad8b3dbb478555c573bd01d9d516927f993e95736b1620c197053db
          ///return;

          //extract transaction if available.
          //if(JSON.parse(body).tranxs > 0){  //before, working with php on server
          if(tranX.length > 0){
            var UTXOs=[], STXOs=[], priority, priority_cut_off=(144/250)*100000000, totalValue=0, sum_vinXage=0, transaction_size;

            for (var i = 0; i < tranX.length; i++) {
              let transaction = tranX[i];
              ///console.log(transactions);
              let vins = [];
              vins = transaction.vin;
              let vouts = [];
              vouts = transaction.vout;
              for (var j = 0; j < vins.length; j++) {
                let stxi = vins[j];
                let utxo = vouts[j];
                if(stxi.addr === address){
                ///if(utxo.scriptPubKey.addresses[0] === address) {

              /*      console.log('is an Object: ',utxo.spentTxId);
      if(utxo.spentTxId === null){
        console.log('is an Object');
      }else if(utxo.spentTxId === "null"){
        console.log('is string Object');
      }else if(utxo.spentTxId === null){
        console.log('is string Object');
      }
                    console.log('is an Object: ',utxo.spentTxId);
      //return;*/

                  if(parseInt(utxo.value*100000000) > 0) { //formerly stxi.valueSat, giving all plus fee.
                  ///if(utxo.spentTxId === null) {
                    if(parseInt(transaction.confirmations) > 0){
                      totalValue = totalValue + parseFloat(utxo.value); //formerly stxi.value, giving all plus fee.
                    }
                    ///sum_vinXage = sum_vinXage + ((parseFloat(utxo.value) * 100000000) * parseInt(transaction.confirmations)); //for priority checks
                    //console.log('sum: ',sum_vinXage,'; total: ',totalValue);
                    ///UTXOs.push({transactionId: transaction.txid, index: utxo.n, value: utxo.value});
                  }else{
                    ///STXOs.push({transactionId: transaction.txid, index: utxo.n, value: utxo.value});
                  }
                }
              }//for j

            }//for i

            ///console.log('amount at blockchain: ',totalValue);
            resolve({
              amount: totalValue
            });
          }else{//if (tranX - ENd
            resolve({
              amount: 0.0
            });
          }

      /*resolve({
        complete_jsons: complete_jsons,
        incomplete_jsons: incomplete_jsons
      });*/

    });//request - ENd
  });//promise -ENd
}


function updateAwait(con, address){

  return new Promise((resolve, reject) => {

          //go from global server variable to specific params.
          for (var i = 0; i < globalVars.length; i++) {
            let globalVar = globalVars[i];

            if(address === globalVar.privatePublic.address){
              params = globalVar;
              break;
            }
          }//for i

          if(params === null){
            //go from scooped server variable to specific params key.
            for (var i = 0; i < scooped_action_required.length; i++) {
              let scooped = scooped_action_required[i];

              if(address === scooped.privatePublic.address){
                params = {};
                params["status"] = "RUN",  //RUN, STANDBY, COMPLETE, CLOSED
                params["action_required"] = scooped;
                break;
              }
            }//for i
          }

          if(params === null) {
            resolve('could not initialize params');
          }

          //go from scooped amounts to specific params key.
          var final_amount = 0;
          for (var i = 0; i < transaction_amounts.length; i++) {
            let scooped_amount = transaction_amounts[i];

            if(address === scooped_amount.address){
              final_amount = scooped_amount.amount;
              break;
            }
          }//for i

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

             //prepare updates, having existing corresponding data from table.
             params.status = "COMPLETE";  //RUN, STANDBY, COMPLETE, CLOSED
             ///params.action_required.lastFeerate = kEEPlIVEdATA.fee; //'"'+ kEEPlIVEdATA.fee +'"';
             var action, actionObject = null;
             //actionObject to be populated as next, if needed.
             actionObject = {
               last_success_run: dformatted,
               //last_fail_run:,
               amount: final_amount/*,
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
               var sql = "UPDATE wp001_tblActionsPending SET "+ updates.join(',') +" WHERE UUID = '"+ params.uuid +"'\
                AND action_required LIKE '%"+ address +"%'";
              /*  AND date = '"+ params.date +"'";*/

    con.query(sql, function (err, result) { //let res = await
      if (err) {
        reject({
            sql_machine_err: err
        });
      }else{
        console.log(result.affectedRows + " record(s) updated");
        resolve('sent');
      }
    });//sql - ENd
  });//promise - ENd

}
