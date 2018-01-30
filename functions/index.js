const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
let serviceAccount = require("./pwa-vista-gram-key.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwa-vista-gram.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest((request, response) => {
 cors(request, response, () => {
  admin.database().ref('posts').push({
    id: request.body.id,
    title: request.body.title,
    location: request.body.location,
    image: request.body.image
  })
    .then(() => {
      webpush.setVapidDetails('mailto: kianev2@gmail.com',
        'BEto4C2X--75LPeIbkp7P9Rc6xBXgQWW6A-tJSRukqIOn6Gf3GP0L0ea9u5pRjbqvOiHHiHEc13B0qkwHH5NP80',
        'lHEEaNBd7GIs6vJenKvFwWUk9Kzn1sRVw8naGf3-6hE');
      return admin.database().ref('subscriptions').once('value');
    })
    .then((subscriptions) => {
      subscriptions.forEach((sub) => {
        let pushConfig = {
          endpoint: sub.val().endpoint,
          keys: {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }
        };
        webpush.sendNotification(pushConfig, JSON.stringify({
          title: 'New Post',
          content: 'New Post Added',
          openUrl: '/help'
        }))
          .catch(err => {
            console.log(err);
          })
      })
      response.status(201).json({message: 'Data stored', id: request.body.id})
    })
    .catch(err => {
     response.status(500).json({error: err})
    })
 });
});
