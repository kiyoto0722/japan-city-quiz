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
let randomPref = null;

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

const prefJP = {
hokkaido:"北海道",
aomori:"青森県",
iwate:"岩手県",
miyagi:"宮城県",
akita:"秋田県",
yamagata:"山形県",
fukushima:"福島県",

ibaraki:"茨城県",
tochigi:"栃木県",
gunma:"群馬県",
saitama:"埼玉県",
chiba:"千葉県",
tokyo:"東京都",
kanagawa:"神奈川県",

niigata:"新潟県",
toyama:"富山県",
ishikawa:"石川県",
fukui:"福井県",
yamanashi:"山梨県",
nagano:"長野県",

gifu:"岐阜県",
shizuoka:"静岡県",
aichi:"愛知県",
mie:"三重県",

shiga:"滋賀県",
kyoto:"京都府",
osaka:"大阪府",
hyogo:"兵庫県",
nara:"奈良県",
wakayama:"和歌山県",

tottori:"鳥取県",
shimane:"島根県",
okayama:"岡山県",
hiroshima:"広島県",
yamaguchi:"山口県",

tokushima:"徳島県",
kagawa:"香川県",
ehime:"愛媛県",
kochi:"高知県",

fukuoka:"福岡県",
saga:"佐賀県",
nagasaki:"長崎県",
kumamoto:"熊本県",
oita:"大分県",
miyazaki:"宮崎県",
kagoshima:"鹿児島県",
okinawa:"沖縄県"
};

function startGame(){

questionCount = 0;
correctCount = 0;

gameOver = false;

let mode = document.getElementById("modeSelect").value;

document.getElementById("modeSelect").disabled = true;
document.getElementById("startBtn").disabled = true;  

if(mode==="random"){
randomPref = prefs[Math.floor(Math.random()*prefs.length)];
document.getElementById("question").innerText =
prefJP[randomPref] + " にチャレンジ！";
setTimeout(()=>{},1200);
}
  
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

currentPref = randomPref;
//prefs[Math.floor(Math.random()*prefs.length)];

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
  modeText = prefJP[randomPref];
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
