function fn_init_map() {
	// 1. 기본 지도 생성하기 및 WMS 레이어 생성
	fn_create_map();
	
	// 2. 위치이동
//	fn_move_map();
	
	// 3. 지도 이벤트 등록 및 사용
//	fn_use_event();
	
	// 4. 지도기본 조작도구 설정
	fn_init_control();
	
	// 5. 지도 측정도구 설정 (거리, 면적)
	fn_init_measure();
	
	// 6. 지도 그리기 도구(점, 선, 면) 설정
	fn_draw_feature();
	
	// 7. 축척바 설정
	fn_set_scaleBar();
	
	// 8. 팝업 추가
//	fn_add_popup();
	
	// 9. 마커 추가
//	fn_add_marker();
}

/*******************************************************************************
* 함수명 : fn_create_map 
* 설 명 :  GMap API을 사용하여 맵의 기본 정보와 WMS 레이어 정보를 초기화하고 생성하는 예제
* 작성일 : 2015.02.05 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.05		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_create_map() {
	// 맵이 만들어진 div 크기를 가져온다. 지도 해상도를 설정할때 필요한 정보
	var mapWidth = $("#map").width();
	var mapHeight = $("#map").height();
	
	// 맵의 전체 영역을 left, bottom, right, top 순서로 설정 (xmin, ymin, xmax, ymax)
	// 맵의 전체영역은 Desktop 툴을 이용해서 확인 하거나 WMS 서비스의 GetCapabilities 요청을 통해서 확인 가능
	gMapParams.maxExtent = [183633.19855636, 442826.41326623, 199405.91356204, 451182.25326623];

	// 화면의 해상도를 구하는 공식
	gMapParams.maxResolution = ((gMapParams.maxExtent[2] - gMapParams.maxExtent[0])>(gMapParams.maxExtent[3] - gMapParams.maxExtent[1]))?(gMapParams.maxExtent[2] - gMapParams.maxExtent[0])/mapWidth:(gMapParams.maxExtent[2] - gMapParams.maxExtent[0])/mapHeight;
	
	// 레이어는 콤마(,) 단위로 구분해서 레이어 이름으로 설정
	WMSParams.layers="CML_BADM_A,SHP_WATER";
	WMSParams.serviceURL = "http://localhost:8080/G2DataService/GService?";
	
	// 인덱스맵 serviceUrl 설정
	gIndexMapParams.serviceUrl = "http://localhost:8080/G2DataService/GService?";
	// 인덱스 맵으로 사용할 레이어 설정
	gIndexMapParams.layers = "CML_BADM_A,SHP_WATER";
	
	// 맵을 생성하고 베이스 레이어를 WMS 레이어로 설정
	// 베이스 레이어는 WMSParams.layers 에 입력한 레이어 명으로 설정
	ginnoMap('map', 'WMS');
}

/*******************************************************************************
* 함수명 : fn_move_map 
* 설 명 :  위/경도값을 입력하여 지도를 이동할 수 있는 예제
* 작성일 : 2015.02.05 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.05		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_move_map() {
	// 지도를 이동할 좌표를 설정
	var lonlat = new GLonLat(191746.88754614,446807.82638767);
	
	// 생성한 맵은 gMap으로 컨트롤 할 수 있으며 moveTo 함수를 사용하여 지도를 이동할 수 있음
	gMap.moveTo(lonlat, 5);
}

/*******************************************************************************
* 함수명 : fn_use_event 
* 설 명 :  지도의 이벤트를 등록하고 사용하는 예제
* 작성일 : 2015.02.05 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.05		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_use_event() {
	// 지도 이동이 끝난후 moveend 상태일때 event 발생
	gMap.events.on({
		"moveend" : function(e) {
	//		alert("moveend event start!!");
		}
	});
	
	// 맵에 등록된 베이스 레이어가 loadstart/loadend 상태일때 event 발생
	gMap.baseLayer.events.on({
		"loadstart" : function(e) {
	//		alert("loadstart event start!!");
		},
		"loadend" : function(e) {
	//		alert("loadend event start!!");
		}
	});
}

/*******************************************************************************
* 함수명 : fn_init_control 
* 설 명 :  지도 기본 조작(drag, zoom) 도구 등록 예제
* 작성일 : 2015.02.05 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.05		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_init_control() {
	// 지도에 기본 조작도구 버튼 및 컨트롤 추가
	GUtil.addControlButton('drag', "controlDiv", {imgURL : "./images/map/btn/btn_map_move.gif"}); // 드래그
	GUtil.addControlButton('zoomIn', "controlDiv", {imgURL : "./images/map/btn/btn_map_zoomIn.gif"}); // 확대
	GUtil.addControlButton('zoomOut', "controlDiv", {imgURL : "./images/map/btn/btn_map_zoomOut.gif"}); // 축소
	GUtil.addControlButton('maxExtent', "controlDiv", {imgURL : "./images/map/btn/btn_map_maxExtent.gif"}); // 전체영역
	GUtil.addControlButton('prev', "controlDiv", {imgURL : "./images/map/btn/btn_map5.gif"}); // 이전영역
	GUtil.addControlButton('next', "controlDiv", {imgURL : "./images/map/btn/btn_map6.gif"}); // 다음영역
	GUtil.addControlButton('clean', "controlDiv", {imgURL : "./images/map/btn/btn_map_clean.gif"}); // 지도 초기화
}

/*******************************************************************************
* 함수명 : fn_init_measure 
* 설 명 :  지도 측정도구(거리,면적) 등록 예제
* 작성일 : 2015.02.05 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.05		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_init_measure() {
	// 지도에 측정 도구 버튼 및 컨트롤 추가
	GUtil.addControlButton('measurePath', "controlDiv", {imgURL : "./images/map/btn/btn_map_measureLine.gif"}); // 거리
	GUtil.addControlButton('measurePolygon', "controlDiv", {imgURL : "./images/map/btn/btn_map_measurePolygon.gif"}); // 면적
}

/*******************************************************************************
* 함수명 : fn_draw_feature 
* 설 명 :  지도 그리기도구(점,선,면) 등록 예제
* 작성일 : 2015.02.05 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.05		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_draw_feature() {
	//지도에 그리기도구 버튼 및 컨트롤 추가
	GUtil.addControlButton('drawPoint', "controlDiv", {imgURL : "./images/map/btn/btn_drawing4_on.gif"}); // 점
	GUtil.addControlButton('drawLine', "controlDiv", {imgURL : "./images/map/btn/btn_drawing_line_on.gif"}); // 선
	GUtil.addControlButton('drawPolygon', "controlDiv", {imgURL : "./images/map/btn/btn_drawing_polygon.gif"}); // 면
}

/*******************************************************************************
* 함수명 : fn_set_scaleBar 
* 설 명 :  축척바 이미지 설정 예제
* 작성일 : 2015.02.05 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.05		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_set_scaleBar() {
	gMap.getControl('panZoomBar').setImg({
		imgUrl : "./images/content/gmap/panzoombar/", // 툴바 이미지 경로
		imgZoomIn : "btn_scale+.png", // 축척 확대 버튼 이미지
		imgZoomOut : "btn_scale-.png", // 축척 축소 버튼 이미지
		imgZoomBarOn : "scale_bg4.png", // 현재 축척바 아래쪽에 표현되는 이미지
		imgZoomBar : "scale_bar.png", // 현재 축척바 슬라이더 이미지
		size : new GSize(18, 18), // 축척 확대/축소 버튼 이미지의 크기
		sliderSize : new GSize(20,6) // 현재 축척바 슬라이더 이미지의 크기
	});
}

/*******************************************************************************
* 함수명 : fn_add_popup 
* 설 명 :  지도에 팝업 추가 예제
* 작성일 : 2015.02.06 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.06		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_add_popup() {
	// 팝업을 추가할 좌표를 설정
	var lonlat = new GLonLat(191746.88754614,446807.82638767);
	
	// 팝업 내용 설정
	var popupHtml = "<div style='font-weight:bold; width : 180px; height : 17px;'>지노시스템 제품개발팀 임상수<div>";
	
	// 팝업 객체를 생성(id, 좌표, 팝업사이즈, 팝업내용, offset)
	var textPopup = new GPopup("popupText", lonlat, null, popupHtml, OpenLayers.Pixel(0,0));
	
	// 맵에 팝업을 등록
	gMap.addPopup(textPopup);
	// 팝업사이즈를 최적화
	textPopup.updateSize();
}

/*******************************************************************************
* 함수명 : fn_add_marker 
* 설 명 :  지도에 마커 추가 예제
* 작성일 : 2015.02.06 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.06		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_add_marker() {
	// 마커를 추가할 좌표를 설정
	var lonlat = new GLonLat(191746.88754614,446807.82638767);
	// 마커 사이즈 설정
	var size = new GSize(21,25);
	// 마커 옵셋 설정
	var offset = new GPixel(-(size.w/2), -size.h);
	
	// 아이콘 생성
	var icon = new GIcon('http://dev.openlayers.org/img/marker-gold.png',size,offset);
	
	// 아이콘과 좌표정보로 마커 생성
	var marker = new GMarker(lonlat,icon);
	
	// 마커를 맵에 추가
	marker.addToGMap();
}

/*******************************************************************************
* 함수명 : fn_save_map 
* 설 명 :  지도 저장 예제
* 작성일 : 2015.02.06 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.06		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_save_map() {
	var xml = gMap.saveTool.getXML();
	$("#datas").val(xml);
	$("#saveForm").attr("action", gMapImageSaveUrl);
	$("#saveForm").submit();
}