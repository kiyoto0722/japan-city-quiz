//let map = L.map('map').setView([36,138],5);
let map = L.map('map');

//L.tileLayer(
//'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
//).addTo(map);

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

document.getElementById("finalScore").innerHTML =
"スコア "+correctCount+" / "+maxQuestion;

document.getElementById("gameoverPopup").style.display="flex";

},1000);

return;

}else{

setTimeout(nextQuestion,800);

}

});

}

}).addTo(map);

if(mode==="tokyo23"){
  map.setView([35.68.139.75],11);
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

document.getElementById("shareBtn").onclick=function(){

let text =
"日本 市区町村当てゲーム\n"+
"スコア "+correctCount+"/"+maxQuestion+"\n"+
location.href;

let url =
"https://twitter.com/intent/tweet?text="+
encodeURIComponent(text);

window.open(url);

}

document.getElementById("startBtn").onclick=startGame;

document.getElementById("restartBtn").onclick=function(){
location.reload();
}
