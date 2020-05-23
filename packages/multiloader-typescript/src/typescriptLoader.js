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
          fileName: context.url,
          compilerOptions: {
            inlineSourceMap: true,
            module: TypeScript.ModuleKind.ES2015,
            target: TypeScript.ScriptTarget.ES2019,
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

const toPatch = [
  {
    pattern: /std[^/]*\/http\/server\.ts$/,
    exports: ['Response', 'HTTPOptions', 'HTTPSOptions'],
  },
  {
    pattern: /std[^/]*\/encoding\/_yaml\/parse\.ts$/,
    exports: ['ParseOptions'],
  },
  {
    pattern: /std[^/]*\/encoding\/_yaml\/stringify\.ts$/,
    exports: ['DumpOptions'],
  },
  {
    pattern: /std[^/]*\/encoding\/_yaml\/schema\.ts$/,
    exports: ['SchemaDefinition'],
  },
  {
    pattern: /std[^/]*\/encoding\/_yaml\/type\.ts$/,
    exports: ['StyleVariant'],
  },
];

function patch(context, source) {
  for (const { pattern, exports } of toPatch) {
    if (pattern.test(context.url)) {
      return addExports(source, exports);
    }
  }
  return source;
}

function addExports(source, exports) {
  return [source]
    .concat(exports.map((exp) => `export const ${exp} = null;`))
    .join('\n');
}
