/**
 * Created by Nguyen Duc Thinh on 12/1/2015.
 */
var GSolver = require('./GSolver');
var ListAtt = {
    Fat: 0,
    Son: 1,
    Dau: 2,
    Dog: 3,
    Mou: 4,
    Rab: 5
};

var ListName = ["Fat", "Son", "Dau", "Dog", "Mou", "Rab"];

var initState = [1, 1, 1, 1, 2, 2];
var nObj = 8;
var A = {nObj: nObj, obj: initState};
var B = {nObj: 0, obj: [0, 0, 0, 0, 0, 0]}
var boatPosition = 'A';

var initPosition = {
    A: A,
    B: B,
    boatPosition: boatPosition
};

var actionBoatMoving = new GSolver.Action('move')
    .setGeneration(function(position, takeAction){
        var start = position.boatPosition, end  = (start === 'A')?'B':'A';
        for(var i = 0; i <= 2; i++){
            if (position[start].obj[i] > 0){
                takeAction({
                    start: start,
                    end: end,
                    obj: [i]
                });
                for(var j = i + 1; j < position[start].obj.length; j++){
                    if (position[start].obj[j] > 0){
                        takeAction({
                            start: start,
                            end: end,
                            obj: [i, j]
                        });
                    }
                }
            }
        }
    })
    .setDo(function(position, content){
        for(var i = 0; i < content.obj.length; i++){
            position[content.start].obj[content.obj[i]]--;
            position[content.start].nObj--;
            position[content.end].obj[content.obj[i]]++;
            position[content.end].nObj++;
        }
        position.boatPosition = content.end;
    });

var boatRiverProb = new GSolver.Problem(initPosition)
    .addAction(actionBoatMoving)
    .addRule(function (position) {
        for (var land in {'A': true, 'B': true}) {
            if (!position[land].obj[ListAtt.Fat] && position[land].obj[ListAtt.Dog]
                && position[land].nObj >= 2) {
                return false;
            }
        }
        return true;
    })
    .addRule(function (position) {
        for (var land in {'A': true, 'B': true}) {
            if (!position[land].obj[ListAtt.Dau] && position[land].obj[ListAtt.Son]
                && position[land].obj[ListAtt.Rab]) {
                return false;
            }
        }
        return true;
    })
    .addRule(function (position) {
        for (var land in {'A': true, 'B': true}) {
            if (!position[land].obj[ListAtt.Son] && position[land].obj[ListAtt.Dau]
                && position[land].obj[ListAtt.Mou]) {
                return false;
            }
        }
        return true;
    })
    .setGoal(function (position){
        return position.A.nObj === 0;
    });
var heurestic = function(position){
    return position.B.nObj;
}

var result = boatRiverProb.findSolution(GSolver.ALGORITHM.DFS);

var step = 0;
var printAtt = function(list){
    var s = "";
    if (list) {
        for(var i = 0; i < list.length; i++){
            s += ListName[list[i]] + " ,";
        }
    }
    return s;
}

var printLand = function(list){
    var s = "";
    if (list) {
        for(var i = 0; i < list.length; i++){
            if (list[i] > 0){
                s += ListName[i] + " " + list[i] + ",";
            }
        }
    }
    return s;
}

var printResult = function(prob){
    if (prob){
        printResult(prob.preState);
        step++;
        console.log("------------Step " + step + " --------------");
        console.log("A: " + printLand(prob.position.A.obj));
        if (prob.preAction && prob.preState){
            console.log("Move from " + prob.preAction.content.start + " to " + prob.preAction.content.end + ": " + printAtt(prob.preAction.content.obj));
        }
        console.log("B: " + printLand(prob.position.B.obj));
    }
}

if (result){
    printResult(result);
}