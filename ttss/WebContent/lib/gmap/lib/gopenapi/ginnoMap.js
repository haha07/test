/**********************************************************************************
 * 파일명 : ginno.js
 * 설 명 : Ginno Open API Map Class
 * 필요 라이브러리 : OpenLayers, GMap
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2014.07.01		이경찬				0.1					최초 생성
 * 
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * GMap
 * 출처 : http://wiki.g-inno.com/    [GMap API]
 * 
**********************************************************************************/
// 맵 객체 전역변수 선언
var gMap;
var indexMap;
var legendTool;
var chartTool;
ginnoMap = OpenLayers.Class({
	drawTool : null,
	
	saveTool : null,
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : ginno.map.Map 객체 생성
	 * 인 자 : div (지도 DIV 엘리먼트 아이디)
	 * 사용법 : initialize('map', options)
	 * 작성일 : 2014.07.01
	 * 작성자 : 연구개발센터 제품개발팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2014.07.01		이경찬		최초 생성
	 * 
	 * 
	 **********************************************************************************/
	initialize: function (mapDiv, baseLayerType) {
		// mapDiv의 width, height 체크
		// 값이 없을 경우 지도가 안뜨는 문제 발생
		if($('#' + mapDiv).css("width").split("px")[0] * 1 < 1 || $('#' + mapDiv).css("height").split("px")[0] * 1 < 1){
			alert("mapDiv의 width, height 값이 유효하지 않아 기본값으로 자동 설정합니다.");
			$('#' + mapDiv).css("width","100%");
			$('#' + mapDiv).css("height","100%");
			$('#' + mapDiv).css("border","1px solid #000000");
		}
		
		// Map Extent 값형태 변경
		var maxExtent = new GBounds(gMapParams.maxExtent[0],gMapParams.maxExtent[1],gMapParams.maxExtent[2],gMapParams.maxExtent[3]);
		gMapParams.maxExtent = maxExtent;
		
		// 맵 객체 생성
		/*gMap = new GMap(mapDiv, { //네이버맵
            theme: null,
			controls: [
				new OpenLayers.Control.Attribution(),
				new OpenLayers.Control.Navigation({
					dragPanOptions: {
						enableKinetic: true
					}
				})
			],
            projection: new OpenLayers.Projection("EPSG:5179"),
            units: "m",
            maxResolution: 2048,
            numZoomLevels: 14,
            maxExtent: new OpenLayers.Bounds(90112, 1192896, 1990673, 2761664)
        });*/
		
		gMap = new GMap(mapDiv, gMapParams);
		
		// BaseLayer 추가
		switch(baseLayerType)
        {
                case "WMS":
	                	//var WMSLayer = new GWMSPost(WMSParams.layerName, 	WMSParams.serviceURL, WMSParams, WMSOptions);
                		var WMSLayer = new OpenLayers.Layer.WMS(WMSParams.layerName, 	WMSParams.serviceURL, WMSParams, WMSOptions);
	            		gMap.addLayer(WMSLayer);
	            		//var WMSLayer1 = new OpenLayers.Layer.WMS(WMSParams1.layerName, 	WMSParams1.serviceURL, WMSParams1, WMSOptions1);
	            		//gMap.addLayer(WMSLayer1);
	            		break;
                case "TileCache":
	                	var TileCacheLayer = new GTileCache(TileCacheParams.layerName, 	TileCacheParams.serviceURL, TileCacheParams, TileCacheOptions);
	            		gMap.addLayer(TileCacheLayer);
	            		break;
                default:
                		//alert("type 값은 필수 입니다.");
                        //return false;
                		break;
        }
		loadEnd = false;
        function layerLoadStart(event)
        {
          loadEnd = false;
        }
        
        function layerLoadEnd(event)
        {
          loadEnd = true;
        }
		/*var naverStreet = new OpenLayers.Layer.NaverStreet("GTileCache",
	              {
	                sphericalMercator: false,
	                eventListeners: {
	                  "loadstart": layerLoadStart,
	                  "loadend": layerLoadEnd
	                }
	              }
	            );
	            
	            gMap.addLayer(naverStreet);
	            gMap.setCenter(new OpenLayers.LonLat(200000, 500000), 1); // Zoom level
*/		// vectorLayer 추가
		var vectorLayer = new GVector("vectorLayer", {
			styleMap : new OpenLayers.StyleMap( {
				'default' : new OpenLayers.Style(null, {
					rules : [ new OpenLayers.Rule( {
						symbolizer : {
							"Point" : {
								//fillColor : "\${pointFillColor}",	//면색상
								pointRadius : 16,
								fillColor : "#0000ff",				//면색상
								strokeColor : "#ff0000",			//선색상
								fillOpacity : 0.5				//면투명도
								//externalGraphic : "/image"
							},
							"Line" : {
								strokeWidth : 10,					//선굵기
								//strokeOpacity : 1,					//선투명도
								strokeColor : "#ff0000",			//선색상
								strokeDashstyle : "solid",			//선스타일
								strokeLinecap : "round"				//선 끝모양
							},
							"Polygon" : {
								strokeWidth : 3,					//선 굵기
								strokeOpacity : 1,					//선 투명도
								strokeColor : "#ff0000",			//선 색상
								fillColor : "#0000ff",				//면 색상
								strokeDashstyle : "dash",			//선스타일
								fillOpacity : 0.5					//면 투명도
							}
						}
					}) ]
				})
			})
		});
		gMap.addLayer(vectorLayer);
		
		// markersLayer 추가
		var markersLayer = new OpenLayers.Layer.Markers("markersLayer");
		gMap.addLayer(markersLayer);
		
		//전체영역으로 지도 이동
		gMap.zoomToMaxExtent();
		
		// 색인도 생성
		indexMap = new GIndexMap(gMap, gIndexMapParams);
		
		//속성조회 컨트롤 생성
		var controls = {
			point : new GGetFeature(GPoint, pointParams),
			circle : new GGetFeature(GRegularPolygonDrawAttr, circleParams),
			polygon : new GGetFeature(GPolygonDraw, polygonParams)
		};
		
		// 속성 조회 컨트롤 추가
		for(var i in controls) {
			gMap.addControl(controls[i]);
		}

		// 그리기 도구 객체 생성
		gMap.drawTool = new GDrawTool(gMap, {
			onModificationStart : ginnoMap.prototype.fn_select_feature, // (단일)편집시작시 callback
			onSelect : ginnoMap.prototype.fn_multiSelect_feature, // (다중)도형선택시 callback
			onUnselectAll : function() { // 도형선택해제시 callback
				//선택된 도형이 없습니다.(li)
				ginnoMap.prototype.fn_switch_show("None");
			},
			onDeactivate : function() { // 비활성화시 callback
				//선택된 도형이 없습니다.(li)
				ginnoMap.prototype.fn_switch_show("None");
			}
		});
		//gMap.drawTool = new GDrawTool(gMap);
		
		// 이미지저장 도구 객체 생성
		gMap.saveTool = new GSaveTool(gMap);
		
		// 심볼 그리기 디폴트 이미지 경로 지정
		if(apiServerHost){
			gMap.getControl("drawSymbol").handler.attributes.externalGraphic = apiServerHost + gMap.getControl("drawSymbol").handler.attributes.externalGraphic;
		}
		
		// 범례
		//legendTool = new GLegendTool(gMap, WMSParams.layerName, gMap.getLayerByName(WMSParams.layerName).params.LAYERS, ginnoMap.prototype.fn_create_legendList);
		
		// 전체 범례 보기
		//legendTool.showFullList();
		// 현재 범례 보기
		//legendTool.showCurrentList();
		
    },
    
    /**********************************************************************************
     * 함수명 : fn_create_legendList
     * 설 명 : 범례 리스트 생성 함수
     * 인 자 : arr (범례 Object Array)
     * 사용법 : fn_create_legendList(arr)
     * 작성일 : 2011.05.19
     * 작성자 : 기술개발팀 최원석
     * 수정일				수정자			수정내용
     * ----------------------------------------------------------------------
     * 2011.05.19		최원석			최초 생성
     * 
     **********************************************************************************/
    fn_create_legendList: function (arr) {
    	var liTagsStr = "";
    	for ( var i in arr) {
    		var symbolizer = arr[i].type;
    		if(symbolizer["point"]){
    			liTagsStr += "<li>";
    			liTagsStr += "<span class='legendGraphic' style='background:url("
    					+ GRequest.WMS.getLegendGraphic(g2WebServiceUrl, {
    						layer : arr[i].layer,
    						style : arr[i].style,
    						rule : arr[i].rule // 엔진요청 보낼때 공백있을경우... 인식못함
    					}) + ") no-repeat; background-position 0 0;' ></span>";
    			liTagsStr += arr[i].rule;
    			liTagsStr += "</li>";
    		}
    		else{
    			var obj = {
    				width : 16,
    				height : 16
    			};
    			
    			if(symbolizer["polygon"]) {
    				obj.strFillColor = symbolizer["polygon"].fillColor.replace("#", "");
    				if(symbolizer["line"]) {
    					obj.strColor = symbolizer["line"].stroke.replace("#", "");
    				}
    				if(apiServerHost){
    					imgUrl = apiServerHost + "/gmap/getPolygonSymbol.do?" + GUtil.fn_convert_objToStr(obj);
    				}
    				else{
    					imgUrl = "/gmap/getPolygonSymbol.do?" + GUtil.fn_convert_objToStr(obj);
    				}
    				
    			}
    			else if(symbolizer["line"]) {
    				obj.strColor = symbolizer["line"].stroke.replace("#", "");
    				if(apiServerHost){
    					imgUrl = apiServerHost + "/gmap/getLineSymbol.do?" + GUtil.fn_convert_objToStr(obj);
    				}
    				else{
    					imgUrl = "/gmap/getLineSymbol.do?" + GUtil.fn_convert_objToStr(obj);
    				}
    			}
    			
    			liTagsStr += "<li>";
    			liTagsStr += "<span class='legendGraphic' style='background:url("
    					+ imgUrl
    					+ ") no-repeat;' ></span>";
    			liTagsStr += arr[i].rule;
    			liTagsStr += "</li>";
    		}
    		
    	}

    	$("#legendMng ul").html(liTagsStr);
    },
    
    /**********************************************************************************
     * 함수명 : fn_select_feature
     * 설 명 : 그리기 도구 - 도형 편집(선택)
     * 사용법 : fn_select_feature()
     * 작성일 : 2011.05.02
     * 작성자 : 기술개발팀 최원석
     * 수정일				수정자			수정내용
     * ----------------------------------------------------------------------
     * 2011.05.02		최원석			최초 생성
     * 
     **********************************************************************************/
    fn_select_feature: function (feature) {
    	var attr = feature.attributes;
    	// 도형에 따라 보이는 속성 메뉴(li) 변경
    	ginnoMap.prototype.fn_switch_show(attr.featureType);
    	// 도형에 따라 값 설정
    	ginnoMap.prototype.fn_bind_drawAttr(attr);
    },
    
    /**********************************************************************************
     * 함수명 : fn_switch_show
     * 설 명 : 화면 레이아웃 switch
     * 사용법 : fn_switch_show()
     * 작성일 : 2011.05.02
     * 작성자 : 기술개발팀 최원석
     * 수정일				수정자			수정내용
     * ----------------------------------------------------------------------
     * 2011.05.02		최원석			최초 생성
     * 
     **********************************************************************************/
    fn_switch_show: function (type) {
    	//li 태그 모두 숨김
    	$("#attrMng li").hide();

    	switch (type) {
    	//도형이 선택 되지 않았을 때
    	case 'None':
    		$('#liNone').show();
    		$('#attrMng .totMenu strong').text("속성 설정");
    		break;
    	// 점형
    	case 'Point':
    		$('#attrMng .totMenu strong').text("점");
    		$('#liType').show(); // 타입 graphicName
    		$('#liSize').show(); // 도형크기 strokeWidth
    		$('#liThickness').show(); // 선 두께 strokeWidth
    		$('#liColor').show(); // 선색 strokeColor
    		$('#liOpa').show(); // 선투명도 strokeOpacity
    		$('#liColorPoly').show(); // 면색 fillColor
    		$('#liOpaPoly').show(); // 면투명도 fillOpacity
    		$('#liSubmit .btnBack').hide();
    		$('#liSubmit').show(); // 적용
    		$('#liIndex').show(); // 위상변화
    		break;
    	case 'Line':
    		$('#attrMng .totMenu strong').text("선형");
    		$('#liColor').show(); // 선 색 strokeColor
    		$('#liThickness').show(); // 선 두께 strokeWidth
    		$('#liOpa').show(); // 선 투명도 strokeOpacity
    		$('#liStyle').show(); // 선 스타일 strokeDashstyle
    		$('#liCap').show(); // 모서리 스타일 strokeLinecap
    		$('#liSubmit .btnBack').hide();
    		$('#liSubmit').show(); // 적용
    		$('#liIndex').show(); // 위상변화
    		break;
    	case 'Image':
    		$('#attrMng .totMenu strong').text("이미지");
    		$('#liWidth').show(); // 너비 graphicWidth
    		$('#liHeight').show(); // 높이 graphicHeight
    		$('#liOpa').show(); // 투명도 graphicOpacity
    		$('#liSubmit .btnBack').hide();
    		$('#liSubmit').show(); // 적용
    		$('#liIndex').show(); // 위상변화
    		break;
    	case 'Polygon':
    		$('#attrMng .totMenu strong').text("다각형");
    		$('#liColor').show(); // 선 색 strokeColor
    		$('#liThickness').show(); // 선 두께 strokeWidth
    		$('#liOpa').show(); // 선 투명도 strokeOpacity
    		$('#liStyle').show(); // 선 스타일 strokeDashstyle
    		$('#liColorPoly').show(); // 면색 fillColor
    		$('#liOpaPoly').show(); // 면투명도 fillOpacity
    		$('#liSubmit .btnBack').hide();
    		$('#liSubmit').show(); // 적용
    		$('#liIndex').show(); // 위상변화
    		break;
    	case 'Text':
    		$('#attrMng .totMenu strong').text("글자");
    		$('#liFont').show(); // 서체 font-family
    		$('#liSize').show(); // 글자 크기 font-size
    		$('#liColor').show(); // 글자색 color
    		$('#liSubmit .btnBack').hide();
    		$('#liSubmit').show(); // 적용
    		$('#liIndex').show(); // 위상변화
    		$('#liBackFillColor').show(); //배경색
    		$('#liBackFillOpa').show(); //배경 투명도
    		$('#liBackLineColor').show(); //배경 테두리 색
    		$('#liBackLineOpa').show(); //배경 테두리 투명도
    		break;
    	case 'Multi':
    		$('#attrMng .totMenu strong').text("다중 선택");
    		$('#liColor').show(); // 선 색 strokeColor
    		$('#liThickness').show(); // 선 두께 strokeWidth
    		$('#liOpa').show(); // 선 투명도 strokeOpacity
    		$('#liStyle').show(); // 선 스타일 strokeDashstyle
    		$('#liColorPoly').show(); // 면색 fillColor
    		$('#liOpaPoly').show(); // 면투명도 fillOpacity
    		$('#liSubmit .btnBack').hide();
    		$('#liSubmit').show(); // 적용
    		$('#liIndex').show(); // 위상변화
    		break;
    	}
    },
    
    /**********************************************************************************
     * 함수명 : fn_bind_drawAttr
     * 설 명 : 선택한 레이어의 스타일 속성 값으로 초기화
     * 인 자 : attr(레이어의 속성 객체)
     * 사용법 : fn_bind_drawAttr(attr)
     * 작성일 : 2011.05.02
     * 작성자 : 기술개발팀 최원석
     * 수정일				수정자			수정내용
     * ----------------------------------------------------------------------
     * 2011.05.02		최원석			최초 생성
     * 
     **********************************************************************************/
    fn_bind_drawAttr: function (attr) {
    	switch (attr.featureType) {
    	case 'Point':
    		//타입 graphicName
    		$('#selType').val(attr.graphicName);
    		// 도형크기 strokeWidth
    		$('#txtSize').val(attr.pointRadius);
    		// 선 두께 strokeWidth
    		$('#txtThickness').val(attr.strokeWidth);
    		// 선색 strokeColor
    		$('#colorAttr').val(attr.strokeColor);
    		$('#colorAttr').css("background-color", attr.strokeColor);
    		// 선투명도 strokeOpacity
    		var strokeOpacity = Math.ceil((1 - attr.strokeOpacity) * 100);
    		$('#txtOpa').val(strokeOpacity);
    		$('#sliderOpa').val(strokeOpacity);
    		// 면색 fillColor
    		$('#colorAttrPoly').val(attr.fillColor);
    		$('#colorAttrPoly').css("background-color", attr.fillColor);
    		// 면투명도 fillOpacity
    		var fillOpacity = Math.ceil((1 - attr.fillOpacity) * 100);
    		$('#txtOpaPoly').val(fillOpacity);
    		$('#sliderOpaPoly').val(fillOpacity);
    		break;
    	case 'Line':
    		//선 색 strokeColor
    		$('#colorAttr').val(attr.strokeColor);
    		$('#colorAttr').css("background-color", attr.strokeColor);
    		// 선 두께 strokeWidth
    		$('#txtThickness').val(attr.strokeWidth);
    		// 선 투명도 strokeOpacity
    		var strokeOpacity = Math.ceil((1 - attr.strokeOpacity) * 100);
    		$('#txtOpa').val(strokeOpacity);
    		$('#sliderOpa').val(strokeOpacity);
    		// 선 스타일 strokeDashstyle
    		//handlerSelStyle.selectedIndex($("#selStyle option").index($("#selStyle option[value='" + attr.strokeDashstyle + "']").get(0)));
    		// 모서리 스타일 strokeLinecap
    		//handlerSelCap.selectedIndex($("#selCap option").index($("#selCap option[value='" + attr.strokeLinecap + "']").get(0)));
    		break;
    	case 'Image':
    		//너비 graphicWidth
    		$('#txtWidth').val(attr.graphicWidth);
    		// 높이 graphicHeight
    		$('#txtHeight').val(attr.graphicHeight);
    		// 투명도 graphicOpacity
    		var opacity = Math.ceil((1 - attr.graphicOpacity) * 100);
    		$('#txtOpa').val(opacity);
    		$('#sliderOpa').val(opacity);
    		break;
    	case 'Polygon':
    		//선 색 strokeColor
    		$('#colorAttr').val(attr.strokeColor);
    		$('#colorAttr').css("background-color", attr.strokeColor);
    		// 선 두께 strokeWidth
    		$('#txtThickness').val(attr.strokeWidth);
    		// 선 투명도 strokeOpacity
    		var strokeOpacity = Math.ceil((1 - attr.strokeOpacity) * 100);
    		$('#txtOpa').val(strokeOpacity);
    		//$('#sliderOpa').slider("value", strokeOpacity);
    		// 선 스타일 strokeDashstyle
    		//handlerSelStyle.selectedIndex($("#selStyle option").index($("#selStyle option[value='" + attr.strokeDashstyle + "']").get(0)));
    		// 면색 fillColor
    		$('#colorAttrPoly').val(attr.fillColor);
    		$('#colorAttrPoly').css("background-color", attr.fillColor);
    		// 면투명도 fillOpacity
    		var fillOpacity = Math.ceil((1 - attr.fillOpacity) * 100);
    		$('#txtOpaPoly').val(fillOpacity);
    		//$('#sliderOpaPoly').slider("value", fillOpacity);
    		break;
    	case 'Text':
    		//서체 font-family
    		$('#selFont').val(attr['fontFamily']);
    		// 글자 크기 font-size
    		$('#txtSize').val(attr['fontSize'].replace("px", ""));
    		// 글자색 color
    		$('#colorAttr').val(attr['fontColor']);
    		$('#colorAttr').css("background-color", attr['fontColor']);
    		
    		// 배경 색상 및 투명도
    		var res = GUtil.fn_convert_color(attr['background_fill']);
    		$('#colorAttrBack').val(res[1]);
    		$('#colorAttrBack').css("background-color", res[1]);
    		$('#txtOpaBack').val(res[0]);
    		//$('#sliderOpaBack').slider("value", res[0]);
    		// 배경 테두리 색상 및 투명도
    		var res = GUtil.fn_convert_color(attr['background_line']);
    		$('#colorAttrBackLine').val(res[1]);
    		$('#colorAttrBackLine').css("background-color", res[1]);
    		$('#txtOpaBackLine').val(res[0]);
    		//$('#sliderOpaBackLine').slider("value", res[0]);
    		break;
    	}
    	
    	// IE Height 버그로 인하여 수정
    	$('#sliderOpa .ui-slider-range').css('height', $('#sliderOpa .ui-slider-range').parent().innerHeight());
    	$('#sliderOpaPoly .ui-slider-range').css('height', $('#sliderOpaPoly .ui-slider-range').parent().innerHeight());
    	
    	//$("#liSubmit .btnApply").unbind('click');
    	$("#liSubmit .btnApply").click(function (){ginnoMap.prototype.fn_apply_attr();});
    },
    
    /**********************************************************************************
     * 함수명 : fn_apply_attr
     * 설 명 : 사용자가 수정한 스타일 적용
     * 사용법 : fn_apply_attr()
     * 작성일 : 2011.05.02
     * 작성자 : 기술개발팀 최원석
     * 수정일				수정자			수정내용
     * ----------------------------------------------------------------------
     * 2011.05.02		최원석			최초 생성
     * 
     **********************************************************************************/
    fn_apply_attr: function () {
    	var feature = gMap.drawTool.getSelectFeature();
    	var attr = feature.attributes;

    	switch (attr.featureType) {
    	case 'Point':
    		//타입 graphicName
    		attr.graphicName = $('#selType').val();
    		// 도형크기 strokeWidth
    		attr.pointRadius = $('#txtSize').val();
    		// 선 두께 strokeWidth
    		attr.strokeWidth = $('#txtThickness').val();
    		// 선색 strokeColor
    		attr.strokeColor = $('#colorAttr').val();
    		// 선투명도 strokeOpacity
    		attr.strokeOpacity = 1 - ($('#txtOpa').val() / 100);
    		// 면색 fillColor
    		attr.fillColor = $('#colorAttrPoly').val();
    		// 면투명도 fillOpacity
    		attr.fillOpacity = 1 - ($('#txtOpaPoly').val() / 100);
    		break;
    	case 'Line':
    		//선 색 strokeColor
    		attr.strokeColor = $('#colorAttr').val();
    		// 선 두께 strokeWidth
    		attr.strokeWidth = $('#txtThickness').val();
    		// 선 투명도 strokeOpacity
    		attr.strokeOpacity = 1 - ($('#txtOpa').val() / 100);
    		// 선 스타일 strokeDashstyle
    		attr.strokeDashstyle = $("#selStyle").val();
    		// 모서리 스타일 strokeLinecap
    		attr.strokeLinecap = $("#selCap").val();
    		break;
    	case 'Image':
    		//너비 graphicWidth
    		attr.graphicWidth = $('#txtWidth').val();
    		// 높이 graphicHeight
    		attr.graphicHeight = $('#txtHeight').val();
    		// 투명도 graphicOpacity
    		attr.graphicOpacity = 1 - ($('#txtOpa').val() / 100);
    		break;
    	case 'Polygon':
    		//선 색 strokeColor
    		attr.strokeColor = $('#colorAttr').val();
    		// 선 두께 strokeWidth
    		attr.strokeWidth = $('#txtThickness').val();
    		// 선 투명도 strokeOpacity
    		attr.strokeOpacity = 1 - ($('#txtOpa').val() / 100);
    		// 선 스타일 strokeDashstyle
    		attr.strokeDashstyle = $("#selStyle").val();
    		// 면색 fillColor
    		attr.fillColor = $('#colorAttrPoly').val();
    		// 면투명도 fillOpacity
    		attr.fillOpacity = 1 - ($('#txtOpaPoly').val() / 100);
    		break;
    	case 'Text':
    		//서체 font-family
    		attr['fontFamily'] = $('#selFont').val();
    		// 글자 크기 font-size
    		attr['fontSize'] = $('#txtSize').val() + "px";
    		// 글자색 color
    		attr['fontColor'] = $('#colorAttr').val();
    		// 글자 배경색 및 투명도
    		attr['background_fill'] = GUtil.fn_convert_color([$('#txtOpaBack').val(),$('#colorAttrBack').val()]); 
    		// 글자 배경 테두리 색 및 투명도
    		attr['background_line'] = GUtil.fn_convert_color([$('#txtOpaBackLine').val(),$('#colorAttrBackLine').val()]);
    		
    		gMap.drawTool.setTextAttr(feature);
    		
    		break;
    	}

    	gMap.drawTool.redraw();
    },
    
    /**********************************************************************************
     * 함수명 : fn_select_feature
     * 설 명 : 그리기 도구 - 도형 편집(선택)
     * 사용법 : fn_select_feature()
     * 작성일 : 2011.05.02
     * 작성자 : 기술개발팀 최원석
     * 수정일				수정자			수정내용
     * ----------------------------------------------------------------------
     * 2011.05.02		최원석			최초 생성
     * 
     **********************************************************************************/
    fn_multiSelect_feature: function (feature) {
    	var features = gMap.drawTool.map.getLayerByName('GDrawToolLayer').selectedFeatures;
    	for(var i in features){
    		var attr = features[i].attributes;
	    	// 도형에 따라 보이는 속성 메뉴(li) 변경
	    	ginnoMap.prototype.fn_switch_show("Multi");
	
	    	//선 색 strokeColor
	    	$('#colorAttr').val(attr.strokeColor);
	    	$('#colorAttr').css("background-color", attr.strokeColor);
	    	// 선 두께 strokeWidth
	    	$('#txtThickness').val(attr.strokeWidth);
	    	// 선 투명도 strokeOpacity
	    	var strokeOpacity = Math.ceil((1 - attr.strokeOpacity) * 100);
	    	$('#txtOpa').val(strokeOpacity);
	    	//$('#sliderOpa').slider("value", strokeOpacity);
	    	// 선 스타일 strokeDashstyle
	    	//handlerSelStyle.selectedIndex($("#selStyle option").index($("#selStyle option[value='" + attr.strokeDashstyle + "']").get(0)));
	    	// 면색 fillColor
	    	$('#colorAttrPoly').val(attr.fillColor);
	    	$('#colorAttrPoly').css("background-color", attr.fillColor);
	    	// 면투명도 fillOpacity
	    	var fillOpacity = Math.ceil((1 - attr.fillOpacity) * 100);
	    	$('#txtOpaPoly').val(fillOpacity);
	    	//$('#sliderOpaPoly').slider("value", fillOpacity);
	    	
	    	// IE Height 버그로 인하여 수정
	    	$('#sliderOpa .ui-slider-range').css('height', $('#sliderOpa .ui-slider-range').parent().innerHeight());
	    	$('#sliderOpaPoly .ui-slider-range').css('height', $('#sliderOpaPoly .ui-slider-range').parent().innerHeight());
	    	
	    	//$("#liSubmit .btnApply").unbind('click');
	    	$("#liSubmit .btnApply").click(function (){ginnoMap.prototype.fn_multiApply_attr();});
    	}
    },
    
    /**********************************************************************************
     * 함수명 : fn_multiApply_attr
     * 설 명 : 사용자가 수정한 스타일을 선택한 Feature들에 적용
     * 사용법 : fn_multiApply_attr()
     * 작성일 : 2013.08.26
     * 작성자 : 제품개발팀 이경찬
     * 수정일				수정자			수정내용
     * ----------------------------------------------------------------------
     * 2013.08.26		이경찬			최초 생성
     * 
     **********************************************************************************/
    fn_multiApply_attr: function () {
    	var features = gMap.drawTool.map.getLayerByName('GDrawToolLayer').selectedFeatures;
    	for(var i in features){
    		var attr = features[i].attributes;
    		//선 색 strokeColor
    		attr.strokeColor = $('#colorAttr').val();
    		// 선 두께 strokeWidth
    		attr.strokeWidth = $('#txtThickness').val();
    		// 선 투명도 strokeOpacity
    		attr.strokeOpacity = 1 - ($('#txtOpa').val() / 100);
    		// 선 스타일 strokeDashstyle
    		attr.strokeDashstyle = $("#selStyle").val();
    		// 면색 fillColor
    		attr.fillColor = $('#colorAttrPoly').val();
    		// 면투명도 fillOpacity
    		attr.fillOpacity = 1 - ($('#txtOpaPoly').val() / 100);
    		
    		attr.originStrokeColor = $('#colorAttr').val();
        	attr.originFillColor = $('#colorAttrPoly').val();
    	}
    	gMap.drawTool.redraw();
    },

	CLASS_NAME: "ginnoMap"
});