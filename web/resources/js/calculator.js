/******************************************************
Copyright (c/c++) 2013-doomsday by Alexey Slovesnov
homepage http://slovesnov.users.sourceforge.net/
email slovesnov@yandex.ru
All rights reserved.
******************************************************/
var replace=[
	['exp()','log()','pow(,)','sqrt()','abs()','random()','min(,)','max(,)']
	,['pi','e','sqrt2','sqrt1_2','ln2','ln10','log2e','log10e']
	,[]//fill below
	,[]//fill below
	,['ceil()','floor()','round()','atan2(,)']
];

parserInit();

function parserInit(){
	var i,j,k;
	var s=['sin','cos','tan','cot','sec','csc'];
	for(j=0;j<2;j++){
		for(k=0;k<2;k++){
			for(i=0;i<s.length;i++){
				replace[j+2].push( (k==0?'':'a') +s[i]+(j==1?'h':'')+'()');
			}
		}
	}
}

/*
calculate use eval, so eval(s) return ok if s is defined, but should be error
so variableArray defines case sensitive array which variables allowed
calculate("x+y") - error
calculate("x+y",['x','y']) - ok
variableArray can be undefined - error for every variable
if typeof variableArray is string - only one variable calculate("x",'x') - ok
if variableArray is array - calculate("x+y",['x','y']) - ok
for compile(), calculate() variables should be defined see http://slovesnov.users.sourceforge.net/scripts/graph_online.js
{
x=0
calculate('tan(x)','x') or compile('tan(x)','x')
}
*/
function calculate(expression,variableArray){
	var e=eval(compile(expression,variableArray));
	//check that eval returns not a string presents eval('log') returns string
	if(typeof e == 'number'){
		return e;
	}
	throw new Error("Invalid return type");
}

function compile(expression,variableArray){
	//todo calculate('1,2') = error
	//todo calculate('sin(1,2)') = error

	var i,j,k,s,e,f,t,r,va;
	e=expression.toLowerCase().replace(/\s+/g,"");
	if(e.length==0){
		throw new Error("Empty expression");
	}
	
	/*random()-> randomvalue
	several occurences 'random()' in string should be changed with different values, so use while cycle
	should do it before unbalanced parentheses checking
	*/
	while( (r=e.replace(/random\(\)/,Math.random() ))!=e ){//replace is not global
		e=r
	}
	
	//check unbalanced parentheses
	t=['(',')','[',']','{','}']
	for(s=0;s<t.length-1;s+=2){
		for(i=0;i<e.length;i++){
			if(e.charAt(i)==t[s]){
				for(k=0,j=i+1;j<e.length;j++){
					if(e.charAt(j)==t[s]){
						k++;
					}
					else if(e.charAt(j)==t[s+1]){
						if(k==0){
							calculate(e.substring(i+1, j),variableArray)
							break;
						}
						k--;
					}
				}
				if(j==e.length){
					throw new Error("Unbalanced parentheses")
				}
			}
		}
	}
	
	//should replace before search matches
	f=["\\[|\\{","\\]|\\}"];
	t=["(",")"];
	for(i=0;i<f.length;i++){
		e=e.replace(new RegExp(f[i],'gi'),t[i])
	}

	//javascript allows "random(bla,bla,bla)" but it's error test it
	if(new RegExp("random\\("+"(?!\\))").test(e)){
		throw new Error("Arguments of random function is not possible");
	}

	//javascript allows "2/+2" but it's error test it
	if(new RegExp("[+\\-\\*/][+\\-\\*/]").test(e)){
		throw new Error("Two operators in a row");
	}

	e=replaceRarelyFunctionText(e);
	for(j=0;j<replace.length;j++){
		r=replace[j]
		for(i=0;i<r.length;i++){
			s=r[i]
			k=s.indexOf('(');
			if(k==-1){//if no arguments toUpperCase pi->PI
				s=s.toUpperCase()
			}
			else{// remove brackets
				s=s.substring(0,k)
				if(s!='random'){
					//javascript allows "sin()" but it's error test it
					if(new RegExp(s+"\\("+"(?=\\))",'gi').test(e)){
						throw new Error("Function '"+s+"' should have argument(s)");
					}
				}
			}
			t='Math.'+s;
			e=e.replace(new RegExp("(^|[^a-z0-9_\.])"+s+"(?=\\W|$)",'gi'),'$1'+t)
		}
	}
	
	//BEGIN test only allowable variables fixed 7sep2019
	//works with expression because variableArray case sensitive
	s=expression
	if(typeof variableArray=='undefined'){
		f=[]
	}
	else if(typeof variableArray=='string'){
		f=[variableArray]
	}
	else{
		f=variableArray
	}
	for(i=0;i<f.length;i++){
		s=s.replace(new RegExp('\\b'+f[i]+'\\b','g'),"")//case sensitive
	}
	f=[]
	for(i=0;i<replace.length;i++){
		for(j=0;j<replace[i].length;j++){
			t=replace[i][j]
			k=t.indexOf('(')
			f.push(k==-1?t:t.substr(0,k))
		}
	}
	for(i=0;i<f.length;i++){
		s=s.replace(new RegExp('\\b'+f[i]+'\\b','gi'),"")//case insensitive
	}
	//replace all exponential numbers "1.2e+2" with ""
	s=s.replace(/[-+]?(\d*\.?\d+|\d+\.?\d*)e[-+]?\d+/gi,'');
	if((j=s.match(/[a-z_][a-z_\d]*/i))!=null){//case insensitive
		throw new Error("Unknown variable ["+j[0]+"]")
	}
	//END test only allowable variables fixed 7sep2019
	return e;
}

/*replaceFunctionText("2*cot(3)")=2*(1/tan(3))
string should not have whitespaces! and lowercased!
replace finctions which not Math object doesn't have
*/
function replaceRarelyFunctionText(s){
	var i,j,k,f,c,q,r;
	var fun=['cot','1/tan(#)'
		,'sec','1/cos(#)'
		,'csc','1/sin(#)'
		,'acot','pi/2-atan(#)'
		,'asec','acos(1/#)'
		,'acsc','asin(1/#)'
		,'sinh','(exp(#)-exp(-#))/2'
		,'cosh','(exp(#)+exp(-#))/2'
		,'tanh','(exp(2*#)-1)/(exp(2*#)+1)'
		,'coth','(exp(2*#)+1)/(exp(2*#)-1)'
		,'sech','2/(exp(#)+exp(-#))'
		,'csch','2/(exp(#)-exp(-#))'
		,'asinh','log(#+sqrt(#*#+1))'
		,'acosh','log(#+sqrt(#*#-1))'
		,'atanh','log((1+#)/(1-#))/2'
		,'acoth','log((#+1)/(#-1))/2'
		,'asech','log((1+sqrt(1-#*#))/#)'
		,'acsch','log(1/#+sqrt(1+#*#)/abs(#))']
	for(f=0;f<fun.length-1;f+=2){
		r=fun[f]+'('
		for(i=0;(i=s.indexOf(r,i))!=-1;){
			c=s.charAt(i-1)
			q=s.substring(0,i)+'(';
			i+=r.length;
			if(i!=r.length && c>='a' && c<='z' ){
				continue;
			}
			
			for(k=0,j=i;j<s.length;j++){
				c=s.charAt(j);
				if(c=='('){
					k++;
				}
				else if(c==')'){
					k--;
				}
				if(k==-1){
					break;
				}
			}
			
			s=q+fun[f+1].replace(/#/g ,'('+s.substring(i,j)+')' )+s.substring(j)
		}
	}
	return s
}
