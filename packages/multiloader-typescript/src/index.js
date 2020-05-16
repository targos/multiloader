import TypeScript from 'typescript';

export default function typescriptLoader() {
  return {
    transformSource(source, context, defaultTransformSource) {
      const { url, format } = context;

      if (url.endsWith('.ts') && format === 'module') {
        return {
          source: TypeScript.transpileModule(source, {
            compilerOptions: {
              module: TypeScript.ModuleKind.ES2015,
            },
          }).outputText,
        };
      }

      return defaultTransformSource(source, context, defaultTransformSource);
    },
  };
}
