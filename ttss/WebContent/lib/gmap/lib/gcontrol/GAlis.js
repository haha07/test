/**********************************************************************************
 * 파일명 : GAlis.js
 * 설 명 : Ginno Alis Class (차단제수변)
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.07.06		최원석				0.1					최초 생성
 * 
**********************************************************************************/

GAlis = OpenLayers.Class(OpenLayers.Control, {
	/**
	 * 이벤트 타입
	 */
	EVENT_TYPES: ['callback'],
	
	/**
	 * 서비스 주소
	 */
	serviceUrl : null,
	
	/**
	 * 도형 영속성
	 */
	persist : true,

	/**
	 * 한글명 사용 여부
	 */
	alias : false,

	/**
	 * 요청 서비스 명
	 */
	service : 'ALIS',
	
	/**
	 * 요청 버전
	 */
	version : '1.1.0',
	
	/**
	 * 요청 Request 
	 */
	request : 'GetLeakIsolation',
	
	/**
	 * 분석 대상 관로 및 밸브 레이어 목록
	 */
	layers : [],
	
	/**
	 * 레이어의 타입 목록 (관형:PIPES, 점형:VALVES)
	 */
	types : [],
	
	/**
	 * 누수 관로를 검색하기 위한 유효 오차거리(m)
	 */
	pipeDistance : 0.5,
	
	/*
	 * 선택한 누구 관로와 연결된 관로를 검색하기 위한 유효 오차거리
	 */
	pipeJoinDistance : 0.5,
	
	/**
	 * 차단 밸브를 검색하기 위한 유효 오차거리(m) 
	 */
	valveDistance : 0.5,
	
	/**
	 * 결과 포맷
	 */
	format : 'text/xml',
	
	/**
	 * 예외 표출 포맷
	 */
	exceptions : 'Xml',
	
	/**
	 * 분석 결과의 유형
	 */
	requesttype : 'TOTAL',
	
	/**
	 * 좌표계
	 */
	crs : 'EPSG:4326',
	
	/**
	 * 관로 및 밸브 레이어 각각의 조건절
	 */
	where : '',
	
	
	
	/**
	 * 반환 함수
	 */
	callbacks : null,
	
	/**
	 * 기본 맵 스타일 정의
	 */
	handlerOptions : {
		persistLayer : true,
		layerOptions: {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style({
					pointRadius: 4,
					graphicName: "circle",
					fillColor: "#ffffff",
					fillOpacity: 1,
					strokeWidth: 1,
					strokeOpacity: 1,
					strokeColor: "#333333"
				})
			})
		}
	},
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GAlis 생성자 함수
	 * 인 자 : options(옵션 들)
	 * 사용법 : initialize(options)
	 * 작성일 : 2011.07.06
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.07.06		최원석		최초 생성
	 *
	 **********************************************************************************/
	initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
		
		this.EVENT_TYPES =
            GAlis.prototype.EVENT_TYPES.concat(
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
		
        this.handler = new GPoint(this, this.callbacks, this.handlerOptions);
	},	
	
	/**********************************************************************************
	 * 함수명 : getFeature
	 * 설 명 : 차단제수변 요청
	 * 인 자 : geometry (Point Geometry)
	 * 사용법 : getFeature(geometry)
	 * 작성일 : 2011.05.20
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.20		최원석		최초 생성
	 * 2011.07.06		최원석		params 속성 외부에서 설정 가능하도록 수정
	 * 
	 **********************************************************************************/
    getFeature: function(geometry) {
		var control = this;

		var point = geometry.getCentroid().x + "," + geometry.getCentroid().y;
		var params = GUtil.fn_convert_objToStr({
			SERVICE : this.service,
			VERSION : this.version,
			REQUEST : this.request,
			LAYERS : this.layers.join(),
			TYPES : this.types.join(),
			LEAKPOINT : point,
			PIPEDISTANCE: this.pipeDistance,
			PIPEJOINDISTANCE : this.pipeJoinDistance,
			VALVEDISTANCE: this.valveDistance,
			FORMAT: this.format,
			EXCEPTIONS: this.exceptions,
			REQUESTTYPE: this.requesttype,
			CRS : this.crs,
			WHERES: this.where
		});
		
		GMapUtil.sendProxyPost(this.serviceUrl, params, function(res) { control.parseResponse(res); });
   	},
	
   	/**********************************************************************************
	 * 함수명 : parseResponse
	 * 설 명 : 차단제수변 요청
	 * 인 자 : parseResponse (Point Geometry)
	 * 사용법 : getFeature(geometry)
	 * 작성일 : 2011.05.20
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.20		최원석		최초 생성
	 * 2011.07.06		최원석		params 속성 외부에서 설정 가능하도록 수정
	 * 
	 **********************************************************************************/
	parseResponse : function(res) {
		var resObj = {
			pipes : [],
			valves : []
		}; 
		var success = true;		
		
		var leakIsolationResult = res.getElementsByTagName("LeakIsolationResult");
		
		if(leakIsolationResult && leakIsolationResult.length > 0) {
			this.parseTable(leakIsolationResult[0], resObj, "Pipes");
			this.parseTable(leakIsolationResult[0], resObj, "Valves");
			
			if(resObj.pipes.length <= 0 && resObj.valves.length <= 0) {
				success =false;
			}
		}
		else {
			success = false;
		}
		
		if(!this.alias) {
			this.getRequestAlias(resObj, success);
		}
		else {
			//트리거 이벤트 실행
			this.events.triggerEvent(this.EVENT_TYPES[0], {
				data : resObj,					//속성 json 객체
				success : function() {		//성공 여부
					return success;					
				}
			});
		}
	},
	
	parseTable: function(element, resObj, tagName) {
		var property = tagName.toLowerCase();
		
		var elements = element.getElementsByTagName(tagName);
		
		if(elements && elements.length > 0 && $(elements[0]).text() != "") {
			var elementArr = $(elements[0]).text().split(",");
			
			for(var i=0,len=elementArr.length; i < len; i++) {
				var tblArr = elementArr[i].split(".");
				var tblStr = tblArr[0];
				
				var index = false;
				for(var j in resObj[property]) {
					if(resObj[property][j].table == tblStr) {
						index = j;
					}
				}
				if(!index) {
					var tblObj = {
						table : tblStr,
						alias : null,
						ids : []
					}
					
					resObj[property].push(tblObj);
				}
				else {
					tblObj = resObj[property][index];
				}
				
				tblObj.ids.push(tblArr[1]);
			}
		}
		else {
			return false;
		}
	},
	
	getRequestAlias : function(obj, success) {
		//실패 시 트리거 이벤트
		if(!success) {
			//트리거 이벤트 실행
			this.events.triggerEvent(this.EVENT_TYPES[0], {
				data : null,				//속성 json 객체
				success : function() {		//성공 여부
					return success;					
				}
			});
			return;
		}
		
		var control = this;
		
		var paramsStr = "";
		for(var i=0, len=obj.pipes.length; i < len; i++) {
			paramsStr += obj.pipes[i].table + ":";
		}
		for(var i=0, len=obj.valves.length; i < len; i++) {
			paramsStr += obj.valves[i].table + ":";
		}
		
		$.post(
			"/gmap/attr/getAlias.do",
			{
				data : paramsStr
			}, 
			function (res) {
				var index=0;
				for(var i=0, len=obj.pipes.length; i < len; i++) {
					obj.pipes[i].alias = res.data[index][obj.pipes[i].table];
					index++;
				}
				for(var i=0, len=obj.valves.length; i < len; i++) {
					obj.valves[i].alias = res.data[index][obj.valves[i].table];
					index++;
				}
				
				//트리거 이벤트 실행
				control.events.triggerEvent(control.EVENT_TYPES[0], {
					data : obj,					//속성 json 객체
					success : function() {		//성공 여부
						return success;					
					}
				});
			},
			"json"
		);
	},
	
	CLASS_NAME: "GAlis" 
});