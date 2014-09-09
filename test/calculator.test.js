var assert =  require('assert');
var app = require('../frontend/app/calculator');

describe("Calculator Tests", function(){

  it("should add two numbers", function(){
    assert.equal(2, app.calculator().add(1, 1));
  });

  it("should sub two numbers", function(){
    assert.equal(0, app.calculator().sub(1, 1));
  });

  it("invalid add function with two numbers", function(){
    assert.equal(25, app.calculator().invalidAdd(5, 5));
  });

  /*it("invalid add function with single number", function(){
    assert.equal(5, app.calculator().invalidAdd(5));
  });*/
});