/**********************************************************************************
 * 파일명 : GWMS.js
 * 설 명 : OpenLayers.Layer.GWMS 를 상속 받아 수정
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.19		최원석				0.1					최초 생성
 * 2011.04.21		최원석				0.2					getParam, getParams 생성
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GWMS = OpenLayers.Class(OpenLayers.Layer.WMS, {
	
	/**
	 * G-Inno 설정에 맞게 Default 값 정의
	 */
	DEFAULT_PARAMS: { 
		service: "WMS",
		version: "1.3.0",
		request: "GetMap",
		styles: "",
		exceptions: "application/vnd.ogc.se_inimage",
		format: "image/jpeg",
		crs : "SR_ORG:6640",
		transparent: true
    },
	
	/**
	 * 싱글 타일 사용 여부
	 * 디폴트로 싱글 타일 사용 (현재 싱글 타일이 속도가 빠름)
	 */
	singleTile: true,
	
	/**
	 * 싱글 타일 시 지도 객체 화면 대비 불러올 이미지 비율
	 * 비율이 높을 수록 이동 시 속도는 빠르지만 호출 속도가 느려짐 (1:1 비율 default)
	 */
	ratio : 1,
	
	/**
	 * 타일 서비스 시에 불러올 타일의 비율
	 */
	buffer : 0,
	
	/**
	 * 화면 조작 시 이벤트
	 */
	transitionEffect : "resize",
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GWMS 객체 생성
	 * 인 자 : name (레이어 명), url (타일 서비스 주소), params (WMS 호출 파라미터), options (Layer options 들)
	 * 사용법 : initialize(name, url, params, options)
	 * 작성일 : 2011.04.19
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		OpenLayers.Layer.WMS 의 initialize 복사
	 * 								생성 시 옵션 체크 추가
	 * 
	 **********************************************************************************/
	initialize: function(name, url, params, options) {
		//필수 파라미터 체크
		if(GError.debug) this.chkParams(name, url, params, options);
		
        var newArguments = [];
        //uppercase params
        params = OpenLayers.Util.upperCaseObject(params);
        if (parseFloat(params.VERSION) >= 1.3 && !params.EXCEPTIONS) {
            params.EXCEPTIONS = "INIMAGE";
        } 
        newArguments.push(name, url, params, options);
        OpenLayers.Layer.Grid.prototype.initialize.apply(this, newArguments);
        OpenLayers.Util.applyDefaults(
                       this.params, 
                       OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS)
                       );


        //layer is transparent        
        if (!this.noMagic && this.params.TRANSPARENT && 
            this.params.TRANSPARENT.toString().toLowerCase() == "true") {
            
            // unless explicitly set in options, make layer an overlay
            if ( (options == null) || (!options.isBaseLayer) ) {
                this.isBaseLayer = false;
            } 
            
            // jpegs can never be transparent, so intelligently switch the 
            //  format, depending on teh browser's capabilities
            if (this.params.FORMAT == "image/jpeg") {
                this.params.FORMAT = OpenLayers.Util.alphaHack() ? "image/gif"
                                                                 : "image/png";
            }
        }
        
        // styles 값이 없을 경우 layers값과 동일하게 전달한다.
        if(this.params.STYLES == ""){
        	this.params.STYLES = this.params.LAYERS;
        }

    },
	
	/**********************************************************************************
	 * 함수명 : getParam
	 * 설 명 : WMS 호출 파라미터 반환
	 * 인 자 : property (반환할 프로퍼티 명)
	 * 사용법 : getParam(property)
	 * 
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	getParam: function(property) {
		if(property) {
			for(var i in this.params) {
				if(i.toUpperCase() == property.toUpperCase()) {
					return this.params[i];
				}
			}
			/* 에러 처리 방안 후 일괄 처리
			alert('GWMS 레이어 : 현재 레이어에 지정한 Property 가 없습니다.');
			*/
			return false;
		}
		else {
			/* 에러 처리 방안 후 일괄 처리
			alert('GWMS 레이어 : property를 지정하여 주십시오.');
			*/
		}
	},
	
	/**********************************************************************************
	 * 함수명 : getParams
	 * 설 명 : WMS 호출 파라미터들 반환
	 * 사용법 : getParams()
	 * 
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.21		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	getParams: function() {
		return this.params;
	},
	
	/**********************************************************************************
	 * 함수명 : chkParams
	 * 설 명 : options 을 체크 하고 변형 생성한다.
	 * 인 자 : name (레이어 명), url (타일 서비스 주소), params (WMS 호출 파라미터), options (Layer options 들)
	 * 사용법 : chkParams(options)
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.19		최원석		최초생성
	 * 
	 **********************************************************************************/
	chkParams : function(name, url, params, options){
		//name 체크
		if(!name) {
			GError.create_obj(this, "Layer Name(레이어 명)");
		}
		else if(!url) {
			GError.create_obj(this, "Url (서비스 주소)");
		}
		else if(!(params && params.layers)) {
			GError.create_obj(this, "Parameter layers (요청 레이어 명 리스트)");
		}
	},
	
	/**********************************************************************************
	 * 함수명 : getURL
	 * 설 명 : WMS 요청 URL를 생성한다.
	 * 인 자 : bound(WMS 영역)
	 * 사용법 : getURL(bounds)
	 * 작성일 : 2014.07.03
	 * 작성자 : 연구개발센터 제품개발팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2014.07.03		이경찬		최초생성
	 * 
	 **********************************************************************************/
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);
        
        var imageSize = this.getImageSize();
        var newParams = {};
        // WMS 1.3 introduced axis order
        var reverseAxisOrder = this.reverseAxisOrder();
        newParams.BBOX = this.encodeBBOX ?
            bounds.toBBOX(null, reverseAxisOrder) :
            bounds.toArray(reverseAxisOrder);
        newParams.WIDTH = imageSize.w;
        newParams.HEIGHT = imageSize.h;
        // WMS 요청시 좌표변환
        // Map객체의 Projection(매쉬업하는 기본 베이스 지도의 좌표계)과 WMS레이어의 Projection을 비교하여 다를 경우
        // WMS 요청시 좌표값을 WMS레이어 좌표계 값으로 변환하여 엔진에 요청
		if(!this.projection.equals(this.map.getProjectionObject())) {
			var point = new OpenLayers.Geometry.Point(bounds.left, bounds.bottom);
			var minGeom = OpenLayers.Projection.transform(point, this.map.projection, this.projection);
			
			point = new OpenLayers.Geometry.Point(bounds.right, bounds.top);
			var maxGeom = OpenLayers.Projection.transform(point, this.map.projection, this.projection);
			newParams.BBOX = [minGeom.x,minGeom.y,maxGeom.x,maxGeom.y];
		}
        
        var requestString = this.getFullRequestString(newParams);
        return requestString;
    },
						
	CLASS_NAME: "GWMS"
});