"use strict";

var assert = require("assert");
require('../')();

function fail(done) {
  return function(e) { done(e); };
}

/*!
 *
 Copyright 2009–2012 Kristopher Michael Kowal. All rights reserved.
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to
 deal in the Software without restriction, including without limitation the
 rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 sell copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/

describe("Promise#finally", function () {

  var exception1 = new Error("boo!");
  var exception2 = new TypeError("evil!");

  describe("when nothing is passed", function() {
    it("should do nothing", function(done) {
      Promise.cast("foo")
        ['finally']()
        ['finally']()
        ['finally']()
        ['finally']()
        .then(function(val){
          assert(val === "foo");
        }).then(done, fail(done));
    });
  });

  describe("when the promise is fulfilled", function () {

    it("should call the callback", function (done) {
      var called = false;

      Promise.cast("foo")
        ['finally'](function () {
          called = true;
        })
        .then(function () {
          assert.equal(called,true);
        }).then(done, fail(done));
    });

    it("should fulfill with the original value", function (done) {
      Promise.cast("foo")
        ['finally'](function () {
          return "bar";
        })
        .then(function (result) {
          assert.equal(result,"foo");
        }).then(done, fail(done));
    });

    describe("when the callback returns a promise", function () {

      describe("that is fulfilled", function () {
        it("should fulfill with the original reason after that promise resolves", function (done) {
          var pending = true;
          var promise = Promise.delay(null, 25).then(function() {
            pending = false;
          });

          Promise.cast("foo")
            ['finally'](function () {
              return promise;
            })
            .then(function (result) {
              assert.equal(pending, false);
              assert.equal(result, "foo");
            }).then(done, fail(done));
        });
      });

      describe("that is rejected", function () {
        it("should reject with this new rejection reason", function (done) {
          Promise.cast("foo")
            ['finally'](function () {
              return Promise.reject(exception1);
            })
            .then(function () {
              assert.fail();
            }, function (exception) {
              assert.equal(exception,exception1);
            }).then(done, fail(done));
        });
      });

    });

    describe("when the callback throws an exception", function () {
      it("should reject with this new exception", function (done) {
        Promise.cast("foo")
          ['finally'](function () {
            throw exception1;
          })
          .then(function () {
            assert.fail();
          }, function (exception) {
            assert.equal(exception,exception1);
          }).then(done, fail(done));
      });
    });

  });

  describe("when the promise is rejected", function () {

    it("should call the callback", function (done) {
      var called = false;

      Promise.reject(exception1)
        ['finally'](function () {
          called = true;
        })
        .then(function () {
          assert.fail();
        }, function () {
          assert.equal(called,true);
        }).then(done, fail(done));
    });

    it("should reject with the original reason", function (done) {
      Promise.reject(exception1)
        ['finally'](function () {
          return "bar";
        })
        .then(function () {
          assert.fail();
        }, function (exception) {
          assert.equal(exception,exception1);
        }).then(done, fail(done));
    });

    describe("when the callback returns a promise", function () {

      describe("that is fulfilled", function () {
        it("should reject with the original reason after that promise resolves", function (done) {
          var pending = true;
          var promise = Promise.delay(null, 25).then(function() {
            pending = false;
          });

          Promise.reject(exception1)
            ['finally'](function () {
              return promise;
            }).then(function () {
              assert.fail();
            }, function (exception) {
              assert.equal(pending, false);
              assert.equal(exception, exception1);
            }).then(done, fail(done));
        });
      });

      describe("that is rejected", function () {
        it("should reject with the new reason", function (done) {
          Promise.reject(exception1)
            ['finally'](function () {
              return Promise.reject(exception2);
            }).then(function () {
              assert.fail();
            }, function (exception) {
              assert.equal(exception,exception2);
            }).then(done, fail(done));
        });
      });
    });

    describe("when the callback throws an exception", function () {
      it("should reject with this new exception", function (done) {
        Promise.reject(exception1)
          ['finally'](function () {
            throw exception2;
          })
          .then(function () {
            assert.fail();
          }, function (exception) {
            assert.equal(exception,exception2);
          }).then(done, fail(done));
      });
    });
  });

  describe("when the callback returns a thenable", function () {

    describe("that will fulfill", function () {
      it("should reject with the original reason after that", function (done) {
        var promise = {
          then: function(fn) {
            setTimeout(function(){
              fn(15);
            }, 13);
          }
        };

        return Promise.reject(exception1)
          ['finally'](function () {
            return promise;
          })
          .then(function () {
            assert.fail();
          }, function (exception) {
            assert.equal(exception,exception1);
          }).then(done, fail(done));
      });
    });

    describe("that is rejected", function () {
      it("should reject with the new reason", function (done) {
        var promise = {
          then: function(f, fn) {
            setTimeout(function(){
              fn(exception2);
            }, 13);
          }
        };

        return Promise.reject(exception1)
          ['finally'](function () {
            return promise;
          })
          .then(function () {
            assert.fail();
          }, function (exception) {
            assert.equal(exception,exception2);
          }).then(done, fail(done));
      });
    });

  });
});
