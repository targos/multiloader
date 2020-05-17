import TypeScript from 'typescript';

export default function typescriptLoader() {
  return {
    getFormat(url, context, defaultGetFormat) {
      if (url.endsWith('.ts')) {
        return { format: 'module' };
      }
      return defaultGetFormat(url, context);
    },

    transformSource(source, context, defaultTransformSource) {
      const { url } = context;
      if (url.endsWith('.ts')) {
        return {
          source: TypeScript.transpileModule(source, {
            compilerOptions: {
              module: TypeScript.ModuleKind.ES2015,
            },
          }).outputText,
        };
      }
      return defaultTransformSource(source, context);
    },
  };
}
