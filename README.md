# multiloader

Easily install, configure and compose Node.js ESM loaders.

## Warning

This module is experimental and the API is definitely going to change.  
Feel free to play with it and give feedback but don't use it in production :).

## Getting started

Start by installing the orchestrator:

```console
npm install @multiloader/loader
```

Then create a file in your project. This will be the entrypoint of your custom
loader:

```console
touch loader.mjs
```

Start with the following piece of code. It creates a loader that does nothing:

```js
export * from '@multiloader/loader';
import configureLoader from '@multiloader/loader';

configureLoader();
```

Then install and add all the loaders that you need. We'll use the https loader as an example.

Install the additional loader:

```console
npm install @multiloader/https
```

Edit `loader.mjs`:

```diff
 export * from '@multiloader/loader';
 import configureLoader from '@multiloader/loader';
+import https from '@multiloader/https';

-configureLoader();
+configureLoader(https());
```

That's it! You can now import modules from "https:" URLs.
