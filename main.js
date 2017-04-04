function $(s){
	return document.querySelectorAll(s);
}
var box = $(".canvas")[0];
var canvas = document.createElement("canvas");
var startX=startY=0;//canvas左上角坐标
var height=width=0;//canvas宽高
var r = 0;//半径
var circleX = 0;//第一个圆的圆心坐标X
var circleY = 0;//坐标y
var pointOrder = [];//当前输入
var times = 0;//已设置次数
var firstSet = [];//首次成功设置的密码
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

//页面初始化
init();
function init(){
	setWH(box);
	initListener();
	drawBase();
}

//canvas宽高设置
function setWH(){
	box.height = box.clientWidth;
	canvas.height = box.clientWidth;
	canvas.width = box.clientWidth;
	height=width=box.clientWidth;
	startX=startY=(box.clientWidth/0.7-box.clientWidth)/2;
	r = height/6*0.45;
	circleX = height/6;
	circleY = circleX;
}

//初始化事件监听
function initListener(){
    canvas.addEventListener("touchstart", function (e) {
        beSelected(e.touches[0],pointOrder);
    }, false);
    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        var touches = e.touches[0];
        beSelected(touches,pointOrder);
        ctx.clearRect(0,0,width,height);
        drawChange(pointOrder,{X:touches.pageX,Y:touches.pageY});
        console.log();
    }, false);
    canvas.addEventListener("touchend", function (e) {
        ctx.clearRect(0,0,width,height);
        drawBase();
        judgePoint(pointOrder);
        pointOrder=[];
    }, false);
}



//绘制9圆基础背景
function drawBase(){
	ctx.beginPath();
	ctx.strokeStyle = "#CBCBCB";//线
	ctx.fillStyle = "#E5E2E2";//面
	ctx.lineWidth = 3;
	var order = 0;
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			ctx.moveTo(circleX+j*width/3+r,circleY+i*height/3);
			ctx.arc(circleX+j*width/3,circleY+i*height/3,r,0,2*Math.PI,false);
		}
	}
	ctx.stroke();
	ctx.fill();
}

function drawChange(orderArr,pos){
	drawBase();
	ctx.beginPath();
	ctx.strokeStyle = "red";
	ctx.lineWidth = 6;
	ctx.lineCap = "round";
	//绘制已选中点以及之间的连线
	var x = function(index){return (orderArr[index])%3;};
	var y = function(index){return Math.ceil((orderArr[index]+1)/3)-1;};
	ctx.moveTo(circleX+x(0)*width/3,circleY+y(0)*height/3);
	for(var i = 0;i < orderArr.length;i++){
		ctx.lineTo(circleX+x(i)*width/3,circleY+y(i)*height/3);
		ctx.stroke();
		ctx.beginPath();
		ctx.fillStyle = "#FFA726";
		ctx.strokeStyle = "#FFA726";
		ctx.moveTo(circleX+x(i)*width/3+r,circleY+y(i)*height/3);
		ctx.arc(circleX+x(i)*width/3,circleY+y(i)*height/3,r,0,2*Math.PI,false);
		ctx.stroke();
		ctx.fill();
		ctx.beginPath();
		ctx.strokeStyle = "red";
		ctx.moveTo(circleX+x(i)*width/3,circleY+y(i)*height/3);
	}
	ctx.stroke();
	ctx.fill();
}

//选中判断
function beSelected(touch,pointOrder){
	var line = Math.ceil((touch.pageY-startX)/(width/3))-1;//所在的行
	var col = Math.ceil((touch.pageX-startY)/(height/3))-1;//所在列
	var closeX = circleX+col*width/3;//对应方格圆心X
	var closeY = circleY+line*height/3;//圆心y
	var dis = twoPointDisPow(touch.pageX-startX,touch.pageY-startY,closeX,closeY);
	if(dis <= r*r){
		if(pointOrder.indexOf(line*3+col) == -1){
			pointOrder.push(line*3+col);
		}
		//绕线经过判断
		if(pointOrder.length>1){
			var lastX = Math.floor(pointOrder[pointOrder.length-2]/3);
			var lastY = (pointOrder[pointOrder.length-2])%3;
			var ifMiddleDis = Math.ceil(twoPointDisPow(closeX,closeY,circleX+lastY*width/3,circleY+lastX*height/3));
			if(ifMiddleDis == Math.ceil(Math.pow(height*2/3,2)) || ifMiddleDis == Math.ceil(8/9*Math.pow(height,2))){
				var latest = pointOrder[pointOrder.length-2];
				var temp = pointOrder.pop();
				pointOrder.push((latest+temp)/2);
				pointOrder.push(temp);
			}
		}
	}
}

//两点间距离的平方
function twoPointDisPow(oneX,oneY,twoX,twoY){
	return Math.pow(oneX-twoX,2)+Math.pow(oneY-twoY,2);
}

//绘制完成检查并存储或校验正确性
function judgePoint(orderArr){
	//获取设置选择
	var func = document.getElementsByName("func");
	var tips = "请输入手势密码";
    if (func.item(0).checked) {
        func = parseInt(func.item(0).getAttribute("value"));
    }else{
    	func = parseInt(func.item(1).getAttribute("value"));
    }
	
	if(func){//验证密码
		var psw = getCode("code");
		if(psw){
			if(orderArr.toString() == psw){
				tips = "密码正确！";
			}else{
				tips = "输入的密码不正确";
			}
		}else{
			tips = "您尚未设置密码";
		}
	}else{//设置密码
		if(orderArr.length>4){
			if(!times){
				firstSet = orderArr;
				tips = "请再次输入手势密码";
				times++;
			}else{
				if(orderArr.toString()==firstSet.toString()){
					tips = "密码设置成功";
					times = 0;
					firstSet = [];
					setCode("code",orderArr.toString());
				}else{
					tips = "两次输入的不一致";
				}
			}
		}else if(orderArr.length>0){
			if(times==0){
				tips = "密码太短，至少需要5个点";
			}else{
				tips = "两次输入的不一致";
			}
		}
	}
	setTips(tips);
}

//浏览器支持性检测  
function ifSupportLocalStorage() {  
    try{  
        localStorage.setItem("test","ifSupport");  
        localStorage.removeItem("test");  
        return true;  
    }catch(e){  
        if(e.message){  
            console.log(e.name+":"+e.message);  
        }else{  
            //IE  
            console.log(e.name+":"+e.description);  
        }  
        return false;
    }  
}  

function setCode(key,value){  
	if(ifSupportLocalStorage()){
    	localStorage.setItem(key,value); 
	}
} 

function getCode(key){
    var code=localStorage.getItem(key);  
    return code;
}  

//设置页面提示信息
function setTips(tip){
	var objTip = $("#tips")[0];
	objTip.innerHTML = tip;
}
