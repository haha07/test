var serviceUrl = "http://203.236.216.158:8080/G2DataService/GService?"; // GeoGate 서비스 URL
var gMap = null; // 맵 객체
function fn_init_map() {
	// 1. 기본 지도 생성하기 및 WMS 레이어 생성
	fn_create_map();
	
	// 2. 레이어 체크박스에 이벤트를 할당
	fn_bind_checkBoxClickEvent();
	
	// 3. 맵에 이벤트 등록
	fn_add_control();
	
	// 4. 사용자가 버튼을 클릭하면 해당 컨트롤 활성화
	fn_event_button();
	
	for(var i=0 ;i < $(".layerlst").find("input").length ; i++){
		$($(".leftresult").find("input")[i]).attr("checked" , false);
	}
	$("#search_query").val('');
	
}
/*******************************************************************************
* 함수명 : fn_move_sacle
* 설 명 :  셀렉트 값의 스케일이 변경되면 지도 스케일을 변경한다.
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_move_sacle(obj) {
	gMap.zoomToScale($(obj).val());
}
/*******************************************************************************
* 함수명 : fn_event_button
* 설 명 :  버튼에 클릭이벤트를 추가
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_event_button() {
	$("#btndrag").click(function(e){
		gMap.activeControls("drag");
		return false;
	});
	
	$("#btnzoomIn").click(function(e){
		gMap.activeControls("zoomIn");
		return false;
	});
	
	$("#btnzoomOut").click(function(e){
		gMap.activeControls("zoomOut");
		return false;
	});
	
	$("#btnmaxExtent").click(function(e){
		//gMap.zoomToMaxExtent();
		gMap.setCenter(new OpenLayers.LonLat(14128015.43529, 4512393.0420133), 13);
		return false;
	});
	
	$("#btnprev").click(function(e){
		gMap.movePrev();
		return false;
	});
	
	$("#btnnext").click(function(e){
		gMap.moveNext();
		return false;
	});
	
	$("#btnclean").click(function(e){
		gMap.cleanMap();
		return false;
	});
	
	$("#btnmeasurePath").click(function(e){
		gMap.activeControls("measurePath");
		return false;
	});
	
	$("#btnmeasurePolygon").click(function(e){
		gMap.activeControls("measurePolygon");
		return false;
	});
	
	$("#btndrawPoint").click(function(e){
		gMap.activeControls("drawPoint");
		return false;
	});
	
	$("#btndrawLine").click(function(e){
		gMap.activeControls("drawLine");
		return false;
	});
	
	$("#btndrawPolygon").click(function(e){
		gMap.activeControls("drawPolygon");
		return false;
	});
	
	$("#getFeature").click(function(e){
		gMap.activeControls("drag");
		gMap.getControl("pointGetFeature").activate();
		
		//var layerOption = {
					//layerName : "Ginno_WMS",
					//layers : "BML_BLDG_AS",
					//styles : "",
					//crs : new OpenLayers.Projection(gMap.getProjection()),
					//isBaseLayer : false
				//};
				//var wmsLayer = fn_create_wmsLayer(layerOption);
				//gMap.addLayer(wmsLayer);
				
				//gMap.raiseLayer(gMap.getLayerByName("GDrawToolLayer"), gMap.layers.length);
		for(var i=0 ;i < $(".layerlst").find("input").length ; i++){
		
			if($($(".layerlst").find("input")[i]).val() == "BML_BLDG_AS"){
				$($(".layerlst").find("input")[i]).prop("checked" , true);
			}
		}
		fn_bind_checkBoxClickEvent1();
		//gMap.zoomToScale(12);
		//zoom레벨도 변경하고 싶은데 zoomToScalse를 이용하면 baseLayer가 깨지는 현상
		//gMap.activeControls("pointGetFeature");
		//gMap.getControl('drag').activate();
		//gMap.getControl('pointGetFeature').activate();
		return false;
	});
	
	$("#search-400m").click(function(e){
		//clickSearch400();
		//gMap.getControl("circleGetFeature").deactivate();
		//gMap.activeControls("drag");
		//gMap.getControl("circleGetFeature").activate();
		
		gMap.getControl("circleGetFeature").activate();
		//gMap.getControl("drag").deactivate();
		//gMap.activeControls("circleGetFeature");
		//gMap.getControl("drag").activate();
		return false;
	});
	
	$("#search-800m").click(function(){
		//clickSearch800();
		gMap.activeControls("drag");
		gMap.getControl("polygonGetFeature").activate();
		//gMap.activeControls("polygonGetFeature");
		return false;
	});
	
	$("#search_query").keydown(function(e) { // 검색 엔터키 옵션 설정
		if (e.keyCode == 13) {
			fn_search_building();
		}
	});
	// 검색버튼을 눌렀을때
	$("#search_btn").click(fn_search_building);
	
	
	$("#aa").click(function(){
		$(this).find("img").attr("src","images/map/btn_selmap01_on.png");
		$("#bb").find("img").attr("src","images/map/btn_selmap02_off.png");
		fn_ff('VWorldStreetMap');
	});
	$("#bb").click(function(){
		$(this).find("img").attr("src","images/map/btn_selmap02_on.png");
		$("#aa").find("img").attr("src","images/map/btn_selmap01_off.png");
		fn_ff('VWorldSatellite');
	});
	
	
}

function fn_ff(temp){
	var vw = gMap.getLayersByName(temp)[0];
	var va = gMap.getLayersByName(temp)[0];
	if(temp == "VWorldStreetMap"){
	gMap.setBaseLayer(vw);
	vw.setVisibility(true);
	va.setVisibility(false);
	}else{
	gMap.setBaseLayer(va);
	vw.setVisibility(false);
	va.setVisibility(true);
	}
}

/*******************************************************************************
* 함수명 : fn_add_control
* 설 명 :  맵 이벤트 등록 
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_search_building() {
	var searchString = $("#search_query").val().trim();
	
	if(!searchString) {
		alert("건물 이름을 입력하세요");
		return ;
	}
	
	// 검색 결과 클리어
	fn_clean_div(); 
	
	GRequest.WFS.getFeatureByComparison(serviceUrl, {
		type : "~",
		prefix : "dh_g3test",
		tables : ["BML_BLDG_AS"],
		fields : ["NAME"],
		values : ["*" + searchString + "*"],
		asc : ["ASC"]
	},function(res) {
		var data = res.data;
		var html = "";
		var queryCnt = 0;
		
		for(var data_i = 0; data_i < data.length; data_i++) {
			var table = data[data_i].table;
			var results = data[data_i].results;
			
			for(var results_i = 0; results_i < results.length; results_i++) {
				html = "";
				var g2id = results[results_i].g2id;
				var fields = results[results_i].fields;
				queryCnt++;
				
				//html += "레이어이름 : " + table;
				//for (var field_i in fields) {
					//html+="<div>" + field_i + " : " + fields[field_i] + "</div>";
					html+="<div>건물명 : " + fields["name"] + "<br />";
					html+="건물 면적 : " + fields["shape_area"] + "</div>";
				//}
				$("<li />", {
					"html" : html,
					"g2id" : g2id,
					"table" : table
				}).on("click", function(e){
					var g2id = $(this).attr("g2id");
					var table = $(this).attr("table");
					
					GRequest.WFS.getFeatureById(serviceUrl, {
						prefix : "dh_g3test",
						tables : table,
						values : g2id,
					},
					function(res) {
						for(var i=0 ;i < $(".layerlst").find("input").length ; i++){
							if($($(".layerlst").find("input")[i]).val() == "BML_BLDG_AS"){
								$($(".layerlst").find("input")[i]).prop("checked" , true);
							}
						}
						fn_bind_checkBoxClickEvent1();
						fn_result_getFaeture(res);
						
						var feature = res.data[0].results[0].feature;
						
						// 맵을 피쳐위치로 이동한다.
						gMap.zoomToFeature(feature, 19);
					});
				}).css({
					"cursor" : "pointer"
				}).hover(function() {
					$(this).css("background-color", "rgb(226, 220, 220)");
				}, function() {
					$(this).css("background-color", "white");
				}).appendTo(".search_result");
			}
		}
		$("#queryCnt").text(queryCnt);
	});
	
}
/*******************************************************************************
* 함수명 : fn_add_control
* 설 명 :  맵 이벤트 등록 
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_add_control() {
	$("#advancedButtonGroup").show(); // 심화 과정에 필요한 버튼을 보여준다
	// GDrawTool 을 추가하면 점, 선, 면 등 컨트롤러가 추가되며 벡터레이어도 자동으로 맵에 추가된다.
	gMap.drawTool = new GDrawTool(gMap);
	
	// 지도에 저장도구 추가
	gMap.saveTool = new GSaveTool(gMap);
	
	var pointGetFeature = new GGetFeature(GPoint, {
		id : "pointGetFeature",
		serviceUrl : serviceUrl,
		// 데이터 하우스 이름을 정의
		prefix : "dh_g3test",
		// 검색 대상 시설물을 정의
		// tables : ["CML_BADM_A", "SHP_WATER", "RDL_RDSR_A", "BML_BLDG_AS", "WTL_PIPE_L", "WTL_VALVE_P"],
		tables : ["BML_BLDG_AS"],
		// 검색후 지도에 Point가 지도에 남아 있을지 여부
		persist : false,
		// 검색 반경을 지정
		distance : 5,
		eventListeners : {
			
			"callback" : fn_result_getFaeture
		}
	});
	
	var circleGetFeature = new GGetFeature(GRegularPolygonDrawAttr, {
		id : "circleGetFeature",
		serviceUrl : serviceUrl,
		// 데이터 하우스 이름을 정의
		prefix : "dh_g3test",
		// 검색 대상 시설물을 정의
		// tables : ["CML_BADM_A", "SHP_WATER", "RDL_RDSR_A", "BML_BLDG_AS", "WTL_PIPE_L", "WTL_VALVE_P"],
		tables : ["BML_BLDG_AS"],
		// 검색후 지도에 Point가 지도에 남아 있을지 여부
		persist : true,
		// 검색 반경을 지정
		distance : 50,
		eventListeners : {
			"callback" : fn_search_result
		},
		handlerOptions : {
			sides : 100
			//callback : function(){
				//if(this.radius > 500){
				//debugger;
				//gMap.getLayerByName("GDrawToolLayer");
				//return false;
				//}
			//}
			//finalize:function(){
				//if(this.radius > 500){
				//debugger;
					//alert("다시 그리시오.");
					//return false;
					//}
			//}
				
			
		}
	});
	
	var polygonGetFeature = new GGetFeature(GPolygonMeasure1, {
		id : "polygonGetFeature",
		serviceUrl : serviceUrl,
		// 데이터 하우스 이름을 정의
		prefix : "dh_g3test",
		// 검색 대상 시설물을 정의
		// tables : ["CML_BADM_A", "SHP_WATER", "RDL_RDSR_A", "BML_BLDG_AS", "WTL_PIPE_L", "WTL_VALVE_P"],
		tables : ["BML_BLDG_AS"],
		// 검색후 지도에 Point가 지도에 남아 있을지 여부
		persist : true,
		// 검색 반경을 지정
		distance : 50,
		eventListeners : {
			"callback" : fn_search_result
		}
	});
	
	// 맵에 getFeature 컨트롤을 추가
	gMap.addControl(pointGetFeature);
	gMap.addControl(circleGetFeature);
	gMap.addControl(polygonGetFeature);
}
/*******************************************************************************
 * 함수명 : fn_remove_feature 
 * 설 명 : 벡터에 그려진 feature 를 삭제 
 * 작성일 : 2015.01.19 
 * 작성자 : 임상수
 * 수정일 수정자 수정내용
 * ----------------------------------------------------------------------
 * 2014.10.06 임상수 최초 생성
 * 
 ******************************************************************************/
function fn_remove_feature(vector) {
	
	var features = vector.features;
	
	for(var i = features.length-1; i >= 0; i--) {
		vector.removeFeatures(features[i]);
	}
	gMap.cleanMap();
}

/*******************************************************************************
 * 함수명 : fn_search_result 
 * 설 명 : 영역검색을 한 결과를 결과창에 나타냄 
 * 작성일 : 2015.02.11
 * 작성자 : 임상수
 * 수정일 수정자 수정내용
 * ----------------------------------------------------------------------
 * 2015.02.11 임상수 최초 생성
 * 
 ******************************************************************************/
function fn_search_result(res) {
	var layer = gMap.getLayersByName('wmsLayerr')[0];
	
	if(!layer){
		alert("WMS Layer가 켜져 있어야 합니다.");
		return;
	}
	
	
	var vector = gMap.getLayerByName("GDrawToolLayer");
	var queryCnt = 0;
	
	// 검색 결과 클리어
	fn_clean_div(); 
	
	// 벡터에 그려진 피쳐를 삭제
	
	fn_remove_feature(vector);
	// 벡터레이어 순서를 가장 위로 변경
	gMap.raiseLayer(vector, gMap.layers.length); 
	
	for(var i = 0; i < res.data.length; i++) {
		var data = res.data[i];
		var table = data.table;
		
		for(var j = 0; j < data.results.length; j++) {
			var results = data.results[j];
			var html = "";
			
				
			// 좌표계변환 현제 레이어의 좌표는 SR-ORG:6640 이므로 맵 좌표에 맞게 EPSG:900913 좌표계로 지오메트리 좌표를 변경
			if(gMap.getProjection() != "SR-ORG:6640") {
				results.feature.geometry.transform(new OpenLayers.Projection("SR-ORG:6640"), new OpenLayers.Projection("EPSG:900913"));
			}
			
			
			var fields = results.fields;
			
			if(!fields["name"]){
				continue;
			}else{
			 vector.addFeatures(results.feature);
			 queryCnt++;
			}
			html += "레이어이름 : " + table;
			//for (var field_i in fields) {
				html+="<div>결과명: " + fields["name"] + "</div>";
			//}
			
			$("<li />", {
				"html" : html,
				"g2id" : results.g2id,
				"table" : table
			}).on("click", function(e){
				var g2id = $(this).attr("g2id");
				var table = $(this).attr("table");
				
				GRequest.WFS.getFeatureById(serviceUrl, {
						prefix : "dh_g3test",
						tables : table,
						values : g2id,
					},
					function(res) {
						fn_result_getFaeture(res);
						
						var feature = res.data[0].results[0].feature;
						
						// 맵을 피쳐위치로 이동한다.
						gMap.zoomToFeature(feature, 19);
					});
			}).css({
				"cursor" : "pointer"
			}).hover(function() {
				$(this).css("background-color", "rgb(226, 220, 220)");
			}, function() {
				$(this).css("background-color", "white");
			}).appendTo(".search_result");
		}
	} 
	$("#queryCnt").text(queryCnt);
}

/*******************************************************************************
 * 함수명 : fn_clean_div 
 * 설 명 : 검색 결과를 초기화
 * 작성일 : 2015.02.11 
 * 작성자 : 임상수 
 * 수정일 수정자 수정내용
 * ----------------------------------------------------------------------
 * 2015.02.11 임상수 최초 생성
 * 
 ******************************************************************************/
function fn_clean_div() {
	$(".resultBx").html("");
	$(".resultBx").html('<ul class="leftresult search_result"></ul>');
	$(".search_result").html("");
	$("#queryCnt").text("");
}

/*******************************************************************************
* 함수명 : fn_result_getFaeture
* 설 명 :  getFeature 속성을 팝업 Div로 생성 
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_result_getFaeture(res) {
	var layer = gMap.getLayersByName('wmsLayerr')[0];
	
	if(!layer){
		alert("WMS Layer가 켜져 있어야 합니다.");
		return;
	}
	var text = "";
	var data = res.data;
	
	if(data.length > 0) {
		for(var data_i = 0; data_i < data.length; data_i++) {
			var table = data[data_i].table; // 검색 대상 테이블명
			var results = data[data_i].results;
			
			for(var results_i = 0; results_i < results.length; results_i++) {
				var feature = results[results_i].feature;
			
				// 좌표계변환 현제 레이어의 좌표는 SR-ORG:6640 이므로 맵 좌표에 맞게 EPSG:900913 좌표계로 지오메트리 좌표를 변경
				if(gMap.getProjection() != "SR-ORG:6640") {
					feature.geometry.transform(new OpenLayers.Projection("SR-ORG:6640"), new OpenLayers.Projection("EPSG:900913"));
				}
				
				var vector = gMap.getLayerByName("GDrawToolLayer");
				// 하이라이팅 된 point 피쳐를 제거한다.
				fn_remove_feature(vector);
				
				gMap.raiseLayer(vector, gMap.layers.length);
				vector.addFeatures(feature);
	
				var fields = results[results_i].fields;
				
				if(!fields["name"]){
					alert("검색된 시설물이 없습니다.");
					return;
				}
				text += "<li>" + "레이어이름 : " + table;
				//for (var field_i in fields) {
					text+="<div>결과명  : " + fields["name"] + "</div>";
				//}
				text += "</li>";
			}
		}
		$("#dialog").dialog({
			title : "결과"
		});
		$("#textArea").html(text);
		$("#dialog").dialog("open");
	} else {
		alert("검색된 시설물이 없습니다.");
	}
}

/*******************************************************************************
* 함수명 : fn_bind_checkBoxClickEvent 
* 설 명 :  레이어 트리에 체크 이벤트를 할당
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_bind_checkBoxClickEvent() {
	$("input:checkbox[name='layer']").click(function(){
		var layers = gMap.layers;
		var wmsLayer = null;
		for(i in layers) {
			if(layers[i].CLASS_NAME == "OpenLayers.Layer.WMS") {
				wmsLayer = layers[i];
			}
		}
		// 체크된 레이어 리스트를 가져온다.
		var layers = fn_get_checkLayerList();
		
		if(layers.length > 0) { // 체크된 레이어가 있을 경우
			if(wmsLayer) { // WMS 레이어가 맵에 추가 되어 있을 경우 WMS 레이어의 layers 와 styles 를 변경
				wmsLayer.mergeNewParams({
					layers : layers.join(","),
					styles : layers.join(",")
				});
			} else { // WMS 레이어가 맵에 추가 되어 있지 않을 경우 WMS 레이어를 신규로 생성
				var layerOption = {
					layerName : "Ginno_WMS",
					layers : layers.join(","),
					styles : layers.join(","),
					crs : new OpenLayers.Projection(gMap.getProjection()),
					isBaseLayer : false
				};
				var wmsLayer = fn_create_wmsLayer(layerOption);
				gMap.addLayer(wmsLayer);
				
				gMap.raiseLayer(gMap.getLayerByName("GDrawToolLayer"), gMap.layers.length);
			}
		} else { // 체크된 레이어가 없을 경우
			if(wmsLayer) { // 체크된 레이어가 없지만 wmsLayer가 남아 있을 경우 매쉬업 했을경우 wmsLayer가 남아 있음
				if(!wmsLayer.isBaseLayer) { // 남아 있는 WMS 레이어가 베이스 베이스 레이어가 아니라면 삭제
					gMap.removeLayer(wmsLayer);
				}
			}
			return;
		}
	});
}

/*******************************************************************************
* 함수명 : fn_bind_checkBoxClickEvent1
* 설 명 :  레이어 트리에 체크 이벤트를 할당
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_bind_checkBoxClickEvent1() {
		var layers = gMap.layers;
		var wmsLayer = null;
		for(i in layers) {
			if(layers[i].CLASS_NAME == "OpenLayers.Layer.WMS") {
				wmsLayer = layers[i];
			}
		}
		// 체크된 레이어 리스트를 가져온다.
		var layers = fn_get_checkLayerList();
		
		if(layers.length > 0) { // 체크된 레이어가 있을 경우
			if(wmsLayer) { // WMS 레이어가 맵에 추가 되어 있을 경우 WMS 레이어의 layers 와 styles 를 변경
				wmsLayer.mergeNewParams({
					layers : layers.join(","),
					styles : layers.join(",")
				});
			} else { // WMS 레이어가 맵에 추가 되어 있지 않을 경우 WMS 레이어를 신규로 생성
				var layerOption = {
					layerName : "Ginno_WMS",
					layers : layers.join(","),
					styles : layers.join(","),
					crs : new OpenLayers.Projection(gMap.getProjection()),
					isBaseLayer : false
				};
				var wmsLayer = fn_create_wmsLayer(layerOption);
				gMap.addLayer(wmsLayer);
				
				gMap.raiseLayer(gMap.getLayerByName("GDrawToolLayer"), gMap.layers.length);
			}
		} else { // 체크된 레이어가 없을 경우
			if(wmsLayer) { // 체크된 레이어가 없지만 wmsLayer가 남아 있을 경우 매쉬업 했을경우 wmsLayer가 남아 있음
				if(!wmsLayer.isBaseLayer) { // 남아 있는 WMS 레이어가 베이스 베이스 레이어가 아니라면 삭제
					gMap.removeLayer(wmsLayer);
				}
			}
			return;
		}
}
/*******************************************************************************
* 함수명 : fn_get_checkLayerList 
* 설 명 :  체크박스에 체크된 레이어 리스트를 반환
* 작성일 : 2015.02.10 
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_get_checkLayerList() {
	var layers = [];
	var checkLayersList = $(".layerlst").find("input:checkbox:checked");
	
	for (var i = 0; i < checkLayersList.length; i++) {
		var layer = $(checkLayersList[i]).val();
		layers.push(layer);
	}
	
	return layers;
}

/*******************************************************************************
* 함수명 : ` 
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
	
	// 일반 GeoGate 서비스 (타일 X, 매쉬업 X)
	//gMap = fn_create_basicMap(mapWidth, mapHeight);
	
	// GeoGate Tile 서비스 (타일 O, 매쉬업 X)
	//gMap = fn_craete_tileMap();
	
	// Vworld 매쉬업 서비스 (타일 X, 매쉬업 O)
	gMap = fn_create_vworldMap();
	
	// SR-ORG:6640 좌표계일 경우 전체영역을 null 값으로 초기화한다.
	// SR-ORG:6640 이 아닌 다른 좌표계를 사용할 경우 Extent 를 설정해줘야한다
	// 현재는 VWorld 는 EPSG:900913(구글 좌표계) 좌표계를 사용하므로 법정읍면동 전체 영역에 대한 Extent를 계산해서 사용한다.
	var maxExtent = gMap.getProjection() == "SR-ORG:6640" ? null : new OpenLayers.Bounds(14111113.297412, 4503497.6828478, 14142891.991918, 4520332.9383252);
	// 인덱스맵 옵션
	var indexMapOption = {
		serviceUrl : serviceUrl,
		// 인덱스맵으로 사용될 레이어
		layers : "CML_BADM_A",
		styles : "CML_BADM_A",
		// 인덱스맵의 해상도
		maxResolution : 80,
		// 인덱스맵의 좌표계
		crs : new OpenLayers.Projection(gMap.getProjection()),
		projection : new OpenLayers.Projection(gMap.getProjection()),
		// 인덱스 맵이 사용할 맵 전체 영역
		maxExtent: maxExtent
	}
	// 인덱스 맵을 생성
	new GIndexMap(gMap, indexMapOption);
	
//	gMap.addControl(new GPanZoomBar({id : "panZoomBar"}));
	gMap.getControl('panZoomBar').setImg({
		imgUrl : "./images/content/gmap/panzoombar/", // 툴바 이미지 경로
		imgZoomIn : "btn_scale+.png", // 축척 확대 버튼 이미지
		imgZoomOut : "btn_scale-.png", // 축척 축소 버튼 이미지
		imgZoomBarOn : "scale_bg4.png", // 현재 축척바 아래쪽에 표현되는 이미지
		imgZoomBar : "scale_bar.png", // 현재 축척바 슬라이더 이미지
		size : new GSize(18, 18), // 축척 확대/축소 버튼 이미지의 크기
		sliderSize : new GSize(20,6) // 현재 축척바 슬라이더 이미지의 크기
	});
	
	// 맵 moveend 이벤트 등록
	gMap.events.on({
		"moveend" : fn_auto_scaleSlection
	});
}

/*******************************************************************************
* 함수명 : fn_auto_scaleSlection 
* 설 명 :  지도 스케일에 맞게 Select 박스의 값을 변경
* 작성일 : 2015.02.10
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_auto_scaleSlection(e) {
	// 지도의 스케일을 받아옴
	var scale = gMap.getScale();
	if (scale < 5000) { // 1000
		$("#scale option:eq(0)").attr("selected", "selected");
	} else if (scale >= 5000 && scale < 10000) { // 5000
		$("#scale option:eq(1)").attr("selected", "selected");
	} else if (scale >= 10000 && scale < 20000) { // 10000
		$("#scale option:eq(2)").attr("selected", "selected");
	} else if (scale >= 20000 && scale < 50000) { // 20000
		$("#scale option:eq(3)").attr("selected", "selected");
	} else if (scale >= 50000 && scale < 100000) { // 50000
		$("#scale option:eq(4)").attr("selected", "selected");
	} else if (scale >= 100000 && scale < 200000) { // 100000
		$("#scale option:eq(5)").attr("selected", "selected");
	} else { // 200000
		$("#scale option:eq(6)").attr("selected", "selected");
	}
}

/*******************************************************************************
* 함수명 : fn_create_vworldMap 
* 설 명 :  Vworld를 매쉬업하기 위한 맵을 생성한다.
* 작성일 : 2015.02.10
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_create_vworldMap() {
	var map = new GMap('map', {
		theme: null,
		sphericalMercator: true,
		projection: new OpenLayers.Projection("EPSG:900913"),
		units: "m",
		numZoomLevels: 21,
		maxResolution: 156543.0339,
		maxExtent: new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
	});
	map.addControl(new OpenLayers.Control.Attribution());
	
	var vworldLayer = fn_create_vworldLayer();
	map.addLayers(vworldLayer);
	map.setCenter(new OpenLayers.LonLat(14128015.43529, 4512393.0420133), 13);
	return map;
}

/*******************************************************************************
* 함수명 : fn_create_vworldLayer 
* 설 명 :  vworld 레이어를 생성
* 작성일 : 2015.02.10
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_create_vworldLayer() {
	var vworldStreet = new OpenLayers.Layer.VWorldStreet("VWorldStreetMap", {
		isBaseLayer: true
	});
	var vWorldSatellite = new OpenLayers.Layer.VWorldSatellite("VWorldSatellite", {
		isBaseLayer: false,
		visibility:false
	});
	return [vworldStreet,vWorldSatellite];
}

/*******************************************************************************
* 함수명 : fn_craete_tileMap 
* 설 명 :  타일 서비스 하기 위한 맵을 생성
* 작성일 : 2015.02.10
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_craete_tileMap() {
	var map = new GMap("map", {
		maxExtent : new OpenLayers.Bounds(183790.9, 438359.5, 200502.6, 455071.1),
		maxResolution : 38.864380780316424,
		fractionalZoom : false,			
		numZoomLevels : 8,													
		projection : new OpenLayers.Projection("SR-ORG:6640"),
		displayProjection : new OpenLayers.Projection("SR-ORG:6640"),
		/*
		* GMap options 추가 설명
		*
		*	1. resolutions : 단계별 해상도를 설정합니다.
		*		(zoomLevels가 8단계로 설정되어있으니 resolutions을 8단계로 설정합니다.)
		*/
		resolutions : 
			[
				38.864380780316424,
19.432058098493144,
9.716029049246572,
4.858014524623286,
2.428874970646575,
1.2144374853232875,
0.6072187426616438,
0.30347707966575393
			]
	});
	var tileLayer = fn_create_tileLayer();
	map.addLayer(tileLayer);
	map.zoomToMaxExtent();
	return map;
}

/*******************************************************************************
* 함수명 : fn_create_basicMap 
* 설 명 :  기본 맵을 생성
* 작성일 : 2015.02.10
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_create_basicMap(mapWidth, mapHeight) {
	var map = new GMap("map", {
		// 맵의 전체 영역을 left, bottom, right, top 순서로 설정 (xmin, ymin, xmax, ymax)
		maxExtent :  new OpenLayers.Bounds(183633.19855636, 442826.41326623, 199405.91356204, 451182.25326623), 
		// 최대 해상도 설정
		maxResolution : ((gMapParams.maxExtent[2] - gMapParams.maxExtent[0])>(gMapParams.maxExtent[3] - gMapParams.maxExtent[1]))?(gMapParams.maxExtent[2] - gMapParams.maxExtent[0])/mapWidth:(gMapParams.maxExtent[2] - gMapParams.maxExtent[0])/mapHeight,
		// 좌표계 설정
		projection: new OpenLayers.Projection("SR-ORG:6640"),
		// 화면 좌표계 설정
		displayProjection : new OpenLayers.Projection("SR-ORG:6640"),
		// 실제 줌 레벨 사용 여부
		fractionalZoom : false,
		// 줌 레벨 단계 설정
		numZoomLevels : 11,
		// 지도 단위 설정
		units: 'm'
	});
	
	var layerOption = {
		layerName : "Ginno_WMS",
		layers : "CML_BADM_A",
		styles : "CML_BADM_A",
		crs : new OpenLayers.Projection("SR-ORG:6640"),
		isBaseLayer : true
	};
	var wmsLayer = fn_create_wmsLayer(layerOption);
	map.addLayer(wmsLayer);
	map.zoomToMaxExtent();
	return map;
}

/*******************************************************************************
* 함수명 : fn_create_wmsLayer 
* 설 명 :  WMS 레이어를 생성하고 WMS 레이어 객체를 반환
* 작성일 : 2015.02.10
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_create_wmsLayer(option) {
	var layer = new OpenLayers.Layer.WMS("wmsLayerr", 	serviceUrl, {
		// WMS레이어 이름
		layerName : option.layerName,
		// WMS 서비스 대상 레이어 목록
		layers : option.layers,
		// WMS 서비스 대상 레이어의 스타일 목록
		styles : option.styles,
		// 좌표계
		crs : option.crs,
		// 이미지 형식
		format : "image/png",
		// WMS 버전
		version : "1.3.0",
		// 투명도 적용 여부
		transparent: true
	}, {
		// 기본 레이어로 지정 여부
		isBaseLayer : option.isBaseLayer,
		// 하나의 타일로 서비스 여부
		singleTile : true,
		// 투명도 설정
		ratio : 1.0,
		// 레이어 좌표계 설정
		projection : new OpenLayers.Projection("SR-ORG:6640")
	});
	
	return layer;
}

/*******************************************************************************
* 함수명 : fn_create_tileLayer 
* 설 명 :  타일 레이어를 생성하고 타일 레이어 객체를 반환
* 작성일 : 2015.02.10
* 작성자 : 임상수 
* 수정일			수정자					수정내용
* ----------------------------------------------------------------------
* 2015.02.10		임상수(제품개발팀)		최초 생성
* 
******************************************************************************/
function fn_create_tileLayer() {
	var tileCacheLayer = new OpenLayers.Layer.TileCacheCustom("Raster", "http://localhost:8080/tile", "basic", 	{ 
			format : "image/png",
			serverResolutions : 
				[
	              	38.864380780316424,
19.432058098493144,
9.716029049246572,
4.858014524623286,
2.428874970646575,
1.2144374853232875,
0.6072187426616438,
0.30347707966575393
              	],
			isBaseLayer: true ,
			transitionEffect: "resize",
			buffer: 0
		}
	);
	return tileCacheLayer;
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
	$("#saveForm").attr("action", "http://203.236.216.158:8080/edu/map/save.do");
	$("#saveForm").submit();
}

function fn_legend(temp){
debugger;
	if($(temp).next().css("display") == "none"){
		$(temp).next().show();
	}else{
		$(temp).next().hide();
	}
	
}