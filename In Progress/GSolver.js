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
    if (undefined === input || typeof input === 'string') {
        return {name: input};
    }
    else {
        return {
            name: input.name,
            fdo: function (state, content) {
                var position = clone(state.position);
                input.do(position, content);
                var newState = new State(
                    position,
                    state,
                    {name: this.name, content: content}
                );
                return newState;
            },
            content: input.content,
            generation: function (state, faction) {
                input.generation(state.position, faction);
            },
            setDo: function (fdo) {
                this.fdo = fdo;
                return this;
            },
            setGeneration: function () {

            }
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
        heuristic: 0,
        distance: 0,
        nextStates: []
    }
};

var Problem = function (input) {
    var me = this;
    var blackList = [];
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
        for (var i = 0; i < blackList.length; i++) {
            if (compare(position, blackList[i])) {
                return true;
            }
        }
        return false;
    };

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
    this.statesGenerate = function () {
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
                if (newState.goal || (isRule && !me.belongBlackList((newState.position)))) {
                    blackList.push(newState.position);
                    gStates.push(newState);
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

    // Find a solution using deep search
    this.findSolution = function (currentState) {
        if (!currentState) {
            currentState = me.initState;
        }
        me.currentState = currentState;

        if (!me.goal(currentState.position)) {
            var gState = me.statesGenerate();
            while (gState.length != 0) {
                var backState = gState.pop();
                if (me.findSolution(backState)) {
                    return true;
                }
            }
            return false;
        }
        else {
            // Found solution
            return true;
        }
    }
};

var createAction = function (input) {
    return new Action(input);
};

var createProblem = function (input) {
    return new Problem(input);
}

module.exports = {
    Action: Action,
    Problem: Problem,
    createAction: createAction,
    createProblem: createProblem
};