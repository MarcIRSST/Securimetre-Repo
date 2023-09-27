importScripts(
    '/dist/workbox/workbox-v6.5.4/workbox-sw.js'	
);
const {setCatchHandler, registerRoute, setDefaultHandler} = workbox.routing;
const {strategies} = workbox;
const {precacheAndRoute, matchPrecache} = workbox.precaching;
const {cacheNames} = workbox.core;

precacheAndRoute([{"revision":"ffb2addbc9ad15325898a54a4ea2fe50","url":"dist/compiled/main.js"},{"revision":"47c5dd18ee27f4f381a3e7c6c5e7181a","url":"dist/compiled/main.min.css"},{"revision":"2bb0292348303cdacf00b312ad29fcb4","url":"dist/compiled/wysiwyg.min.css"},{"revision":"7c86de9fa6d0aa038243f436f13f3660","url":"favicon.ico"},{"revision":"2f911b19484c0f8cc4a75ab45129a5e7","url":"offline.html"}]);

const cacheName = cacheNames.runtime;

const urlArr = [
    '/fr/app',
    '/en/app',
    '/_app/resources'
];

const manifestURLs = urlArr.map((entry) => {
    // Create a full, absolute URL to make routing easier.
    const url = new URL(entry, self.location);
    return new Request(url.href);
});

self.addEventListener('install', (event) => {

    // const cache = await caches.open(cacheName);
    const populateCache = async () => {
        caches.open(cacheName).then((cache) => cache.addAll(manifestURLs))
    };

    event.waitUntil(populateCache());
});

for (const url of urlArr) {
    registerRoute(
        // new RegExp('/fr'),
        (new URL(url, self.location)).href,
        new strategies.NetworkFirst({cacheName, matchOptions : {
                ignoreVary: true
            }})
    );
}

registerRoute(
    new RegExp('/admin'),
    new strategies.NetworkOnly()
);

registerRoute(
    new RegExp('/admin/*'),
    new strategies.NetworkOnly()
);

setCatchHandler(async ({ url, request, event }) => {
    console.log(event)

    // Return the precached offline page if a document is being requested
    if (event.request.destination === 'document') {
        return matchPrecache('/');
    }

    return Response.error();
});
