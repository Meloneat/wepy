const path = require('path');
const fs = require('fs-extra');
const expect = require('chai').expect;
const sassPlugin = require('../index');
const specs = require('./helpers/specs');
const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const NodeJsInputFileSystem = require('enhanced-resolve/lib/NodeJsInputFileSystem');
const CachedInputFileSystem = require('enhanced-resolve/lib/CachedInputFileSystem');

class Hook {
  register(key, fn) {
    if (!this._fns) this._fns = {};
    this._fns[key] = fn;
  }
  hook(key, ...args) {
    return this._fns[key].apply(this, args);
  }
  clear() {
    this._fns = {};
  }
}

function createCompile(sassOpt, resolveOpt) {
  let instance = new Hook();
  sassPlugin(sassOpt).call(instance);

  instance.resolvers = {
    normal: ResolverFactory.createResolver(
      Object.assign(
        {
          fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000)
        },
        resolveOpt
      )
    )
  };

  let fnNormalBak = instance.resolvers.normal.resolve;
  instance.resolvers.normal.resolve = function(...args) {
    return new Promise((resolve, reject) => {
      args.push(function(err, filepath, meta) {
        if (err) {
          reject(err);
        } else {
          resolve({ path: filepath, meta: meta });
        }
      });
      fnNormalBak.apply(instance.resolvers.normal, args);
    });
  };
  return instance;
}

function readSpec(id) {
  let ext = path.extname(id);
  let name = id.replace(new RegExp(ext + '$'), '');
  let sassfile = path.join(__dirname, 'fixtures', 'sass', id);
  let expectfile = path.join(__dirname, 'fixtures', 'css', id + '.css');

  return {
    node: {
      content: fs.readFileSync(sassfile, 'utf-8')
    },
    file: sassfile,
    expect: fs.readFileSync(expectfile, 'utf-8')
  };
}

function compare(id, done) {
  let compile = createCompile(specs.getOpt(id), specs.getResolveOpt(id));

  let spec = readSpec(id);
  let ext = path.extname(spec.file);
  let type = ext.substring(1, ext.length);

  return compile
    .hook('wepy-compiler-' + type, spec.node, spec.file)
    .then(node => {
      let css = node.compiled.code;
      expect(css).to.equal(spec.expect);
      done();
    })
    .catch(e => {
      done();
      throw e;
    });
}

describe('wepy-compiler-less', function() {
  let ids = specs.getIds();

  ids.forEach(id => {
    it('testing ' + id, function(done) {
      compare(id, done);
    });
  });
});
