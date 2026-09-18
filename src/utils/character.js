import { NAMES_P } from '../data/lore';
import { SD, SKD } from '../data/stats';
import { pk, r1 } from './dice';
import { getRaces } from './raceStore';
import { getProfs } from './profStore';
import { getTraits } from './traitStore';
import { armorPenaltyOf } from '../data/combat';
import { activeTraitEffects } from '../data/traits';

function iS(){var s={};SD.forEach(function(x){s[x.key]=1});return s}function iSk(){var s={};Object.values(SKD).flat().forEach(function(x){s[x.name]=0});return s}function uSP(s){return Object.values(s).reduce(function(a,b){return a+b},0)}function uSkP(s){var t=0;Object.values(SKD).flat().forEach(function(x){t+=x.x2?(s[x.name]||0)*2:(s[x.name]||0)});return t}function gE(b,bo){var r=Object.assign({},b);Object.entries(bo||{}).forEach(function(e){r[e[0]]=(r[e[0]]||0)+e[1]});return r}/* Object.assign({},iS(),c.stats) подставляет 1 для характеристик, которых
   не было в сохранённых данных (например, PRC у персонажей, созданных до
   её добавления) — без этого fs[key] был бы undefined и ломал бросок в NaN. */
/* Черты (traits) добавляют бонусы к характеристикам/навыкам прямо здесь —
   тогда они автоматически учитываются везде, где используются fs/eSk.
   activeTraitEffects уже учитывает отмену чертой-«протезом» (cancels). */
function applyTraits(c,es,eSk){
  activeTraitEffects(c,getTraits()).forEach(function(e){
    if(e.type==="stat_bonus"&&e.stat)es[e.stat]=(es[e.stat]||0)+(e.amount||0);
    if(e.type==="skill_bonus"&&e.skill)eSk[e.skill]=(eSk[e.skill]||0)+(e.amount||0);
  });
}
function cF(c){var R=getRaces();var rc=R.find(function(r){return r.id===c.raceId})||R[0];var baseStats=Object.assign({},iS(),c.stats||{});var es=gE(baseStats,rc.st);if(rc.fp&&c.humanBonusStat)es[c.humanBonusStat]=(es[c.humanBonusStat]||0)+1;var eSk=gE(c.skills||iSk(),rc.sk);applyTraits(c,es,eSk);
  /* Штраф к Уклонению от надетой тяжёлой брони/шлема/щита — складывается
     в сам навык, поэтому автоматически участвует во всех бросках уклонения. */
  var ap=armorPenaltyOf(c,es);if(ap.dodge)eSk["Уклонение"]=(eSk["Уклонение"]||0)+ap.dodge;
  return{race:rc,fs:es,eSk:eSk}}
/* ХП = BODY*2 + REF*2 + d10 (+ бонусы черт). Кубик бросается один раз
   (hpRoll хранится на персонаже) — иначе mHP пересчитывался бы заново на
   каждый рендер и максимум ХП «скакал» бы. */
function mHP(f,c){
  var base=(f.BODY||0)*2+(f.REF||0)*2+((c&&c.hpRoll)||0);
  if(!c)return Math.max(1,base);
  var bonus=0;
  activeTraitEffects(c,getTraits()).forEach(function(e){if(e.type==="hp_flat")bonus+=(e.amount||0)});
  return Math.max(1,base+bonus);
}
function nC(name){return{name:name||"",level:1,xp:0,profId:"none",raceId:"none",humanBonusStat:"",portrait:"",hair:"",height:"",weight:"",alignment:"",eyeColor:"",skinColor:"",bio:"",lifepath:[],stats:iS(),skills:iSk(),locked:false,curHp:null,hpOv:null,curWill:null,willOv:null,hpRoll:r1(10),weapons:[],statPts:0,skillPts:0,armors:[],equippedHead:null,equippedBody:null,shield:null,shieldHp:0,shieldMaxHp:0,equippedWeapon:null,weaponMode:"1h",inventory:[],traits:[],currency:{gold:0,silver:0,bronze:0,copper:0}}}

/* Опыт до следующего уровня растёт на 100 за уровень: 1→2 100, 2→3 200,
   3→4 300 ... 9→10 900. xpForLevel(N) — сколько всего опыта нужно набрать
   с нуля, чтобы ДОСТИЧЬ уровня N (кумулятивно). */
function xpForLevel(level){var total=0;for(var i=1;i<level;i++)total+=i*100;return total}
function xpProgress(c){
  var lvl=c.level||1;var have=c.xp||0;
  var curThresh=xpForLevel(lvl);var nextThresh=xpForLevel(lvl+1);
  var need=Math.max(1,nextThresh-curThresh);var got=Math.max(0,Math.min(need,have-curThresh));
  return{level:lvl,have:have,curThresh:curThresh,nextThresh:nextThresh,need:need,got:got,pct:Math.min(100,(got/need)*100),ready:have>=nextThresh};
}

/* Награда очками за каждый уровень (ключ — уровень, на который переходят).
   Очко характеристики поднимает стат на 1. Очко навыка поднимает обычный
   навык на 1, навык ×2 стоит 2 очка навыка (та же логика, что и при
   первичном распределении). Уровни выше 10 получают награду 10-го. */
var LEVEL_REWARDS={2:{stat:0,skill:2},3:{stat:0,skill:4},4:{stat:1,skill:2},5:{stat:1,skill:2},6:{stat:0,skill:3},7:{stat:1,skill:2},8:{stat:0,skill:4},9:{stat:2,skill:0},10:{stat:1,skill:5}};
function levelUpReward(level){return LEVEL_REWARDS[level]||LEVEL_REWARDS[10]}

/* Генерация случайных статов/навыков для заданной расы и профессии (имя/раса/класс не трогаются) */
function rndCore(pr,rc){var st=iS();var rem=33;var pb=Math.floor(rem*0.7);var sp=0;if(pr.pS.length>0)for(var i=0;i<pb;i++){var cn=pr.pS.filter(function(k){return st[k]<8});if(!cn.length)break;st[pk(cn)]++;sp++}var lf=rem-sp;var ak=SD.map(function(s){return s.key});for(var j=0;j<lf;j++){var c2=ak.filter(function(k){return st[k]<8});if(!c2.length)break;st[pk(c2)]++}var sk=iSk();var aS=Object.values(SKD).flat();var co=function(n){var d=aS.find(function(s){return s.name===n});return d&&d.x2?2:1};var bk=rc.bsp?1:0;var sB=60+bk;var sp2=Math.floor(sB*0.7);var ss=0;if(pr.pSk.length>0)for(var x=0;x<200&&ss<sp2;x++){var c3=pr.pSk.filter(function(n){return sk[n]<8&&co(n)<=(sB-ss)});if(!c3.length)break;var n2=pk(c3);sk[n2]++;ss+=co(n2)}var sl=sB-ss;for(var y=0;y<200&&sl>0;y++){var c4=aS.map(function(s){return s.name}).filter(function(n){return sk[n]<6&&co(n)<=sl});if(!c4.length)break;var n3=pk(c4);sk[n3]++;sl-=co(n3)}var hb="";if(rc.fp&&pr.pS.length>0)hb=pk(pr.pS);return{humanBonusStat:hb,stats:st,skills:sk}}

/* Полный рандом: случайная раса + имя + статы/навыки */
function rnd(pId){var P=getProfs();var pr=P.find(function(p){return p.id===pId})||P[0];var rc=pk(getRaces().filter(function(r){return r.id!=="none"}));var core=rndCore(pr,rc);return{name:pk(NAMES_P),raceId:rc.id,humanBonusStat:core.humanBonusStat,stats:core.stats,skills:core.skills}}

/* Рандом только цифр: имя/класс/раса сохраняются */
function rndStats(pId,raceId){var P=getProfs();var pr=P.find(function(p){return p.id===pId})||P[0];var R=getRaces();var rc=R.find(function(r){return r.id===raceId})||R[0];return rndCore(pr,rc)}

export { iS, iSk, uSP, uSkP, gE, cF, mHP, nC, rnd, rndStats, xpForLevel, xpProgress, levelUpReward };
