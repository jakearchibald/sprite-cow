var fileSystem;
var log = [];
var utils = {};

utils.get = function(url, opts, done, error) {
  opts = opts || {};
  var req = new XMLHttpRequest();

  req.open('get', url);

  if (opts.type) {
    req.responseType = opts.type;
  }

  req.addEventListener('load', function() {
    done(req);
  });

  req.addEventListener('error', function() {
    error(req);
  });

  req.send();
};

this.onfetch = function(event) {
  if (fileSystem) {
    fileSystem.root.getFile('assets/8/style/all-min.css', {}, function(entry) {
      entry.file(function(file) {
        // this crashes
        // var response = new SameOriginResponse();
        // response.setBody(blob);
        // event.respondWith(response);
        // This doesn't…
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
          // reader.result contains the contents of blob as a typed array
          var blob = new Blob([reader.result], {
            type: 'text/css'
          });
          var response = new SameOriginResponse();
          response.setBody(blob);
          event.respondWith(response);
        });
        reader.readAsBinaryString(file);
        log.push(['responding with css to', event.request]);
      }, function(err) {
        log.push(['failed to get file', err]);
      });
    }, function() {
      // file doesn't exist in filesystem
      utils.get('assets/8/style/all-min.css', {type: 'blob'}, function(req) {
        var response = new SameOriginResponse();
        response.setBody(req.response);
        event.respondWith(response);
      }, function() {
        var response = new SameOriginResponse();
        response.setBody(
          new Blob(['XHR failed'], {
            type: 'text/plain'
          })
        );
        event.respondWith(response);
      });
    });
  }
  else {
    // if we haven't got the filesystem…
    // TODO: we should just pass through to the normal network here
    var response = new SameOriginResponse();
    response.setBody(
      new Blob(['No filesystem'], {
        type: 'text/plain'
      })
    );
    event.respondWith(response);
  }
  event.preventDefault();
};

function createDirRecursive(path, root, success, err) {
  var pathsLeft = path.split('/');
  var dir = root;
  var nextPath;

  function createDir(path) {
    dir.getDirectory(path);
  }

  function next() {
    nextPath = pathsLeft.shift();

    if (!nextPath) {
      success(dir);
      return;
    }

    dir.getDirectory(nextPath, {create: true}, function(entry) {
      dir = entry;
      next();
    }, err);
  }

  next();
}

function cache(path, root, success, errCallback) {
  var req;

  // fetch the resource
  utils.get(path, {type: 'blob'}, onResourceFetched, function(req) {
    log.push(['fetch fail', req]);
    errCallback(req);
  });

  function onResourceFetched(request) {
    req = request;
    var dirPath = path.split('/').slice(0, -1).join('/');
    createDirRecursive(dirPath, root, onDirCreated, function(err) {
      log.push(['createdir fail', err]);
      errCallback(err);
    });
  }

  function onDirCreated(dir) {
    log.push(['dir worked', dir]);
    root.getFile(path, {create: true}, onGotFileEntry, function(err) {
      log.push(['getFile fail', err]);
      errCallback(err);
    });
  }

  function onGotFileEntry(entry) {
    log.push(['getFile worked', entry]);
    entry.createWriter(onWriterCreated, function(err) {
      log.push(['createWriter fail', err]);
      errCallback(err);
    });
  }

  function onWriterCreated(fileWriter) {
    fileWriter.onwriteend = success;
    fileWriter.onerror = function(event) {
      log.push(['write error', event]);
      errCallback(event);
    };
    fileWriter.write(req.response);
  }
}

// woo, let's get cachin'
// TODO: PERSISTENT cache doesn't work, is this a general worker issue?
webkitRequestFileSystem(TEMPORARY, 1024*1024, onFileSystemReady, function(err) {
  log.push(['filesystem fail', err]);
});

function onFileSystemReady(fs) {
  fileSystem = fs;

  cache('assets/8/style/all-min.css', fileSystem.root, function() {
    log.push(['done']);
  }, function(err) {
    // bleh
  });
}