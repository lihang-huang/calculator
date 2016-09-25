//计算器总共由4个部分组成：屏幕输出模块，存储与运算模块，计算模块，清除模块。
Array.prototype.insert = function(index, item) {
    this.splice(index, 0, item);
};

Array.prototype.remove = function(from, to) {
    //删除数组元素
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

// 添加浮点数精确计算方法
//加法函数，用来得到精确的加法结果
//说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
//调用：accAdd(arg1,arg2)
//返回值：arg1加上arg2的精确结果
function accAdd(arg1,arg2){
    var r1,r2,m;
    try{r1=arg1.toString().split(".")[1].length}catch(e){r1=0}
    try{r2=arg2.toString().split(".")[1].length}catch(e){r2=0}
    m=Math.pow(10,Math.max(r1,r2))
    return (arg1*m+arg2*m)/m
}

//乘法函数，用来得到精确的乘法结果
//说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
//调用：accMul(arg1,arg2)
//返回值：arg1乘以arg2的精确结果
function accMul(arg1,arg2)
{
    var m=0,s1=arg1.toString(),s2=arg2.toString();
    try{m+=s1.split(".")[1].length}catch(e){}
    try{m+=s2.split(".")[1].length}catch(e){}
    return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m)
}

//除法函数，用来得到精确的除法结果
//说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
//调用：accDiv(arg1,arg2)
//返回值：arg1除以arg2的精确结果
function accDiv(arg1,arg2){
    var t1=0,t2=0,r1,r2;
    try{t1=arg1.toString().split(".")[1].length}catch(e){}
    try{t2=arg2.toString().split(".")[1].length}catch(e){}
    with(Math){
        r1=Number(arg1.toString().replace(".",""))
        r2=Number(arg2.toString().replace(".",""))
        return (r1/r2)*pow(10,t2-t1);
    }
}


var output = []; //屏幕输出与值寄存器,数据结构['','',''...]
var initial = "0"; //屏幕初始值
var result = ''; //计算结果寄存器
var temValue = [0, 0]; //四则运算value1与value2寄存器
var spValue = 0; //特殊运算值寄存器：包括三角函数、倒数、取负数、百分比、开根号
var flag = 0; //temValue寄存器指针,0指向value1，1指向value2
var sign = ''; //运算符寄存器
var screen;

//按钮值捕获
var capture = function() {
    var nodeValue = this.value;
    //输出屏幕
    screenOutput(nodeValue);
    //输入寄存器——计算
    stock(nodeValue);
}

//清除模块
var clear = function() {
    temValue = [0, 0];
    sign = '';
    flag = 0;
}

var clearButton = function() {
    clear();
    result = '';
    spValue = 0;
    output = [];
    screen.innerHTML = initial;
}

//windows.onload注册事件
window.onload = function() {
    screen = document.getElementById('screen-output'); //声明一个屏幕元素变量
    screen.innerHTML = initial;
    var button = document.getElementsByTagName('button');
    for (var i = 1; i < button.length; i++) {
        // button元素中，跳过第1个与第3个按钮
        if (i == 2) {
            continue;
        } else {
            if (navigator.appName == "Microsoft Internet Explorer") { //IE兼容
                button[i].onclick = capture;
            } else {
                button[i].addEventListener("click", capture, false); //冒泡阶段触发
            }
        }
    }
    if (navigator.appName == "Microsoft Internet Explorer") {//IE兼容
        button[2].onclick = clearButton;
    }else{
    	button[2].addEventListener("click", clearButton, false);
    }
}

//屏幕输出部分
var screenOutput = function(inputValue) {
    //inputValue为通过点击捕获的按钮value,条件：值为数字或小数点
    if (!isNaN(inputValue) || inputValue == '.') {
        if (inputValue == '.') {
            for (var i = 0; i < output.length; i++) {
                if (inputValue == output[i]) {
                    return;
                }
            }
        }
        output.push(inputValue);
        var screenValue = output.join('');
        if (isNaN(parseFloat(screenValue))) {
            //只输入一个“.”的情况
            output.insert(0, '0');
            screenValue = output.join('');
            screen.innerHTML = screenValue;
        } else if (/^0?0$/.test(screenValue) && !/0.0+/.test(screenValue)) {
            //“0000”的情况
            output = [output[0]];
        } else if (screenValue == '0.' || /0.0+/.test(screenValue)) {
            screen.innerHTML = screenValue;
        } else {
            screen.innerHTML = String(parseFloat(screenValue));
        }
    } else if (inputValue == 'back') {
        if (output.length != 0 && output.length != 1) {
            output.remove(-1);
            var screenValue = output.join('');
            screen.innerHTML = screenValue;
        } else if (output.length == 1) {
            output.remove(-1);
            screen.innerHTML = initial;
        } else {
            screen.innerHTML = initial;
        }
    }
}

// 存储与运算模块
var stock = function(inputValue) {
    // 存储的条件是当事件触发运算符
    if (inputValue == "+" || inputValue == "-" || inputValue == "/" || inputValue == "*" || inputValue == "=") {
        // 四则运算
        if (output.length != 0) {
            temValue[flag] = parseFloat(output.join(""));
        } else if (result.length != 0) {
            temValue[0] = result;
            flag = 1;
        } else {
            temValue[flag] = initial;
        }
        result = compute(sign, temValue[0], temValue[1]);
        temValue[0] = result;

        if (inputValue != '=') {
            sign = inputValue;
            flag = 1;
        } else {
            clear();
        }
        screen.innerHTML = String(result);
        output = [];
    } else if (inputValue == "sin" || inputValue == "cos" || inputValue == "tan" || inputValue == "sqrt" || inputValue == "part" || inputValue == "neg" || inputValue == "%") {
        //特殊运算符
        if (output.length != 0) {
            spValue = parseFloat(output.join(""));
        } else if (result.length != 0) {
            spValue = result;
        } else {
            spValue = initial;
        }
        sign = inputValue;
        result = compute(sign, spValue);
        screen.innerHTML = String(result);
        sign = '';
        output = [];
    }
}

//计算模块
var compute = function(sign, value1, value2) {
    //sign为运算符形参，value1为计算值形参（包含四则运算和特殊运算），value2为计算值形参
    var computeResult;
    switch (sign) {
        case "+":
            computeResult = accAdd(value1,value2);
            break;
        case "-":
            computeResult = value1 - value2;
            break;
        case "*":
            computeResult = accMul(value1,value2);
            break;
        case "/":
            if (value2 == 0) {
                computeResult = 'error';
                alert('除数不能为0！');
                break;
            }
            computeResult = accDiv(value1,value2);
            break;
        case "sin":
            computeResult = Math.sin(2 * Math.PI / 360 * value1);
            break;
        case "cos":
            computeResult = Math.cos(2 * Math.PI / 360 * value1);
            break;
        case "tan":
            computeResult = Math.tan(2 * Math.PI / 360 * value1);
            break;
        case "part":
            if (value1 == 0) {
                computeResult = 'error';
                alert('除数不能为0！');
                break;
            }
            computeResult = 1 / value1;
            break;
        case "%":
            computeResult = value1 / 100;
            break;
        case "neg":
            computeResult = -value1;
            break;
        case "sqrt":
            if (value1 < 0) {
                computeResult = "error";
                alert("负数无法进行根号运算！");
                break;
            }
            computeResult = Math.sqrt(value1);
            break;
        default:
            computeResult = value1;
    }
    return parseFloat(computeResult.toFixed(5));
}
