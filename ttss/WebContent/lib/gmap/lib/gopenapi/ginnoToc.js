/**********************************************************************************
 * 파일명 : ginnoToc.js
 * 설 명 : Ginno Open API TOC Class
 * 필요 라이브러리 : OpenLayers, GMap
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2014.07.03		이경찬				0.1					최초 생성
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
ginnoToc = OpenLayers.Class({
	/**
	 * TOC Data
	 */
	data : null,

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
	initialize: function (jstreeDiv, data) {
		var strDiv = "#" + jstreeDiv;

		// 레이어 관리 트리 생성
		$(strDiv).jstree({
			"plugins" : ["types", "checkbox", "dnd", "state", "contextmenu"],
			"core" : {
			    //'data' : ['Simple root node', {'text' : 'Root node 2','state' : {'opened' : true,'selected' : true},'children' : [{ 'text' : 'Child 1' },'Child 2']}]
				'data' : ginnoToc.prototype.fn_create_treeJson(data)
			  },
			  "types" : {
					"valid_children" : [ "tmap" ],
					"types" : {
						"style" : {
							"valid_children" : "none",
							"start_drag" : false
						},
						"layer" : {
							"valid_children" : "style"
						},
						"group" : {
							"valid_children" : "layer"
						},
						"root" : {
							"valid_children" : "group",
							"rename" : false,
							"start_drag" : false,
							"move_node" : false,
							"delete_node" : false,
							"remove" : false
						},
						"tmap" : {
							"valid_children" : [ "layer" ],
							"rename" : false,
							"start_drag" : false,
							"move_node" : false,
							"delete_node" : false,
							"remove" : false
						}
					}
				}
		});

		/*// 트리 생성 후 이벤트 바인딩
		$(strDiv).bind(
			"loaded.jstree",
			function() {
				$("#layerTree li[show=1]").each( function() {
					$(strDiv).jstree("check_node", $(this));
				});
				
				// 레이어 on/off
				$("#layerTree a ins.jstree-checkbox").click(function() {
					var element = $(this).parent().parent();
					if(element.attr("id").indexOf("root") > -1){
						if(element.attr("class").indexOf("undetermined") > -1 || element.attr("class").indexOf("unchecked") > -1)
						{
							// 레이어 전체 해제 (모든 레이어정보 안주면 모든 레이어 표시되도록 설정되어있음)
							$(strDiv).jstree("uncheck_all");
							var element = $(strDiv).find("li.group");
							$(element).each(function(index){
								$(element).find("li.layer").each(function(index) {
									var layerId = $(this).attr("id").replace("layer_","");
									layerTool.setLayerAttr({
										con : "id",
										conVal : layerId,
										attr : "show",
										value : null
									});
								});
								$(element).find("li.style").each(function(index) {
									var sld = layerTool.getSld();
									var tmpStr = $(this).attr("id").replace("style_", "").replace("_symbol", "");
									var arrInx = tmpStr.split("_");
									var rule = sld.data.namedLayers[arrInx[0]].userStyle[arrInx[1]].rules[arrInx[2]];
									rule.hidden = true;
								});
							});
							fn_redraw_wms("unChkAll");
						}
						else if(element.attr("class").indexOf("jstree-checked")){
							// 레이어 전체 선택
							$(strDiv).jstree("check_all");
							var element = $(strDiv).find("li.group");
							$(element).each(function(index){
								$(element).find("li.layer").each(function(index) {
									var layerId = $(this).attr("id").replace("layer_","");
									layerTool.setLayerAttr({
										con : "id",
										conVal : layerId,
										attr : "show",
										value : 1
									});
								});
								$(element).find("li.style").each(function(index) {
									var sld = layerTool.getSld();
									var tmpStr = $(this).attr("id").replace("style_", "").replace("_symbol", "");
									var arrInx = tmpStr.split("_");
									var rule = sld.data.namedLayers[arrInx[0]].userStyle[arrInx[1]].rules[arrInx[2]];
									rule.hidden = false;
									
								});
							});
							fn_redraw_wms();
						}
					}
					else if(element.attr("id").indexOf("group_") > -1) {
						$(element).find("li.layer").each(function(index) {
							var layerId = $(this).attr("id").replace("layer_","");
							if ($(strDiv).jstree("is_checked", element)) {
								layerTool.setLayerAttr( {
									con : "id",
									conVal : layerId,
									attr : "show",
									value : null
								});
							} else {
								layerTool.setLayerAttr( {
									con : "id",
									conVal : layerId,
									attr : "show",
									value : 1
								});
							}
						});
						
						$(element).find("li.style").each(function(index) {
							var sld = layerTool.getSld();
							var tmpStr = $(this).attr("id").replace("style_", "").replace("_symbol", "");
							var arrInx = tmpStr.split("_");
							var rule = sld.data.namedLayers[arrInx[0]].userStyle[arrInx[1]].rules[arrInx[2]];
							
							if ($(strDiv).jstree("is_checked",element)) {
								rule.hidden = true;
							}
							else {
								rule.hidden = false;
							}
						});
					}
					else if (element.attr("id").indexOf("layer_") > -1) {
						if ($(strDiv).jstree("is_checked",element)) {
							layerTool.setLayerAttr( {
								con : "id",
								conVal : element.attr("id").replace("layer_", ""),
								attr : "show",
								value : null
							});
						} 
						else {
							layerTool.setLayerAttr( {
								con : "id",
								conVal : element.attr("id").replace("layer_", ""),
								attr : "show",
								value : 1
							});
						}
						
						$(element).find("li.style").each(function(index) {
							var sld = layerTool.getSld();
							var tmpStr = $(this).attr("id").replace("style_", "").replace("_symbol", "");
							var arrInx = tmpStr.split("_");
							var rule = sld.data.namedLayers[arrInx[0]].userStyle[arrInx[1]].rules[arrInx[2]];
							
							if ($(strDiv).jstree("is_checked",element)) {
								rule.hidden = true;
							}
							else {
								rule.hidden = false;
							}
						});
					}
					else {
						var sld = layerTool.getSld();
						var tmpStr = element.attr("id").replace("style_", "").replace("_symbol", "");
						var arrInx = tmpStr.split("_");
						var rule = sld.data.namedLayers[arrInx[0]].userStyle[arrInx[1]].rules[arrInx[2]];
						
						var lyrElement = (element).parent().parent();
						if (!$(strDiv).jstree("is_checked",lyrElement)) {
							layerTool.setLayerAttr( {
								con : "id",
								conVal : lyrElement.attr("id").replace("layer_", ""),
								attr : "show",
								value : 1
							});
						} 
						else {
							layerTool.setLayerAttr( {
								con : "id",
								conVal : lyrElement.attr("id").replace("layer_", ""),
								attr : "show",
								value : null
							});
						}
						
						if ($(strDiv).jstree("is_checked",element)) {
							rule.hidden = true;
						}
						else {
							rule.hidden = false;
						}
					}
					
					fn_redraw_wms();
				});
			}
		);
		
		// 레이어 Open시 스타일의 심볼 표현
		$(strDiv).bind("open_node.jstree", function(e, data) {
			if($(data.rslt.obj[0]).attr("rel")=="layer") {
				$(data.rslt.obj[0]).find("li[rel=style]").each(function() {
					if($(this).attr("id").indexOf("symbol") >= 0) {
						var id = $(this).attr("id").replace("style_", "").replace("_symbol", "");
						var indexArr = id.split("_");
						
						if($(this).find("a ins.jstree-icon").css("background-image").indexOf("blank") >= 0) {
							var sld = layerTool.getSld();
							var symbolizer = sld.data.namedLayers[indexArr[0]].userStyle[indexArr[1]].rules[indexArr[2]].symbolizer;
							var imgUrl;
							
							//rule view check
							if (!$(strDiv).jstree("is_checked",data.rslt.obj[0])) {
								sld.data.namedLayers[indexArr[0]].userStyle[indexArr[1]].rules[indexArr[2]].hidden = true;
							}
							
							if(symbolizer["point"]) {
								imgUrl = GRequest.WMS.getLegendGraphic(serviceUrl, {
									layer : sld.data.namedLayers[indexArr[0]].name,
									style : sld.data.namedLayers[indexArr[0]].userStyle[indexArr[1]].name,
									rule : sld.data.namedLayers[indexArr[0]].userStyle[indexArr[1]].rules[indexArr[2]].name
								});
							}
							else {
								var obj = {
									width : 16,
									height : 16
								};
								
								if(symbolizer["polygon"]) {
									obj.strFillColor = symbolizer["polygon"].fillColor.replace("#", "");
									if(symbolizer["line"]) {
										obj.strColor = symbolizer["line"].stroke.replace("#", "");
									}
									imgUrl = "/gmap/getPolygonSymbol.do?" + GUtil.fn_convert_objToStr(obj);
								}
								else if(symbolizer["line"]) {
									obj.strColor = symbolizer["line"].stroke.replace("#", "");
									imgUrl = "/gmap/getLineSymbol.do?" + GUtil.fn_convert_objToStr(obj);
								}
							}
							$(this).find("a ins.jstree-icon").css("background-image", "url("+imgUrl+")");
						}
					}
				});
			}
		});
		
		// Drag로 레이어 순서 변경시 layerTool.layers의 seq값을 변경하여 보여지는 순서 변경
		$(strDiv).bind("move_node.jstree", function(e, data) {
			
			 * data.rslt.o.attr("id") // 이동한 노드의 id
			 * data.rslt.r.attr("id") // reference node(참조 노드)의 id
			 * 
			 * data.rslt.np.attr("id") // 이동 후 부모 노드의 id
			 * data.rslt.op.attr("id") // 이동 전 부모 노드의 id
			 * 
			 * data.rslt.cr.attr("id") // 이동 후 루트 노드의 id
			 * data.rslt.or.attr("id") // 이동 전 루트 노드의 id
			 
			var element = $("#" + data.rslt.o.attr("id"));
			var prevElementId = $(element).prev().attr("id");
			var nextElementId = $(element).next().attr("id");
			
			if($(element).attr("id").split("_")[0] == "group"){
				
			}
			else if($(element).attr("id").split("_")[0] == "layer"){
				if($(element).prev().size() == 0 || $(element).prev().attr("seq") > $(element).attr("seq")){
					// 위로 올리기
					layerTool.setLayerAttr({
						con : "id",
						conVal : $(element).attr("id").replace("layer_", ""),
						attr : "seq",
						value : $(element).next().attr("seq")
					});
					
					$(element).attr("seq", $(element).next().attr("seq"));
					
					var until = document.getElementById(prevElementId);
					$(element).nextUntil(until, ".layer").each(function(){
						layerTool.setLayerAttr( {
							con : "id",
							conVal : $(this).attr("id").replace("layer_", ""),
							attr : "seq",
							value : (($(this).attr("seq")) * 1) - 1
						});
						
						$(this).attr("seq", (($(this).attr("seq")) * 1) - 1);
					});
				}
				
				if($(element).next().size() == 0 || $(element).prev().attr("seq") < $(element).attr("seq")){
					// 아래로 내리기
					layerTool.setLayerAttr({
						con : "id",
						conVal : $(element).attr("id").replace("layer_", ""),
						attr : "seq",
						value : $(element).prev().attr("seq")
					});
					
					$(element).attr("seq", $(element).prev().attr("seq"));
					
					$(element).prevUntil("#" + nextElementId).each(function(){
						layerTool.setLayerAttr( {
							con : "id",
							conVal : $(this).attr("id").replace("layer_", ""),
							attr : "seq",
							value : (($(this).attr("seq")) * 1) + 1
						});
						
						$(this).attr("seq", (($(this).attr("seq")) * 1) + 1);
					});
				}
			}
			
			fn_redraw_wms();
		});
		
		// 레이어 Style 수정 탭으로 변경
		$(strDiv).bind("click.jstree", function(e) {
			if($(e.target).parent().attr("rel") == 'style') {
				var id = $(e.target).parent().attr("id").replace("style_", "");
				
				var indexArr = id.split("_");
				fn_bind_style(indexArr[0], indexArr[1], indexArr[2], indexArr[3], $(e.target).parent().attr("id"));
				
				// Style(Rule) 선택시 속성 편집 DIV로 전환
				fn_switch_content(2);
			}
		});
		
		fn_switch_content(0);*/
    },
    
    fn_create_treeJson: function(data){
    	var rootObjs = [];
    	var groupObjs = [];
    	var layerObjs = [];
    	var styleObjs = [];
    	
    	for(var i in data){
    		if(i.indexOf("root") != -1){
    			
    		}
    		else if(i.indexOf("group") != -1){
    			
    		}
    		else if(i.indexOf("layer") != -1){
    			
    		}
    		else if(i.indexOf("style") != -1){
    			
    		}
    	}
    	
    	var imgUrl = GRequest.WMS.getLegendGraphic(g2WebServiceUrl, {
			layer : "법정읍면동",
			style : "법정읍면동",
			rule : "법정읍면동_스타일"
		});
    	
    	var rootObj = {
			id : "root", // will be autogenerated if omitted
		    text : "root", // node text
		    icon : "string", // string for custom
		    state : {
		    	opened : false,  // is the node open
				disabled : false,  // is the node disabled
				selected : false // is the node selected
				},
		    children : [],  // array of strings or objects
		    li_attr : {},  // attributes for the generated LI node
		    a_attr : {}  // attributes for the generated A node
    	};
    	
    	var groupObj = {
			id : "group", // will be autogenerated if omitted
		    text : "group", // node text
		    icon : "string", // string for custom
		    state : {
		    	opened : false,  // is the node open
				disabled : false,  // is the node disabled
				selected : false // is the node selected
				},
		    children : [],  // array of strings or objects
		    li_attr : {},  // attributes for the generated LI node
		    a_attr : {}  // attributes for the generated A node
		};
    	
    	var layerObj = {
			id : "layer", // will be autogenerated if omitted
		    text : "layer", // node text
		    icon : "string", // string for custom
		    state : {
		    	opened : false,  // is the node open
				disabled : false,  // is the node disabled
				selected : false // is the node selected
				},
		    children : [],  // array of strings or objects
		    li_attr : {},  // attributes for the generated LI node
		    a_attr : {}  // attributes for the generated A node
		};
    	
    	// 레이어 리스트 파싱해서 json 객체 트리구조로 반환
    	/*var resObj = {
    			ginno: {
    				
    			}
    	};
    	
    	return resObj;*/
    	
    },

	CLASS_NAME: "ginnoToc"
});