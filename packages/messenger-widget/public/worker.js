// service worker to detect any push notification is triggered
this.addEventListener('push', async (event) => {
    // data sent in the push notification
    const message = await event.data.json();
    let { title, body, image } = message;
    console.log({ message });
    await event.waitUntil(
        this.registration.showNotification(title, {
            body: body,
            icon: image,
            duration: 4000,
        }),
    );
});
