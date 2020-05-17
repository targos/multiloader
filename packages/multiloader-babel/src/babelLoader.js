import babel from '@babel/core';

export default function babelLoader(options = {}) {
  return {
    async transformSource(source, context, defaultTransformSource) {
      const { format } = context;
      if (format === 'module' || format === 'commonjs') {
        const config = await babel.loadPartialConfig(options);
        const { code } = await babel.transformAsync(source, config.options);
        return { source: code };
      }
      return defaultTransformSource(source, context);
    },
  };
}
