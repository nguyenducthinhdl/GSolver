/**
 * Created by Nguyen Duc Thinh on 10/11/2015.
 */
var ListAtt = {
    Fat: 0,
    Son: 1,
    Dau: 2,
    Dog: 3,
    Mou: 4,
    Rab: 5
};

var ListName = ["Fat", "Son", "Dau", "Dog", "Mou", "Rab"];

var fn_isHuman = function(element){
    return element.att != undefined && element.att <= ListAtt.Dau;
};

var removeArray = function(list, cmp){
    for(var i = 0; i < list.length; i++){
        if (cmp(list[i])){
            return list.slice(0, i).concat(list.slice(i + 1));
        }
    }
    return list;
};

var compareArray = function(listA, listB){
    if (listA.length === listB.length){
        for(var i = 0; i < listA.length; i++){
            var find = false;
            for(var j = 0; j < listB.length && !find; j++){
                if (listA[i].id === listB[j].id){
                    find = true;
                }
            }
            if (find == false){
                return false;
            }
        }
        return true;
    }
    return false;
}

var id = 0;
var Att = function(_att){
    id++;
    return {
        att: _att,
        id: id
    };
};

var condition = function(list){
    var con = [];
    for(var i = 0; i < list.length; i++){
        con[list[i].att] = true;
    }

    // condition 1, 2 and 3
    var cond1 = !con[ListAtt.Fat] && con[ListAtt.Dog] && list.length >= 2;
    var cond2 = !con[ListAtt.Dau] && con[ListAtt.Son] && con[ListAtt.Rab];
    var cond3 = con[ListAtt.Dau] && !con[ListAtt.Son] && con[ListAtt.Mou];

    return !cond1 && !cond2 && !cond3;
}

var Action = function(_dir, _val){
    return {
        dir: _dir,
        val: _val
    };
}

var arrCopy = function(arr){
    var arrRet = [];
    for(var i = 0; i < arr.length; i++){
        arrRet.push(arr[i]);
    }
    return arrRet;
}

var closeList = [];
// currentDir = -1 --> boat on the A direction
var Prob = function(_A, _B, _currentDir, _pred, _action){
    return {
        currentDir: _currentDir,
        A: _A,
        B: _B,
        pred: _pred,
        actionToPred: _action,
        checkSuccess: function(){
            return this.A.length === 0;
        },
        checkCondition: function(){
            return this.checkSuccess() || (condition(this.A) && condition(this.B));
        },
        takeAction: function(action){
            var nA = this.A.slice(), nB = this.B.slice();
            if (this.currentDir === -1){
                for(var i = 0; i < action.val.length; i++){
                    nB.push(action.val[i]);
                    nA = removeArray(nA, function(v){
                        return v.id === action.val[i].id;
                    });
                }
            }
            else {
                for(var i = 0; i < action.val.length; i++){
                    nA.push(action.val[i]);
                    nB = removeArray(nB, function(v){
                        return v.id === action.val[i].id;
                    });
                }
            }
            return new Prob(nA, nB, -this.currentDir, this, action);
        },
        geneAction: function(){
            var arrProb = [], field = this.B;
            if (this.currentDir == -1){
                field = this.A;
            }
            for(var i = 0; i < field.length; i++){
                if (fn_isHuman(field[i])){
                    for(var j = i + 1; j < field.length; j++){
                        var newAction2 = new Action(-1*this.currentDir, [field[i], field[j]]);
                        var newProb2 = this.takeAction(newAction2);
                        if (newProb2.checkCondition() && !newProb2.isClosed(closeList)){
                            arrProb.push(newProb2);
                            closeList.push(newProb2);
                        }
                    }

                    var newAction1 = new Action(-1*this.currentDir, [field[i]]);
                    var newProb1 = this.takeAction(newAction1);
                    if (newProb1.checkCondition() && !newProb1.isClosed(closeList)){
                        arrProb.push(newProb1);
                        closeList.push(newProb1);
                    }
                }
                else {
                    for(var j = i + 1; j < field.length; j++){
                        if (fn_isHuman(field[j])){
                            var newAction2 = new Action(-1*this.currentDir, [field[i], field[j]]);
                            var newProb2 = this.takeAction(newAction2);
                            if (newProb2.checkCondition() && !newProb2.isClosed(closeList)){
                                arrProb.push(newProb2);
                                closeList.push(newProb2);
                            }
                        }
                    }
                }
            }
            return arrProb;
        },
        isClosed: function(list){
            for(var i = 0; i < list.length; i++){
                if (compareArray(this.A, list[i].A) && compareArray(this.B, list[i].B)
                    && this.currentDir == list[i].currentDir){
                    return true;
                }
            }
            return false;
        }
    }
};

var printAtt = function(list){
    var s = "";
    if (list) {
        for(var i = 0; i < list.length; i++){
            s += ListName[list[i].att] + " ";
        }
    }
    return s;
}

var step = 0;
var printResult = function(prob){
    if (prob){
        printResult(prob.pred);
        step++;
        console.log("------------Step " + step + " --------------");
        console.log("A: " + printAtt(prob.A));
        if (prob.actionToPred && prob.pred){
            var from =  (prob.pred.currentDir == -1)?"A":"B";
            var to = (prob.pred.currentDir == -1)?"B":"A";
            console.log("Move from " + from + " to " + to + ": " + printAtt(prob.actionToPred.val));
        }
        console.log("B: " + printAtt(prob.B));
    }
}

var fn_findSolution = function (prob) {
    if (prob.checkSuccess()) {
        console.log("Find Solution");
        printResult(prob);
        return true;
    }
    else {
        var arrGenPro = prob.geneAction();
        var i = 0;
        while(arrGenPro.length > i && !fn_findSolution(arrGenPro[i++]));
    }
    return false;
}

var A = [
        new Att(ListAtt.Fat), new Att(ListAtt.Son), new Att(ListAtt.Dau),
        new Att(ListAtt.Rab), new Att(ListAtt.Dog), new Att(ListAtt.Mou),
        new Att(ListAtt.Mou), new Att(ListAtt.Rab)
    ];
//var A = [
//        new Att(ListAtt.Fat), new Att(ListAtt.Son),
//        new Att(ListAtt.Rab)
//    ];

var prob = new Prob(A, [], -1);
fn_findSolution(prob);

//process.exit(1);

//var arr = [new Att(ListAtt.Fat), new Att(ListAtt.Dau), new Att(ListAtt.Rab)];
//console.log(arr);
//arr = removeArray(arr, function(a){
//    return a.id === 4;
//});
//console.log(arr);

