/**
 * Created by Nguyen Duc Thinh on 11/25/2015.
 */
var GSolver = require('./GSolver');

var moveAction = {
    name: 'move',
    do: function (position, content) {
        var temp = position.puzzle[position.space.x][position.space.y];
        position.puzzle[position.space.x][position.space.y] =
            position.puzzle[position.space.x + content.deltaX][
            position.space.y + content.deltaY
                ];
        position.space.x += content.deltaX;
        position.space.y += content.deltaY;
        position.puzzle[position.space.x][position.space.y] = temp;
    },
    generation: function (position, takeAction) {
        if (position.space.x > 0) {
            takeAction({deltaX: -1, deltaY: 0});
        }
        if (position.space.x < position.puzzle[0].length - 1) {
            takeAction({deltaX: 1, deltaY: 0});
        }
        if (position.space.y > 0) {
            takeAction({deltaX: 0, deltaY: -1});
        }
        if (position.space.y < position.puzzle.length - 1) {
            takeAction({deltaX: 0, deltaY: 1});
        }
    }
};

var goal = [
    [1, 2, 3],
    [4, 0, 5],
    [6, 7, 8]
];

var puzzleProblem = GSolver.createProblem(
    {
        puzzle: [
            [5, 0, 1],
            [4, 3, 8],
            [6, 7, 2]
        ],
        space: {x: 0, y: 1}
    }).setGoal(
    function (position) {
        for (var i = 0; i < goal.length; i++) {
            for (var j = 0; j < goal[i].length; j++) {
                if (goal[i][j] !== position.puzzle[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
).addAction(moveAction);

/*
*
*   @function: calculate the manhattan distance
*
* */
var manhattanDistanceHeuristic = function (puzzleA, puzzleB) {
    if (puzzleA.length !== puzzleB.length &&
        puzzleA[0].length != puzzleA.length &&
        puzzleB[0].length != puzzleB.length) {
        throw new Error('Input is not valid');
    }
    else {
        var positionA = new Array(puzzleA.length*puzzleA.length);
        for(var i = 0; i < puzzleA.length; i++){
            for(var j = 0; j < puzzleA[i].length; j++){
                positionA[puzzleA[i][j]] = {
                    x: i,
                    y: j
                };
            }
        }
        var dRet = 0;
        for(var i = 0; i < puzzleB.length; i++){
            for(var j = 0; j < puzzleB[i].length; j++){
                dRet += Math.abs(positionA[puzzleB[i][j]].x - i) +
                Math.abs(positionA[puzzleB[i][j]].y - j);
            }
        }
        return dRet;
    }
};

var tBeginFindSolution = (new Date()).getTime();
//console.log(puzzleProblem.aStar({
//    cost: function(){
//        return -1;
//    }
//}));
console.log(puzzleProblem.findSolution(GSolver.ALGORITHM.ASTAR().setHeuristic(
    function (position) {
        return manhattanDistanceHeuristic(goal, position.puzzle);
    }
)));

console.log("Time to BFS " + ((new Date()).getTime() - tBeginFindSolution) / 1000 + " seconds");

//console.log(manhattanDistanceHeuristic([
//    [5, 0, 1],
//    [4, 3, 8],
//    [6, 7, 2]
//], [
//    [1, 2, 3],
//    [4, 0, 5],
//    [6, 7, 8]
//]));



