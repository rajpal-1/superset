"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[1573],{99890:(t,e,n)=>{n.d(e,{F:()=>u,m:()=>g});var i=n(9187),o=n.n(i),r=n(25215);const s=r.wG.CLOCKWISE,l=r.wG.COUNTER_CLOCKWISE,a={isClosed:!0};function c(t,e,n,i,o){let s=e;const l=n.length;for(let e=0;e<l;e++)for(let o=0;o<i;o++)t[s++]=n[e][o]||0;if(!function(t){const e=t[0],n=t[t.length-1];return e[0]===n[0]&&e[1]===n[1]&&e[2]===n[2]}(n))for(let e=0;e<i;e++)t[s++]=n[0][e]||0;return a.start=e,a.end=s,a.size=i,(0,r.Ny)(t,o,a),s}function p(t,e,n,i,o=0,s,l){const c=(s=s||n.length)-o;if(c<=0)return e;let p=e;for(let e=0;e<c;e++)t[p++]=n[o+e];if(!function(t,e,n,i){for(let o=0;o<e;o++)if(t[n+o]!==t[i-e+o])return!1;return!0}(n,i,o,s))for(let e=0;e<i;e++)t[p++]=n[o+e];return a.start=e,a.end=p,a.size=i,(0,r.Ny)(t,l,a),p}function u(t,e){!function(t){if(t=t&&t.positions||t,!Array.isArray(t)&&!ArrayBuffer.isView(t))throw new Error("invalid polygon")}(t);const n=[],i=[];if(t.positions){const{positions:o,holeIndices:r}=t;if(r){let t=0;for(let a=0;a<=r.length;a++)t=p(n,t,o,e,r[a-1],r[a],0===a?s:l),i.push(t);return i.pop(),{positions:n,holeIndices:i}}t=o}if(Number.isFinite(t[0]))return p(n,0,t,e,0,n.length,s),n;if(!function(t){return t.length>=1&&t[0].length>=2&&Number.isFinite(t[0][0])}(t)){let o=0;for(const[r,a]of t.entries())o=c(n,o,a,e,0===r?s:l),i.push(o);return i.pop(),{positions:n,holeIndices:i}}return c(n,0,t,e,s),n}function g(t,e,n){let i=null;t.holeIndices&&(i=t.holeIndices.map((t=>t/e)));let r=t.positions||t;if(n){const t=r.length;r=r.slice();const i=[];for(let o=0;o<t;o+=e){i[0]=r[o],i[1]=r[o+1];const t=n(i);r[o]=t[0],r[o+1]=t[1]}}return o()(r,i,e)}},71435:(t,e,n)=>{n.d(e,{Z:()=>C});var i=n(95772),o=n(93844),r=n(95644),s=n(51331),l=n(24088),a=n(44211),c=n(6948),p=n(1113),u=n(53982),g=n(99890),h=n(28005),d=n(25215);class f extends h.Z{constructor(t){const{fp64:e,IndexType:n=Uint32Array}=t;super({...t,attributes:{positions:{size:3,type:e?Float64Array:Float32Array},vertexValid:{type:Uint8ClampedArray,size:1},indices:{type:n,size:1}}})}get(t){const{attributes:e}=this;return"indices"===t?e.indices&&e.indices.subarray(0,this.vertexCount):e[t]}updateGeometry(t){super.updateGeometry(t);const e=this.buffers.indices;e&&(this.vertexCount=(e.value||e).length)}normalizeGeometry(t){if(this.normalize){if(t=g.F(t,this.positionSize),this.opts.resolution)return(0,d.WZ)(t.positions||t,t.holeIndices,{size:this.positionSize,gridResolution:this.opts.resolution,edgeTypes:!0});if(this.opts.wrapLongitude)return(0,d.GU)(t.positions||t,t.holeIndices,{size:this.positionSize,maxLatitude:86,edgeTypes:!0})}return t}getGeometrySize(t){if(Array.isArray(t)&&!Number.isFinite(t[0])){let e=0;for(const n of t)e+=this.getGeometrySize(n);return e}return(t.positions||t).length/this.positionSize}getGeometryFromBuffer(t){return this.normalize||!this.buffers.indices?super.getGeometryFromBuffer(t):()=>null}updateGeometryAttributes(t,e){if(Array.isArray(t)&&!Number.isFinite(t[0]))for(const n of t){const t=this.getGeometrySize(n);e.geometrySize=t,this.updateGeometryAttributes(n,e),e.vertexStart+=t,e.indexStart=this.indexStarts[e.geometryIndex+1]}else this._updateIndices(t,e),this._updatePositions(t,e),this._updateVertexValid(t,e)}_updateIndices(t,{geometryIndex:e,vertexStart:n,indexStart:i}){const{attributes:o,indexStarts:r,typedArrayManager:s}=this;let l=o.indices;if(!l)return;let a=i;const c=g.m(t,this.positionSize,this.opts.preproject);l=s.allocate(l,i+c.length,{copy:!0});for(let t=0;t<c.length;t++)l[a++]=c[t]+n;r[e+1]=i+c.length,o.indices=l}_updatePositions(t,{vertexStart:e,geometrySize:n}){const{attributes:{positions:i},positionSize:o}=this;if(!i)return;const r=t.positions||t;for(let t=e,s=0;s<n;t++,s++){const e=r[s*o],n=r[s*o+1],l=o>2?r[s*o+2]:0;i[3*t]=e,i[3*t+1]=n,i[3*t+2]=l}}_updateVertexValid(t,{vertexStart:e,geometrySize:n}){const{attributes:{vertexValid:i},positionSize:o}=this,r=t&&t.holeIndices;if(t&&t.edgeTypes?i.set(t.edgeTypes,e):i.fill(1,e,e+n),r)for(let t=0;t<r.length;t++)i[e+r[t]/o-1]=0;i[e+n-1]=0}}const v="\nattribute vec2 vertexPositions;\nattribute float vertexValid;\n\nuniform bool extruded;\nuniform bool isWireframe;\nuniform float elevationScale;\nuniform float opacity;\n\nvarying vec4 vColor;\n\nstruct PolygonProps {\n  vec4 fillColors;\n  vec4 lineColors;\n  vec3 positions;\n  vec3 nextPositions;\n  vec3 pickingColors;\n  vec3 positions64Low;\n  vec3 nextPositions64Low;\n  float elevations;\n};\n\nvec3 project_offset_normal(vec3 vector) {\n  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||\n    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {\n    return normalize(vector * project_uCommonUnitsPerWorldUnit);\n  }\n  return project_normal(vector);\n}\n\nvoid calculatePosition(PolygonProps props) {\n#ifdef IS_SIDE_VERTEX\n  if(vertexValid < 0.5){\n    gl_Position = vec4(0.);\n    return;\n  }\n#endif\n\n  vec3 pos;\n  vec3 pos64Low;\n  vec3 normal;\n  vec4 colors = isWireframe ? props.lineColors : props.fillColors;\n\n  geometry.worldPosition = props.positions;\n  geometry.worldPositionAlt = props.nextPositions;\n  geometry.pickingColor = props.pickingColors;\n\n#ifdef IS_SIDE_VERTEX\n  pos = mix(props.positions, props.nextPositions, vertexPositions.x);\n  pos64Low = mix(props.positions64Low, props.nextPositions64Low, vertexPositions.x);\n#else\n  pos = props.positions;\n  pos64Low = props.positions64Low;\n#endif\n\n  if (extruded) {\n    pos.z += props.elevations * vertexPositions.y * elevationScale;\n\n#ifdef IS_SIDE_VERTEX\n    normal = vec3(\n      props.positions.y - props.nextPositions.y + (props.positions64Low.y - props.nextPositions64Low.y),\n      props.nextPositions.x - props.positions.x + (props.nextPositions64Low.x - props.positions64Low.x),\n      0.0);\n    normal = project_offset_normal(normal);\n#else\n    normal = vec3(0.0, 0.0, 1.0);\n#endif\n    geometry.normal = normal;\n  }\n\n  gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);\n  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);\n\n  if (extruded) {\n    vec3 lightColor = lighting_getLightColor(colors.rgb, project_uCameraPosition, geometry.position.xyz, normal);\n    vColor = vec4(lightColor, colors.a * opacity);\n  } else {\n    vColor = vec4(colors.rgb, colors.a * opacity);\n  }\n  DECKGL_FILTER_COLOR(vColor, geometry);\n}\n",x="#define SHADER_NAME solid-polygon-layer-vertex-shader\n\nattribute vec3 positions;\nattribute vec3 positions64Low;\nattribute float elevations;\nattribute vec4 fillColors;\nattribute vec4 lineColors;\nattribute vec3 pickingColors;\n\n".concat(v,"\n\nvoid main(void) {\n  PolygonProps props;\n\n  props.positions = positions;\n  props.positions64Low = positions64Low;\n  props.elevations = elevations;\n  props.fillColors = fillColors;\n  props.lineColors = lineColors;\n  props.pickingColors = pickingColors;\n\n  calculatePosition(props);\n}\n"),_="#define SHADER_NAME solid-polygon-layer-vertex-shader-side\n#define IS_SIDE_VERTEX\n\n\nattribute vec3 instancePositions;\nattribute vec3 nextPositions;\nattribute vec3 instancePositions64Low;\nattribute vec3 nextPositions64Low;\nattribute float instanceElevations;\nattribute vec4 instanceFillColors;\nattribute vec4 instanceLineColors;\nattribute vec3 instancePickingColors;\n\n".concat(v,"\n\nvoid main(void) {\n  PolygonProps props;\n\n  #if RING_WINDING_ORDER_CW == 1\n    props.positions = instancePositions;\n    props.positions64Low = instancePositions64Low;\n    props.nextPositions = nextPositions;\n    props.nextPositions64Low = nextPositions64Low;\n  #else\n    props.positions = nextPositions;\n    props.positions64Low = nextPositions64Low;\n    props.nextPositions = instancePositions;\n    props.nextPositions64Low = instancePositions64Low;\n  #endif\n  props.elevations = instanceElevations;\n  props.fillColors = instanceFillColors;\n  props.lineColors = instanceLineColors;\n  props.pickingColors = instancePickingColors;\n\n  calculatePosition(props);\n}\n"),y=[0,0,0,255],m={filled:!0,extruded:!1,wireframe:!1,_normalize:!0,_windingOrder:"CW",elevationScale:{type:"number",min:0,value:1},getPolygon:{type:"accessor",value:t=>t.polygon},getElevation:{type:"accessor",value:1e3},getFillColor:{type:"accessor",value:y},getLineColor:{type:"accessor",value:y},material:!0},L={enter:(t,e)=>e.length?e.subarray(e.length-t.length):t};class C extends i.Z{getShaders(t){return super.getShaders({vs:"top"===t?x:_,fs:"#define SHADER_NAME solid-polygon-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\n\nvoid main(void) {\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n",defines:{RING_WINDING_ORDER_CW:this.props._normalize||"CCW"!==this.props._windingOrder?1:0},modules:[o.Z,r.N,s.Z]})}get wrapLongitude(){return!1}initializeState(){const{gl:t,viewport:e}=this.context;let{coordinateSystem:n}=this.props;e.isGeospatial&&n===l.Df.DEFAULT&&(n=l.Df.LNGLAT),this.setState({numInstances:0,polygonTesselator:new f({preproject:n===l.Df.LNGLAT&&e.projectFlat,fp64:this.use64bitPositions(),IndexType:!t||(0,a.ag)(t,c.h.ELEMENT_INDEX_UINT32)?Uint32Array:Uint16Array})});const i=this.getAttributeManager(),o=!0;i.remove(["instancePickingColors"]),i.add({indices:{size:1,isIndexed:!0,update:this.calculateIndices,noAlloc:o},positions:{size:3,type:5130,fp64:this.use64bitPositions(),transition:L,accessor:"getPolygon",update:this.calculatePositions,noAlloc:o,shaderAttributes:{positions:{vertexOffset:0,divisor:0},instancePositions:{vertexOffset:0,divisor:1},nextPositions:{vertexOffset:1,divisor:1}}},vertexValid:{size:1,divisor:1,type:5121,update:this.calculateVertexValid,noAlloc:o},elevations:{size:1,transition:L,accessor:"getElevation",shaderAttributes:{elevations:{divisor:0},instanceElevations:{divisor:1}}},fillColors:{alias:"colors",size:this.props.colorFormat.length,type:5121,normalized:!0,transition:L,accessor:"getFillColor",defaultValue:y,shaderAttributes:{fillColors:{divisor:0},instanceFillColors:{divisor:1}}},lineColors:{alias:"colors",size:this.props.colorFormat.length,type:5121,normalized:!0,transition:L,accessor:"getLineColor",defaultValue:y,shaderAttributes:{lineColors:{divisor:0},instanceLineColors:{divisor:1}}},pickingColors:{size:3,type:5121,accessor:(t,{index:e,target:n})=>this.encodePickingColor(t&&t.__source?t.__source.index:e,n),shaderAttributes:{pickingColors:{divisor:0},instancePickingColors:{divisor:1}}}})}getPickingInfo(t){const e=super.getPickingInfo(t),{index:n}=e,{data:i}=this.props;return i[0]&&i[0].__source&&(e.object=i.find((t=>t.__source.index===n))),e}disablePickingIndex(t){const{data:e}=this.props;if(e[0]&&e[0].__source)for(let n=0;n<e.length;n++)e[n].__source.index===t&&this._disablePickingIndex(n);else this._disablePickingIndex(t)}draw({uniforms:t}){const{extruded:e,filled:n,wireframe:i,elevationScale:o}=this.props,{topModel:r,sideModel:s,polygonTesselator:l}=this.state,a={...t,extruded:Boolean(e),elevationScale:o};s&&(s.setInstanceCount(l.instanceCount-1),s.setUniforms(a),i&&(s.setDrawMode(3),s.setUniforms({isWireframe:!0}).draw()),n&&(s.setDrawMode(6),s.setUniforms({isWireframe:!1}).draw())),r&&(r.setVertexCount(l.vertexCount),r.setUniforms(a).draw())}updateState(t){super.updateState(t),this.updateGeometry(t);const{props:e,oldProps:n,changeFlags:i}=t,o=this.getAttributeManager();var r;(i.extensionsChanged||e.filled!==n.filled||e.extruded!==n.extruded)&&(null===(r=this.state.models)||void 0===r||r.forEach((t=>t.delete())),this.setState(this._getModels(this.context.gl)),o.invalidateAll())}updateGeometry({props:t,oldProps:e,changeFlags:n}){if(n.dataChanged||n.updateTriggersChanged&&(n.updateTriggersChanged.all||n.updateTriggersChanged.getPolygon)){const{polygonTesselator:e}=this.state,i=t.data.attributes||{};e.updateGeometry({data:t.data,normalize:t._normalize,geometryBuffer:i.getPolygon,buffers:i,getGeometry:t.getPolygon,positionFormat:t.positionFormat,wrapLongitude:t.wrapLongitude,resolution:this.context.viewport.resolution,fp64:this.use64bitPositions(),dataChanged:n.dataChanged}),this.setState({numInstances:e.instanceCount,startIndices:e.vertexStarts}),n.dataChanged||this.getAttributeManager().invalidateAll()}}_getModels(t){const{id:e,filled:n,extruded:i}=this.props;let o,r;if(n){const n=this.getShaders("top");n.defines.NON_INSTANCED_MODEL=1,o=new p.Z(t,{...n,id:"".concat(e,"-top"),drawMode:4,attributes:{vertexPositions:new Float32Array([0,1])},uniforms:{isWireframe:!1,isSideVertex:!1},vertexCount:0,isIndexed:!0})}return i&&(r=new p.Z(t,{...this.getShaders("side"),id:"".concat(e,"-side"),geometry:new u.Z({drawMode:1,vertexCount:4,attributes:{vertexPositions:{size:2,value:new Float32Array([1,0,0,0,0,1,1,1])}}}),instanceCount:0,isInstanced:1}),r.userData.excludeAttributes={indices:!0}),{models:[r,o].filter(Boolean),topModel:o,sideModel:r}}calculateIndices(t){const{polygonTesselator:e}=this.state;t.startIndices=e.indexStarts,t.value=e.get("indices")}calculatePositions(t){const{polygonTesselator:e}=this.state;t.startIndices=e.vertexStarts,t.value=e.get("positions")}calculateVertexValid(t){t.value=this.state.polygonTesselator.get("vertexValid")}}C.layerName="SolidPolygonLayer",C.defaultProps=m},98452:(t,e,n)=>{function i({data:t,getIndex:e,dataRange:n,replace:i}){const{startRow:o=0,endRow:r=1/0}=n,s=t.length;let l=s,a=s;for(let n=0;n<s;n++){const i=e(t[n]);if(l>n&&i>=o&&(l=n),i>=r){a=n;break}}let c=l;const p=a-l!==i.length,u=p&&t.slice(a);for(let e=0;e<i.length;e++)t[c++]=i[e];if(p){for(let e=0;e<u.length;e++)t[c++]=u[e];t.length=c}return{startRow:l,endRow:l+i.length}}n.d(e,{b:()=>i})},95644:(t,e,n)=>{n.d(e,{N:()=>l});const i="#if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))\n\nstruct AmbientLight {\n vec3 color;\n};\n\nstruct PointLight {\n vec3 color;\n vec3 position;\n vec3 attenuation;\n};\n\nstruct DirectionalLight {\n  vec3 color;\n  vec3 direction;\n};\n\nuniform AmbientLight lighting_uAmbientLight;\nuniform PointLight lighting_uPointLight[MAX_LIGHTS];\nuniform DirectionalLight lighting_uDirectionalLight[MAX_LIGHTS];\nuniform int lighting_uPointLightCount;\nuniform int lighting_uDirectionalLightCount;\n\nuniform bool lighting_uEnabled;\n\nfloat getPointLightAttenuation(PointLight pointLight, float distance) {\n  return pointLight.attenuation.x\n       + pointLight.attenuation.y * distance\n       + pointLight.attenuation.z * distance * distance;\n}\n\n#endif\n",o={lightSources:{}};function r({color:t=[0,0,0],intensity:e=1}={}){return t.map((t=>t*e/255))}const s={};const l={name:"gouraud-lighting",dependencies:[{name:"lights",vs:i,fs:i,getUniforms:function t(e=o){if("lightSources"in e){const{ambientLight:t,pointLights:n,directionalLights:i}=e.lightSources||{};return t||n&&n.length>0||i&&i.length>0?Object.assign({},function({ambientLight:t,pointLights:e=[],directionalLights:n=[]}){const i={};return i["lighting_uAmbientLight.color"]=t?r(t):[0,0,0],e.forEach(((t,e)=>{i["lighting_uPointLight[".concat(e,"].color")]=r(t),i["lighting_uPointLight[".concat(e,"].position")]=t.position,i["lighting_uPointLight[".concat(e,"].attenuation")]=t.attenuation||[1,0,0]})),i.lighting_uPointLightCount=e.length,n.forEach(((t,e)=>{i["lighting_uDirectionalLight[".concat(e,"].color")]=r(t),i["lighting_uDirectionalLight[".concat(e,"].direction")]=t.direction})),i.lighting_uDirectionalLightCount=n.length,i}({ambientLight:t,pointLights:n,directionalLights:i}),{lighting_uEnabled:!0}):{lighting_uEnabled:!1}}if("lights"in e){const n={pointLights:[],directionalLights:[]};for(const t of e.lights||[])switch(t.type){case"ambient":n.ambientLight=t;break;case"directional":n.directionalLights.push(t);break;case"point":n.pointLights.push(t)}return t({lightSources:n})}return{}},defines:{MAX_LIGHTS:3}}],vs:"\nuniform float lighting_uAmbient;\nuniform float lighting_uDiffuse;\nuniform float lighting_uShininess;\nuniform vec3  lighting_uSpecularColor;\n\nvec3 lighting_getLightColor(vec3 surfaceColor, vec3 light_direction, vec3 view_direction, vec3 normal_worldspace, vec3 color) {\n    vec3 halfway_direction = normalize(light_direction + view_direction);\n    float lambertian = dot(light_direction, normal_worldspace);\n    float specular = 0.0;\n    if (lambertian > 0.0) {\n      float specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);\n      specular = pow(specular_angle, lighting_uShininess);\n    }\n    lambertian = max(lambertian, 0.0);\n    return (lambertian * lighting_uDiffuse * surfaceColor + specular * lighting_uSpecularColor) * color;\n}\n\nvec3 lighting_getLightColor(vec3 surfaceColor, vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {\n  vec3 lightColor = surfaceColor;\n\n  if (lighting_uEnabled) {\n    vec3 view_direction = normalize(cameraPosition - position_worldspace);\n    lightColor = lighting_uAmbient * surfaceColor * lighting_uAmbientLight.color;\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uPointLightCount) {\n        break;\n      }\n      PointLight pointLight = lighting_uPointLight[i];\n      vec3 light_position_worldspace = pointLight.position;\n      vec3 light_direction = normalize(light_position_worldspace - position_worldspace);\n      lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color);\n    }\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uDirectionalLightCount) {\n        break;\n      }\n      DirectionalLight directionalLight = lighting_uDirectionalLight[i];\n      lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);\n    }\n  }\n  return lightColor;\n}\n\nvec3 lighting_getSpecularLightColor(vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {\n  vec3 lightColor = vec3(0, 0, 0);\n  vec3 surfaceColor = vec3(0, 0, 0);\n\n  if (lighting_uEnabled) {\n    vec3 view_direction = normalize(cameraPosition - position_worldspace);\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uPointLightCount) {\n        break;\n      }\n      PointLight pointLight = lighting_uPointLight[i];\n      vec3 light_position_worldspace = pointLight.position;\n      vec3 light_direction = normalize(light_position_worldspace - position_worldspace);\n      lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color);\n    }\n\n    for (int i = 0; i < MAX_LIGHTS; i++) {\n      if (i >= lighting_uDirectionalLightCount) {\n        break;\n      }\n      DirectionalLight directionalLight = lighting_uDirectionalLight[i];\n      lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);\n    }\n  }\n  return lightColor;\n}\n",defines:{LIGHTING_VERTEX:1},getUniforms:function(t=s){if(!("material"in t))return{};const{material:e}=t;return e?function(t){const{ambient:e=.35,diffuse:n=.6,shininess:i=32,specularColor:o=[30,30,30]}=t;return{lighting_uAmbient:e,lighting_uDiffuse:n,lighting_uShininess:i,lighting_uSpecularColor:o.map((t=>t/255))}}(e):{lighting_uEnabled:!1}}}},9187:t=>{function e(t,e,i){i=i||2;var r,s,l,a,u,g,d,f=e&&e.length,v=f?e[0]*i:t.length,x=n(t,0,v,i,!0),_=[];if(!x||x.next===x.prev)return _;if(f&&(x=function(t,e,i,o){var r,s,l,a=[];for(r=0,s=e.length;r<s;r++)(l=n(t,e[r]*o,r<s-1?e[r+1]*o:t.length,o,!1))===l.next&&(l.steiner=!0),a.push(h(l));for(a.sort(c),r=0;r<a.length;r++)i=p(a[r],i);return i}(t,e,x,i)),t.length>80*i){r=l=t[0],s=a=t[1];for(var y=i;y<v;y+=i)(u=t[y])<r&&(r=u),(g=t[y+1])<s&&(s=g),u>l&&(l=u),g>a&&(a=g);d=0!==(d=Math.max(l-r,a-s))?32767/d:0}return o(x,_,i,r,s,d,0),_}function n(t,e,n,i,o){var r,s;if(o===S(t,e,n,i)>0)for(r=e;r<n;r+=i)s=w(r,t[r],t[r+1],s);else for(r=n-i;r>=e;r-=i)s=w(r,t[r],t[r+1],s);return s&&x(s,s.next)&&(b(s),s=s.next),s}function i(t,e){if(!t)return t;e||(e=t);var n,i=t;do{if(n=!1,i.steiner||!x(i,i.next)&&0!==v(i.prev,i,i.next))i=i.next;else{if(b(i),(i=e=i.prev)===i.next)break;n=!0}}while(n||i!==e);return e}function o(t,e,n,c,p,u,h){if(t){!h&&u&&function(t,e,n,i){var o=t;do{0===o.z&&(o.z=g(o.x,o.y,e,n,i)),o.prevZ=o.prev,o.nextZ=o.next,o=o.next}while(o!==t);o.prevZ.nextZ=null,o.prevZ=null,function(t){var e,n,i,o,r,s,l,a,c=1;do{for(n=t,t=null,r=null,s=0;n;){for(s++,i=n,l=0,e=0;e<c&&(l++,i=i.nextZ);e++);for(a=c;l>0||a>0&&i;)0!==l&&(0===a||!i||n.z<=i.z)?(o=n,n=n.nextZ,l--):(o=i,i=i.nextZ,a--),r?r.nextZ=o:t=o,o.prevZ=r,r=o;n=i}r.nextZ=null,c*=2}while(s>1)}(o)}(t,c,p,u);for(var d,f,v=t;t.prev!==t.next;)if(d=t.prev,f=t.next,u?s(t,c,p,u):r(t))e.push(d.i/n|0),e.push(t.i/n|0),e.push(f.i/n|0),b(t),t=f.next,v=f.next;else if((t=f)===v){h?1===h?o(t=l(i(t),e,n),e,n,c,p,u,2):2===h&&a(t,e,n,c,p,u):o(i(t),e,n,c,p,u,1);break}}}function r(t){var e=t.prev,n=t,i=t.next;if(v(e,n,i)>=0)return!1;for(var o=e.x,r=n.x,s=i.x,l=e.y,a=n.y,c=i.y,p=o<r?o<s?o:s:r<s?r:s,u=l<a?l<c?l:c:a<c?a:c,g=o>r?o>s?o:s:r>s?r:s,h=l>a?l>c?l:c:a>c?a:c,f=i.next;f!==e;){if(f.x>=p&&f.x<=g&&f.y>=u&&f.y<=h&&d(o,l,r,a,s,c,f.x,f.y)&&v(f.prev,f,f.next)>=0)return!1;f=f.next}return!0}function s(t,e,n,i){var o=t.prev,r=t,s=t.next;if(v(o,r,s)>=0)return!1;for(var l=o.x,a=r.x,c=s.x,p=o.y,u=r.y,h=s.y,f=l<a?l<c?l:c:a<c?a:c,x=p<u?p<h?p:h:u<h?u:h,_=l>a?l>c?l:c:a>c?a:c,y=p>u?p>h?p:h:u>h?u:h,m=g(f,x,e,n,i),L=g(_,y,e,n,i),C=t.prevZ,w=t.nextZ;C&&C.z>=m&&w&&w.z<=L;){if(C.x>=f&&C.x<=_&&C.y>=x&&C.y<=y&&C!==o&&C!==s&&d(l,p,a,u,c,h,C.x,C.y)&&v(C.prev,C,C.next)>=0)return!1;if(C=C.prevZ,w.x>=f&&w.x<=_&&w.y>=x&&w.y<=y&&w!==o&&w!==s&&d(l,p,a,u,c,h,w.x,w.y)&&v(w.prev,w,w.next)>=0)return!1;w=w.nextZ}for(;C&&C.z>=m;){if(C.x>=f&&C.x<=_&&C.y>=x&&C.y<=y&&C!==o&&C!==s&&d(l,p,a,u,c,h,C.x,C.y)&&v(C.prev,C,C.next)>=0)return!1;C=C.prevZ}for(;w&&w.z<=L;){if(w.x>=f&&w.x<=_&&w.y>=x&&w.y<=y&&w!==o&&w!==s&&d(l,p,a,u,c,h,w.x,w.y)&&v(w.prev,w,w.next)>=0)return!1;w=w.nextZ}return!0}function l(t,e,n){var o=t;do{var r=o.prev,s=o.next.next;!x(r,s)&&_(r,o,o.next,s)&&L(r,s)&&L(s,r)&&(e.push(r.i/n|0),e.push(o.i/n|0),e.push(s.i/n|0),b(o),b(o.next),o=t=s),o=o.next}while(o!==t);return i(o)}function a(t,e,n,r,s,l){var a=t;do{for(var c=a.next.next;c!==a.prev;){if(a.i!==c.i&&f(a,c)){var p=C(a,c);return a=i(a,a.next),p=i(p,p.next),o(a,e,n,r,s,l,0),void o(p,e,n,r,s,l,0)}c=c.next}a=a.next}while(a!==t)}function c(t,e){return t.x-e.x}function p(t,e){var n=function(t,e){var n,i=e,o=t.x,r=t.y,s=-1/0;do{if(r<=i.y&&r>=i.next.y&&i.next.y!==i.y){var l=i.x+(r-i.y)*(i.next.x-i.x)/(i.next.y-i.y);if(l<=o&&l>s&&(s=l,n=i.x<i.next.x?i:i.next,l===o))return n}i=i.next}while(i!==e);if(!n)return null;var a,c=n,p=n.x,g=n.y,h=1/0;i=n;do{o>=i.x&&i.x>=p&&o!==i.x&&d(r<g?o:s,r,p,g,r<g?s:o,r,i.x,i.y)&&(a=Math.abs(r-i.y)/(o-i.x),L(i,t)&&(a<h||a===h&&(i.x>n.x||i.x===n.x&&u(n,i)))&&(n=i,h=a)),i=i.next}while(i!==c);return n}(t,e);if(!n)return e;var o=C(n,t);return i(o,o.next),i(n,n.next)}function u(t,e){return v(t.prev,t,e.prev)<0&&v(e.next,t,t.next)<0}function g(t,e,n,i,o){return(t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=(t-n)*o|0)|t<<8))|t<<4))|t<<2))|t<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-i)*o|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function h(t){var e=t,n=t;do{(e.x<n.x||e.x===n.x&&e.y<n.y)&&(n=e),e=e.next}while(e!==t);return n}function d(t,e,n,i,o,r,s,l){return(o-s)*(e-l)>=(t-s)*(r-l)&&(t-s)*(i-l)>=(n-s)*(e-l)&&(n-s)*(r-l)>=(o-s)*(i-l)}function f(t,e){return t.next.i!==e.i&&t.prev.i!==e.i&&!function(t,e){var n=t;do{if(n.i!==t.i&&n.next.i!==t.i&&n.i!==e.i&&n.next.i!==e.i&&_(n,n.next,t,e))return!0;n=n.next}while(n!==t);return!1}(t,e)&&(L(t,e)&&L(e,t)&&function(t,e){var n=t,i=!1,o=(t.x+e.x)/2,r=(t.y+e.y)/2;do{n.y>r!=n.next.y>r&&n.next.y!==n.y&&o<(n.next.x-n.x)*(r-n.y)/(n.next.y-n.y)+n.x&&(i=!i),n=n.next}while(n!==t);return i}(t,e)&&(v(t.prev,t,e.prev)||v(t,e.prev,e))||x(t,e)&&v(t.prev,t,t.next)>0&&v(e.prev,e,e.next)>0)}function v(t,e,n){return(e.y-t.y)*(n.x-e.x)-(e.x-t.x)*(n.y-e.y)}function x(t,e){return t.x===e.x&&t.y===e.y}function _(t,e,n,i){var o=m(v(t,e,n)),r=m(v(t,e,i)),s=m(v(n,i,t)),l=m(v(n,i,e));return o!==r&&s!==l||!(0!==o||!y(t,n,e))||!(0!==r||!y(t,i,e))||!(0!==s||!y(n,t,i))||!(0!==l||!y(n,e,i))}function y(t,e,n){return e.x<=Math.max(t.x,n.x)&&e.x>=Math.min(t.x,n.x)&&e.y<=Math.max(t.y,n.y)&&e.y>=Math.min(t.y,n.y)}function m(t){return t>0?1:t<0?-1:0}function L(t,e){return v(t.prev,t,t.next)<0?v(t,e,t.next)>=0&&v(t,t.prev,e)>=0:v(t,e,t.prev)<0||v(t,t.next,e)<0}function C(t,e){var n=new P(t.i,t.x,t.y),i=new P(e.i,e.x,e.y),o=t.next,r=e.prev;return t.next=e,e.prev=t,n.next=o,o.prev=n,i.next=n,n.prev=i,r.next=i,i.prev=r,i}function w(t,e,n,i){var o=new P(t,e,n);return i?(o.next=i.next,o.prev=i,i.next.prev=o,i.next=o):(o.prev=o,o.next=o),o}function b(t){t.next.prev=t.prev,t.prev.next=t.next,t.prevZ&&(t.prevZ.nextZ=t.nextZ),t.nextZ&&(t.nextZ.prevZ=t.prevZ)}function P(t,e,n){this.i=t,this.x=e,this.y=n,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function S(t,e,n,i){for(var o=0,r=e,s=n-i;r<n;r+=i)o+=(t[s]-t[r])*(t[r+1]+t[s+1]),s=r;return o}t.exports=e,t.exports.default=e,e.deviation=function(t,e,n,i){var o=e&&e.length,r=o?e[0]*n:t.length,s=Math.abs(S(t,0,r,n));if(o)for(var l=0,a=e.length;l<a;l++){var c=e[l]*n,p=l<a-1?e[l+1]*n:t.length;s-=Math.abs(S(t,c,p,n))}var u=0;for(l=0;l<i.length;l+=3){var g=i[l]*n,h=i[l+1]*n,d=i[l+2]*n;u+=Math.abs((t[g]-t[d])*(t[h+1]-t[g+1])-(t[g]-t[h])*(t[d+1]-t[g+1]))}return 0===s&&0===u?0:Math.abs((u-s)/s)},e.flatten=function(t){for(var e=t[0][0].length,n={vertices:[],holes:[],dimensions:e},i=0,o=0;o<t.length;o++){for(var r=0;r<t[o].length;r++)for(var s=0;s<e;s++)n.vertices.push(t[o][r][s]);o>0&&(i+=t[o-1].length,n.holes.push(i))}return n}}}]);
//# sourceMappingURL=2d8e4594741dce3dbd4f.chunk.js.map
