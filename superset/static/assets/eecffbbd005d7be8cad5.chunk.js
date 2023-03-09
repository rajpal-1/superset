"use strict";(globalThis.webpackChunksuperset=globalThis.webpackChunksuperset||[]).push([[1221],{31221:(t,e,a)=>{a.r(e),a.d(e,{default:()=>V,getLayer:()=>F});var o=a(67294),i=a(45697),n=a.n(i),s=a(80744),r=a(77380),l=a(15614),g=a(44211),c=a(6948),u=a(1113),d=a(53982),p=a(95772),h=a(51331),m=a(4516);const f=[0,0,0,0],x=[0,255,0,255],v=["minColor","maxColor","colorRange","colorDomain"],C={cellSizePixels:{value:100,min:1},cellMarginPixels:{value:2,min:0,max:5},colorDomain:null,colorRange:m.K};class S extends p.Z{static isSupported(t){return(0,g.ag)(t,[c.h.TEXTURE_FLOAT])}getShaders(){return{vs:"#define SHADER_NAME screen-grid-layer-vertex-shader\n#define RANGE_COUNT 6\n\nattribute vec3 positions;\nattribute vec3 instancePositions;\nattribute vec4 instanceCounts;\nattribute vec3 instancePickingColors;\n\nuniform float opacity;\nuniform vec3 cellScale;\nuniform vec4 minColor;\nuniform vec4 maxColor;\nuniform vec4 colorRange[RANGE_COUNT];\nuniform vec2 colorDomain;\nuniform bool shouldUseMinMax;\nuniform sampler2D maxTexture;\n\nvarying vec4 vColor;\nvarying float vSampleCount;\n\nvec4 quantizeScale(vec2 domain, vec4 range[RANGE_COUNT], float value) {\n  vec4 outColor = vec4(0., 0., 0., 0.);\n  if (value >= domain.x && value <= domain.y) {\n    float domainRange = domain.y - domain.x;\n    if (domainRange <= 0.) {\n      outColor = colorRange[0];\n    } else {\n      float rangeCount = float(RANGE_COUNT);\n      float rangeStep = domainRange / rangeCount;\n      float idx = floor((value - domain.x) / rangeStep);\n      idx = clamp(idx, 0., rangeCount - 1.);\n      int intIdx = int(idx);\n      outColor = colorRange[intIdx];\n    }\n  }\n  outColor = outColor / 255.;\n  return outColor;\n}\n\nvoid main(void) {\n  vSampleCount = instanceCounts.a;\n\n  float weight = instanceCounts.r;\n  float maxWeight = texture2D(maxTexture, vec2(0.5)).r;\n\n  float step = weight / maxWeight;\n  vec4 minMaxColor = mix(minColor, maxColor, step) / 255.;\n\n  vec2 domain = colorDomain;\n  float domainMaxValid = float(colorDomain.y != 0.);\n  domain.y = mix(maxWeight, colorDomain.y, domainMaxValid);\n  vec4 rangeColor = quantizeScale(domain, colorRange, weight);\n\n  float rangeMinMax = float(shouldUseMinMax);\n  vec4 color = mix(rangeColor, minMaxColor, rangeMinMax);\n  vColor = vec4(color.rgb, color.a * opacity);\n  picking_setPickingColor(instancePickingColors);\n\n  gl_Position = vec4(instancePositions + positions * cellScale, 1.);\n}\n",fs:"#define SHADER_NAME screen-grid-layer-fragment-shader\n\nprecision highp float;\n\nvarying vec4 vColor;\nvarying float vSampleCount;\n\nvoid main(void) {\n  if (vSampleCount <= 0.0) {\n    discard;\n  }\n  gl_FragColor = vColor;\n\n  DECKGL_FILTER_COLOR(gl_FragColor, geometry);\n}\n",modules:[h.Z]}}initializeState(){const{gl:t}=this.context;this.getAttributeManager().addInstanced({instancePositions:{size:3,update:this.calculateInstancePositions},instanceCounts:{size:4,noAlloc:!0}}),this.setState({model:this._getModel(t)})}shouldUpdateState({changeFlags:t}){return t.somethingChanged}updateState({oldProps:t,props:e,changeFlags:a}){super.updateState({oldProps:t,props:e,changeFlags:a});const o=this.getAttributeManager();e.numInstances!==t.numInstances?o.invalidateAll():t.cellSizePixels!==e.cellSizePixels&&o.invalidate("instancePositions"),this._updateUniforms(t,e,a)}draw({uniforms:t}){const{parameters:e,maxTexture:a}=this.props,o=this.props.minColor||f,i=this.props.maxColor||x,n=this.props.colorDomain||[1,0],{model:s}=this.state;s.setUniforms(t).setUniforms({minColor:o,maxColor:i,maxTexture:a,colorDomain:n}).draw({parameters:{depthTest:!1,depthMask:!1,...e}})}calculateInstancePositions(t,{numInstances:e}){const{width:a,height:o}=this.context.viewport,{cellSizePixels:i}=this.props,n=Math.ceil(a/i),{value:s,size:r}=t;for(let t=0;t<e;t++){const e=t%n,l=Math.floor(t/n);s[t*r+0]=e*i/a*2-1,s[t*r+1]=1-l*i/o*2,s[t*r+2]=0}}_getModel(t){return new u.Z(t,{...this.getShaders(),id:this.props.id,geometry:new d.Z({drawMode:6,attributes:{positions:new Float32Array([0,0,0,1,0,0,1,1,0,0,1,0])}}),isInstanced:!0})}_shouldUseMinMax(){const{minColor:t,maxColor:e,colorDomain:a,colorRange:o}=this.props;return t||e?(s.Z.deprecated("ScreenGridLayer props: minColor and maxColor","colorRange, colorDomain")(),!0):!a&&!o}_updateUniforms(t,e,a){const{model:o}=this.state;if(v.some((a=>t[a]!==e[a]))&&o.setUniforms({shouldUseMinMax:this._shouldUseMinMax()}),t.colorRange!==e.colorRange&&o.setUniforms({colorRange:(0,m.P)(e.colorRange)}),t.cellMarginPixels!==e.cellMarginPixels||t.cellSizePixels!==e.cellSizePixels||a.viewportChanged){const{width:t,height:e}=this.context.viewport,{cellSizePixels:a,cellMarginPixels:i}=this.props,n=a>i?i:0,s=new Float32Array([(a-n)/t*2,-(a-n)/e*2,1]);o.setUniforms({cellScale:s})}}}S.layerName="ScreenGridCellLayer",S.defaultProps=C;var y=a(13208),w=a(92637);const _={...S.defaultProps,getPosition:{type:"accessor",value:t=>t.position},getWeight:{type:"accessor",value:1},gpuAggregation:!0,aggregation:"SUM"},b="positions",P={data:{props:["cellSizePixels"]},weights:{props:["aggregation"],accessors:["getWeight"]}};class A extends y.Z{initializeState(){const{gl:t}=this.context;if(!S.isSupported(t))return this.setState({supported:!1}),void s.Z.error("ScreenGridLayer: ".concat(this.id," is not supported on this browser"))();super.initializeState({dimensions:P,getCellSize:t=>t.cellSizePixels});const e={count:{size:1,operation:l.KM.SUM,needMax:!0,maxTexture:(0,w.hq)(t,{id:"".concat(this.id,"-max-texture")})}};this.setState({supported:!0,projectPoints:!0,weights:e,subLayerData:{attributes:{}},maxTexture:e.count.maxTexture,positionAttributeName:"positions",posOffset:[0,0],translation:[1,-1]}),this.getAttributeManager().add({[b]:{size:3,accessor:"getPosition",type:5130,fp64:this.use64bitPositions()},count:{size:3,accessor:"getWeight"}})}shouldUpdateState({changeFlags:t}){return this.state.supported&&t.somethingChanged}updateState(t){super.updateState(t)}renderLayers(){if(!this.state.supported)return[];const{maxTexture:t,numRow:e,numCol:a,weights:o}=this.state,{updateTriggers:i}=this.props,{aggregationBuffer:n}=o.count;return new(this.getSubLayerClass("cells",S))(this.props,this.getSubLayerProps({id:"cell-layer",updateTriggers:i}),{data:{attributes:{instanceCounts:n}},maxTexture:t,numInstances:e*a})}finalizeState(){super.finalizeState();const{aggregationBuffer:t,maxBuffer:e,maxTexture:a}=this.state;null==t||t.delete(),null==e||e.delete(),null==a||a.delete()}getPickingInfo({info:t,mode:e}){const{index:a}=t;if(a>=0){const{gpuGridAggregator:e,gpuAggregation:o,weights:i}=this.state,n=o?e.getData("count"):i.count;t.object=r.Z.getAggregationData({pixelIndex:a,...n})}return t}updateResults({aggregationData:t,maxData:e}){const{count:a}=this.state.weights;a.aggregationData=t,a.aggregationBuffer.setData({data:t}),a.maxData=e,a.maxTexture.setImageData({data:e})}updateAggregationState(t){const e=t.props.cellSizePixels,a=t.oldProps.cellSizePixels!==e,{viewportChanged:o}=t.changeFlags;let i=t.props.gpuAggregation;this.state.gpuAggregation!==t.props.gpuAggregation&&i&&!r.Z.isSupported(this.context.gl)&&(s.Z.warn("GPU Grid Aggregation not supported, falling back to CPU")(),i=!1);const n=i!==this.state.gpuAggregation;this.setState({gpuAggregation:i});const l=this.isAttributeChanged(b),{dimensions:g}=this.state,{data:c,weights:u}=g,d=l||n||o||this.isAggregationDirty(t,{compareAll:i,dimension:c}),p=this.isAggregationDirty(t,{dimension:u});this.setState({aggregationDataDirty:d,aggregationWeightsDirty:p});const{viewport:h}=this.context;if(o||a){const{width:t,height:a}=h,o=Math.ceil(t/e),i=Math.ceil(a/e);this.allocateResources(i,o),this.setState({scaling:[t/2,-a/2,1],gridOffset:{xOffset:e,yOffset:e},width:t,height:a,numCol:o,numRow:i})}p&&this._updateAccessors(t),(d||p)&&this._resetResults()}_updateAccessors(t){const{getWeight:e,aggregation:a,data:o}=t.props,{count:i}=this.state.weights;i&&(i.getWeight=e,i.operation=l.KM[a]),this.setState({getValue:(0,l._D)(a,e,{data:o})})}_resetResults(){const{count:t}=this.state.weights;t&&(t.aggregationData=null)}}A.layerName="ScreenGridLayer",A.defaultProps=_;var D=a(55867),M=a(85531),R=a(66911),T=a(21207),z=a(52154),U=a(1740),L=a(40461),Z=a(11965);function k(t){return(0,Z.tZ)("div",{className:"deckgl-tooltip"},(0,Z.tZ)(U.Z,{label:(0,D.t)("Longitude and Latitude")+": ",value:`${t.coordinate[0]}, ${t.coordinate[1]}`}),(0,Z.tZ)(U.Z,{label:(0,D.t)("Weight")+": ",value:`${t.object.cellWeight}`}))}function F(t,e,a,o,i,n,s){const r=t,l=r.color_picker;let g=e.data.features.map((t=>({...t,color:[l.r,l.g,l.b,255*l.a]})));if(r.js_data_mutator){const t=(0,T.Z)(r.js_data_mutator);g=t(g)}return null!=s&&s.forEach((t=>{g=g.filter((e=>t(e)))})),new A({id:`screengrid-layer-${r.slice_id}`,data:g,pickable:!0,cellSizePixels:r.grid_size,minColor:[l.r,l.g,l.b,0],maxColor:[l.r,l.g,l.b,255*l.a],outline:!1,getWeight:t=>t.weight||0,...(0,z.N)(r,o,k)})}const N={formData:n().object.isRequired,payload:n().object.isRequired,setControlValue:n().func.isRequired,viewport:n().object.isRequired,onAddFilter:n().func,width:n().number.isRequired,height:n().number.isRequired},I={onAddFilter(){}};class E extends o.PureComponent{constructor(t){super(t),this.containerRef=o.createRef(),this.setTooltip=t=>{const{current:e}=this.containerRef;e&&e.setTooltip(t)},this.state=E.getDerivedStateFromProps(t),this.getLayers=this.getLayers.bind(this),this.onValuesChange=this.onValuesChange.bind(this)}static getDerivedStateFromProps(t,e){if(e&&t.payload.form_data===e.formData)return null;const a=t.payload.data.features||[],o=a.map((t=>t.__timestamp)),i=t.payload.form_data.time_grain_sqla||t.payload.form_data.granularity||"P1D",{start:n,end:s,getStep:r,values:l,disabled:g}=(0,R.g)(o,i),{width:c,height:u,formData:d}=t;let{viewport:p}=t;var h;return d.autozoom&&(p=(0,L.Z)(p,{width:c,height:u,points:(h=a,h.map((t=>t.position)))})),{start:n,end:s,getStep:r,values:l,disabled:g,viewport:p,selected:[],lastClick:0,formData:t.payload.form_data}}onValuesChange(t){this.setState({values:Array.isArray(t)?t:[t,t+this.state.getStep(t)]})}getLayers(t){const e=[];return t[0]===t[1]||t[1]===this.end?e.push((e=>e.__timestamp>=t[0]&&e.__timestamp<=t[1])):e.push((e=>e.__timestamp>=t[0]&&e.__timestamp<t[1])),[F(this.props.formData,this.props.payload,this.props.onAddFilter,this.setTooltip)]}render(){const{formData:t,payload:e,setControlValue:a}=this.props;return(0,Z.tZ)("div",null,(0,Z.tZ)(M.Z,{ref:this.containerRef,aggregation:!0,getLayers:this.getLayers,start:this.state.start,end:this.state.end,getStep:this.state.getStep,values:this.state.values,disabled:this.state.disabled,viewport:this.state.viewport,width:this.props.width,height:this.props.height,mapboxApiAccessToken:e.data.mapboxApiKey,mapStyle:t.mapbox_style,setControlValue:a,onValuesChange:this.onValuesChange,onViewportChange:this.onViewportChange}))}}E.propTypes=N,E.defaultProps=I;const V=E}}]);
//# sourceMappingURL=eecffbbd005d7be8cad5.chunk.js.map
