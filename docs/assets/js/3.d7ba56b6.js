(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{321:function(e,t,n){"use strict";var o=this&&this.__assign||function(){return(o=Object.assign||function(e){for(var t,n=1,o=arguments.length;n<o;n++)for(var a in t=arguments[n])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e}).apply(this,arguments)};Object.defineProperty(t,"__esModule",{value:!0}),t.getScriptCodeShowInfo=t.diffShowType=t.filterUserObject=t.nodeFilterOptions=t.nodeFilterType=t.getNodeShowInfoByClass=t.getNodeShowInfo=t.V8SnapshotNodeTypes=t.V8SnapshotEdgeTypes=t.V8SnapshotInfo=void 0;var a,i=n(21),r=n(21);Object.defineProperty(t,"V8SnapshotInfo",{enumerable:!0,get:function(){return r.V8SnapshotInfo}}),Object.defineProperty(t,"V8SnapshotEdgeTypes",{enumerable:!0,get:function(){return r.V8SnapshotEdgeTypes}}),Object.defineProperty(t,"V8SnapshotNodeTypes",{enumerable:!0,get:function(){return r.V8SnapshotNodeTypes}}),t.getNodeShowInfo=function(e){var t=e.edge,n=e.node,a=e.totalSize;return o(o(o({},n),t),{nodeType:n.type,distanceShow:n.distance>=i.V8SnapshotInfo.BASE_SYSTEM_DISTANCE?"-":n.distance,nameShow:n.type===i.V8SnapshotNodeTypes.concatenated_string||n.type===i.V8SnapshotNodeTypes.string?'"'.concat(n.name,'"'):n.type===i.V8SnapshotNodeTypes.regexp?"/".concat(n.name,"/"):n.type===i.V8SnapshotNodeTypes.closure?"".concat(n.name,"()"):n.type===i.V8SnapshotNodeTypes.array?"".concat(n.name||"(internal array)","[]"):n.name,nameShowStyle:{color:n.type===i.V8SnapshotNodeTypes.concatenated_string||n.type===i.V8SnapshotNodeTypes.string||n.type===i.V8SnapshotNodeTypes.regexp?"rgb(200,0,0)":n.type===i.V8SnapshotNodeTypes.closure?void 0:n.type===i.V8SnapshotNodeTypes.bigint?"rgb(35,110,37)":n.type===i.V8SnapshotNodeTypes.number?"rgb(26,26,166)":n.type===i.V8SnapshotNodeTypes.hidden||n.type===i.V8SnapshotNodeTypes.object_shape?"#909399":void 0,fontStyle:n.type===i.V8SnapshotNodeTypes.closure?"italic":void 0},nameShowPrefix:(null==t?void 0:t.type)===i.V8SnapshotEdgeTypes.element?"[".concat(t.name_or_index,"]"):(null==t?void 0:t.name_or_index)||"",nameShowPrefixStyle:{color:[i.V8SnapshotEdgeTypes.internal,i.V8SnapshotEdgeTypes.hidden,i.V8SnapshotEdgeTypes.weak].indexOf(null==t?void 0:t.type)>-1?"#909399":(null==t?void 0:t.type)===i.V8SnapshotEdgeTypes.context?"rgb(26,26,166)":"rgb(136,18,128)"},reachableFromWindow:n.type===i.V8SnapshotNodeTypes.string||n.type===i.V8SnapshotNodeTypes.object&&0===n.name.indexOf("Window")||Boolean(n.flag&i.V8SnapshotInfo.NODE_FLAGS.canBeQueried),detachedDOMTreeNode:Boolean(n.flag&i.V8SnapshotInfo.NODE_FLAGS.detachedDOMTreeNode),selfSizePercent:Math.round(100*n.self_size/a),retainedSizePercent:Math.round(100*n.retained_size/a)})},t.getNodeShowInfoByClass=function(e){var t=e._class,n=e.totalSize;return o(o({},t),{distanceShow:t.distance,nameShow:t.name,nameShowStyle:{},nameShowPrefix:"",nameShowPrefixStyle:{},reachableFromWindow:!1,detachedDOMTreeNode:!1,self_size:t.self,selfSizePercent:Math.round(100*t.self/n),retained_size:t.maxRet,retainedSizePercent:Math.round(100*t.maxRet/n),hasChildren:!!t.idxs.length,rowKey:t.idx})},function(e){e[e.userObject=1]="userObject",e[e.showObject=2]="showObject",e[e.all=3]="all"}(a=t.nodeFilterType||(t.nodeFilterType={})),t.nodeFilterOptions=[{value:a.userObject,label:"用户节点"},{value:a.showObject,label:"可访问节点"},{value:a.all,label:"全部节点"}],t.filterUserObject=function(e){var t=e.node,n=e.edge;return!(t.distance>=i.V8SnapshotInfo.BASE_SYSTEM_DISTANCE)&&(!!(t.flag&i.V8SnapshotInfo.NODE_FLAGS.canBeQueried)&&(![i.V8SnapshotNodeTypes.hidden,i.V8SnapshotNodeTypes.object_shape,i.V8SnapshotNodeTypes.native,i.V8SnapshotNodeTypes.code].includes(t.type)&&(![i.V8SnapshotEdgeTypes.internal,i.V8SnapshotEdgeTypes.hidden,i.V8SnapshotEdgeTypes.weak,i.V8SnapshotEdgeTypes.context].includes(null==n?void 0:n.type)&&(!["__proto__"].includes(null==n?void 0:n.name_or_index)&&(((null==n?void 0:n.type)!==i.V8SnapshotEdgeTypes.property||!["BigInt64Array","Int8Array","Int16Array","Int32Array","Uint8Array","Uint16Array","Uint32Array","BigUint64Array","Float32Array","Float64Array","Uint8ClampedArray","Boolean","Map","Symbol","WeakMap","Math","Date","Array","ArrayBuffer","NaN","Infinity","String","RegExp","Set","WeakSet","Object","Number","JSON","Function","BigInt","Promise","Proxy","WebAssembly","FinalizationRegistry","WeakRef","Error","RangeError","URIError","SyntaxError","EvalError","TypeError","ReferenceError","AggregateError","XMLHttpRequest","DataView","isNaN","isFinite","Reflect","Intl","Atomics","setTimeout","setInterval","clearTimeout","clearInterval","encodeURI","decodeURI","encodeURIComponent","decodeURIComponent","eval","parseInt","parseFloat","console","escape","unescape","global","structuredClone","resizeBy","requestIdleCallback","webkitRequestAnimationFrame","requestAnimationFrame","cancelIdleCallback","cancelAnimationFrame","webkitCancelAnimationFrame","webkitResolveLocalFileSystemURL","fetch","alert","confirm","prompt","document","print","open","close","scroll","scrollTo","scrollBy","moveTo","focus","blur","resizeTo","moveBy","find","stop","releaseEvents","postMessage","createImageBitmap","webkitRequestFileSystem","JSCompiler_renameProperty","ShadyCSS","atob","btoa","caches","localStorage","captureEvents","MutationObserver","showOpenFilePicker","showSaveFilePicker","showDirectoryPicker","queueMicrotask","queryLocalFonts","getScreenDetails","getComputedStyle","openDatabase","get launchQueue","get onbeforematch","set onbeforematch","get ondevicemotion","set ondevicemotion","get ondeviceorientation","set ondeviceorientation","get crossOriginIsolated","set crossOriginIsolated","get originAgentCluster","get ondeviceorientationabsolute","set ondeviceorientationabsolute","get onpointerrawupdate","set onpointerrawupdate","get trustedTypes","get caches","get speechSynthesis","get navigation","set navigation","get scheduler","set scheduler","getSelection","get cookieStore","__proto__","heap number"].some((function(e){return e===t.name||e===n.name_or_index})))&&((null==n?void 0:n.type)!==i.V8SnapshotEdgeTypes.property||!["window","self","document","name","location","customElements","history","locationbar","menubar","personalbar","scrollbars","statusbar","toolbar","status","closed","frames","length","top","opener","parent","frameElement","navigator","origin","external","screen","innerWidth","innerHeight","scrollX","pageXOffset","scrollY","pageYOffset","visualViewport","screenX","screenY","outerWidth","outerHeight","devicePixelRatio","clientInformation","screenLeft","screenTop","styleMedia","onsearch","isSecureContext","trustedTypes","performance","onappinstalled","onbeforeinstallprompt","crypto","indexedDB","sessionStorage","localStorage","onbeforexrselect","onabort","onbeforeinput","onblur","oncancel","oncanplay","oncanplaythrough","onchange","onclick","onclose","oncontextlost","oncontextmenu","oncontextrestored","oncuechange","ondblclick","ondrag","ondragend","ondragenter","ondragleave","ondragover","ondragstart","ondrop","ondurationchange","onemptied","onended","onerror","onfocus","onformdata","oninput","oninvalid","onkeydown","onkeypress","onkeyup","onload","onloadeddata","onloadedmetadata","onloadstart","onmousedown","onmouseenter","onmouseleave","onmousemove","onmouseout","onmouseover","onmouseup","onmousewheel","onpause","onplay","onplaying","onprogress","onratechange","onreset","onresize","onscroll","onsecuritypolicyviolation","onseeked","onseeking","onselect","onslotchange","onstalled","onsubmit","onsuspend","ontimeupdate","ontoggle","onvolumechange","onwaiting","onwebkitanimationend","onwebkitanimationiteration","onwebkitanimationstart","onwebkittransitionend","onwheel","onauxclick","ongotpointercapture","onlostpointercapture","onpointerdown","onpointermove","onpointerrawupdate","onpointerup","onpointercancel","onpointerover","onpointerout","onpointerenter","onpointerleave","onselectstart","onselectionchange","onanimationend","onanimationiteration","onanimationstart","ontransitionrun","ontransitionstart","ontransitionend","ontransitioncancel","onafterprint","onbeforeprint","onbeforeunload","onhashchange","onlanguagechange","onmessage","onmessageerror","onoffline","ononline","onpagehide","onpageshow","onpopstate","onrejectionhandled","onstorage","onunhandledrejection","onunload","crossOriginIsolated","scheduler","alert","atob","blur","btoa","cancelAnimationFrame","cancelIdleCallback","captureEvents","clearInterval","clearTimeout","close","confirm","createImageBitmap","fetch","find","focus","getComputedStyle","getSelection","matchMedia","moveBy","moveTo","open","postMessage","print","prompt","queueMicrotask","releaseEvents","reportError","requestAnimationFrame","requestIdleCallback","resizeBy","resizeTo","scroll","scrollBy","scrollTo","setInterval","setTimeout","stop","structuredClone","webkitCancelAnimationFrame","webkitRequestAnimationFrame","chrome","caches","cookieStore","ondevicemotion","ondeviceorientation","ondeviceorientationabsolute","launchQueue","onbeforematch","getScreenDetails","queryLocalFonts","showDirectoryPicker","showOpenFilePicker","showSaveFilePicker","originAgentCluster","navigation","webkitStorageInfo","speechSynthesis","oncontentvisibilityautostatechange","openDatabase","webkitRequestFileSystem","webkitResolveLocalFileSystemURL","loadTimeData","JSCompiler_renameProperty","ShadyCSS","cr"].some((function(e){return t.name===e||t.name==="get ".concat(e)||t.name==="set ".concat(e)||e===n.name_or_index}))))))))},function(e){e[e.added=0]="added",e[e.removed=1]="removed"}(t.diffShowType||(t.diffShowType={})),t.getScriptCodeShowInfo=function(e){var t=e.list,n=e.totalSize;return t.map((function(e){var t,o;return{name:e.node.name,scriptName:null===(t=e.scriptOrDebug.find((function(e){return"name"===e.edge.name_or_index})))||void 0===t?void 0:t.node.name,scriptColumn:e.location[i.V8SnapshotLocationFields.column],scriptLine:e.location[i.V8SnapshotLocationFields.line],source:null===(o=e.scriptOrDebug.find((function(e){return"source"===e.edge.name_or_index})))||void 0===o?void 0:o.node.name,selfSize:e.node.self_size,retainedSize:e.node.retained_size,selfSizePercent:Math.round(100*e.node.self_size/n),retainedSizePercent:Math.round(100*e.node.retained_size/n)}}))}},336:function(e,t,n){},360:function(e,t,n){"use strict";n(336)},372:function(e,t,n){"use strict";n.r(t);var o=n(35),a=n(321);const{mapGetters:i}=Object(o.a)("V8Snapshot");var r={name:"V8SnapshotContainment",data:()=>({nodeFilterSelect:a.nodeFilterType.userObject,nodeFilterName:"",nodeFilterDistanceMin:null,nodeFilterDistanceMax:null,nodeFilterSelfSizeMin:null,nodeFilterSelfSizeMax:null,nodeFilterRetainedSizeMin:null,nodeFilterRetainedSizeMax:null,nodeFilterForm:{nodeFilterSelect:a.nodeFilterType.userObject,nodeFilterName:"",nodeFilterDistanceMin:null,nodeFilterDistanceMax:null,nodeFilterSelfSizeMin:null,nodeFilterSelfSizeMax:null,nodeFilterRetainedSizeMin:null,nodeFilterRetainedSizeMax:null},nodeFilterType:a.nodeFilterType,currentNode:null,nodeFilterOptions:a.nodeFilterOptions,rootId:-1}),computed:{rootList(){return this.getNodeChildren(this.rootId)},totalSize(){return this.activeSnapshot&&this.activeSnapshot.snapshot&&this.activeSnapshot.snapshot.calculateStatistics().total||9999999999},currentNodeParents(){return this.currentNode?this.getNodeParents(this.currentNode.id):[]},...i(["activeSnapshot"])},methods:{load(e,t,n){if(!this.activeSnapshot||!this.activeSnapshot.snapshot)return void n([]);n(this.getNodeChildren(e.id))},onFilter(){this.nodeFilterSelect=this.nodeFilterForm.nodeFilterSelect,this.nodeFilterName=this.nodeFilterForm.nodeFilterName&&new RegExp(this.nodeFilterForm.nodeFilterName),this.nodeFilterDistanceMin=this.nodeFilterForm.nodeFilterDistanceMin,this.nodeFilterDistanceMax=this.nodeFilterForm.nodeFilterDistanceMax,this.nodeFilterSelfSizeMin=this.nodeFilterForm.nodeFilterSelfSizeMin,this.nodeFilterSelfSizeMax=this.nodeFilterForm.nodeFilterSelfSizeMax,this.nodeFilterRetainedSizeMin=this.nodeFilterForm.nodeFilterRetainedSizeMin,this.nodeFilterRetainedSizeMax=this.nodeFilterForm.nodeFilterRetainedSizeMax,this.currentNode=null,this.rootId-=1},filterItem(e){return!(!e||!e.node)&&(!(this.nodeFilterSelect===a.nodeFilterType.userObject&&!Object(a.filterUserObject)(e))&&(!!(this.nodeFilterSelect!==a.nodeFilterType.showObject||e.node.flag&a.V8SnapshotInfo.NODE_FLAGS.canBeQueried)&&(!(this.nodeFilterName&&!this.nodeFilterName.test(e.node.name))&&((!this.nodeFilterDistanceMin&&0!==this.nodeFilterDistanceMin||!(e.node.distance<this.nodeFilterDistanceMin))&&((!this.nodeFilterDistanceMax&&0!==this.nodeFilterDistanceMax||!(e.node.distance>=this.nodeFilterDistanceMax))&&((!this.nodeFilterSelfSizeMin&&0!==this.nodeFilterSelfSizeMin||!(e.node.self_size<this.nodeFilterSelfSizeMin))&&((!this.nodeFilterSelfSizeMax&&0!==this.nodeFilterSelfSizeMax||!(e.node.self_size>=this.nodeFilterSelfSizeMax))&&((!this.nodeFilterRetainedSizeMin&&0!==this.nodeFilterRetainedSizeMin||!(e.node.retained_size<this.nodeFilterRetainedSizeMin))&&(!this.nodeFilterRetainedSizeMax&&0!==this.nodeFilterRetainedSizeMax||!(e.node.retained_size>=this.nodeFilterRetainedSizeMax))))))))))},getNodeChildren(e){return this.activeSnapshot&&this.activeSnapshot.snapshot?this.activeSnapshot.snapshot.getNodeChildren(e).filter(e=>this.filterItem(e)).map(e=>{const{node:t,edge:n}=e,o=this.activeSnapshot.snapshot.getNodeChildren(t.id).filter(e=>this.filterItem(e));return{...Object(a.getNodeShowInfo)({node:t,edge:n,totalSize:this.totalSize}),rowKey:`${n?n.name_or_index:""}_${n?n.to_node:t.id}`,hasChildren:!!o.length}}):[]},loadParents(e,t,n){if(!this.activeSnapshot||!this.activeSnapshot.snapshot)return void n([]);n(this.getNodeParents(e.id))},getNodeParents(e){return this.activeSnapshot&&this.activeSnapshot.snapshot?this.activeSnapshot.snapshot.getNodeParents(e).filter(e=>this.filterItem(e)).map(e=>{const{node:t,edge:n}=e,o=this.activeSnapshot.snapshot.getNodeParents(t.id).filter(e=>this.filterItem(e));return{...Object(a.getNodeShowInfo)({node:t,edge:n,totalSize:this.totalSize}),rowKey:`${n?n.idx:""}_${n?n.from_node:t.id}`,hasParents:!!o.length}}):[]},handleCurrentChange(e){this.currentNode=e}}},s=(n(360),n(20)),l=Object(s.a)(r,(function(){var e=this,t=e._self._c;return t("div",[t("el-card",[t("V8Snapshot-V8SnapshotFiles")],1),e._v(" "),t("br"),e._v(" "),t("el-card",[t("div",{attrs:{slot:"header"},slot:"header"},[t("div",[e._v("节点过滤")])]),e._v(" "),t("el-form",{attrs:{inline:!0,size:"small",model:e.nodeFilterForm}},[t("el-form-item",{attrs:{label:"节点类型"}},[t("el-select",{staticStyle:{width:"130px"},attrs:{placeholder:"请选择"},model:{value:e.nodeFilterForm.nodeFilterSelect,callback:function(t){e.$set(e.nodeFilterForm,"nodeFilterSelect",t)},expression:"nodeFilterForm.nodeFilterSelect"}},e._l(e.nodeFilterOptions,(function(e){return t("el-option",{key:e.value,attrs:{label:e.label,value:e.value}})})),1)],1),e._v(" "),t("el-form-item",[t("el-button",{attrs:{type:"primary"},on:{click:e.onFilter}},[e._v("提交")])],1)],1)],1),e._v(" "),t("br"),e._v(" "),t("el-card",[t("div",{attrs:{slot:"header"},slot:"header"},[e.activeSnapshot?t("div",[e._v(e._s(e.activeSnapshot.name))]):t("div",[e._v("未选择")])]),e._v(" "),t("div",[e.activeSnapshot?e.activeSnapshot.snapshot?t("el-table",{staticStyle:{width:"100%"},attrs:{data:e.rootList,"row-key":"rowKey","max-height":500,size:"small",lazy:"",load:e.load,"tree-props":{children:"children",hasChildren:"hasChildren"},"header-cell-style":{backgroundColor:"#f5f7fa"},"highlight-current-row":""},on:{"current-change":e.handleCurrentChange}},[t("el-table-column",{attrs:{prop:"name",sortable:"",label:"对象"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",{style:n.row.nameShowPrefixStyle},[e._v("\n                "+e._s(n.row.nameShowPrefix)+"\n              ")]),e._v(" "),t("span",[e._v(" :: ")]),e._v(" "),t("span",{style:n.row.nameShowStyle},[e._v("\n                "+e._s(n.row.nameShow)+"\n              ")]),e._v(" "),t("span",{staticClass:"sub-text"},[e._v(" @"+e._s(n.row.id))]),e._v(" "),n.row.reachableFromWindow?t("span",{attrs:{title:"可通过window访问的用户对象"}},[e._v(" 🀆")]):e._e(),e._v(" "),n.row.detachedDOMTreeNode?t("span",{attrs:{title:"脱离Dom树"}},[e._v(" 🀆")]):e._e()]}}])}),e._v(" "),t("el-table-column",{attrs:{prop:"distance",sortable:"",label:"最短根距离",align:"right",width:"150px"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",[e._v(e._s(n.row.distanceShow))])]}}])}),e._v(" "),t("el-table-column",{attrs:{prop:"self_size",sortable:"",label:"自身大小",align:"right",width:"150px"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",[e._v(e._s(n.row.self_size))]),e._v(" "),t("span",{staticClass:"sub-text"},[e._v("  "+e._s(n.row.selfSizePercent)+"%")])]}}])}),e._v(" "),t("el-table-column",{attrs:{prop:"retained_size",sortable:"",label:"总大小",align:"right",width:"150px"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",[e._v(e._s(n.row.retained_size))]),e._v(" "),t("span",{staticClass:"sub-text"},[e._v("  "+e._s(n.row.retainedSizePercent)+"%")])]}}])})],1):t("div",{directives:[{name:"loading",rawName:"v-loading",value:!0,expression:"true"}]},[e._v("解析中...")]):t("div",[e._v("未选择")]),e._v(" "),t("br"),e._v(" "),t("el-tabs",{attrs:{type:"border-card"}},[t("el-tab-pane",{attrs:{label:"父节点"}},[e.currentNode?t("el-table",{staticStyle:{width:"100%"},attrs:{data:e.currentNodeParents,"row-key":"rowKey","max-height":500,size:"small",lazy:"",load:e.loadParents,"tree-props":{children:"parents",hasChildren:"hasParents"},"header-cell-style":{backgroundColor:"#f5f7fa"}}},[t("el-table-column",{attrs:{prop:"name",sortable:"",label:"对象"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",{style:n.row.nameShowPrefixStyle},[e._v("\n                    "+e._s(n.row.nameShowPrefix)+"\n                  ")]),e._v(" "),t("span",[e._v(" :: ")]),e._v(" "),t("span",{style:n.row.nameShowStyle},[e._v("\n                    "+e._s(n.row.nameShow)+"\n                  ")]),e._v(" "),t("span",{staticClass:"sub-text"},[e._v(" @"+e._s(n.row.id))]),e._v(" "),n.row.reachableFromWindow?t("span",{attrs:{title:"可通过window访问的用户对象"}},[e._v(" 🀆")]):e._e(),e._v(" "),n.row.detachedDOMTreeNode?t("span",{attrs:{title:"脱离Dom树"}},[e._v(" 🀆")]):e._e()]}}],null,!1,3874020075)}),e._v(" "),t("el-table-column",{attrs:{prop:"distance",sortable:"",label:"最短根距离",align:"right",width:"150px"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",[e._v(e._s(n.row.distanceShow))])]}}],null,!1,3793119334)}),e._v(" "),t("el-table-column",{attrs:{prop:"self_size",sortable:"",label:"自身大小",align:"right",width:"150px"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",[e._v(e._s(n.row.self_size))]),e._v(" "),t("span",{staticClass:"sub-text"},[e._v("  "+e._s(n.row.selfSizePercent)+"%")])]}}],null,!1,4104622787)}),e._v(" "),t("el-table-column",{attrs:{prop:"retained_size",sortable:"",label:"总大小",align:"right",width:"150px"},scopedSlots:e._u([{key:"default",fn:function(n){return[t("span",[e._v(e._s(n.row.retained_size))]),e._v(" "),t("span",{staticClass:"sub-text"},[e._v("  "+e._s(n.row.retainedSizePercent)+"%")])]}}],null,!1,3982463107)})],1):e._e()],1)],1)],1)])],1)}),[],!1,null,"9430360a",null);t.default=l.exports}}]);