import logo from './assets/images/dm3.svg';

// service worker to detect any push notification is triggered
self.addEventListener('push', (ev) => {
    // data sent in the push notification
    const data = ev.data.json();
    console.log('Push notification : ', data);

    // sends notification on browser
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: logo,
        duration: 4000,
    });
});
