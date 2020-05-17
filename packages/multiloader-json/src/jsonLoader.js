export default function jsonLoader() {
  return {
    getFormat(url, context, defaultGetFormat) {
      if (url.endsWith('.json')) {
        return { format: 'json' };
      }
      return defaultGetFormat(url, context);
    },
  };
}
