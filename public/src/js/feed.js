let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  // setTimeout(() => {
    createPostArea.style.transform = 'translateY(0)';
  // }, 1);
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
  //ungegistering serviceWorker
 /* if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        for (let i = 0; i < registrations.length; i++) {
          registrations[i].unregister();
        }
      })
  }*/
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  //createPostArea.style.display = 'none';
}

//not active, but offers save cache on demand
function onSaveButton (event) {
  if('caches' in window) {
    caches.open('user-requested')
      .then(cache => {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards () {
  while (sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url('+ data.image +')';
  cardTitle.style.backgroundSize = 'cover';
  //cardTitle.style.height = '200px';
  cardWrapper.appendChild(cardTitle);
  let cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  let cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // let cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.className = 'mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent';
  // cardSaveButton.addEventListener('click', onSaveButton);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI (data) {
  clearCards();
  for (let i = 0; i < data.length; i++) {
  createCard(data[i]);
  }
}

let url = 'https://pwa-vista-gram.firebaseio.com/posts.json';
let networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    let dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if('indexedDB' in window) {
    readAllData('posts')
      .then(data => {
        if(!networkDataReceived){
          console.log('From cache', data);
          updateUI(data);
        }
      });
  }

  function sendData () {
    fetch('https://us-central1-pwa-vista-gram.cloudfunctions.net/storePostData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image: 'https://firebasestorage.googleapis.com/v0/b/pwa-vista-gram.appspot.com/o/london.jpg?alt=media&token=2fe911c4-ea15-47b3-9c80-8b3fee8865d4'
      })
    })
      .then(res => {
        console.log('Sent data', res);
        updateUI();
      })
  }
  
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if(titleInput.value.trim() === '' || locationInput.value.trim() === ''){
      alert('Please enter valid data');
      return;
    }

    closeCreatePostModal();

    if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
          .then(sw => {
            let post = {
              id: new Date().toISOString(),
              title: titleInput.value,
              location: locationInput.value
            }
            writeData('sync-posts', post)
              .then(() => {
                return sw.sync.register('sync-new-posts');
              })
              .then(() => {
                let snackbarContainer = document.querySelector('#confirmation-toast');
                let data = {message: 'Your post was saved for syncing'};
                snackbarContainer.MaterialSnackbar.showSnackbar(data);
              })
              .catch(err => {
                console.log(err);
              });
          });
    } else {
      sendData();
    }
  })


