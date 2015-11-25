/**
 * Created by Nguyen Duc Thinh on 11/25/2015.
 */
var GSolver = require('./GSolver');

var actions = [new GSolver.Action('move', null,function(position, val){
    var temp = position.puzzle[position.space.x][position.space.y];
    position.puzzle[position.space.x][position.space.y] = position.puzzle[position.space.x + val.deltaX][position.space.y + val.deltaY];
    position.space.x += val.deltaX;
    position.space.y += val.deltaY;
    position.puzzle[position.space.x][position.space.y] = temp;
}, function(position, takeAction){
    if (position.space.x > 0){
        takeAction({deltaX: -1, deltaY: 0});
    }
    if (position.space.x < position.puzzle[0].length - 1){
        takeAction({deltaX: 1, deltaY: 0});
    }
    if (position.space.y > 0){
        takeAction({deltaX: 0, deltaY: -1});
    }
    if (position.space.y < position.puzzle.length - 1){
        takeAction({deltaX: 0, deltaY: 1});
    }
})];

var problem = new GSolver.Problem(actions, {
    puzzle: [
        [5,0,1],
        [4,3,8],
        [6,7,2]
    ],
    space: {x: 0, y: 1}
}, [], function(position){
    var goal = [
        [1, 2, 3],
        [4, 0, 5],
        [6, 7, 8]
    ];
    for(var i = 0; i < goal.length; i++){
        for(var j = 0; j < goal[i].length; j++){
            if (goal[i][j] !== position.puzzle[i][j]){
                return false;
            }
        }
    }
    return true;
});

console.log(problem.findSolution());



