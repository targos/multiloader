/*

Adapted from https://raw.githubusercontent.com/denoland/deno/master/cli/js/web/console.ts

MIT License

Copyright (c) 2018-2020 the Deno authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

'use strict';

const {
  stripColor,
  yellow,
  dim,
  cyan,
  red,
  green,
  magenta,
  bold,
} = require('./nodeno.colors.js');

function isTypedArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function isInvalidDate(x) {
  return isNaN(x.getTime());
}

const DEFAULT_INDENT = '  '; // Default indent string

const DEFAULT_MAX_DEPTH = 4; // Default depth of logging nested objects
const LINE_BREAKING_LENGTH = 80;
const MAX_ITERABLE_LENGTH = 100;
const MIN_GROUP_LENGTH = 6;
const STR_ABBREVIATE_SIZE = 100;

const PROMISE_STRING_BASE_LENGTH = 12;

const customInspect = Symbol('Deno.symbols.customInspect');

function inspect(value, { depth = DEFAULT_MAX_DEPTH } = {}) {
  if (typeof value === 'string') {
    return value;
  } else {
    return stringify(value, new Set(), 0, depth);
  }
}

function stringify(value, ctx, level, maxLevel) {
  switch (typeof value) {
    case 'string':
      return value;
    case 'number': // Numbers are yellow
      // Special handling of -0
      return yellow(Object.is(value, -0) ? '-0' : `${value}`);
    case 'boolean': // booleans are yellow
      return yellow(String(value));
    case 'undefined': // undefined is dim
      return dim(String(value));
    case 'symbol': // Symbols are green
      return green(String(value));
    case 'bigint': // Bigints are yellow
      return yellow(`${value}n`);
    case 'function': // Function string is cyan
      return cyan(createFunctionString(value, ctx));
    case 'object': // null is bold
      if (value === null) {
        return bold('null');
      }

      if (ctx.has(value)) {
        // Circular string is cyan
        return cyan('[Circular]');
      }

      return createObjectString(value, ctx, level, maxLevel);
    default:
      // Not implemented is red
      return red('[Not Implemented]');
  }
}

function createFunctionString(value, _ctx) {
  // Might be Function/AsyncFunction/GeneratorFunction
  const cstrName = Object.getPrototypeOf(value).constructor.name;
  if (value.name && value.name !== 'anonymous') {
    // from MDN spec
    return `[${cstrName}: ${value.name}]`;
  }
  return `[${cstrName}]`;
}

function createObjectString(value, ...args) {
  if (customInspect in value && typeof value[customInspect] === 'function') {
    try {
      return String(value[customInspect]());
    } catch {}
  }
  if (value instanceof Error) {
    return String(value.stack);
  } else if (Array.isArray(value)) {
    return createArrayString(value, ...args);
  } else if (value instanceof Number) {
    return createNumberWrapperString(value);
  } else if (value instanceof Boolean) {
    return createBooleanWrapperString(value);
  } else if (value instanceof String) {
    return createStringWrapperString(value);
  } else if (value instanceof Promise) {
    return createPromiseString(value, ...args);
  } else if (value instanceof RegExp) {
    return createRegExpString(value);
  } else if (value instanceof Date) {
    return createDateString(value);
  } else if (value instanceof Set) {
    return createSetString(value, ...args);
  } else if (value instanceof Map) {
    return createMapString(value, ...args);
  } else if (value instanceof WeakSet) {
    return createWeakSetString();
  } else if (value instanceof WeakMap) {
    return createWeakMapString();
  } else if (isTypedArray(value)) {
    return createTypedArrayString(
      Object.getPrototypeOf(value).constructor.name,
      value,
      ...args,
    );
  } else {
    // Otherwise, default object formatting
    return createRawObjectString(value, ...args);
  }
}

function createArrayString(value, ctx, level, maxLevel) {
  const printConfig = {
    typeName: 'Array',
    displayName: '',
    delims: ['[', ']'],
    entryHandler: (entry, ctx, level, maxLevel, next) => {
      const [index, val] = entry;
      let i = index;
      if (!value.hasOwnProperty(i)) {
        i++;
        while (!value.hasOwnProperty(i) && i < value.length) {
          next();
          i++;
        }
        const emptyItems = i - index;
        const ending = emptyItems > 1 ? 's' : '';
        return dim(`<${emptyItems} empty item${ending}>`);
      } else {
        return stringifyWithQuotes(val, ctx, level + 1, maxLevel);
      }
    },
    group: true,
  };
  return createIterableString(value, ctx, level, maxLevel, printConfig);
}

function createNumberWrapperString(value) {
  return cyan(`[Number: ${value.toString()}]`); // wrappers are in cyan
}

function createBooleanWrapperString(value) {
  return cyan(`[Boolean: ${value.toString()}]`); // wrappers are in cyan
}

function createStringWrapperString(value) {
  return cyan(`[String: "${value.toString()}"]`); // wrappers are in cyan
}

function createPromiseString(value, ctx, level, maxLevel) {
  const [state, result] = Deno.core.getPromiseDetails(value);

  if (state === PromiseState.Pending) {
    return `Promise { ${cyan('<pending>')} }`;
  }

  const prefix =
    state === PromiseState.Fulfilled ? '' : `${red('<rejected>')} `;

  const str = `${prefix}${stringifyWithQuotes(
    result,
    ctx,
    level + 1,
    maxLevel,
  )}`;

  if (str.length + PROMISE_STRING_BASE_LENGTH > LINE_BREAKING_LENGTH) {
    return `Promise {\n${DEFAULT_INDENT.repeat(level + 1)}${str}\n}`;
  }

  return `Promise { ${str} }`;
}

function createRegExpString(value) {
  return red(value.toString()); // RegExps are red
}

function createDateString(value) {
  // without quotes, ISO format, in magenta like before
  return magenta(isInvalidDate(value) ? 'Invalid Date' : value.toISOString());
}

function createSetString(value, ctx, level, maxLevel) {
  const printConfig = {
    typeName: 'Set',
    displayName: 'Set',
    delims: ['{', '}'],
    entryHandler: (entry, ctx, level, maxLevel) => {
      const [_, val] = entry;
      return stringifyWithQuotes(val, ctx, level + 1, maxLevel);
    },
    group: false,
  };
  return createIterableString(value, ctx, level, maxLevel, printConfig);
}

function createMapString(value, ctx, level, maxLevel) {
  const printConfig = {
    typeName: 'Map',
    displayName: 'Map',
    delims: ['{', '}'],
    entryHandler: (entry, ctx, level, maxLevel) => {
      const [key, val] = entry;
      return `${stringifyWithQuotes(
        key,
        ctx,
        level + 1,
        maxLevel,
      )} => ${stringifyWithQuotes(val, ctx, level + 1, maxLevel)}`;
    },
    group: false,
  };
  return createIterableString(value, ctx, level, maxLevel, printConfig);
}

function createWeakSetString() {
  return `WeakSet { ${cyan('[items unknown]')} }`; // as seen in Node, with cyan color
}

function createWeakMapString() {
  return `WeakMap { ${cyan('[items unknown]')} }`; // as seen in Node, with cyan color
}

function createTypedArrayString(typedArrayName, value, ctx, level, maxLevel) {
  const valueLength = value.length;
  const printConfig = {
    typeName: typedArrayName,
    displayName: `${typedArrayName}(${valueLength})`,
    delims: ['[', ']'],
    entryHandler: (entry, ctx, level, maxLevel) => {
      const [_, val] = entry;
      return stringifyWithQuotes(val, ctx, level + 1, maxLevel);
    },
    group: true,
  };
  return createIterableString(value, ctx, level, maxLevel, printConfig);
}

function createRawObjectString(value, ctx, level, maxLevel) {
  if (level >= maxLevel) {
    return cyan('[Object]'); // wrappers are in cyan
  }
  ctx.add(value);

  let baseString = '';

  let shouldShowDisplayName = false;
  // @ts-ignore
  let displayName = value[Symbol.toStringTag];
  if (!displayName) {
    displayName = getClassInstanceName(value);
  }
  if (displayName && displayName !== 'Object' && displayName !== 'anonymous') {
    shouldShowDisplayName = true;
  }

  const entries = [];
  const stringKeys = Object.keys(value);
  const symbolKeys = Object.getOwnPropertySymbols(value);

  for (const key of stringKeys) {
    entries.push(
      `${key}: ${stringifyWithQuotes(value[key], ctx, level + 1, maxLevel)}`,
    );
  }
  for (const key of symbolKeys) {
    entries.push(
      `${key.toString()}: ${stringifyWithQuotes(
        // @ts-ignore
        value[key],
        ctx,
        level + 1,
        maxLevel,
      )}`,
    );
  }
  // Making sure color codes are ignored when calculating the total length
  const totalLength =
    entries.length + level + stripColor(entries.join('')).length;

  ctx.delete(value);

  if (entries.length === 0) {
    baseString = '{}';
  } else if (totalLength > LINE_BREAKING_LENGTH) {
    const entryIndent = DEFAULT_INDENT.repeat(level + 1);
    const closingIndent = DEFAULT_INDENT.repeat(level);
    baseString = `{\n${entryIndent}${entries.join(
      `,\n${entryIndent}`,
    )}\n${closingIndent}}`;
  } else {
    baseString = `{ ${entries.join(', ')} }`;
  }

  if (shouldShowDisplayName) {
    baseString = `${displayName} ${baseString}`;
  }

  return baseString;
}

function stringifyWithQuotes(value, ctx, level, maxLevel) {
  switch (typeof value) {
    case 'string':
      const trunc =
        value.length > STR_ABBREVIATE_SIZE
          ? value.slice(0, STR_ABBREVIATE_SIZE) + '...'
          : value;
      return green(`"${trunc}"`); // Quoted strings are green
    default:
      return stringify(value, ctx, level, maxLevel);
  }
}

function createIterableString(value, ctx, level, maxLevel, config) {
  if (level >= maxLevel) {
    return cyan(`[${config.typeName}]`);
  }
  ctx.add(value);

  const entries = [];

  const iter = value.entries();
  let entriesLength = 0;
  const next = () => {
    return iter.next();
  };
  for (const el of iter) {
    if (entriesLength < MAX_ITERABLE_LENGTH) {
      entries.push(
        config.entryHandler(el, ctx, level + 1, maxLevel, next.bind(iter)),
      );
    }
    entriesLength++;
  }
  ctx.delete(value);

  if (entriesLength > MAX_ITERABLE_LENGTH) {
    const nmore = entriesLength - MAX_ITERABLE_LENGTH;
    entries.push(`... ${nmore} more items`);
  }

  const iPrefix = `${config.displayName ? config.displayName + ' ' : ''}`;

  let iContent;
  if (config.group && entries.length > MIN_GROUP_LENGTH) {
    const groups = groupEntries(entries, level, value);
    const initIndentation = `\n${DEFAULT_INDENT.repeat(level + 1)}`;
    const entryIndentation = `,\n${DEFAULT_INDENT.repeat(level + 1)}`;
    const closingIndentation = `\n${DEFAULT_INDENT.repeat(level)}`;

    iContent = `${initIndentation}${groups.join(
      entryIndentation,
    )}${closingIndentation}`;
  } else {
    iContent = entries.length === 0 ? '' : ` ${entries.join(', ')} `;
    if (stripColor(iContent).length > LINE_BREAKING_LENGTH) {
      const initIndentation = `\n${DEFAULT_INDENT.repeat(level + 1)}`;
      const entryIndentation = `,\n${DEFAULT_INDENT.repeat(level + 1)}`;
      const closingIndentation = `\n`;

      iContent = `${initIndentation}${entries.join(
        entryIndentation,
      )}${closingIndentation}`;
    }
  }

  return `${iPrefix}${config.delims[0]}${iContent}${config.delims[1]}`;
}

function getClassInstanceName(instance) {
  if (typeof instance !== 'object') {
    return '';
  }
  if (!instance) {
    return '';
  }

  const proto = Object.getPrototypeOf(instance);
  if (proto && proto.constructor) {
    return proto.constructor.name; // could be "Object" or "Array"
  }

  return '';
}

// Ported from Node.js
// Copyright Node.js contributors. All rights reserved.
function groupEntries(entries, level, value) {
  let totalLength = 0;
  let maxLength = 0;
  let entriesLength = entries.length;
  if (MAX_ITERABLE_LENGTH < entriesLength) {
    // This makes sure the "... n more items" part is not taken into account.
    entriesLength--;
  }
  const separatorSpace = 2; // Add 1 for the space and 1 for the separator.
  const dataLen = new Array(entriesLength);
  // Calculate the total length of all output entries and the individual max
  // entries length of all output entries.
  // IN PROGRESS: Colors are being taken into account.
  for (let i = 0; i < entriesLength; i++) {
    // Taking colors into account: removing the ANSI color
    // codes from the string before measuring its length
    const len = stripColor(entries[i]).length;
    dataLen[i] = len;
    totalLength += len + separatorSpace;
    if (maxLength < len) maxLength = len;
  }
  // Add two to `maxLength` as we add a single whitespace character plus a comma
  // in-between two entries.
  const actualMax = maxLength + separatorSpace;
  // Check if at least three entries fit next to each other and prevent grouping
  // of arrays that contains entries of very different length (i.e., if a single
  // entry is longer than 1/5 of all other entries combined). Otherwise the
  // space in-between small entries would be enormous.
  if (
    actualMax * 3 + (level + 1) < LINE_BREAKING_LENGTH &&
    (totalLength / actualMax > 5 || maxLength <= 6)
  ) {
    const approxCharHeights = 2.5;
    const averageBias = Math.sqrt(actualMax - totalLength / entries.length);
    const biasedMax = Math.max(actualMax - 3 - averageBias, 1);
    // Dynamically check how many columns seem possible.
    const columns = Math.min(
      // Ideally a square should be drawn. We expect a character to be about 2.5
      // times as high as wide. This is the area formula to calculate a square
      // which contains n rectangles of size `actualMax * approxCharHeights`.
      // Divide that by `actualMax` to receive the correct number of columns.
      // The added bias increases the columns for short entries.
      Math.round(
        Math.sqrt(approxCharHeights * biasedMax * entriesLength) / biasedMax,
      ),
      // Do not exceed the breakLength.
      Math.floor((LINE_BREAKING_LENGTH - (level + 1)) / actualMax),
      // Limit the columns to a maximum of fifteen.
      15,
    );
    // Return with the original output if no grouping should happen.
    if (columns <= 1) {
      return entries;
    }
    const tmp = [];
    const maxLineLength = [];
    for (let i = 0; i < columns; i++) {
      let lineMaxLength = 0;
      for (let j = i; j < entries.length; j += columns) {
        if (dataLen[j] > lineMaxLength) lineMaxLength = dataLen[j];
      }
      lineMaxLength += separatorSpace;
      maxLineLength[i] = lineMaxLength;
    }
    let order = 'padStart';
    if (value !== undefined) {
      for (let i = 0; i < entries.length; i++) {
        //@ts-ignore
        if (typeof value[i] !== 'number' && typeof value[i] !== 'bigint') {
          order = 'padEnd';
          break;
        }
      }
    }
    // Each iteration creates a single line of grouped entries.
    for (let i = 0; i < entriesLength; i += columns) {
      // The last lines may contain less entries than columns.
      const max = Math.min(i + columns, entriesLength);
      let str = '';
      let j = i;
      for (; j < max - 1; j++) {
        // In future, colors should be taken here into the account
        const padding = maxLineLength[j - i];
        //@ts-ignore
        str += `${entries[j]}, `[order](padding, ' ');
      }
      if (order === 'padStart') {
        const padding =
          maxLineLength[j - i] +
          entries[j].length -
          dataLen[j] -
          separatorSpace;
        str += entries[j].padStart(padding, ' ');
      } else {
        str += entries[j];
      }
      tmp.push(str);
    }
    if (MAX_ITERABLE_LENGTH < entries.length) {
      tmp.push(entries[entriesLength]);
    }
    entries = tmp;
  }
  return entries;
}

module.exports = {
  customInspect,
  inspect,
};
