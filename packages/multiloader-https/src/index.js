import { get } from 'https';

export default function httpsLoader() {
  return {
    resolve(specifier, context, defaultResolve) {
      const { parentURL = null } = context;

      if (specifier.startsWith('https://')) {
        return {
          url: specifier,
        };
      } else if (parentURL && parentURL.startsWith('https://')) {
        return {
          url: new URL(specifier, parentURL).href,
        };
      }

      return defaultResolve(specifier, context, defaultResolve);
    },

    getFormat(url, context, defaultGetFormat) {
      if (url.startsWith('https://')) {
        return {
          format: 'module',
        };
      }

      return defaultGetFormat(url, context, defaultGetFormat);
    },

    getSource(url, context, defaultGetSource) {
      if (url.startsWith('https://')) {
        console.log(url);
        return new Promise((resolve, reject) => {
          get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => resolve({ source: data }));
          }).on('error', (err) => reject(err));
        });
      }

      // Let Node.js handle all other URLs.
      return defaultGetSource(url, context, defaultGetSource);
    },
  };
}
