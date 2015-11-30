/**
 * Created by Nguyen Duc Thinh on 11/24/2015.
 */
var GSolver = require('./GSolver');

var fillAction = {
    name: 'fill',
    do: function(position, content){
        position.hold[content.from] -= content.water;
        position.hold[content.to] += content.water;
    },
    generation: function(position, takeAction){
        for(var i = 0; i < position.hold.length; i++){
            for(var j = i + 1; j < position.hold.length; j++){
                if (position.hold[j] > 0 && position.hold[i] < position.capacity[i]){
                    var water = Math.min(position.hold[j], position.capacity[i] - position.hold[i]);
                    takeAction({
                        from: j,
                        to: i,
                        water: water
                    });
                }

                if (position.hold[i] > 0 && position.hold[j] < position.capacity[j]){
                    var water = Math.min(position.hold[i], position.capacity[j] - position.hold[j]);
                    takeAction({
                        from: i,
                        to: j,
                        water: water
                    });
                }
            }
        }
    }
};

var problem = GSolver.createProblem({
    hold: [1, 3, 6, 4],
    capacity: [12, 9, 9, 9]
}).addAction(fillAction).setGoal(function (position) {
    return position.hold[0] == 10
});

//if (problem.findSolution()){
var result = problem.findSolution(GSolver.ALGORITHM.DFS);
//if (problem.findSolution()){
if (result){
    console.log("Find Solution");
    // print solution
    var printState = result;
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

