var chai = require("chai");

// Make sure chai and jasmine ".not" play nice together
var originalNot = Object.getOwnPropertyDescriptor(chai.Assertion.prototype, "not").get;
Object.defineProperty(chai.Assertion.prototype, "not", {
  get: function() {
    Object.assign(this, this.assignedNot);
    return originalNot.apply(this);
  },
  set: function(newNot) {
    this.assignedNot = newNot;
    return newNot;
  },
});

// Combine both jest and chai matchers on expect
var originalExpect = global.expect;

global.expect = function(actual) {
  var originalMatchers = originalExpect(actual);
  var chaiMatchers = chai.expect(actual);
  var combinedMatchers = Object.assign(chaiMatchers, originalMatchers);
  return combinedMatchers;
};