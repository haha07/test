/**********************************************************************************
 * 파일명 : GMeasure.js
 * 설 명 : 거리, 면적 측정
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.22		최원석				0.1					최초 생성
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GMeasure = OpenLayers.Class(OpenLayers.Control.Measure, {
	/*
	 * 측정 결과 한번 완료 후에도 유지
	 */
	persist: true,
	
	//default style map 정의
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
								graphicName: "square",
								fillColor: "#ffffff",
								fillOpacity: 1,
								strokeWidth: 1,
								strokeOpacity: 1,
								strokeColor: "#ff8000"
							},
							"Line": {
								strokeWidth: 3,
								strokeOpacity: 0.7,
								strokeColor: "#ff8000"
							},
							"Polygon": {
								strokeWidth: 3,
								strokeOpacity: 0.7,
								strokeColor: "#ff8000",
								fillColor: "#ee9900",
								fillOpacity: 0
							}
						}
					})]
				})
			})
		}
	},
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GMeasure 객체 생성
	 * 인 자 : handler (handler 클래스),  options (컨트롤, 핸들러 옵션 들)
	 * 사용법 : initialize(handler, options)
	 * 작성일 : 2011.04.22
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.22		최원석		OpenLayers.Control.Measure 의 initialize 복사
	 * 								생성시 handler defalut 옵션 정의
	 * 
	 **********************************************************************************/
	initialize: function(handler, options) {
        // concatenate events specific to measure with those from the base
        /*this.EVENT_TYPES =
            OpenLayers.Control.Measure.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );*/
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        this.callbacks = OpenLayers.Util.extend(
            {done: this.measureComplete},
            this.callbacks
        );

        // let the handler options override, so old code that passes 'persist' 
        // directly to the handler does not need an update
        this.handlerOptions = OpenLayers.Util.extend(
            {persist: this.persist}, this.handlerOptions
        );
        this.handler = new handler(this, this.callbacks, this.handlerOptions);
    },
    
	measureComplete: function(geometry) {
		this.cancelDelay();
        this.measure(geometry, "measure");
    },
	
	/**********************************************************************************
	 * 함수명 : setStyle
	 * 설 명 : GMeasure 객체 생성
	 * 인 자 : obj (styleOptions)
	 * 사용법 : setStyle(obj)
	 * 작성일 : 2011.04.22
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.22		최원석		거리, 면적 측정의 스타일을 변경
	 * 
	 **********************************************************************************/
	setStyle : function(obj) {
		for(var i in obj) {
			for(var j in obj[i]) {
				this.handlerOptions['layerOptions']['styleMap']['styles']['default']['rules'][0]['symbolizer'][i][j] = obj[i][j];
			}
		}
		
		this.handler.handlerOptions = this.handlerOptions;
	},
	
	CLASS_NAME: "GMeasure"
});