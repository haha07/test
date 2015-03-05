/**********************************************************************************
 * 파일명 : GMap.js
 * 설 명 : Ginno Map Class
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.18		최원석				0.1					최초 생성
 * 2011.04.21		최원석				0.2					getLayerByName 생성
 * 																		activeControls 생성
 * 																		movePrev 생성
 * 																		moveNext 생성
 * 																		removeLayerByName 생성
 * 																		cleanMap 생성	
 * 2011.05.11		최원석				0.3					getPopup 생성		
 * 2011.08.24		최원석				0.4					공통 함수 GRequest.WFS 에 정의
 * 2014.06.17		이경찬				0.5					OpenLayers 2.13.1버전으로 변경
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GMap = OpenLayers.Class(OpenLayers.Map, {
	/**
     * APIProperty: events
     * {<OpenLayers.Events>}
     *
     * Register a listener for a particular event with the following syntax:
     * (code)
     * map.events.register(type, obj, listener);
     * (end)
     *
     * Listeners will be called with a reference to an event object.  The
     *     properties of this event depends on exactly what happened.
     *
     * All event objects have at least the following properties:
     * object - {Object} A reference to map.events.object.
     * element - {DOMElement} A reference to map.events.element.
     *
     * Browser events have the following additional properties:
     * xy - {<OpenLayers.Pixel>} The pixel location of the event (relative
     *     to the the map viewport).
     *
     * Supported map event types:
     * preaddlayer - triggered before a layer has been added.  The event
     *     object will include a *layer* property that references the layer  
     *     to be added. When a listener returns "false" the adding will be 
     *     aborted.
     * addlayer - triggered after a layer has been added.  The event object
     *     will include a *layer* property that references the added layer.
     * preremovelayer - triggered before a layer has been removed. The event
     *     object will include a *layer* property that references the layer  
     *     to be removed. When a listener returns "false" the removal will be 
     *     aborted.
     * removelayer - triggered after a layer has been removed.  The event
     *     object will include a *layer* property that references the removed
     *     layer.
     * changelayer - triggered after a layer name change, order change,
     *     opacity change, params change, visibility change (actual visibility,
     *     not the layer's visibility property) or attribution change (due to
     *     extent change). Listeners will receive an event object with *layer*
     *     and *property* properties. The *layer* property will be a reference
     *     to the changed layer. The *property* property will be a key to the
     *     changed property (name, order, opacity, params, visibility or
     *     attribution).
     * movestart - triggered after the start of a drag, pan, or zoom. The event
     *     object may include a *zoomChanged* property that tells whether the
     *     zoom has changed.
     * move - triggered after each drag, pan, or zoom
     * moveend - triggered after a drag, pan, or zoom completes
     * zoomend - triggered after a zoom completes
     * mouseover - triggered after mouseover the map
     * mouseout - triggered after mouseout the map
     * mousemove - triggered after mousemove the map
     * changebaselayer - triggered after the base layer changes
     * updatesize - triggered after the <updateSize> method was executed
     */
	
	/**
	 * 지도 기본 단위 값
	 */
	units: 'm',
	
	/**
	 * 축척 레벨
	 */
	numZoomLevels : 11,
	
	/**
	 * 투영법
	 */
	projection: 'EPSG:4326',
	
	/**
	 * 화면 투영법
	 */
	displayProjection:'EPSG:4326',
	
	/**
	 * 실제 축척 사용 여부
	 */
	fractionalZoom : true,
	
	/**
	 * 기준 레이어 사용 안 함. 가장 아래에 있는 레이어가 기준 레이어가 됨
	 */
	allOverlays: false,
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GMap 객체 생성
	 * 인 자 : div (지도 DIV 엘리먼트 아이디)
	 * 사용법 : initialize('map', options)
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		OpenLayers.Map 의 initialize 복사
	 * 								생성 시 옵션 체크 추가
	 * 2011.04.20		최원석		default Control 수정
	 * 
	 **********************************************************************************/
	initialize: function (div, options) {
		//필수 파라미터 체크
		if(GError.debug) this.chkParams(div, options);
		
		// If only one argument is provided, check if it is an object.
        if(arguments.length === 1 && typeof div === "object") {
            options = div;
            div = options && options.div;
        }

        // Simple-type defaults are set in class definition. 
        //  Now set complex-type defaults 
        this.tileSize = new OpenLayers.Size(OpenLayers.Map.TILE_WIDTH,
                                            OpenLayers.Map.TILE_HEIGHT);
        
        this.paddingForPopups = new OpenLayers.Bounds(15, 15, 15, 15);

        this.theme = OpenLayers._getScriptLocation() + 
                             'theme/default/style.css'; 

        // now override default options 
        OpenLayers.Util.extend(this, options);
        
        var projCode = this.projection instanceof OpenLayers.Projection ?
            this.projection.projCode : this.projection;
        OpenLayers.Util.applyDefaults(this, OpenLayers.Projection.defaults[projCode]);
        
        // allow extents and center to be arrays
        if (this.maxExtent && !(this.maxExtent instanceof OpenLayers.Bounds)) {
            this.maxExtent = new OpenLayers.Bounds(this.maxExtent);
        }
        if (this.minExtent && !(this.minExtent instanceof OpenLayers.Bounds)) {
            this.minExtent = new OpenLayers.Bounds(this.minExtent);
        }
        if (this.restrictedExtent && !(this.restrictedExtent instanceof OpenLayers.Bounds)) {
            this.restrictedExtent = new OpenLayers.Bounds(this.restrictedExtent);
        }
        if (this.center && !(this.center instanceof OpenLayers.LonLat)) {
            this.center = new OpenLayers.LonLat(this.center);
        }

        // initialize layers array
        this.layers = [];

        this.id = OpenLayers.Util.createUniqueID("OpenLayers.Map_");

        this.div = OpenLayers.Util.getElement(div);
        if(!this.div) {
            this.div = document.createElement("div");
            this.div.style.height = "1px";
            this.div.style.width = "1px";
        }
        
        OpenLayers.Element.addClass(this.div, 'olMap');

        // the viewPortDiv is the outermost div we modify
        var id = this.id + "_OpenLayers_ViewPort";
        this.viewPortDiv = OpenLayers.Util.createDiv(id, null, null, null,
                                                     "relative", null,
                                                     "hidden");
        this.viewPortDiv.style.width = "100%";
        this.viewPortDiv.style.height = "100%";
        this.viewPortDiv.className = "olMapViewport";
        this.div.appendChild(this.viewPortDiv);
        
        this.events = new OpenLayers.Events(
                this, this.viewPortDiv, null, this.fallThrough, 
                {includeXY: true}
            );
            
            if (OpenLayers.TileManager && this.tileManager !== null) {
                if (!(this.tileManager instanceof OpenLayers.TileManager)) {
                    this.tileManager = new OpenLayers.TileManager(this.tileManager);
                }
                this.tileManager.addMap(this);
            }

        // the layerContainerDiv is the one that holds all the layers
        id = this.id + "_OpenLayers_Container";
        this.layerContainerDiv = OpenLayers.Util.createDiv(id);
        this.layerContainerDiv.style.zIndex=this.Z_INDEX_BASE['Popup']-1;
        this.layerContainerOriginPx = {x: 0, y: 0};
        this.applyTransform();
        
        this.viewPortDiv.appendChild(this.layerContainerDiv);

        this.updateSize();
        if(this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }
 
        if (this.autoUpdateSize === true) {
            // updateSize on catching the window's resize
            // Note that this is ok, as updateSize() does nothing if the 
            // map's size has not actually changed.
            this.updateSizeDestroy = OpenLayers.Function.bind(this.updateSize, 
                this);
            OpenLayers.Event.observe(window, 'resize',
                            this.updateSizeDestroy);
        }
        
        // only append link stylesheet if the theme property is set
        if(this.theme) {
            // check existing links for equivalent url
            var addNode = true;
            var nodes = document.getElementsByTagName('link');
            for(var i=0, len=nodes.length; i<len; ++i) {
                if(OpenLayers.Util.isEquivalentUrl(nodes.item(i).href,
                                                   this.theme)) {
                    addNode = false;
                    break;
                }
            }
            // only add a new node if one with an equivalent url hasn't already
            // been added
            if(addNode) {
                var cssNode = document.createElement('link');
                cssNode.setAttribute('rel', 'stylesheet');
                cssNode.setAttribute('type', 'text/css');
                cssNode.setAttribute('href', this.theme);
                document.getElementsByTagName('head')[0].appendChild(cssNode);
            }
        }
        
        if (this.controls == null) {
        	 this.controls = [];
            if (OpenLayers.Control != null) { // running full or lite?
            	/*
                // Navigation or TouchNavigation depending on what is in build
                if (OpenLayers.Control.Navigation) {
                    this.controls.push(new OpenLayers.Control.Navigation());
                } else if (OpenLayers.Control.TouchNavigation) {
                    this.controls.push(new OpenLayers.Control.TouchNavigation());
                }
                if (OpenLayers.Control.Zoom) {
                    this.controls.push(new OpenLayers.Control.Zoom());
                } else if (OpenLayers.Control.PanZoom) {
                    this.controls.push(new OpenLayers.Control.PanZoom());
                }

                if (OpenLayers.Control.ArgParser) {
                    this.controls.push(new OpenLayers.Control.ArgParser());
                }
                if (OpenLayers.Control.Attribution) {
                    this.controls.push(new OpenLayers.Control.Attribution());
                }
                if (OpenLayers.Control.ZoomBox) {
                    this.controls.push(new OpenLayers.Control.ZoomBox());
                }
                if (OpenLayers.Control.NavigationHistory) {
                    this.controls.push(new OpenLayers.Control.NavigationHistory());
                }
                */
            	if(GDrag){
            		this.controls.push(new GDrag({id : 'drag'}));
            	}
            	if(GZoomIn){
            		this.controls.push(new GZoomIn({id : 'zoomIn'}));
            	}
            	if(GZoomOut){
            		this.controls.push(new GZoomOut({id : 'zoomOut'}));
            	}
            	if(GNavigationHistory){
            		this.controls.push(new GNavigationHistory({id : 'naivgationHistory'}));
            	}
            	if(GMeasure){
            		if(GPathMeasure){
            			this.controls.push(new GMeasure(GPathMeasure, {
							id : "measurePath"
						}));
            		}
            		if(GPathMeasure){
            			this.controls.push(new GMeasure(GPolygonMeasure, {
							id : "measurePolygon"
						}));
            		}
            	}
            	if(GPanZoomBar){
            		var obj = {
            				id : "panZoomBar"
            		};
            		if(apiServerHost){
            			obj.apiServerHost = apiServerHost; 
            		}
            		// 축척바
            		this.controls.push(new GPanZoomBar(obj));
            	}
            } 
        }
		
        for(var i=0, len=this.controls.length; i<len; i++) {
            this.addControlToMap(this.controls[i]);
        }
		
        this.popups = [];

        this.unloadDestroy = OpenLayers.Function.bind(this.destroy, this);
        

        // always call map.destroy()
        OpenLayers.Event.observe(window, 'unload', this.unloadDestroy);
        
        // add any initial layers
        if (options && options.layers) {
            /** 
             * If you have set options.center, the map center property will be
             * set at this point.  However, since setCenter has not been called,
             * addLayers gets confused.  So we delete the map center in this 
             * case.  Because the check below uses options.center, it will
             * be properly set below.
             */
            delete this.center;
            delete this.zoom;
            this.addLayers(options.layers);
            // set center (and optionally zoom)
            if (options.center && !this.getCenter()) {
                // zoom can be undefined here
                this.setCenter(options.center, options.zoom);
            }
        }
        
        if (this.panMethod) {
            this.panTween = new OpenLayers.Tween(this.panMethod);
        }
        if (this.zoomMethod && this.applyTransform.transform) {
            this.zoomTween = new OpenLayers.Tween(this.zoomMethod);
        }
    },
	
	/**********************************************************************************
	 * 함수명 : chkParams
	 * 설 명 : 필수 프로퍼티를 검사한다.
	 * 인 자 : div (Div Element Id) ,options (맵 options 들)
	 * 사용법 : chkParams(div, options)
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	chkParams : function(div, options){
		if(!OpenLayers.Util.getElement(div)) {
			GError.create_obj(this, "id (지도를 표시할 DIV ID)");
		}
		
		//options 파라미터 존재 여부 확인
		if(options && typeof options === "object") {
			//maxExtent는 필수 옵션
			if(!options.maxExtent) {
				GError.create_obj(this, "options maxExtent (최대 영역)");
			}
			if(!options.maxResolution) {
				GError.create_obj(this, "options maxResolution (최대 해상도)");
			}
		}
		else {
			GError.create_obj(this, "options");
		}
	},
	
	/**********************************************************************************
	 * 함수명 : getLayerByName
	 * 설 명 : 레이어 이름으로 레이어를 반환
	 * 인 자 : name (반환할 레이어 명)
	 * 사용법 : getLayerByName(name)
	 * 
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	getLayerByName: function(name) {
		var foundLayer = null;
        for (var i=0, len=this.layers.length; i<len; i++) {
            var layer = this.layers[i];
            if (layer.name == name) {
                foundLayer = layer;
                break;
            }
        }
        return foundLayer;
	},
	
	/**********************************************************************************
	 * 함수명 : removeLayerByName
	 * 설 명 : 레이어 이름으로 레이어 삭제
	 * 인 자 : name (반환할 레이어 명)
	 * 사용법 : removeLayerByName(name)
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	removeLayerByName: function(name) {
        for (var i=0, len=this.layers.length; i<len; i++) {
            var layer = this.layers[i];
            if (layer.name == name) {
				this.removeLayer(layer);
                break;
            }
        }
	},
	
	/**********************************************************************************
	 * 함수명 : activeControls
	 * 설 명 : 컨트롤들을 활성화 한다.
	 * 인 자 : controls (컨트롤 or 컨트롤들)
	 * 사용법 : activeControls(controls)
	 *	controls 
	 * 		- drag		:	이동 툴
	 * 		- ZoomIn	:	확대 툴
	 * 		- ZoomOut	:	축소 툴
	 * 
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	activeControls: function(controls) {
		for(var i in this.controls) {
			if(this.controls[i].type != OpenLayers.Control.TYPE_TOGGLE) {
				this.controls[i].deactivate();	
			}
		}
		
		if(typeof controls === "object") {
			if(controls.length && controls.length > 0) {
				for(var i = 0; i < controls.length; i++) {
					this.getControl(controls[i]).activate();
				}
			}
		}
		else {
			this.getControl(controls).activate();
		}
	},
	
	/**********************************************************************************
	 * 함수명 : removeAllPopups
	 * 설 명 : 지도 위의 모든 팝업 객체 삭제
	 * 인 자 : div (맵 객체 id)
	 * 사용법 : removeAllPopups()
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 
	 **********************************************************************************/
	removeAllPopups : function() {
		var len = this.popups.length;
		for(var i=len-1; i >= 0; i--) {
			this.removePopup(this.popups[i]);
		}
	},
	
	/**********************************************************************************
	 * 함수명 : getResolutions
	 * 설 명 : 지도 객체의 해상도의 배열을 반환한다.
	 * 사용법 : getResolutions()
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		최초 생성
	 * 
	 **********************************************************************************/
	getResolutions : function() {
		return this.resolutions;
	},

	/**********************************************************************************
	 * 함수명 : movePrev
	 * 설 명 : 이전 영역으로 이동한다.
	 * 사용법 : movePrev()
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	movePrev: function() {
		this.getControl("naivgationHistory").previousTrigger();
	},
	
	/**********************************************************************************
	 * 함수명 : moveNext
	 * 설 명 : 다음 영역으로 이동한다. (이전으로 되 돌린 영역이 있을 때만 가능)
	 * 사용법 : moveNext()
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	moveNext: function() {
		this.getControl("naivgationHistory").nextTrigger();
	},
	
	isPrevStack : function() {
		if(this.getControl("naivgationHistory").previousStack.length > 1) {
			return true;
		}
		else {
			return false;
		}
	},
	
	isNextStack : function() {
		if(this.getControl("naivgationHistory").nextStack.length > 0) {
			return true;
		}
		else {
			return false;
		}
	},
	
	/**********************************************************************************
	 * 함수명 : cleanMap
	 * 설 명 : 지도 위의 모든 도형(사용자 그래픽)과 팝업을 삭제.
	 * 사용법 : cleanMap()
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	cleanMap : function() {
		var currControls = [];
		for(var i in this.controls) {
			if(this.controls[i].active) {
				currControls.push(this.controls[i]);
			}
			this.controls[i].deactivate();
		}
		
				
		for(var i=0; i < currControls.length; i++) {
			currControls[i].activate();
		}
		
		for(var i in this.layers) {
			if(this.layers[i].CLASS_NAME == "GVector" || this.layers[i].CLASS_NAME == "OpenLayers.Layer.Vector") {
				this.layers[i].removeFeatures(this.layers[i].features);
			}
		}
		
		this.removeAllPopups();
	},
	
	/**********************************************************************************
	 * 함수명 : getPopup
	 * 설 명 : 팝업 객체 반환
	 * 인 자 : id (반환할 팝업 ID)
	 * 사용법 : getPopup(id)
	 * 작성일 : 2011.05.11
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.11		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	getPopup : function(id) {
		for(var i in this.popups) {
			if(this.popups[i].id == id) {
				return this.popups[i];
			};
		}
		return false;
	},
	
	/**********************************************************************************
	 * 함수명 : setCenterScale
	 * 설 명 : 지정한 좌표와 축척으로 이동
	 * 인 자 : lonlat (이동할 좌표), scale (이동할 축척)
	 * 사용법 : setCenterScale(lonlat, scale)
	 * 작성일 : 2011.05.11
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.11		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	setCenterScale : function(lonlat, scale) {
		if(scale) {
			this.center = lonlat;
			this.zoomToScale(scale);
		}
		else {
			this.setCetner(lonlat);
		}
	},
	
	zoomToFeature : function(feature, zoom) {
		if(zoom) {
			this.setCenter(new GLonLat(feature.geometry.getCentroid().x, feature.geometry.getCentroid().y), zoom);
		}
		else {
			if(feature.geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
				this.setCenter(new GLonLat(feature.geometry.getCentroid().x, feature.geometry.getCentroid().y), this.getNumZoomLevels()-1);
			}
			else {
				this.zoomToExtent(feature.geometry.getBounds());	
			}
		}
	},
	
	setDrawSymbolImg : function(imgURL){
		gMap.getControl("drawSymbol").handler.attributes.externalGraphic = imgURL;
	},
	
	getDrawToolLayer: function(){
		return gMap.getLayerByName("GDrawToolLayer");
	},
		
	CLASS_NAME: "GMap"
});