"use strict";(()=>{var u=[{name:"Boston-NewYork",outputs:{parsel:{cost:6.07,speedValue:2,pickup:!0,pickupTag:"Up to 5 free pickups"},other:{cost:8.12,speedValue:3,pickup:!1},retail:{cost:12.45,speedValue:3,pickup:!1}}},{name:"Boston-Dallas",outputs:{parsel:{cost:4.07,speedValue:1,pickup:!0,pickupTag:"Up to 4 free pickups"},other:{cost:6.12,speedValue:2,pickup:!1},retail:{cost:10.45,speedValue:2,pickup:!1}}},{name:"Denver-NewYork",outputs:{parsel:{cost:7.07,speedValue:1,pickup:!0,pickupTag:"Up to 6 free pickups"},other:{cost:9.12,speedValue:2,pickup:!1},retail:{cost:13.45,speedValue:2,pickup:!1}}}];var r=class{constructor(e){this.component=e,this.origin=e.querySelector('select[name="origin"]'),this.destination=e.querySelector('select[name="destination"]'),this.inputs=[this.origin,this.destination],this.outputs=[...e.querySelectorAll("[data-compare-output]")],this.routeName=this.getRouteName(),this.routeConfig=this.getRouteConfig(),this.update=this.update.bind(this)}init(){this.render(),this.bindEvents()}bindEvents(){this.inputs.forEach(e=>{e.addEventListener("change",()=>{this.update()})})}update(){this.routeName=this.getRouteName(),this.routeConfig=this.getRouteConfig(),this.render()}render(){this.outputs.forEach(e=>{let{compareGroup:t,compareOutput:i}=e.dataset;if(!t||!i)return;let s=this.getGroupConfig(t),o=s[i];switch(i){case"costTag":let{costTagVisibility:a}=s;a?e.style.removeProperty("display"):e.style.display="none",this.setText(e,o);break;case"speedTagVisibility":let{speedTagVisibility:p}=s;p?e.style.removeProperty("display"):e.style.display="none",this.setText(e,o);break;case"pickup":e.dataset.comparePickup=o;break;default:this.setText(e,o);break}})}setText(e,t){e.textContent=t}getRouteName(){return`${this.origin.value}-${this.destination.value}`}getRouteConfig(){let e=u.find(t=>t.name===this.routeName);if(!e)throw new Error(`No route configuration found for ${this.routeName}`);return this.routeConfig=e.outputs,this.updateRouteConfig(),e.outputs}updateRouteConfig(){let e=this.routeConfig.parsel.cost/this.routeConfig.retail.cost,t=Math.round(e*100),i=`${t}% savings`,s=!(t<1),o=this.routeConfig.retail.speedValue-this.routeConfig.parsel.speedValue,a=o>1?"days":"day",p=`${o} ${a} faster`,c=!(o<1);this.routeConfig.parsel.costTag=i,this.routeConfig.parsel.costTagVisibility=s,this.routeConfig.parsel.speedTag=p,this.routeConfig.parsel.speedTagVisibility=c,this.routeConfig.parsel.speedLabel=this.routeConfig.parsel.speedValue>1?"days":"day",this.routeConfig.other.speedLabel=this.routeConfig.other.speedValue>1?"days":"day",this.routeConfig.retail.speedLabel=this.routeConfig.retail.speedValue>1?"days":"day"}getGroupConfig(e){return this.routeConfig[e]}};var n=()=>{console.log("compare");let e=[...document.querySelectorAll('[data-compare="component"]')];e.length!==0&&e.forEach(t=>{new r(t).init()})};window.Webflow||(window.Webflow=[]);window.Webflow.push(()=>{n()});})();
