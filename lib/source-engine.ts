import type { ToiletPlace } from "@/components/real-map";

export type EvidenceKey = "location"|"wheelchair"|"access"|"openingHours"|"fee"|"changingTable"|"operator"|"freshness"|"equipment";
export type NextSource = "official"|"operator"|"open_map"|"commercial"|"verified_community";

export type SourceAssessment = {
  completeness:number;
  confidence:number;
  freshness:number;
  known:number;
  total:number;
  gaps:EvidenceKey[];
  nextSources:NextSource[];
  rationale:string[];
};

const known=(value:unknown)=>value!==null&&value!==undefined&&value!==""&&value!=="unknown";

export function assessToilet(place:ToiletPlace):SourceAssessment{
  const fields:Array<{key:EvidenceKey;value:unknown;weight:number}>=[
    {key:"location",value:Number.isFinite(place.lat)&&Number.isFinite(place.lon),weight:18},
    {key:"wheelchair",value:place.wheelchair,weight:18},
    {key:"access",value:place.access,weight:14},
    {key:"openingHours",value:place.openingHours,weight:12},
    {key:"fee",value:place.fee,weight:7},
    {key:"changingTable",value:place.changingTable,weight:9},
    {key:"operator",value:place.operator,weight:7},
    {key:"equipment",value:place.handwashing||place.paperSupplied||place.position||place.ostomy||place.centralKey,weight:10},
    {key:"freshness",value:place.updatedAt,weight:5},
  ];
  const isKnown=(entry:typeof fields[number])=>entry.key==="location"?entry.value===true:known(entry.value);
  const completeness=Math.round(fields.reduce((sum,entry)=>sum+(isKnown(entry)?entry.weight:0),0));
  const ageDays=place.updatedAt?Math.max(0,(Date.now()-new Date(place.updatedAt).getTime())/86400000):null;
  const freshness=ageDays===null?55:ageDays<=90?100:ageDays<=365?90:ageDays<=1095?70:45;
  const sourceTrust=place.custom?55:place.source==="OpenStreetMap"?76:65;
  const confidence=Math.round(Math.min(100,sourceTrust*.58+freshness*.22+completeness*.20));
  const gaps=fields.filter(entry=>!isKnown(entry)&&["wheelchair","access","openingHours","fee","changingTable","operator"].includes(entry.key)).map(entry=>entry.key);
  const nextSources:NextSource[]=[];
  if(gaps.includes("access")||gaps.includes("wheelchair")||gaps.includes("changingTable")){nextSources.push("official","verified_community")}
  if(gaps.includes("openingHours")||gaps.includes("fee")||gaps.includes("operator")){nextSources.push("operator")}
  if(completeness<60)nextSources.push("commercial");
  if(place.custom)nextSources.push("open_map");
  const rationale=[place.custom?"user_source":"open_map_source",ageDays===null?"date_missing":freshness>=90?"recent":"older",completeness>=75?"complete":completeness>=45?"partial":"sparse"];
  return{completeness,confidence,freshness,known:fields.filter(isKnown).length,total:fields.length,gaps,nextSources:[...new Set(nextSources)].slice(0,3),rationale};
}
