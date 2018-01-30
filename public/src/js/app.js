
let deferredPrompt;
let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function () {
      console.log('Service worker registered!');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification () {
  if('serviceWorker' in navigator) {
    let options = {
      body: 'You successfully subscribed to our notification service.',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US', //BCP 47
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        {action: 'confirm', title: 'Okay', icon: '/src/images/icons/ok-icon.png'},
        {action: 'cancel', title: 'Cancel', icon: '/src/images/icons/cancel-icon.png'}
      ]
    };
    navigator.serviceWorker.ready
      .then(swreg => {
        swreg.showNotification('Successfully subscribed', options);
      });
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  let reg;
  navigator.serviceWorker.ready
    .then((swreg) => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then((sub) => {
      if (sub === null) {
        // Create a new subscription
        let vapidPublicKey = 'BEto4C2X--75LPeIbkp7P9Rc6xBXgQWW6A-tJSRukqIOn6Gf3GP0L0ea9u5pRjbqvOiHHiHEc13B0qkwHH5NP80';
        let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        // We have a subscription
      }
    })
    .then((newSub) => {
      return fetch('https://pwa-vista-gram.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then((res) => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function askForNotificationPermission () {
  Notification.requestPermission((reesult) => {
    console.log('user choice' ,reesult);
    if(reesult !== 'granted'){
      console.log('No notification permission granted');
    } else {
      //hide the button
      //displayConfirmNotification();
      configurePushSub();
    }
  })
}

if('Notification' in window && 'serviceWorker' in navigator) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission)
  }
}