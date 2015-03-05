/**********************************************************************************
 * 파일명 : GGetFeature.js
 * 설 명 : Ginno Get Feature Class (속성조회 컨트롤)
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.18		최원석				0.1					최초 생성
	
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GGetFeature = OpenLayers.Class(OpenLayers.Control, {
	/**
	 * 이벤트 타입 (요청 완료 시 실행할 이벤트)
	 */
	 EVENT_TYPES: ['callback', 'click'],
	
	/**
	 * Geogate 지도 서비스 주소
	 */
	serviceUrl : null,
	
	/**
	 * XML prefix 명
	 */
	 prefix : null,
	
	/**
	 * 최대 도형 수
	 */
	maxFeatures : 9999,
	
	/**
	 * 테이블 목록
	 */
	tables : [],
	
	/**
	 * 타이틀 필드 리스트
	 */
	titles : {},
	
	/**
	 * 도형 영속성
	 */
	persist : true,
	
	/**
	 * 거리
	 */
	distance : 10,
	
	/**
	 * 반환 함수
	 */
	callbacks : null,
	
	/**
	 * 현재 레이어목록
	 */
	current : false,
	
	/**
	 * 테이블, 필드명 Alias 반환여부
	 */
	alias : false,
	
	/**
	 * 도메인 정보 사용 여부 
	 */
	useDomain : false,
	
	/**
	 * 레이어 관리 객체
	 */
	layerTool : null,
	
	/**
	 * GML 객체
	 */
	gml : new OpenLayers.Format.GML(),
	
	/**
	 * 검색 결과
	 */
	result : null,
	
	/*
	 * 정렬할 필드명 리스트
	 */
	sortFields : [],
	
	/*
	 * 정렬 방향 리스트 (ASC | DESC)
	 */
	sortOrders : [],
	
	/**
	 * default map style 정의
	 */
	handlerOptions : {
		//라인 데이터 유지
		multiLine : true,
		//컨트롤 비 활성화 시 라인 유지 여부
		persistControl : true,
		//레이어 옵션
		layerOptions: {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style(null, {
					rules: [new OpenLayers.Rule({
						symbolizer : {
							"Point": {
								pointRadius: 4,
								graphicName: "circle",
								fillColor: "#ffffff",
								fillOpacity: 1,
								strokeWidth: 1,
								strokeOpacity: 1,
								strokeColor: "#333333"
							},
							"Line" : {
								strokeWidth: 1,
								strokeOpacity: 1,
								strokeColor: "#333333"
							},
							"Polygon": {
								strokeWidth: 1,
								strokeOpacity: 1,
								strokeColor: "#333333",
								fillColor: "#ffffff",
								fillOpacity: 0.3
							}
						}
					})]
				})
			})
		}
	},
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GGetFeatureAttrInfo 생성자 함수
	 * 인 자 : handler (handler 객체), options(옵션 들)
	 * 사용법 : initialize(handler, options)
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		OpenLayers.Map 의 initialize 복사
	 * 								생성 시 옵션 체크 추가
	 * 2011.04.20		최원석		default Control 수정
	 * 
	 **********************************************************************************/
	initialize: function(handler, options) {
		if(options.handlerOptions) {
			OpenLayers.Util.extend(this.handlerOptions, options.handlerOptions);
		}

		OpenLayers.Control.prototype.initialize.apply(this, [options]);
		
		this.EVENT_TYPES =
            GGetFeature.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );
        
        this.callbacks = OpenLayers.Util.extend(
            {
                done: this.getFeature
            },
            this.callbacks
        );
		
        this.handlerOptions = OpenLayers.Util.extend(
            {persist: this.persist}, this.handlerOptions
        );

        this.handler = new handler(this, this.callbacks, this.handlerOptions);
	},
	
	/**********************************************************************************
	 * 함수명 : setTables
	 * 설 명 : 테이블 명 목록 설정
	 * 인 자 : arr (layer 목록 배열 또는 레이어 이름)
	 * 사용법 : setTables(arr)
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		최초 생성
	 * 
	 **********************************************************************************/
	setTables : function(arr) {
		if(arr instanceof Object) {
			this.tables = arr;
		}	
		else {
			this.tables = [];
			this.tables.push(arr);
		}
	},
	
	setDistance : function(distance) {
		this.distance = distance;
	},

	setCallbacks : function(eventListeners) {
        // 기존 callback 해제
		this.events.un(this.eventListeners);
		// 새로운 callback 등록
		this.events.on(eventListeners);
	},  
	
	setGetRequestFilter : function(state){
		this.getRequestFilter = state; // true or false
	},

	/**********************************************************************************
	 * 함수명 : getFeature
	 * 설 명 : 속성 정보 요청
	 * 인 자 : geometry (Point Geometry)
	 * 사용법 : getFeature(geometry)
	 * 작성일 : 2011.05.19
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.19		최원석		최초 생성
	 * 
	 **********************************************************************************/
    getFeature: function(geometry) {
    	var isChangeProjection = false;
    	
    	for(var layers in this.map.layers) {
    		var layer = this.map.layers[layers];
    		if(layer.projection) {
    			if(!layer.projection.equals(this.map.getProjectionObject()) && !isChangeProjection) {
    				geometry.transform(this.map.projection, layer.projection);
    				isChangeProjection = true;
    			}
    		}
    	}
    	
		this.events.triggerEvent(this.EVENT_TYPES[1], geometry);
		 
		if(this.handler.radiusDist && (this.handler.radiusDist == 0 || this.handler.radiusDist > 500)) {
			alert("검색반경은 0m 와 500m 이내로 설정해주세요");
			return;
		}
		
		
		if(this.layerTool) {
			this.tables = [];
			var layers = this.layerTool.getLayers({con : 'attr',conVal : 1,order : 'asc'});
			
			var sld = this.layerTool.getSld();
			var namedLayers = sld.namedLayers;
			
			
			for(var i in namedLayers) {
				var userStyles = namedLayers[i].userStyle;
				for(var j in userStyles) {
					var rules = userStyles[j].rules;
					
					for(var k in rules) {
						if(rules[k].symbolizer.text) continue;
						
						var count = 0;
						
						var scale = parseInt(this.map.getScale());
						var maxScale = rules[k].maxScale;
						if(maxScale == 0) {
							maxScale = parseInt(OpenLayers.Util.getScaleFromResolution(this.map.getResolutionForZoom(0), this.map.units));
						}
						
						if(maxScale >= scale && scale >= rules[k].minScale) {
							for(var l in layers) {
								if(namedLayers[i].name == layers[l].theme) {
									if(layers[l].show == 1){
										var exist = false;
										for(var m in this.tables) {
											if(this.tables[m] == layers[l].table) {
												exist = true;
												break;
											}
										}
										if(!exist) this.tables.push(layers[l].table);
									}
								}
							}
							break;
						}
					}
				}
			}
			if(this.tables.length < 1) {
				alert("조건에 맞는 레이어가 없습니다.");
				return;
			}
		}
	 
		var control = this;
		
		if(this.handler.CLASS_NAME == "GPoint") {
			GRequest.WFS.getFeatureByDWithin(
				this.serviceUrl, 
				{
					prefix : this.prefix,
					tables : this.tables,
					distance : this.distance,
					values : [geometry],
					sortFields : this.sortFields,
					sortOrders : this.sortOrders,
					useDomain : this.useDomain
				}, 
				function(res) {
					control.result = res;
					control.events.triggerEvent(control.EVENT_TYPES[0], res);
				},
				{
					alias : this.alias,
					titles : this.titles,
					getRequestFilter : this.getRequestFilter
				}
			);
		}
		else {
			GRequest.WFS.getFeatureByGeometry(
				this.serviceUrl, 
				{
					prefix : this.prefix,
					tables : this.tables,
					values : [geometry],
					sortFields : this.sortFields,
					sortOrders : this.sortOrders,
					useDomain : this.useDomain
				}, 
				function(res) {
					control.result = res;
					control.events.triggerEvent(control.EVENT_TYPES[0], res);
				},
				{
					alias : this.alias,
					titles : this.titles,
					getRequestFilter : this.getRequestFilter
				}
			);
		}
    },
    
    getResult : function() {
    	return this.result;
    },
	
	CLASS_NAME: "GGetFeature" 
});