
var https = require("https");
const request = require('request'); //npm install request --save
const mysql = require('mysql'); //npm install mysql --save
const nodemailer = require('nodemailer'); //npm install nodemailer --save

const translate = require('google-translate-api');

self.addEventListener('message', function(e) {
  self.postMessage('now in from worker: ', self.name);
  console.log('worker: '+JSON.stringify(e.data,null,2));

  let langAsync = async () => {

              //let's translate
              if(e.data.sentences.sentences == null){
                //terminating things... ON ERROR.
                self.postMessage({terminatingWorker: "Worker initiate failed."});

                console.log('terminating worker...');
                self.close();
              }else{

                var translations = [];
                let sentences = e.data.sentences.sentences;
                for (var i = 0; i < sentences.length; i++) {
                  let sentence = sentences[i];

                  let res = await translate(sentence, {from: 'en', to: e.data.sentences.language})
                  /*.then(res => {
                  })*/
                  .catch(err => {
                    //terminating things... ON ERROR.
                    self.postMessage({terminatingWorker: "translation failed: "+err});

                    console.log('terminating worker...');
                    self.close();
                  });
                  //use res Here.
                  translations.push(res);
                }

                  //success ENd
                  //send value back to global(parent) last feerate.
                  self.postMessage({
                    translations: translations,
                    workerIsFinished: true
                  });
                  
                  console.log('terminating worker...');
                  self.close();
              }

  }
  langAsync();

}, false);
