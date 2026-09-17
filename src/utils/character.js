import { NAMES_P } from '../data/lore';
import { SD, SKD } from '../data/stats';
import { pk } from './dice';
import { getRaces } from './raceStore';
import { getProfs } from './profStore';

function iS(){var s={};SD.forEach(function(x){s[x.key]=1});return s}function iSk(){var s={};Object.values(SKD).flat().forEach(function(x){s[x.name]=0});return s}function uSP(s){return Object.values(s).reduce(function(a,b){return a+b},0)}function uSkP(s){var t=0;Object.values(SKD).flat().forEach(function(x){t+=x.x2?(s[x.name]||0)*2:(s[x.name]||0)});return t}function gE(b,bo){var r=Object.assign({},b);Object.entries(bo||{}).forEach(function(e){r[e[0]]=(r[e[0]]||0)+e[1]});return r}function cF(c){var R=getRaces();var rc=R.find(function(r){return r.id===c.raceId})||R[0];var es=gE(c.stats||iS(),rc.st);if(rc.fp&&c.humanBonusStat)es[c.humanBonusStat]=(es[c.humanBonusStat]||0)+1;return{race:rc,fs:es,eSk:gE(c.skills||iSk(),rc.sk)}}function mHP(f){return((f.BODY||0)+(f.WILL||0))*2}
function nC(name){return{name:name||"",level:1,profId:"none",raceId:"none",humanBonusStat:"",portrait:"",hair:"",bio:"",stats:iS(),skills:iSk(),locked:false,curHp:null,hpOv:null,curWill:null,willOv:null,weapons:[],lvlPts:0,spentLvlPts:0,armors:[],equippedHead:null,equippedBody:null,shield:null,shieldHp:0,shieldMaxHp:0,equippedWeapon:null,weaponMode:"1h",inventory:[],gold:0}}

/* Генерация случайных статов/навыков для заданной расы и профессии (имя/раса/класс не трогаются) */
function rndCore(pr,rc){var st=iS();var rem=33;var pb=Math.floor(rem*0.7);var sp=0;if(pr.pS.length>0)for(var i=0;i<pb;i++){var cn=pr.pS.filter(function(k){return st[k]<8});if(!cn.length)break;st[pk(cn)]++;sp++}var lf=rem-sp;var ak=SD.map(function(s){return s.key});for(var j=0;j<lf;j++){var c2=ak.filter(function(k){return st[k]<8});if(!c2.length)break;st[pk(c2)]++}var sk=iSk();var aS=Object.values(SKD).flat();var co=function(n){var d=aS.find(function(s){return s.name===n});return d&&d.x2?2:1};var bk=rc.bsp?1:0;var sB=60+bk;var sp2=Math.floor(sB*0.7);var ss=0;if(pr.pSk.length>0)for(var x=0;x<200&&ss<sp2;x++){var c3=pr.pSk.filter(function(n){return sk[n]<8&&co(n)<=(sB-ss)});if(!c3.length)break;var n2=pk(c3);sk[n2]++;ss+=co(n2)}var sl=sB-ss;for(var y=0;y<200&&sl>0;y++){var c4=aS.map(function(s){return s.name}).filter(function(n){return sk[n]<6&&co(n)<=sl});if(!c4.length)break;var n3=pk(c4);sk[n3]++;sl-=co(n3)}var hb="";if(rc.fp&&pr.pS.length>0)hb=pk(pr.pS);return{humanBonusStat:hb,stats:st,skills:sk}}

/* Полный рандом: случайная раса + имя + статы/навыки */
function rnd(pId){var P=getProfs();var pr=P.find(function(p){return p.id===pId})||P[0];var rc=pk(getRaces().filter(function(r){return r.id!=="none"}));var core=rndCore(pr,rc);return{name:pk(NAMES_P),raceId:rc.id,humanBonusStat:core.humanBonusStat,stats:core.stats,skills:core.skills}}

/* Рандом только цифр: имя/класс/раса сохраняются */
function rndStats(pId,raceId){var P=getProfs();var pr=P.find(function(p){return p.id===pId})||P[0];var R=getRaces();var rc=R.find(function(r){return r.id===raceId})||R[0];return rndCore(pr,rc)}

export { iS, iSk, uSP, uSkP, gE, cF, mHP, nC, rnd, rndStats };
