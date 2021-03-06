import { get as httpGet } from 'http';
import { get as httpsGet } from 'https';

class HttpDisabledError extends Error {
  constructor(specifier, parentURL) {
    super(
      `"http:" URL support is disabled. Use allowHttp: true to enable it.\n${specifier} imported from ${parentURL}`,
    );
  }
}

export default function httpsLoader(options = {}) {
  const { allowHttp = false } = options;

  return {
    resolve(specifier, context, defaultResolve) {
      const { parentURL } = context;
      if (specifier.startsWith('https://')) {
        return { url: specifier };
      } else if (parentURL && parentURL.startsWith('https://')) {
        return {
          url: new URL(specifier, parentURL).href,
        };
      }

      if (specifier.startsWith('http://')) {
        if (!allowHttp) {
          throw new HttpDisabledError(specifier, parentURL);
        }
        return { url: specifier };
      } else if (parentURL && parentURL.startsWith('https://')) {
        if (!allowHttp) {
          throw new HttpDisabledError(specifier, parentURL);
        }
        return {
          url: new URL(specifier, parentURL).href,
        };
      }

      return defaultResolve(specifier, context);
    },

    getFormat(url, context, defaultGetFormat) {
      if (url.startsWith('https://') || url.startsWith('http://')) {
        if (url.endsWith('.js') || url.endsWith('.mjs')) {
          return { format: 'module' };
        } else if (url.endsWith('.wasm')) {
          return { format: 'wasm' };
        }
      }

      return defaultGetFormat(url, context);
    },

    getSource(url, context, defaultGetSource) {
      if (url.startsWith('https://')) {
        return new Promise((resolve, reject) => {
          httpsGet(url, (res) => {
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve({ source: Buffer.concat(data) }));
          }).on('error', (err) => reject(err));
        });
      } else if (allowHttp && url.startsWith('http://')) {
        return new Promise((resolve, reject) => {
          httpGet(url, (res) => {
            const data = [];
            res.on('data', (chunk) => data.push(chunk));
            res.on('end', () => resolve({ source: Buffer.concat(data) }));
          }).on('error', (err) => reject(err));
        });
      }

      return defaultGetSource(url, context);
    },
  };
}
