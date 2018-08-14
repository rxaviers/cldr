/*
 * grunt-compare-size
 * https://github.com/rwldrn/grunt-compare-size
 *
 * Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com> &
 *                     Richard Gibson <richard.gibson@gmail.com> &
 *                      Corey Frang <gnarf@gnarf.net> &
 *                       Mike Sherov <mike.sherov@gmail.com>
 * Licensed under the MIT license.
 */

"use strict";

var _ = require("lodash");
var fs = require("fs");
var exec = require("child_process").exec;
const glob = require("glob");
const debug = require("debug")("compare-size");
const chalk = require("chalk");

const options = {
  files: ["dist/cldr.js", "dist/cldr/*.js"],
  options: {
    compress: {
      gz: function(fileContents) {
        return require("gzip-js").zip(fileContents, {}).length;
      }
    }
  }
};

// Grunt utilities & task-wide assignments
const file = {
  read(filepath) {
    debug("Reading " + filepath + "...");
    try {
      return fs.readFileSync(String(filepath));
    } catch (e) {
      throw new Error(
        'Unable to read "' + filepath + '" file (Error code: ' + e.code + ").",
        e
      );
    }
  },
  readJSON(filepath) {
    var src = file.read(filepath);
    debug("Parsing " + filepath + "...");
    try {
      return JSON.parse(src);
    } catch (e) {
      throw new Error(
        'Unable to parse "' + filepath + '" file (' + e.message + ").",
        e
      );
    }
  },
  write(filepath, contents) {
    debug("Writing " + filepath + "...");

    try {
      fs.writeFileSync(filepath, contents);

      return true;
    } catch (e) {
      throw new Error(
        'Unable to write "' + filepath + '" file (Error code: ' + e.code + ").",
        e
      );
    }
  }
};

// Return a string, uncolored (suitable for testing .length, etc).
function uncolor(str) {
  return str.replace(/\x1B\[\d+m/g, "");
}

// Word-wrap text to a given width, permitting ANSI color codes.
function wraptext(width, text) {
  // notes to self:
  // grab 1st character or ansi code from string
  // if ansi code, add to array and save for later, strip from front of string
  // if character, add to array and increment counter, strip from front of string
  // if width + 1 is reached and current character isn't space:
  //  slice off everything after last space in array and prepend it to string
  //  etc

  // This result array will be joined on \n.
  var result = [];
  var matches, color, tmp;
  var captured = [];
  var charlen = 0;

  while ((matches = text.match(/(?:(\x1B\[\d+m)|\n|(.))([\s\S]*)/))) {
    // Updated text to be everything not matched.
    text = matches[3];

    // Matched a color code?
    if (matches[1]) {
      // Save last captured color code for later use.
      color = matches[1];
      // Capture color code.
      captured.push(matches[1]);
      continue;

      // Matched a non-newline character?
    } else if (matches[2]) {
      // If this is the first character and a previous color code was set, push
      // that onto the captured array first.
      if (charlen === 0 && color) {
        captured.push(color);
      }
      // Push the matched character.
      captured.push(matches[2]);
      // Increment the current charlen.
      charlen++;
      // If not yet at the width limit or a space was matched, continue.
      if (charlen <= width || matches[2] === " ") {
        continue;
      }
      // The current charlen exceeds the width and a space wasn't matched.
      // "Roll everything back" until the last space character.
      tmp = captured.lastIndexOf(" ");
      text = captured.slice(tmp === -1 ? tmp : tmp + 1).join("") + text;
      captured = captured.slice(0, tmp);
    }

    // The limit has been reached. Push captured string onto result array.
    result.push(captured.join(""));

    // Reset captured array and charlen.
    captured = [];
    charlen = 0;
  }

  result.push(captured.join(""));
  return result.join("\n");
}

function writetableln(widths, texts) {
  var rows = [];
  widths.forEach(function(width, i) {
    var lines = wraptext(width, texts[i]).split("\n");
    lines.forEach(function(line, j) {
      var row = rows[j];
      if (!row) {
        row = rows[j] = [];
      }
      row[i] = line;
    });
  });

  var lines = [];
  rows.forEach(function(row) {
    var txt = "";
    var column;
    for (var i = 0; i < row.length; i++) {
      column = row[i] || "";
      txt += column;
      var diff = widths[i] - uncolor(column).length;
      if (diff > 0) {
        txt += _.repeat(" ", diff);
      }
    }
    lines.push(txt);
  }, this);

  console.log(lines.join("\n"));
}

const defaultCache = ".sizecache.json";
const lastrun = " last run";

var processPatterns = function(patterns, fn) {
  // Filepaths to return.
  var result = [];
  // Iterate over flattened patterns array.
  _.flatten(patterns).forEach(function(pattern) {
    // If the first character is ! it should be omitted
    var exclusion = pattern.indexOf("!") === 0;
    // If the pattern is an exclusion, remove the !
    if (exclusion) {
      pattern = pattern.slice(1);
    }
    // Find all matching files for this pattern.
    var matches = fn(pattern);
    if (exclusion) {
      // If an exclusion, remove matching files.
      result = _.difference(result, matches);
    } else {
      // Otherwise add matching files.
      result = _.union(result, matches);
    }
  });
  return result;
};

const helpers = {
  // Label sequence helper
  sorted_labels: function(cache) {
    var tips = cache[""].tips;

    // Sort labels: metadata, then branch tips by first add,
    // then user entries by first add, then last run
    // Then return without metadata
    return Object.keys(cache)
      .sort(function(a, b) {
        var keys = Object.keys(cache);

        return (
          (a ? 1 : 0) - (b ? 1 : 0) ||
          (a in tips ? 0 : 1) - (b in tips ? 0 : 1) ||
          (a.charAt(0) === " " ? 1 : 0) - (b.charAt(0) === " " ? 1 : 0) ||
          keys.indexOf(a) - keys.indexOf(b)
        );
      })
      .slice(1);
  },

  // Label with optional commit
  label: function(label, commit) {
    return (
      label.replace(/^ /, "") + (commit ? " " + ("@ " + commit)["grey"] : "")
    );
  },

  // Color-coded size difference
  delta: function(delta, width) {
    var color = "green";

    if (delta > 0) {
      delta = "+" + delta;
      color = "red";
    } else if (!delta) {
      delta = delta === 0 ? "=" : "?";
      color = "grey";
    }

    return chalk[color](_.padStart(delta, width));
  },

  // Size cache helper
  get_cache: function(src) {
    var cache;

    try {
      cache = fs.existsSync(src) ? file.readJSON(src) : undefined;
    } catch (e) {
      debug(e);
    }

    // Progressively upgrade `cache`, which is one of:
    // empty
    // {}
    // { file: size [,...] }
    // { "": { tips: { label: SHA1, ... } }, label: { file: size, ... }, ... }
    // { "": { version: 0.4, tips: { label: SHA1, ... } },
    //   label: { file: { "": size, compressor: size, ... }, ... }, ... }
    if (typeof cache !== "object") {
      cache = undefined;
    }
    if (!cache || !cache[""]) {
      // If promoting cache to dictionary, assume that data are for last run
      cache = _.zipObject(["", lastrun], [{ version: 0, tips: {} }, cache]);
    }
    if (!cache[""].version) {
      cache[""].version = 0.4;
      _.forEach(cache, function(sizes, label) {
        if (!label || !sizes) {
          return;
        }

        // If promoting sizes to dictionary, assume that compressed size data are indicated by suffixes
        Object.keys(sizes)
          .sort()
          .forEach(function(file) {
            var parts = file.split("."),
              prefix = parts.shift();

            // Append compressed size data to a matching prefix
            while (parts.length) {
              if (typeof sizes[prefix] === "object") {
                sizes[prefix][parts.join(".")] = sizes[file];
                delete sizes[file];
                return;
              }
              prefix += "." + parts.shift();
            }

            // Store uncompressed size data
            sizes[file] = { "": sizes[file] };
          });
      });
    }

    return cache;
  },

  // Files helper.
  sizes: function(task, compressors) {
    var sizes = {},
      files = processPatterns(task.files, function(pattern) {
        // Find all matching files for this pattern.
        return glob.sync(pattern, { filter: "isFile" });
      });

    files.forEach(function(src) {
      var contents = file.read(src),
        fileSizes = (sizes[src] = { "": contents.length });
      if (compressors) {
        Object.keys(compressors).forEach(function(compressor) {
          fileSizes[compressor] = compressors[compressor](contents);
        });
      }
    });

    return sizes;
  },

  // git helper.
  git_status: function(done) {
    debug("Running `git branch` command...");
    exec(
      "git branch --no-color --verbose --no-abbrev --contains HEAD",
      function(err, stdout) {
        var status = {},
          matches = /^\* (.+?)\s+([0-9a-f]{8,})/im.exec(stdout);

        if (err || !matches) {
          done(err || "branch not found");
        } else if (matches[1].indexOf(" ") >= 0) {
          done("not a branch tip: " + matches[2]);
        } else {
          status.branch = matches[1];
          status.head = matches[2];
          exec("git diff --quiet HEAD", function(err) {
            status.changed = !!err;
            done(null, status);
          });
        }
      }
    );
  }
};

// Compare size to saved sizes
// Derived and adapted from Corey Frang's original `sizer`
function compareSizes(task) {
  var compressors = task.options.compress,
    newsizes = helpers.sizes(task, compressors),
    files = Object.keys(newsizes),
    sizecache = defaultCache,
    cache = helpers.get_cache(defaultCache),
    tips = cache[""].tips,
    labels = helpers.sorted_labels(cache);

  // Obtain the current branch and continue...
  helpers.git_status(function(err, status) {
    var prefixes = compressors ? [""].concat(Object.keys(compressors)) : [""],
      availableWidth = 79,
      columns = prefixes.map(function(label) {
        // Ensure width for the label and 6-character sizes, plus a padding space
        return Math.max(label.length + 1, 7);
      }),
      // Right-align headers
      commonHeader = prefixes.map(function(label, i) {
        return _.padStart(
          i === 0 && compressors ? "raw" : label,
          columns[i] - 1
        );
      });

    if (err) {
      log.warn(err);
      status = {};
    }

    // Remaining space goes to the file path
    columns.push(
      Math.max(
        1,
        availableWidth -
          columns.reduce(function(a, b) {
            return a + b;
          })
      )
    );

    // Raw sizes
    writetableln(columns, commonHeader.concat("Sizes"));
    files.forEach(function(key) {
      writetableln(
        columns,
        prefixes
          .map(function(prefix, i) {
            return _.padStart(newsizes[key][prefix], columns[i] - 1);
          })
          .concat(key + "")
      );
    });

    // Comparisons
    labels.forEach(function(label) {
      var oldsizes = cache[label];

      // Skip metadata key and empty cache entries
      if (label === "" || !cache[label]) {
        return;
      }

      // Header
      console.log();
      writetableln(
        columns,
        commonHeader.concat("Compared to " + helpers.label(label, tips[label]))
      );

      // Data
      files.forEach(function(key) {
        var old = oldsizes && oldsizes[key];
        writetableln(
          columns,
          prefixes
            .map(function(prefix, i) {
              return helpers.delta(
                old && newsizes[key][prefix] - old[prefix],
                columns[i] - 1
              );
            })
            .concat(key + "")
        );
      });
    });

    // Update "last run" sizes
    cache[lastrun] = newsizes;

    // Remember if we're at a branch tip and the branch name is an available key
    if (
      status.branch &&
      !status.changed &&
      (status.branch in tips || !cache[status.branch])
    ) {
      tips[status.branch] = status.head;
      cache[status.branch] = newsizes;
      console.log("\nSaved as: " + status.branch);
    }

    // Write to file
    file.write(sizecache, JSON.stringify(cache));
  });
}

compareSizes(options);
