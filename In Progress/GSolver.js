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
var Action = function(_name, _val, _fdo, _gstate){
    return {
        name: _name,
        fdo: function(state, val){
            var position = clone(state.position);
            _fdo(position, val);
            var newState = new State(position, state, {name: _name, val: val});
            return newState;
        },
        val: _val,
        gstate: function(state, faction){
            _gstate(state.position, faction);
        }
    }
};

/*
*
*   @function State
*
* */
var State = function(_position, _predState, _predAction){
    return {
        position: _position,
        predState: _predState,
        predAction: _predAction,
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

    me.checkRuleGoal = function(state){
        if (goal(state)){
            state.goal = true;
        }
        else {
            for(var i = 0; i < rule.length; i++){
                if (rule[i](state.position)){
                    return false;
                }
            }
        }
        return true;
    }

    // Generate all possible states
    this.statesGenerate = function(){
        var gStates = [];
        for(var akey in actions){
            actions[akey].gstate(me.currentState, function(action){
                var newState = actions[akey].fdo(me.currentState, action),
                    isRule = true;
                if (goal(newState.position)){
                    newState.goal = true;
                }
                else {
                    for(var i = 0; i < rule.length && isRule; i++){
                        isRule = rule[i](newState.position);
                    }
                }
                if (newState.goal || (isRule && !me.belongBlackList((newState.position)))){
                    backList.push(newState.position);
                    gStates.push(newState);
                }
            });
        }
        return gStates;
    }

    // Find a solution using deep search
    this.findSolution = function(currentState){
        if (!currentState){
            currentState = me.initState;
        }
        me.currentState = currentState;

        if (!goal(currentState.position)){
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

module.exports = {
    Action: Action,
    Problem: Problem
};