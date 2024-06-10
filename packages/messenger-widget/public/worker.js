// service worker to detect any push notification is triggered
self.addEventListener('push', async (event) => {
    const message = await event.data.json();
    const { title, body, image } = message;
    self.registration.showNotification(title, {
        body: body,
        icon: image,
    });
});
