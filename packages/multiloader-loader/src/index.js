const resolveHooks = {
  name: 'resolve',
  hooks: [],
};

const getFormatHooks = {
  name: 'getFormat',
  hooks: [],
};

const getSourceHooks = {
  name: 'getSource',
  hooks: [],
};

const transformSourceHooks = {
  name: 'transformSource',
  hooks: [],
};

const hooks = [
  resolveHooks,
  getFormatHooks,
  getSourceHooks,
  transformSourceHooks,
];

export default function configureLoader(...loaders) {
  for (const loader of loaders) {
    for (const hook of hooks) {
      if (loader[hook.name]) {
        hook.hooks.push(loader[hook.name]);
      }
    }
  }
}

export async function resolve(specifier, context, defaultResolve, index = 0) {
  if (resolveHooks.hooks[index]) {
    return resolveHooks.hooks[index](specifier, context, (s, c, d) =>
      resolve(s, c, defaultResolve, index + 1),
    );
  }
  return defaultResolve(specifier, context, defaultResolve);
}

export async function getFormat(
  specifier,
  context,
  defaultGetFormat,
  index = 0,
) {
  if (getFormatHooks.hooks[index]) {
    return getFormatHooks.hooks[index](specifier, context, (s, c, d) =>
      getFormat(s, c, defaultGetFormat, index + 1),
    );
  }
  return defaultGetFormat(specifier, context, defaultGetFormat);
}

export async function getSource(
  specifier,
  context,
  defaultGetSource,
  index = 0,
) {
  if (getSourceHooks.hooks[index]) {
    return getSourceHooks.hooks[index](specifier, context, (s, c, d) =>
      getSource(s, c, defaultGetSource, index + 1),
    );
  }
  return defaultGetSource(specifier, context, defaultGetSource);
}

export async function transformSource(
  specifier,
  context,
  defaultTransformSource,
  index = 0,
) {
  if (transformSourceHooks.hooks[index]) {
    return transformSourceHooks.hooks[index](specifier, context, (s, c, d) =>
      transformSource(s, c, defaultTransformSource, index + 1),
    );
  }
  return defaultTransformSource(specifier, context, defaultTransformSource);
}
