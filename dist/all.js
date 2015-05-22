"use strict";
/**
* @fileOverview AI is the root module of the evolution program.
* @author Anthony Norton
*/
"use strict";

(function AI(global, DOMinterface) {
  "use strict";

  var cycleLength = 10;

  var catalog = {
    predator: {
      male: [],
      female: []
    },
    prey: {
      male: [],
      female: []
    }
  };

  function clone(item) {
    if (!item) {
      return item;
    } // null, undefined values check

    var types = [Number, String, Boolean],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
      if (item instanceof type) {
        result = type(item);
      }
    });

    if (typeof result == "undefined") {
      if (Object.prototype.toString.call(item) === "[object Array]") {
        result = [];
        item.forEach(function (child, index, array) {
          result[index] = clone(child);
        });
      } else if (typeof item == "object") {
        // testing that this is DOM
        if (item.nodeType && typeof item.cloneNode == "function") {
          result = item.cloneNode(true);
        } else if (!item.prototype) {
          // check that this is a literal
          if (item instanceof Date) {
            result = new Date(item);
          } else {
            // it is an object literal
            result = {};
            for (var i in item) {
              result[i] = clone(item[i]);
            }
          }
        } else {
          // depending what you would like here,
          // just keep the reference, or create new object
          if (false && item.constructor) {
            // would not advice to do that, reason? Read below
            result = new item.constructor();
          } else {
            result = item;
          }
        }
      } else {
        result = item;
      }
    }

    return result;
  }

  var copy = clone({
    one: {
      "one-one": new String("hello"),
      "one-two": ["one", "two", true, "four"]
    },
    two: document.createElement("div"),
    three: [{
      name: "three-one",
      number: 100,
      obj: new function () {
        this.name = "Object test";
      }()
    }]
  });

  var objToString = Object.prototype.toString;
  function getType(param) {
    return objToString.call(param).replace("[object ", "").replace("]", "").toLowerCase();
  }

  var cycles = {

    cycleLength: cycleLength,

    roster: [],

    register: function registerActor(actor) {
      var max;
      var i;

      if (getType(actor) === "array") {
        max = actor.length;
        i = 0;
        for (i; i < max; i++) {
          actor[i].init();
          this.roster.unshift(actor);
        }
      } else {
        actor.init();
        this.roster.unshift(actor);
      }
    },

    cycleLoop: function cycleLoop(context) {
      var i = context.roster.length - 1;

      for (i; i >= 0; i--) {
        context.roster[i].executeActions.call(context.roster[i]);
      }
    },

    init: function cyclesInit() {
      setInterval(this.cycleLoop, this.cycleLength, this);
      delete this.init;
    }

  };

  // Creature constructor function. Returns a creature with its own DOM element, and some of it's own traits.
  function Creature() {
    if (!(this instanceof Creature)) {
      return new Creature();
    }

    var randomGrowthSeed;
    var predator = Math.random() * 30 > 25;
    var male = Math.random() * 30 > 25;

    this.init = function creatureInit() {
      this.predator = predator;
      this.male = male;
      this.seekingMate = false;
      this.pursuingMate = false;
      this.elem = document.createElement("div");
      this.size = 1;
      this.elem.style.height = this.size + "px";
      this.elem.style.width = this.size + "px";
      if (this.predator) {
        if (this.male) {
          this.elem.style.backgroundColor = "red";
          this.maxSize = Math.floor(Math.random() * 3 + 7);
          var randomGrowthSeed = Math.floor(Math.random() * 10 + 10);
        } else {
          this.elem.style.backgroundColor = "cyan";
          this.maxSize = Math.floor(Math.random() * 3 + 5);
          randomGrowthSeed = Math.floor(Math.random() * 10 + 10);
        }
      } else if (this.male) {
        this.elem.style.backgroundColor = "green";
        this.maxSize = Math.floor(Math.random() * 5 + 17);
        randomGrowthSeed = Math.floor(Math.random() * 50 + 10);
      } else {
        this.elem.style.backgroundColor = "lightgreen";
        this.maxSize = Math.floor(Math.random() * 5 + 6);
        randomGrowthSeed = Math.floor(Math.random() * 150 + 10);
      }
      this.growthRateSeed = function returnRandomGrowthSeed() {
        return randomGrowthSeed;
      };
      this.growing = this.maxSize > this.size;
      this.elem.style.position = "absolute";
      this.posTop = Math.floor(Math.random() * DOMinterface.body.offsetHeight);
      this.elem.style.top = this.posTop + "px";
      this.posLeft = Math.floor(Math.random() * DOMinterface.body.offsetWidth);
      this.elem.style.left = this.posLeft + "px";
      this.elem.style.borderRadius = "10000px";
      this.elem.classList.add("creature");
      DOMinterface.body.appendChild(this.elem);
      this.catagories();
    };
  }

  Creature.prototype = {
    i: 0,
    actions: [function live(context) {
      var potentialFood;
      var potentialMates;
      if (this.predator) {
        if (this.male) {
          potentialMates = catalog.predator.female;
        } else {
          potentialMates = catalog.predator.male;
        }
      } else {
        if (this.male) {
          potentialMates = catalog.prey.female;
        } else {
          potentialMates = catalog.prey.male;
        }
      }
      if (!this.pursuingMate) {
        this.move();
      }
      if (this.growing) {
        this.grow();
      }
      if (this.seekingMate) {
        this.findMate(potentialMates);
      }
    }],

    catalog: {
      predator: {
        male: [],
        female: []
      },
      prey: {
        male: [],
        female: []
      }
    },

    catagories: function catagories() {
      if (this.predator) {
        if (this.male) {
          // Creature.prototype.catalog.predator.male.push(this);
          catalog.predator.male.push(this);
        } else {
          // Creature.prototype.catalog.predator.female.push(this);
          catalog.predator.female.push(this);
        }
      } else {
        if (this.male) {
          // Creature.prototype.catalog.prey.male.push(this);
          catalog.prey.male.push(this);
        } else {
          // Creature.prototype.catalog.prey.female.push(this);
          catalog.prey.female.push(this);
        }
      }
    },

    move: function move(target) {
      var newTop;
      var newLeft;
      var verticalSeed;
      var horizontalSeed;
      var pursuingATarget = target !== null && typeof target !== "undefined";

      if (pursuingATarget) {
        console.log(this.posTop, ":", this.posLeft);
        this.size = 70;
        this.elem.style.height = this.size + "px";
        this.elem.style.width = this.size + "px";
        var maxVertical = Math.abs(this.posTop - target.posTop);
        var maxHorizontal = Math.abs(this.posLeft - target.posLeft);
        if (this.posTop > target.posTop) {
          verticalSeed = 2;
        } else {
          verticalSeed = 1;
        }

        maxVertical = maxVertical <= 10 ? maxVertical : 10;
        maxHorizontal = maxHorizontal <= 10 ? maxHorizontal : 10;

        if (this.posLeft > target.posLeft) {
          horizontalSeed = 2;
        } else {
          horizontalSeed = 1;
        }

        if (verticalSeed === 1) {
          newTop = parseInt(this.elem.style.top) + Math.floor(maxVertical);
        } else if (verticalSeed === 2) {
          newTop = parseInt(this.elem.style.top) - Math.floor(maxVertical);
        }

        if (horizontalSeed === 1) {
          newLeft = parseInt(this.elem.style.left) + Math.floor(maxHorizontal);
        } else if (horizontalSeed === 2) {
          newLeft = parseInt(this.elem.style.left) - Math.floor(maxHorizontal);
        }
      } else {
        // if verticalSeed is 1 move up, if verticalSeed is 2 move down.
        verticalSeed = Math.floor(Math.random() * 2 + 1);
        // if horizontalSeed is 1 move right, if horizontalSeed is 2 move left.
        horizontalSeed = Math.floor(Math.random() * 2 + 1);

        if (verticalSeed === 1) {
          newTop = parseInt(this.elem.style.top) + Math.floor(Math.random() * 10 + 1);
        } else if (verticalSeed === 2) {
          newTop = parseInt(this.elem.style.top) - Math.floor(Math.random() * 10 + 1);
        }

        if (horizontalSeed === 1) {
          newLeft = parseInt(this.elem.style.left) + Math.floor(Math.random() * 10 + 1);
        } else if (horizontalSeed === 2) {
          newLeft = parseInt(this.elem.style.left) - Math.floor(Math.random() * 10 + 1);
        }
      }

      if (newTop > 0 && newTop < DOMinterface.body.offsetHeight) {
        this.elem.style.top = newTop + "px";
      } else {}

      if (newLeft > 0 && newLeft < DOMinterface.body.offsetWidth) {
        this.elem.style.left = newLeft + "px";
      } else {}

      if (pursuingATarget) {
        if (Math.abs(this.posTop - target.posTop) < this.size / 2 && Math.abs(this.posLeft - target.posLeft) < this.size / 2) {
          console.log("Happy day!");
          this.backgroundColor = orange;
          this.pursuingMate = false;
          this.seekingMate = false;
          setTimeout(function () {
            this.seekingMate = true;
          }, cycleLength * 40);
        }
      }
    },

    grow: function grow() {
      var growing = Math.floor(Math.random() * this.growthRateSeed() + 1);
      var sizeChange;
      var currentHeight;
      var currentWidth;
      if (growing === 1) {
        sizeChange = 1;
        currentHeight = this.elem.offsetHeight;
        this.size = currentHeight + sizeChange;
        if (this.size > this.maxSize * 0.75) {
          this.seekingMate = true;
        }
        if (this.size >= this.maxSize) {
          this.growing = false;
        }
        this.elem.style.height = this.size + "px";
        this.elem.style.width = this.size + "px";
      }
    },

    pursueMate: function pursueMate(mate) {
      this.pursuingMate = true;
      this.matingInterval = setInterval((function pursuingMate() {
        this.move(mate);
      }).call(this), cycleLength);
    },

    findMate: function findMate(potentialMates) {
      for (var i = potentialMates.length - 1; i >= 0; i--) {
        if (Math.floor(this.posTop - potentialMates[i].posTop) < 100 && Math.floor(this.posTop - potentialMates[i].posTop) < 100) {
          this.pursueMate(potentialMates[i]);
          i = 0;
        }
      }
    },

    executeActions: function executeActions() {
      var i = this.actions.length - 1;

      for (i; i >= 0; i--) {
        this.actions[i].call(this);
      }
    },

    registerAction: function registerAction() {}
  };

  global.onload = function () {

    var creature1;
    var i = 0;
    var max = 50;
    for (; i < max; i++) {
      creature1 = Creature();
      cycles.register(clone(creature1));
    }

    cycles.init();
    // listen('.communincation input');
  };
})(window, document);