/**********************************************************************************
 * 파일명 : GGetFeatureParams.js
 * 설 명 : Ginno GetFeatureControl Parameters Class
**********************************************************************************/
// g2WebServiceUrl : GMapParams.js 에서 선언한 URL 사용

// 데이터하우스 명칭
var prefix = "EDU_DataHouse";

// 검색대상 레이어 목록
var targetTable = ["CML_BADM_A", "SHP_WATER"];

// 검색결과 처리 함수
var callbackFunction = function(res){
	//성공 여부 판별
	if (res.success()) {
		//검색 결과 처리
		//..
		//..
		//alert("attrRes 변수에 검색 결과 저장!");
		attrRes = res;
	} else {
		//요청 실패
		alert('요청 실패');
	}
	/*if(gMap.getLayerByName('GRegularPolygonDrawAttr')){
		gMap.removePopup(gMap.popups[gMap.popups.length-1]);
	}*/
	
	
	/*// 이전 결과 삭제
	if(gMap.getLayerByName('GPoint')){
		gMap.getLayerByName('GPoint').removeAllFeatures();
	}
	
	if(gMap.getLayerByName('GRegularPolygonDrawAttr')){
		gMap.getLayerByName('GRegularPolygonDrawAttr').removeAllFeatures();
		gMap.popups.splice(gMap.popups.length-1 , 1);
	}
	if(gMap.getLayerByName('GPolygonDraw')){
		gMap.getLayerByName('GPolygonDraw').removeAllFeatures();
	}*/
};

// 점형 검색 파라미터
var pointParams = {
	// 점형 검색 컨트롤 ID
	id : "attrPoint",
	// 서비스 URL
	serviceUrl : g2WebServiceUrl,
	// 데이터하우스 명칭
	prefix : prefix,
	// 검색 대상 레이어 목록
	tables : targetTable,
	// 점형 핸들러 유지 여부 (지도에서 화면 선택시 점형 그래픽을 지도에 계속 보여줄것인지 결정.)
	persist : true,
	// 버퍼 사이즈 (단위 : m)
	distance : 0.5,
	// 검색 결과를 OpenLayers.Filter 형태로 받을지 여부
	getRequestFilter : true,
	// 이벤트 리스너 (검색 결과 처리 함수) 선언
	eventListeners : {
		"callback" : function(res) {
			callbackFunction(res);
		}
	}
};

var circleParams = {
	// 원형 검색 컨트롤 ID
	id : "attrCircle",
	// 서비스 URL
	serviceUrl : g2WebServiceUrl,
	// 데이터하우스 명칭
	prefix : prefix,
	// 검색 대상 레이어 목록
	tables : targetTable,
	// 원형 핸들러 유지 여부 (지도에서 화면 선택시 원형 그래픽을 지도에 계속 보여줄것인지 결정.)
	persist : true,
	// 검색 결과를 OpenLayers.Filter 형태로 받을지 여부
	getRequestFilter : true,
	// 원형 핸들러 옵션
	handlerOptions : {
		// 도형의 꼭지점 갯수(값이 클수록 원형에 가깝게 도형이 그려진다.)
		sides : 100,
		// True일 경우 타원, False일 경우 원
		irregular : false
	},
	// 이벤트 리스너 (검색 결과 처리 함수) 선언
	eventListeners : {
		"callback" : function(res) {
			callbackFunction(res);
		}
	}
};

var polygonParams = {
	// 다각형 검색 컨트롤 ID
	id : "attrPolygon",
	// 서비스 URL
	serviceUrl : g2WebServiceUrl,
	// 데이터하우스 명칭
	prefix : prefix,
	// 검색 대상 레이어 목록
	tables : targetTable,
	// 다각형 핸들러 유지 여부 (지도에서 화면 선택시 다각형 그래픽을 지도에 계속 보여줄것인지 결정.)
	persist : true,
	// 검색 결과를 OpenLayers.Filter 형태로 받을지 여부
	getRequestFilter : true,
	// 이벤트 리스너 (검색 결과 처리 함수) 선언
	eventListeners : {
		"callback" : function(res) {
			callbackFunction(res);
		}
	}
};