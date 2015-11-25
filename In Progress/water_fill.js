/**
 * Created by Nguyen Duc Thinh on 11/24/2015.
 */
var GSolver = require('./GSolver');

var actions = [new GSolver.Action(
    "fill",
    null,
    function(position, val){
        position.hold[val.from] -= val.water;
        position.hold[val.to] += val.water;
    },
    function(position, takeAction){
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
)
];
var problem = new GSolver.Problem(
    actions,
    {
        hold: [1, 3, 6, 4],
        capacity: [12, 9, 9, 9]
    },
    [],
    function(position){
        return position.hold[0] === 10;
    }
);

if (problem.findSolution()){
    console.log("Find Solution");
    // print solution
    var printState = problem.currentState;
    var s = "";
    while(printState){
        var m = "----------------\n";
        if (printState.predAction){
            m += "action: tranfer " + printState.predAction.val.water + " from " +
            printState.predAction.val.from + " to " + printState.predAction.val.to + "\n";
        }
        m += "Current holding water: " + printState.position.hold + "\n";
        s = m + s;
        printState = printState.predState;
    }
    console.log(s);
}

