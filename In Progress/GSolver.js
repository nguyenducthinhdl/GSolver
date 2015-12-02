'use strict'
// @function: clone object
var clone = function (obj) {
    // clone object
    var ret = null,
        tobj = typeof obj;
    if (tobj === 'number' || tobj === 'string') {
        return obj;
    }

    if (tobj === 'object') {
        if (Array.isArray(obj)) {
            ret = [];
            for (var i = 0; i < obj.length; i++) {
                ret.push(clone(obj[i]));
            }
            return ret;
        }
        else { // Json object
            ret = {};
            for (var key in obj) {
                ret[key] = clone(obj[key]);
            }
        }
    }

    return ret;
}

// @function: compare object
var compare = function (xobj, yobj) {
    var txobj = typeof xobj,
        tyobj = typeof yobj;
    if (txobj === tyobj) {
        if (txobj === 'string' || tyobj === 'number') {
            return xobj === yobj;
        }

        if (txobj === 'object') {
            if (Array.isArray(xobj)) {
                if (xobj.length === yobj.length) {
                    for (var i = 0; i < xobj.length; i++) {
                        if (!compare(xobj[i], yobj[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                // For JSon object
                var checkKey = true;
                for (var key in xobj) {
                    if (undefined === yobj[key]) {
                        checkKey = false;
                    }
                }

                for (var key in yobj) {
                    if (undefined === xobj[key]) {
                        checkKey = false;
                    }
                }

                if (checkKey) {
                    for (var key in xobj) {
                        if (!compare(xobj[key], yobj[key])) {
                            return false;
                        }
                    }
                }
                return checkKey;
            }
        }
    }

    return false;
}

var obj2string = function (obj) {
    var ret = "",
        tobj = typeof obj;
    if (tobj === 'number' || tobj === 'string') {
        return obj + '';
    }

    if (tobj === 'object') {
        if (Array.isArray(obj)) {
            ret = '';
            for (var i = 0; i < obj.length; i++) {
                ret += obj2string(obj[i]);
            }
        }
        else { // Json object
            ret = '';
            for (var key in obj) {
                ret += obj2string(obj[key]);
            }
        }
    }

    return ret;
};

var hashCode = function (string) {
    return string.split("").reduce(
        function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
};

var ALGORITHM = {
    DFS: {
        algorithm: 'DFS',
        cost: function () {
            return -1;
        }
    },
    BFS: {
        algorithm: 'BFS',
        cost: function () {
            return 1;
        }
    },
    DIJKSTRA: function () {
        return {
            setCost: function (cost) {
                this.cost = cost;
                return this;
            },
            algorithm: 'DIJKSTRA'
        }
    },
    ASTAR: function (cost, heuristic) {
        return {
            algorithm: 'ASTAR',
            cost: cost,
            heuristic: heuristic,
            setCost: function (cost) {
                this.cost = cost;
                return this;
            },
            setHeuristic: function (heuristic) {
                this.heuristic = heuristic;
                return this;
            }
        };
    }
};

/*
 *      moveAction = new Action(
 *           "move",
 *           function(state){
 *               return new State();
 *           }
 *      )
 *
 * */
var Action = function (input) {
    return {
        name: (input === undefined || typeof input === 'string') ? input : input.name,
        do: input.do,
        fGenerate: (input !== undefined && input.fGenerate) ? input.fGenerate : input.generation,
        fdo: function (state, content) {
            var position = clone(state.position);
            this.do(position, content);
            var newState = new State(
                position,
                state,
                {name: this.name, content: content}
            );
            return newState;
        },
        content: input.content,
        generation: function (state, faction) {
            this.fGenerate(state.position, faction);
        },
        setDo: function (fdo) {
            this.do = fdo;
            return this;
        },
        setGeneration: function (generate) {
            this.fGenerate = generate;
            return this;
        }
    }
};

/*
 *
 *   @function State
 *
 * */
var State = function (_position, _predState, _predAction) {
    return {
        position: _position,
        preState: _predState,
        preAction: _predAction,
        goal: false,
        score: {
            h: 0,
            g: 0,
            f: 0
        },
        nextStates: []
    }
};

var Problem = function (input) {
    var me = this;
    var blackList = {};
    if (!input.rules) {
        me.rules = [];
    }
    else {
        me.rules = input.rules;
    }
    if (!input.actions) {
        me.actions = [];
    }
    else {
        me.actions = input.actions;
    }
    if (!input.goal) {
        me.goal = function (position) {
            return false;
        }
    }
    else {
        me.goal = input.goal
    }

    me.setInitState = function (initState) {
        me.initState = new State(initState, null, null);
        me.currentState = me.initState;
        return me;
    };

    if (
        undefined !== input && undefined === input.rules &&
        undefined === input.actions && undefined === input.initState &&
        undefined === input.goal
    ) {
        me.initState = input;
    }
    else {
        if (undefined != input) {
            me.initState = input.initState;
        }
    }

    me.setInitState(me.initState);

    me.setGoal = function (goal) {
        if (undefined != goal && typeof goal === 'function') {
            me.goal = goal;
        }
        return me;
    };

    me.belongBlackList = function (position) {
        var key = hashCode(obj2string(position));
        if (blackList[key]) {
            for (var i = 0; i < blackList[key].length; i++) {
                if (compare(position, blackList[key][i])) {
                    return {info: true, key: key};
                }
            }
        }
        return {info: false, key: key};
    };

    me.pushBlackList = function (key, position) {
        if (blackList[key]) {
            blackList[key].push(position);
        }
        else {
            blackList[key] = [position];
        }
    }

    me.checkRuleGoal = function (state) {
        if (input.goal(state)) {
            state.goal = true;
        }
        else {
            for (var i = 0; i < me.rules.length; i++) {
                if (me.rules[i](state.position)) {
                    return false;
                }
            }
        }
        return true;
    }

    // Generate all possible states
    this.statesGenerate = function (currentState) {
        me.currentState = currentState || me.currentState;
        var gStates = [];
        for (var key in me.actions) {
            me.actions[key].generation(me.currentState, function (action) {
                var newState = me.actions[key].fdo(me.currentState, action),
                    isRule = true;
                if (me.goal(newState.position)) {
                    newState.goal = true;
                }
                else {
                    for (var i = 0; i < me.rules.length && isRule; i++) {
                        isRule = me.rules[i](newState.position);
                    }
                }
                if (isRule) {
                    var infoKey = me.belongBlackList(newState.position);
                    if (infoKey.info === false) {
                        me.pushBlackList(infoKey.key, newState.position);
                        gStates.push(newState);
                    }
                }
            });
        }
        return gStates;
    }

    me.addAction = function (action) {
        me.actions.push(createAction(action));
        return this;
    }

    me.addRule = function (rule) {
        me.rules.push(rule);
        return this;
    }

    // Find a solution
    this.findSolution = function (input) {
        input = input || {algorithm: 'BFS'};
        if (input.algorithm === 'BFS' ||
            input.algorithm === 'DFS') {
            return me.aStar(ALGORITHM[input.algorithm]);
        }
        else {
            if (input.algorithm === 'DIJKSTRA') {
                return me.aStar(ALGORITHM[input.algorithm](input.cost));
            }
            else if (input.algorithm === 'ASTAR') {
                return me.aStar(
                    ALGORITHM[input.algorithm](input.cost, input.heuristic)
                );
            }
        }
        throw new Error('Algorithm function error');
    }

    this.aStar = function (input) {
        var heuristic = (input && input.heuristic) ||
            function () {
                return 0;
            };
        var cost = (input && input.cost) ||
            function () {
                return 1;
            };
        var openHeap = new OpenHeap();
        me.initState.score.g = 0;
        openHeap.push(me.initState);

        while (openHeap.size() > 0) {
            var currentState = openHeap.pop();
            if (me.goal(currentState.position)) {
                currentState.goal = true;
                return currentState;
            }
            var nextStates = me.statesGenerate(currentState);

            for (var i = 0; i < nextStates.length; i++) {
                nextStates[i].score.h = heuristic(nextStates[i].position);
                nextStates[i].score.g = cost(currentState.position,
                    nextStates[i].position) + currentState.score.g;
                nextStates[i].score.f = nextStates[i].score.g
                + nextStates[i].score.h;
                openHeap.push(nextStates[i]);
            }
        }
        return null;
    };
};

var createAction = function (input) {
    return new Action(input);
};

var createProblem = function (input) {
    return new Problem(input);
}

/*
 *
 *
 *   @function: Open heap
 *   Temporally is an binary tree
 *   - A tree is described as an array
 *   - The 2^n-th position is left child of n-th node
 *   - The (2^n + 1)-th position is right child of n-th node
 *
 * */
var OpenHeap = function () {
    // compare two state: minimum version
    var comp = function (sA, sB) {
        return sA.score.f < sB.score.f;
    };

    var arr = [];

    var swap = function (a, b) {
        var temp = arr[a];
        arr[a] = arr[b];
        arr[b] = temp;
    };

    var bubbleDown = function (pos) {
        var left = 2 * pos + 1;
        var right = left + 1;
        var largest = pos;
        if (left < arr.length && comp(arr[left], arr[largest])) {
            largest = left;
        }
        if (right < arr.length && comp(arr[right], arr[largest])) {
            largest = right;
        }
        if (largest != pos) {
            swap(largest, pos);
            bubbleDown(largest);
        }
    };

    var bubbleUp = function (pos) {
        if (pos <= 0) {
            return;
        }
        var parent = Math.floor((pos - 1) / 2);
        if (comp(arr[pos], arr[parent])) {
            swap(pos, parent);
            bubbleUp(parent);
        }
    };

    var that = {};

    that.pop = function () {
        if (arr.length === 0) {
            throw new Error("pop() called on emtpy binary heap");
        }
        var value = arr[0];
        var last = arr.length - 1;
        arr[0] = arr[last];
        arr.length = last;
        if (last > 0) {
            bubbleDown(0);
        }
        return value;
    };

    that.push = function (value) {
        arr.push(value);
        bubbleUp(arr.length - 1);
    };

    that.size = function () {
        return arr.length;
    };

    return that;
};

//// Test open heap
//var states = [3, 2, 9, 7, 10, 1, 12];
//var openHeap = new OpenHeap();
//for(var i = 0; i < states.length; i++){
//    openHeap.push({score: {f: states[i]}});
//}
//
//// print
//while(openHeap.size() !== 0){
//    var iter = openHeap.pop();
//    console.log(iter.score.f);
//}

//var states = [3, 2, 9, 7, 10, 1, 12];
//var s = {
//    hold: [1, 3, 222, 2],
//    capacity: [12, 9, 9, 9],
//    a: 'acb',
//    b: [1, 3, '4']
//};
////console.log(states.toString().hashCode());
//console.log(hashCode(obj2string(s)));

var definition = {
    Action: Action,
    Problem: Problem,
    createAction: createAction,
    createProblem: createProblem,
    ALGORITHM: ALGORITHM
};


if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = definition;
} else if (typeof define === 'function' && define.amd) {
    define([], definition);
} else {
    var exports = definition;
    for (var key in exports) {
        window[key] = exports[key];
    }
}
