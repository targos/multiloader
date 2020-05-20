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
        const transpiled = TypeScript.transpileModule(source, {
          compilerOptions: {
            module: TypeScript.ModuleKind.ES2015,
          },
        });
        return {
          source: patch(context, transpiled.outputText),
        };
      }
      return defaultTransformSource(source, context);
    },
  };
}

const httpServer = /^https:\/\/deno.land\/std[^/]*\/http\/server\.ts$/;

function patch(context, source) {
  if (context.url.match(httpServer)) {
    return addExports(source, ['Response', 'HTTPOptions', 'HTTPSOptions']);
  } else {
    return source;
  }
}

function addExports(source, exports) {
  return [source]
    .concat(exports.map((exp) => `export const ${exp} = null;`))
    .join('\n');
}
