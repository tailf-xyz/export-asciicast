const through2  = require('through2')
  ,   schema    = require('./schema')
  ,   tmpl      = JSON.stringify(schema)
  ;

let split = tmpl.split(`"STDOUT"`)
  , o     = `${split[0]}\n`
  , c     = `\n${split[1]}\n`
  ;

function open(options = {}) {
  let { columns = 80, rows = 24 } = options;

  let ret = o;

  ret = ret.replace(`"[WIDTH]"`, columns);
  ret = ret.replace(`"[HEIGHT]"`, rows);

  return ret;
}

function close(duration) {
  return c.replace(`"[DURATION]"`, duration);
}

function map(options = {}) {
  let first     = undefined
    , last      = undefined
    ;

  return through2.obj(function(msg, enc, cb) {
    let text = msg.chunk.toString('utf-8');
    let frame           = [ 0, text ]
      , is_first_line   = !first
      ;

    if (is_first_line) {
      first = msg;
      this.push(`${asciicast.open(options)}  `);
    } else {
      this.push(`, `);
      frame[0] = (msg.time - last.time) / 1000;
    }

    last = msg;
    this.push(`${JSON.stringify(frame)}\n`);

    cb();
  }, function(cb) {
    let duration = (last.time - first.time) / 1000;

    this.push(asciicast.close(duration));
    cb();
  });
}

module.exports = {
  export : map
};
