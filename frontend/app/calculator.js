exports.calculator = function(){
  this.sub = function(a, b){
    return a - b;
  };
  this.add = function(a, b){
    return a + b;
  };
  this.invalidAdd = function(a, b){
    return a * (b || 0);
  };

  return this;
};