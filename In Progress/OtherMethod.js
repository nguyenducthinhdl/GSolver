/**
 * Created by Nguyen Duc Thinh on 11/23/2015.
 */
//
//
//      S --action--> S'
//      Action ---> ActionsGenerate
//
//
//

// @function: clone object
var clone = function(obj){
    // clone object
    var ret = null,
        tobj = typeof obj;
    if (tobj === 'number' || tobj === 'string'){
        return obj;
    }

    if (tobj === 'object'){
        if (Array.isArray(obj)){
            ret = [];
            for(var i = 0; i < obj.length; i++){
                ret.push(clone(obj[i]));
            }
            return ret;
        }
        else { // Json object
            ret = {};
            for(var key in obj){
                ret[key] = clone(obj[key]);
            }
        }
    }

    return ret;
}

// @function: compare object
var compare = function(xobj, yobj){
    var txobj = typeof xobj,
        tyobj = typeof yobj;
    if (txobj === tyobj){
        if (txobj === 'string' || tyobj === 'number'){
            return xobj === yobj;
        }

        if (txobj === 'object'){
            if (Array.isArray(xobj)){
                if (xobj.length === yobj.length){
                    for(var i = 0; i < xobj.length; i++){
                        if (!compare(xobj[i], yobj[i])){
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
                for(var key in xobj){
                    if (undefined == yobj[key]){
                        checkKey = false;
                    }
                }

                for(var key in yobj){
                    if (undefined == xobj[key]){
                        checkKey = false;
                    }
                }

                if (checkKey){
                    for(var key in xobj){
                        if (!compare(xobj[key], yobj[key])){
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
var Action = function(_name, _fdo, _gstate, _val){
    return {
        name: _name,
        fdo: function(state, val){
            var position = clone(state.position);
            _fdo(position, val);
            var newState = new State(position, state, {name: _name, content: val});
            return newState;
        },
        content: _val,
        generation: function(state){
            var gactions = _gstate(state.position);
            var ret = [];
            for(var i = 0; i < gactions.length; i++){
                ret.push(this.fdo(state, gactions[i]));
            }
            return ret;
        }
    }
};

var State = function(_position, _predState, _predAction){
    return {
        position: _position,
        preState: _predState,
        preAction: _predAction,
        goal: false
    }
};

var Problem = function(actions, initState, rule, goal){
    this.initState = new State(initState, null, null);
    this.currentState = this.initState;
    var me = this;
    var backList = [];

    me.belongBlackList = function(position){
        for(var i = 0; i < backList.length; i++){
            if (compare(position, backList[i])){
                return true;
            }
        }
        return false;
    };

    // Generate all possible states
    this.statesGenerate = function(){
        var gStates = [];
        for(var akey in actions){
            var newStates = actions[akey].generation(me.currentState);
            for(var istate in newStates){
                var newState = newStates[istate],
                    isRule = true;
                if (goal(newState)){
                    newState.goal = true;
                }
                else {
                    for(var i = 0; i < rule.length && isRule; i++){
                        isRule = rule[i](newState);
                    }
                }
                if (newState.goal || (isRule && !me.belongBlackList((newState.position)))){
                    backList.push(newState.position);
                    gStates.push(newState);
                }
            }
        }
        return gStates;
    }

    // Find a solution using deep search
    this.findSolution = function(currentState){
        if (!currentState){
            currentState = me.initState;
        }
        me.currentState = currentState;

        if (!goal(currentState)){
            var gState = me.statesGenerate();
            while(gState.length != 0){
                var backState = gState.pop();
                if (me.findSolution(backState)){
                    return true;
                }
                delete backState;
            }
            return false;
        }
        else {
            // Found solution
            return true;
        }
    }
};

var actions = [new Action(
                    "fill",
                    function(position, val){
                        position.hold[val.from] -= val.water;
                        position.hold[val.to] += val.water;
                    },
                    function(position){
                        var actions = [];
                        for(var i = 0; i < position.hold.length; i++){
                            for(var j = i + 1; j < position.hold.length; j++){
                                if (position.hold[j] > 0 && position.hold[i] < position.capacity[i]){
                                    var water = Math.min(position.hold[j], position.capacity[i] - position.hold[i]);
                                    actions.push({
                                        from: j,
                                        to: i,
                                        water: water
                                    });
                                }

                                if (position.hold[i] > 0 && position.hold[j] < position.capacity[j]){
                                    var water = Math.min(position.hold[i], position.capacity[j] - position.hold[j]);
                                    actions.push({
                                        from: i,
                                        to: j,
                                        water: water
                                    });
                                }
                            }
                        }
                        return actions;
                    }
                )
];
var problem = new Problem(
    actions,
    {
        hold: [1, 3, 6, 4],
        capacity: [12, 9, 9, 9]
    },
    [],
    function(state){
        return state.position.hold[0] === 10;
    }
);

if (problem.findSolution()){
    console.log("Find Solution");
    // print solution
    var printState = problem.currentState;
    var s = "";
    while(printState){
        var m = "----------------\n";
        if (printState.preAction){
            m += "action: tranfer " + printState.preAction.content.water + " from " +
            printState.preAction.content.from + " to " + printState.preAction.content.to + "\n";
        }
        m += "Current holding water: " + printState.position.hold + "\n";
        s = m + s;
        printState = printState.preState;
    }
    console.log(s);
}

var p = {
    hold: [1, 3, 6, 4],
    capacity: [12, 9, 9, 9]
};

var q = {
    hold: [1, 3, 6, 4],
    capacity: [12, 9, 9, 9]
};

//console.log(compare(p, q));