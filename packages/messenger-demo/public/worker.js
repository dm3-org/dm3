// service worker to detect any push notification is triggered
// eslint-disable-next-line no-restricted-globals
self.addEventListener('push', async (event) => {
    const message = await event.data.json();
    const { title, body, image } = message;
    // eslint-disable-next-line no-restricted-globals
    self.registration.showNotification(title, {
        body: body,
        icon: image,
    });
});
