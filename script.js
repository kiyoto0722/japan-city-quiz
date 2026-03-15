let map = L.map('map');

let geoLayer;

let cities = [];
let remainingCities = [];

let currentCity = null;
let currentPref = null;

let questionCount = 0;
let correctCount = 0;

let maxQuestion = 5;

let answering = false;
let gameOver = false;

let loadedPref = null;

const prefs = [

"hokkaido","aomori","iwate","miyagi","akita","yamagata","fukushima",

"ibaraki","tochigi","gunma","saitama","chiba","tokyo","kanagawa",

"niigata","toyama","ishikawa","fukui","yamanashi","nagano",

"gifu","shizuoka","aichi","mie",

"shiga","kyoto","osaka","hyogo","nara","wakayama",

"tottori","shimane","okayama","hiroshima","yamaguchi",

"tokushima","kagawa","ehime","kochi",

"fukuoka","saga","nagasaki","kumamoto","oita","miyazaki","kagoshima","okinawa"

];

function startGame(){

questionCount = 0;
correctCount = 0;

gameOver = false;

document.getElementById("modeSelect").disabled = true;
document.getElementById("startBtn").disabled = true;  

nextQuestion();

}

function nextQuestion(){

answering = false;

if(geoLayer){
geoLayer.resetStyle();
}

let mode =
document.getElementById("modeSelect").value;

if(mode==="random"){

currentPref =
prefs[Math.floor(Math.random()*prefs.length)];

}else if(mode==="tokyo23"){

currentPref="tokyo";

}else{

currentPref = mode;

}

if(currentPref !== loadedPref){

if(geoLayer){
map.removeLayer(geoLayer);
}
  
cities = [];

//fetch("geojson/pref/"+currentPref+".geojson")
fetch(currentPref+".json")

.then(res=>res.json())

.then(data=>{

loadedPref = currentPref;

geoLayer = L.geoJSON(data,{

style:{
color:"#006400",
weight:1,
fillColor:"#00aa00",
fillOpacity:1
},

onEachFeature:(feature,layer)=>{

let name = feature.properties.N03_004;

if(mode==="tokyo23"){

if(name.endsWith("区")){
if(!cities.includes(name)){
cities.push(name);
}
}

}else{

if(
name.endsWith("市") ||
name.endsWith("区") ||
name.endsWith("町") ||
name.endsWith("村")
){
if(!cities.includes(name)){
cities.push(name);
}
}

}

layer.on("click",()=>{

if(gameOver) return;
if(answering) return;
if(!currentCity) return;

answering = true;

let name = feature.properties.N03_004;

if(name===currentCity){

layer.setStyle({
fillColor:"#00ff00"
});

correctCount++;

showJudge(true);

}else{

layer.setStyle({
fillColor:"#0000ff"
});

geoLayer.eachLayer(function(l){

if(l.feature.properties.N03_004===currentCity){

l.setStyle({fillColor:"#ff0000"});

}

});

showJudge(false);

}

questionCount++;

if(questionCount>=maxQuestion){

gameOver = true;

setTimeout(()=>{

showResult();

document.getElementById("modeSelect").disabled = false;
document.getElementById("startBtn").disabled = false; 

},1000);

return;

}else{

setTimeout(nextQuestion,800);

}

});

}

}).addTo(map);

if(mode==="tokyo23"){
  map.setView([35.68,139.75],11);
}else{
  map.fitBounds(geoLayer.getBounds());
}

remainingCities = [...cities];

nextCity();

});

}else{

nextCity();

}

}

function nextCity(){

if(remainingCities.length===0) return;

let r = Math.floor(Math.random()*remainingCities.length);

currentCity = remainingCities[r];

remainingCities.splice(r,1);

document.getElementById("question").innerText =
"第"+(questionCount+1)+"問\n"+currentCity;

}

function showJudge(correct){

const result =
document.getElementById("result");

if(correct){

result.innerHTML="⭕";
result.style.color="red";

}else{

result.innerHTML="✕";
result.style.color="blue";

}

setTimeout(()=>{
result.innerHTML="";
},1000);

}

function getRank(){
let modeText = document.getElementById("modeSelect").selectedOptions[0].text;
let rank = "";

if(modeText==="全国ランダム"){
  modeText = "全国";
}
  
if(correctCount===5){
  rank = "マスター！";
}else if(correctCount>=4){
  rank = "かなり詳しい"
}else if(correctCount>=3){
  rank = "それなりに詳しい";
}else if(correctCount>=2){
  rank = "まあまあ詳しい";
}else{
  rank = "要勉強";
}
return {modeText,rank};
}

function showResult(){

let result = getRank();

document.getElementById("finalScore").innerHTML =
correctCount+" / "+maxQuestion+"問正解<br><br>"+
"あなたは "+result.modeText+" "+result.rank;

document.getElementById("gameoverPopup").style.display="flex";
}

document.getElementById("shareBtn").onclick=function(){

let result = getRank();

let shareURL = location.origin + location.pathname;
  
let text =
"【"+result.modeText+" 市区町村当てゲーム】\n"+
correctCount+"/"+maxQuestion+"問正解！\n"+
"あなたは "+result.rank+"\n"+
"挑戦はこちら👇\n";

let url =
"https://twitter.com/intent/tweet?text="+
encodeURIComponent(text)+
"&url="+encodeURIComponent(shareURL);

window.open(url);

}

document.getElementById("startBtn").onclick=startGame;

document.getElementById("restartBtn").onclick=function(){
location.reload();
}
