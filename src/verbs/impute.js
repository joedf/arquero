import _impute from '../engine/impute';
import _rollup from '../engine/rollup';
import parse from '../expression/parse';
import parseValues from './expr/parse';
import { unique } from '../op/op-api';
import error from '../util/error';
import toString from '../util/to-string';

export default function(table, values, options = {}) {
  values = parse(values, { table });

  values.names.forEach(name =>
    table.column(name) ? 0 : error(`Invalid impute column ${toString(name)}`)
  );

  if (options.expand) {
    const params = parseValues('impute', table, options.expand, { preparse });
    const result = _rollup(table.ungroup(), params);
    return _impute(
      table, values, params.names,
      params.names.map(name => result.get(name, 0))
    );
  } else {
    return _impute(table, values);
  }
}

// map direct field reference to "unique" aggregate
function preparse(map) {
  map.forEach((value, key) =>
    value.field ? map.set(key, unique(value + '')) : 0
  );
}