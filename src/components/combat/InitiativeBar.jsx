import React from 'react';

function InitiativeBar(pr){
var init=pr.initiative;
if(!init||!Array.isArray(init.list)||!init.list.length)return null;
var turn=init.turn||0;
return(<div className="n-card">
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
<div style={{fontSize:11,fontWeight:700,letterSpacing:.06,textTransform:"uppercase",color:"var(--color-text-muted)"}}>Порядок хода</div>
<div style={{fontSize:11,color:"var(--color-text-muted)"}}>{"Раунд "+(init.round||1)}</div>
</div>
<div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
{init.list.map(function(e,i){var cur=i===turn;
return(<div key={e.id+"_"+i} style={{flexShrink:0,minWidth:100,padding:"8px 12px",borderRadius:10,background:cur?"rgba(145,132,217,.14)":"var(--color-sunken)",border:"1.5px solid "+(cur?"var(--color-accent)":"var(--color-divider)")}}>
<div style={{fontSize:10,color:"var(--color-text-muted)",fontWeight:600}}>{"РЕФ "+e.init}</div>
<div style={{fontSize:14,fontWeight:700,color:cur?"var(--color-accent)":"var(--color-text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:100}}>{e.name}</div>
<div style={{fontSize:11,color:"var(--color-text-muted)"}}>{e.kind==="npc"?"НПС":""}</div>
</div>);
})}
</div>
</div>);
}

export default InitiativeBar;
