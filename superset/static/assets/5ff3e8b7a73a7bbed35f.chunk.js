"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[4494,6871,1261],{95644:(t,e,i)=>{i.d(e,{N:()=>s});const o="#if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))\n\nstruct AmbientLight {\n vec3 color;\n};\n\nstruct PointLight {\n vec3 color;\n vec3 position;\n vec3 attenuation;\n};\n\nstruct DirectionalLight {\n  vec3 color;\n  vec3 direction;\n};\n\nuniform AmbientLight lighting_uAmbientLight;\nuniform PointLight lighting_uPointLight[MAX_LIGHTS];\nuniform DirectionalLight lighting_uDirectionalLight[MAX_LIGHTS];\nuniform int lighting_uPointLightCount;\nuniform int lighting_uDirectionalLightCount;\n\nuniform bool lighting_uEnabled;\n\nfloat getPointLightAttenuation(PointLight pointLight, float distance) {\n  return pointLight.attenuation.x\n       + pointLight.attenuation.y * distance\n       + pointLight.attenuation.z * distance * distance;\n}\n\n#endif\n",n={lightSources:{}};function r({color:t=[0,0,0],intensity:e=1}={}){return t.map((t=>t*e/255))}const a={};const s={name:"gouraud-lighting",dependencies:[{name:"lights",vs:o,fs:o,getUniforms:function t(e=n){if("lightSources"in e){const{ambientLight:t,pointLights:i,directionalLights:o}=e.lightSources||{};return t||i&&i.length>0||o&&o.length>0?Object.assign({},function({ambientLight:t,pointLights:e=[],directionalLights:i=[]}){const o={};return o["lighting_uAmbientLight.color"]=t?r(t):[0,0,0],e.forEach(((t,e)=>{o["lighting_uPointLight[".concat(e,"].color")]=r(t),o["lighting_uPointLight[".concat(e,"].position")]=t.position,o["lighting_uPointLight[".concat(e,"].attenuation")]=t.attenuation||[1,0,0]})),o.lighting_uPointLightCount=e.length,i.forEach(((t,e)=>{o["lighting_uDirectionalLight[".concat(e,"].color")]=r(t),o["lighting_uDirectionalLight[".concat(e,"].direction")]=t.direction})),o.lighting_uDirectionalLightCount=i.length,o}({ambientLight:t,pointLights:i,directionalLights:o}),{lighting_uEnabled:!0}):{lighting_uEnabled:!1}}if("lights"in e){const i={pointLights:[],directionalLights:[]};for(const t of e.lights||[])switch(t.type){case"ambient":i.ambientLight=t;break;case"directional":i.directionalLights.push(t);break;case"point":i.pointLights.push(t)}return t({lightSources:i})}return{}},defines:{MAX_LIGHTS:3}}],vs:"\nuniform float lighting_uAmbient;\nuniform float lighting_uDiffuse;\nuniform float lighting_uShininess;\nuniform vec3  lighting_uSpecularColor;\n\nvec3 lighting_getLightColor(vec3 surfaceColor, vec3 light_direction, vec3 view_direction, vec3 normal_worldspace, vec3 color) {\n    vec3 halfway_direction = normalize(light_direction + view_direction);\n    float lambertian = dot(light_direction, normal_worldspace);\n    float specular = 0.0;\n    if (lambertian > 0.0) {\n      float specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);\n      specular = pow(specular_angle, lighting_uShininess);\n    }\n    lambertian = max(lambertian, 0.0);\n    return (lambertian * lighting_uDiffuse * surfaceColor + specular * lighting_uSpecularColor) * color;\n}\n\nvec3 lighting_getLightColor(vec3 surfaceColor, vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {\n  vec3 lightColor = surfaceColor;\n\n  if (lighting_uEnabled) {\n    vec3 view_direction = normalize(cameraPosition - position_worldspace);\n    lightColor = lighting_uAmbient * surfaceColor * lighting_uAmbientLight.color;\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uPointLightCount) {\n        break;\n      }\n      PointLight pointLight = lighting_uPointLight[i];\n      vec3 light_position_worldspace = pointLight.position;\n      vec3 light_direction = normalize(light_position_worldspace - position_worldspace);\n      lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color);\n    }\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uDirectionalLightCount) {\n        break;\n      }\n      DirectionalLight directionalLight = lighting_uDirectionalLight[i];\n      lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);\n    }\n  }\n  return lightColor;\n}\n\nvec3 lighting_getSpecularLightColor(vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {\n  vec3 lightColor = vec3(0, 0, 0);\n  vec3 surfaceColor = vec3(0, 0, 0);\n\n  if (lighting_uEnabled) {\n    vec3 view_direction = normalize(cameraPosition - position_worldspace);\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uPointLightCount) {\n        break;\n      }\n      PointLight pointLight = lighting_uPointLight[i];\n      vec3 light_position_worldspace = pointLight.position;\n      vec3 light_direction = normalize(light_position_worldspace - position_worldspace);\n      lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color);\n    }\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uDirectionalLightCount) {\n        break;\n      }\n      DirectionalLight directionalLight = lighting_uDirectionalLight[i];\n      lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);\n    }\n  }\n  return lightColor;\n}\n",defines:{LIGHTING_VERTEX:1},getUniforms:function(t=a){if(!("material"in t))return{};const{material:e}=t;return e?function(t){const{ambient:e=.35,diffuse:i=.6,shininess:o=32,specularColor:n=[30,30,30]}=t;return{lighting_uAmbient:e,lighting_uDiffuse:i,lighting_uShininess:o,lighting_uSpecularColor:n.map((t=>t/255))}}(e):{lighting_uEnabled:!1}}}},36665:(t,e,i)=>{i.d(e,{Z:()=>d});var o=i(78580),n=i.n(o),r=i(67294),a=i(45697),s=i.n(a),l=i(51995),g=i(67190),c=i(11965);const u=l.iK.div`
  ${t=>{let{theme:e}=t;return`\n    font-size: ${e.typography.sizes.s}px;\n    position: absolute;\n    background: ${e.colors.grayscale.light5};\n    box-shadow: 0 0 ${e.gridUnit}px ${e.colors.grayscale.light2};\n    margin: ${6*e.gridUnit}px;\n    padding: ${3*e.gridUnit}px ${5*e.gridUnit}px;\n    outline: none;\n    overflow-y: scroll;\n    max-height: 200px;\n\n    & ul {\n      list-style: none;\n      padding-left: 0;\n      margin: 0;\n\n      & li a {\n        color: ${e.colors.grayscale.base};\n        text-decoration: none;\n\n        & span {\n          margin-right: ${3*e.gridUnit}px;\n        }\n      }\n    }\n  `}}
`,h=" - ",p={categories:s().object,forceCategorical:s().bool,format:s().string,position:s().oneOf([null,"tl","tr","bl","br"]),showSingleCategory:s().func,toggleCategory:s().func};class d extends r.PureComponent{format(t){if(!this.props.format||this.props.forceCategorical)return t;const e=parseFloat(t);return(0,g.uf)(this.props.format,e)}formatCategoryLabel(t){if(!this.props.format)return t;if(n()(t).call(t,h)){const e=t.split(h);return this.format(e[0])+h+this.format(e[1])}return this.format(t)}render(){if(0===Object.keys(this.props.categories).length||null===this.props.position)return null;const t=Object.entries(this.props.categories).map((t=>{let[e,i]=t;const o={color:`rgba(${i.color.join(", ")})`},n=i.enabled?"◼":"◻";return(0,c.tZ)("li",{key:e},(0,c.tZ)("a",{href:"#",onClick:()=>this.props.toggleCategory(e),onDoubleClick:()=>this.props.showSingleCategory(e)},(0,c.tZ)("span",{style:o},n)," ",this.formatCategoryLabel(e)))})),e={position:"absolute",["t"===this.props.position.charAt(0)?"top":"bottom"]:"0px",["r"===this.props.position.charAt(1)?"right":"left"]:"10px"};return(0,c.tZ)(u,{style:e},(0,c.tZ)("ul",null,t))}}d.propTypes=p,d.defaultProps={categories:{},forceCategorical:!1,format:null,position:"tr",showSingleCategory:()=>{},toggleCategory:()=>{}}},33452:(t,e,i)=>{i.r(e),i.d(e,{default:()=>A,getLayer:()=>x});var o=i(80744),n=i(15103),r=i(4516),a=Math.PI/3,s=[0,a,2*a,3*a,4*a,5*a];function l(t){return t[0]}function g(t){return t[1]}var c=i(38550),u=i(73728),h=i(63295);function p(){}const d={colorDomain:null,colorRange:r.K,getColorValue:{type:"accessor",value:null},getColorWeight:{type:"accessor",value:1},colorAggregation:"SUM",lowerPercentile:{type:"number",value:0,min:0,max:100},upperPercentile:{type:"number",value:100,min:0,max:100},colorScaleType:"quantize",onSetColorDomain:p,elevationDomain:null,elevationRange:[0,1e3],getElevationValue:{type:"accessor",value:null},getElevationWeight:{type:"accessor",value:1},elevationAggregation:"SUM",elevationLowerPercentile:{type:"number",value:0,min:0,max:100},elevationUpperPercentile:{type:"number",value:100,min:0,max:100},elevationScale:{type:"number",min:0,value:1},elevationScaleType:"linear",onSetElevationDomain:p,radius:{type:"number",value:1e3,min:1},coverage:{type:"number",min:0,max:1,value:1},extruded:!1,hexagonAggregator:function(t,e){const{data:i,radius:n}=t,{viewport:r,attributes:u}=e,h=i.length?function(t,e){const{attributes:i}=e,o=i.positions.value,{size:n}=i.positions.getAccessor();let r,a=1/0,s=1/0,l=-1/0,g=-1/0;for(r=0;r<n*t.length;r+=n){const t=o[r],e=o[r+1];Number.isFinite(t)&&Number.isFinite(e)&&(a=Math.min(t,a),l=Math.max(t,l),s=Math.min(e,s),g=Math.max(e,g))}return[a,s,l,g].every(Number.isFinite)?[(a+l)/2,(s+g)/2]:null}(i,e):null,p=function(t,e,i){const{unitsPerMeter:o}=e.getDistanceScales(i);return t*o[0]}(n,r,h),d=[],{iterable:f,objectInfo:m}=(0,c.jB)(i),_=u.positions.value,{size:v}=u.positions.getAccessor();for(const t of f){m.index++;const e=m.index*v,i=[_[e],_[e+1]];Number.isFinite(i[0])&&Number.isFinite(i[1])?d.push({screenCoord:r.projectFlat(i),source:t,index:m.index}):o.Z.warn("HexagonLayer: invalid position")()}const b=function(){var t,e,i,o=0,n=0,r=1,c=1,u=l,h=g;function p(t){var o,n={},r=[],a=t.length;for(o=0;o<a;++o)if(!isNaN(l=+u.call(null,s=t[o],o,t))&&!isNaN(g=+h.call(null,s,o,t))){var s,l,g,c=Math.round(g/=i),p=Math.round(l=l/e-(1&c)/2),d=g-c;if(3*Math.abs(d)>1){var f=l-p,m=p+(l<p?-1:1)/2,_=c+(g<c?-1:1),v=l-m,b=g-_;f*f+d*d>v*v+b*b&&(p=m+(1&c?1:-1)/2,c=_)}var y=p+"-"+c,L=n[y];L?L.push(s):(r.push(L=n[y]=[s]),L.x=(p+(1&c)/2)*e,L.y=c*i)}return r}function d(t){var e=0,i=0;return s.map((function(o){var n=Math.sin(o)*t,r=-Math.cos(o)*t,a=n-e,s=r-i;return e=n,i=r,[a,s]}))}return p.hexagon=function(e){return"m"+d(null==e?t:+e).join("l")+"z"},p.centers=function(){for(var a=[],s=Math.round(n/i),l=Math.round(o/e),g=s*i;g<c+t;g+=i,++s)for(var u=l*e+(1&s)*e/2;u<r+e/2;u+=e)a.push([u,g]);return a},p.mesh=function(){var e=d(t).slice(0,4).join("l");return p.centers().map((function(t){return"M"+t+"m"+e})).join("")},p.x=function(t){return arguments.length?(u=t,p):u},p.y=function(t){return arguments.length?(h=t,p):h},p.radius=function(o){return arguments.length?(e=2*(t=+o)*Math.sin(a),i=1.5*t,p):t},p.size=function(t){return arguments.length?(o=n=0,r=+t[0],c=+t[1],p):[r-o,c-n]},p.extent=function(t){return arguments.length?(o=+t[0][0],n=+t[0][1],r=+t[1][0],c=+t[1][1],p):[[o,n],[r,c]]},p.radius(1)}().radius(p).x((t=>t.screenCoord[0])).y((t=>t.screenCoord[1]));return{hexagons:b(d).map(((t,e)=>({position:r.unprojectFlat([t.x,t.y]),points:t,index:e}))),radiusCommon:p}},getPosition:{type:"accessor",value:t=>t.position},material:!0,_filterData:{type:"function",value:null,optional:!0}};class f extends h.Z{shouldUpdateState({changeFlags:t}){return t.somethingChanged}initializeState(){const t=new u.Z({getAggregator:t=>t.hexagonAggregator,getCellSize:t=>t.radius});this.state={cpuAggregator:t,aggregatorState:t.state,hexagonVertices:null},this.getAttributeManager().add({positions:{size:3,accessor:"getPosition"}})}updateState(t){super.updateState(t);const{cpuAggregator:e,hexagonVertices:i}=this.state;t.changeFlags.propsOrDataChanged&&this.setState({aggregatorState:e.updateState(t,{viewport:this.context.viewport,attributes:this.getAttributes()})});const{hexagonVertices:o}=e.state.layerData||{};if(o&&i!==o){const t=this.convertLatLngToMeterOffset(o);t&&this.setState({hexagonVertices:o,vertices:t})}else this.updateRadiusAngle()}updateRadiusAngle(t){const{viewport:e}=this.context,{unitsPerMeter:i}=e.getDistanceScales(),{cpuAggregator:o}=this.state;if(o.state.layerData&&o.state.layerData.radiusCommon){const{radiusCommon:t}=o.state.layerData,e=t/i[0];this.setState({angle:90,radius:e})}}convertLatLngToMeterOffset(t){const{viewport:e}=this.context;if(Array.isArray(t)&&6===t.length){const i=t[0],o=t[3],n=[(i[0]+o[0])/2,(i[1]+o[1])/2],r=e.projectFlat(n),{metersPerUnit:a}=e.getDistanceScales(n);return t.map((t=>{const i=e.projectFlat(t);return[(i[0]-r[0])*a[0],(i[1]-r[1])*a[1]]}))}return o.Z.error("HexagonLayer: hexagonVertices needs to be an array of 6 points")(),null}getPickingInfo({info:t}){return this.state.cpuAggregator.getPickingInfo({info:t})}_onGetSublayerColor(t){return this.state.cpuAggregator.getAccessor("fillColor")(t)}_onGetSublayerElevation(t){return this.state.cpuAggregator.getAccessor("elevation")(t)}_getSublayerUpdateTriggers(){return this.state.cpuAggregator.getUpdateTriggers(this.props)}renderLayers(){const{elevationScale:t,extruded:e,coverage:i,material:o,transitions:r}=this.props,{angle:a,radius:s,cpuAggregator:l,vertices:g}=this.state,c=this.getSubLayerClass("hexagon-cell",n.Z),u=this._getSublayerUpdateTriggers();return new c({...g&&g.length?{vertices:g,radius:1}:{radius:s,angle:a},diskResolution:6,elevationScale:t,extruded:e,coverage:i,material:o,getFillColor:this._onGetSublayerColor.bind(this),getElevation:this._onGetSublayerElevation.bind(this),transitions:r&&{getFillColor:r.getColorValue||r.getColorWeight,getElevation:r.getElevationValue||r.getElevationWeight}},this.getSubLayerProps({id:"hexagon-cell",updateTriggers:u}),{data:l.state.layerData.data})}}f.layerName="HexagonLayer",f.defaultProps=d,i(67294);var m=i(55867),_=i(28062),v=i(52154),b=i(21207),y=i(64106),L=i(26331),C=i(1740),w=i(11965);function S(t){return(0,w.tZ)("div",{className:"deckgl-tooltip"},(0,w.tZ)(C.Z,{label:(0,m.t)("Centroid (Longitude and Latitude): "),value:`(${t.coordinate[0]}, ${t.coordinate[1]})`}),(0,w.tZ)(C.Z,{label:(0,m.t)("Height")+": ",value:`${t.object.elevationValue}`}))}function x(t,e,i,o){const n=t,r=_.getScale(n.color_scheme).range().map((t=>(0,y.hexToRGB)(t)));let a=e.data.features;n.js_data_mutator&&(a=(0,b.Z)(n.js_data_mutator)(a));const s=(0,v.Z)(n.js_agg_function,(t=>t.weight));return new f({id:`hex-layer-${n.slice_id}`,data:a,pickable:!0,radius:n.grid_size,extruded:n.extruded,colorRange:r,outline:!1,getElevationValue:s,getColorValue:s,...(0,v.N)(n,o,S)})}const A=(0,L.G)(x,(function(t){return t.map((t=>t.position))}))},26331:(t,e,i)=>{i.d(e,{B:()=>L,G:()=>y});var o=i(18446),n=i.n(o),r=i(67294),a=i(84502),s=i(45697),l=i.n(s),g=i(28062),c=i(85531),u=i(36665),h=i(64106),p=i(66911),d=i(21207),f=i(40461),m=i(11965);const{getScale:_}=g,v={datasource:l().object.isRequired,formData:l().object.isRequired,getLayer:l().func.isRequired,getPoints:l().func.isRequired,height:l().number.isRequired,mapboxApiKey:l().string.isRequired,onAddFilter:l().func,payload:l().object.isRequired,setControlValue:l().func.isRequired,viewport:l().object.isRequired,width:l().number.isRequired};class b extends r.PureComponent{constructor(t){super(t),this.containerRef=r.createRef(),this.setTooltip=t=>{const{current:e}=this.containerRef;e&&e.setTooltip(t)},this.state=this.getStateFromProps(t),this.getLayers=this.getLayers.bind(this),this.onValuesChange=this.onValuesChange.bind(this),this.toggleCategory=this.toggleCategory.bind(this),this.showSingleCategory=this.showSingleCategory.bind(this)}UNSAFE_componentWillReceiveProps(t){t.payload.form_data!==this.state.formData&&this.setState({...this.getStateFromProps(t)})}onValuesChange(t){this.setState({values:Array.isArray(t)?t:[t,t+this.state.getStep(t)]})}getStateFromProps(t,e){const i=t.payload.data.features||[],o=i.map((t=>t.__timestamp)),n=function(t,e){const i=t.color_picker||{r:0,g:0,b:0,a:1},o=[i.r,i.g,i.b,255*i.a],n=_(t.color_scheme),r={};return e.forEach((e=>{if(null!=e.cat_color&&!r.hasOwnProperty(e.cat_color)){let a;a=t.dimension?(0,h.hexToRGB)(n(e.cat_color,t.sliceId),255*i.a):o,r[e.cat_color]={color:a,enabled:!0}}})),r}(t.formData,i);if(e&&t.payload.form_data===e.formData)return{...e,categories:n};const r=t.payload.form_data.time_grain_sqla||t.payload.form_data.granularity||"P1D",{start:a,end:s,getStep:l,values:g,disabled:c}=(0,p.g)(o,r),{width:u,height:d,formData:m}=t;let{viewport:v}=t;return m.autozoom&&(v=(0,f.Z)(v,{width:u,height:d,points:t.getPoints(i)})),v.zoom<0&&(v.zoom=0),{start:a,end:s,getStep:l,values:g,disabled:c,viewport:v,selected:[],lastClick:0,formData:t.payload.form_data,categories:n}}getLayers(t){const{getLayer:e,payload:i,formData:o,onAddFilter:n}=this.props;let r=i.data.features?[...i.data.features]:[];r=this.addColor(r,o),o.js_data_mutator&&(r=(0,d.Z)(o.js_data_mutator)(r)),r=t[0]===t[1]||t[1]===this.end?r.filter((e=>e.__timestamp>=t[0]&&e.__timestamp<=t[1])):r.filter((e=>e.__timestamp>=t[0]&&e.__timestamp<t[1]));const a=this.state.categories;return o.dimension&&(r=r.filter((t=>a[t.cat_color]&&a[t.cat_color].enabled))),[e(o,{...i,data:{...i.data,features:r}},n,this.setTooltip,this.props.datasource)]}addColor(t,e){const i=e.color_picker||{r:0,g:0,b:0,a:1},o=_(e.color_scheme);return t.map((t=>{let n;return e.dimension?(n=(0,h.hexToRGB)(o(t.cat_color,e.sliceId),255*i.a),{...t,color:n}):t}))}toggleCategory(t){const e=this.state.categories[t],i={...this.state.categories,[t]:{...e,enabled:!e.enabled}};Object.values(i).every((t=>!t.enabled))&&Object.values(i).forEach((t=>{t.enabled=!0})),this.setState({categories:i})}showSingleCategory(t){const e={...this.state.categories};Object.values(e).forEach((t=>{t.enabled=!1})),e[t].enabled=!0,this.setState({categories:e})}render(){return(0,m.tZ)("div",{style:{position:"relative"}},(0,m.tZ)(c.Z,{ref:this.containerRef,getLayers:this.getLayers,start:this.state.start,end:this.state.end,getStep:this.state.getStep,values:this.state.values,disabled:this.state.disabled,viewport:this.state.viewport,mapboxApiAccessToken:this.props.mapboxApiKey,mapStyle:this.props.formData.mapbox_style,setControlValue:this.props.setControlValue,width:this.props.width,height:this.props.height},(0,m.tZ)(u.Z,{forceCategorical:!0,categories:this.state.categories,format:this.props.formData.legend_format,position:this.props.formData.legend_position,showSingleCategory:this.showSingleCategory,toggleCategory:this.toggleCategory})))}}function y(t,e){class i extends r.PureComponent{constructor(t){super(t),this.containerRef=r.createRef(),this.setTooltip=t=>{const{current:e}=this.containerRef;e&&(null==e||e.setTooltip(t))};const{width:i,height:o,formData:n}=t;let{viewport:a}=t;n.autozoom&&(a=(0,f.Z)(a,{width:i,height:o,points:e(t.payload.data.features)})),this.state={viewport:a,layer:this.computeLayer(t)},this.onViewportChange=this.onViewportChange.bind(this)}UNSAFE_componentWillReceiveProps(t){const e={...t.formData,viewport:null},i={...this.props.formData,viewport:null};n()(e,i)&&t.payload===this.props.payload||this.setState({layer:this.computeLayer(t)})}onViewportChange(t){this.setState({viewport:t})}computeLayer(e){const{formData:i,payload:o,onAddFilter:n}=e;return t(i,o,n,this.setTooltip)}render(){const{formData:t,payload:e,setControlValue:i,height:o,width:n}=this.props,{layer:r,viewport:s}=this.state;return(0,m.tZ)(a.F,{ref:this.containerRef,mapboxApiAccessToken:e.data.mapboxApiKey,viewport:s,layers:[r],mapStyle:t.mapbox_style,setControlValue:i,width:n,height:o,onViewportChange:this.onViewportChange})}}return i}function L(t,e){return function(i){const{datasource:o,formData:n,height:r,payload:a,setControlValue:s,viewport:l,width:g}=i;return(0,m.tZ)(b,{datasource:o,formData:n,mapboxApiKey:a.data.mapboxApiKey,setControlValue:s,viewport:l,getLayer:t,payload:a,getPoints:e,width:g,height:r})}}b.propTypes=v}}]);
//# sourceMappingURL=5ff3e8b7a73a7bbed35f.chunk.js.map
