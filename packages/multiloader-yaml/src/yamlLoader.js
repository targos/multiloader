import yaml from 'yaml';

export default function yamlLoader() {
  return {
    getFormat(url, context, defaultGetFormat) {
      if (url.endsWith('.yml') || url.endsWith('.yaml')) {
        return { format: 'json' };
      }
      return defaultGetFormat(url, context);
    },

    transformSource(source, context, defaultTransformSource) {
      const { url } = context;
      if (url.endsWith('.yml') || url.endsWith('.yaml')) {
        return {
          source: JSON.stringify(yaml.parse(source)),
        };
      }
      return defaultTransformSource(source, context);
    },
  };
}
