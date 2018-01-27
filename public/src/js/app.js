let defferedPrompt;

if(!window.Promise) {
  window.Promise = Promise;
}

// checking if the browser supports serviceWorker
if ('serviceWorker' in navigator) {
   navigator.serviceWorker
     .register('/sw.js')
     .then(() => {
       console.log('service worker registered');
     })
     .catch(err => {
       console.log(err);
     });
}

window.addEventListener('beforeinstallprompt', function (event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  defferedPrompt = event;
  return false;
});

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    //resolve('This is executed once the timer is done');
    reject({code: 500, message: 'An error occured'})
    //console.log('This is executed once the timer is done');
  }, 3000);
});

let xhr = new XMLHttpRequest();
xhr.open('GET', 'http://httpbin.org/ip');
xhr.responseType = 'json';

xhr.onload = function () {
  console.log(xhr.response);
}

xhr.onerror = function () {
  console.log('Error')
}

xhr.send();

fetch('http://httpbin.org/ip')
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });

fetch('http://httpbin.org/post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  mode: 'cors',
  body: JSON.stringify({message: 'Does this work?'})
})
  .then(response => {
    return response.json();
  })
  .then(data => {
    console.log(data);
  })
  .catch(err => {
    console.log(err);
  });

 promise.then((text) => {
   return text;
 }).then((newText) => {
   console.log(newText);
 }).catch(err => {
   console.log(err);
 });

console.log('This is executed after SetTimeout');