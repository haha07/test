/**********************************************************************************
 * 파일명 : GSLDTool.js
 * 설 명 : 지도 SLD_BODY 객체 형태로 관리
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2012.05.23		이경찬				0.1					최초 생성
 * 2012.05.24		이경찬				0.2					getSLDXML 생성
 * 2012.05.25		이경찬				0.3					getXMLSLD 생성
 * 2012.05.25		이경찬				0.4					searchNamedLayer 생성 (명칭검색)
 * 															searchRule 생성 (명칭검색)
 * 2012.05.25		이경찬				0.5					createMapTopic, createNamedLayers
 * 															createUserStyle, createRules
 * 															createSymbolizer 생성 (속성으로 객체생성)
 * 															regNamedLayers, regUserStyle
 * 															regRules, regSymbolizer 생성 (상위 객체에 해당객체 등록)
 * 															updateNamedLayer(해당 NamedLayer 수정 or 추가)
 * 															delNamedLayer, delRule
 * 															delSymbolizer 생성 (해당 객체 삭제)
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/
GSLDTool = OpenLayers.Class({
	/*
	 *  SLD_BODY의 XML 타입
	 */
	xml : null,
	
	/*
	 *  SLD_BODY의 JSON 객체 타입
	 */
	data : null,
	
	/*
	 *  TagName List 
	 */
	tagNameList : {
		NamedLayer : "sld:NamedLayer",
		UserStyle : "sld:UserStyle",
		Rule : "se:Rule",
		Name : "se:Name",
		Description : "se:Description",
		Title : "se:Title",
		LayerFeatureConstraints : "sld:LayerFeatureConstraints",
		FeatureTypeName : "se:FeatureTypeName",
		FeatureTypeStyle : "se:FeatureTypeStyle",
		Filter : "ogc:Filter",
		PropertyIsEqualTo : "PropertyIsEqualTo",
		PropertyName : "ogc:PropertyName",
		Literal : "Literal",
		PropertyIsGreaterThanOrEqualTo : "PropertyIsGreaterThanOrEqualTo",
		PropertyIsLessThan : "PropertyIsLessThan",
		PropertyIsGreaterThan : "PropertyIsGreaterThan",
		MinScaleDenominator : "se:MinScaleDenominator",
		MaxScaleDenominator : "se:MaxScaleDenominator",
		PointSymbolizer : "se:PointSymbolizer",
		LineSymbolizer : "se:LineSymbolizer",
		PolygonSymbolizer : "se:PolygonSymbolizer",
		TextSymbolizer : "se:TextSymbolizer",
		Size : "se:Size",
		Opacity : "se:Opacity",
		Rotation : "se:Rotation",
		Displacement : "se:Displacement",
		DisplacementX : "se:DisplacementX",
		DisplacementY : "se:DisplacementY",
		ExternalGraphic : "se:ExternalGraphic",
		InlineContent : "se:InlineContent",
		Format : "se:Format",
		Graphic : "se:Graphic",
		Mark : "se:Mark",
		VendorOption : "sld:VendorOption",
		SvgParameter : "se:SvgParameter",
		Font : "se:Font",
		LabelPlacement : "se:LabelPlacement",
		PointPlacement : "se:PointPlacement",
		LinePlacement : "se:LinePlacement",
		Halo : "se:Halo",
		Radius : "se:Radius",
		Fill : "se:Fill",
		And : "ogc:And",
		Or : "ogc:Or"
	},
	
	/*
	 * Browser Name
	 */
	browserName : GUtil.getBrowserName(),
	
	/*
	 *  DefaultLayers
	 */
	defaultLayers : [],
	
	/**********************************************************************************
	* 함수명 : initialize (생성자 함수)
	* 설 명 : GSLD 객체 생성
	* 인 자 : xml (SLD_BODY의 XML String 형태)
	* 사용법 : new GSLD(xml)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	initialize : function(sld,type){
		if(this.browserName != "msie" && this.browserName != "firefox" ){
			for(var i in this.tagNameList){
				var tmp = this.tagNameList[i].split(":");
				if(tmp.length > 1){
					this.tagNameList[i] = tmp[1]; 
				}
			}
		}

		if(type == "xml"){
			this.xml = sld;
			this.data = this.getSLDObj(sld);
		}
		else if(type == "obj"){
			this.xml = this.getSLDXML(sld);
			this.data = sld.data;
		}
		
	},
	
	getData : function() {
		return this.data;
	},
	
	/**********************************************************************************
	* 함수명 : getSLDObj
	* 설 명 : XML형태의 SLD_BODY를 Object(Json)형태로 변환
	* 인 자 : xml (SLD_BODY의 XML String 형태)
	* 사용법 : getSLDObj(xml)
	* 작성일 : 2012.05.23
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 2012.05.23		이경찬		NamedLayer, UserStyle, Rule별로 함수화
	* 
	**********************************************************************************/
	getSLDObj : function(xml) {
		var data;
		var namedObj;
		var userdObj;
		var ruleObj;
		
		var namedLayers;
		var userStyles;
		var rules;
		
		data = this.readMapTopic(xml);
		namedLayers = xml.getElementsByTagName(this.tagNameList.NamedLayer);
		for(var i=0, iLen=namedLayers.length ; i < iLen ; i++){
			namedObj =  this.readNamedLayer(namedLayers[i]);
			userStyles = namedLayers[i].getElementsByTagName(this.tagNameList.UserStyle);
			for(var j=0, jLen=userStyles.length ; j < jLen ; j++){
				userdObj = this.readUserStyle(userStyles[j]);
				rules = userStyles[j].getElementsByTagName(this.tagNameList.Rule);
				for(var k=0, kLen=rules.length ; k < kLen ; k++){
					ruleObj = this.readRule(rules[k]);
					userdObj.rules.push(ruleObj);
				}
				namedObj.userStyle.push(userdObj);
			}
			data.namedLayers.push(namedObj);
		}
		
		return data;
	},

	/**********************************************************************************
	* 함수명 : readMapTopic
	* 설 명 : XML형태의 SLD_BODY에서 MapTopic부분의 정보를 파싱하고 Object(Json)형태로 return
	* 인 자 : xml (SLD_BODY의 XML String 형태)
	* 사용법 : readMapTopic(xml)
	* 작성일 : 2012.05.23
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	readMapTopic : function(xml){
		var data = {
				name : "",
				title : "",
				namedLayers : []
		};
		
		var element = xml.getElementsByTagName(this.tagNameList.Name);
		
		// MapTopic 명  (서울 상수 맵토픽 이름 : MapTopic)
		if(element.length > 0) {
			data.name = $(xml.getElementsByTagName(this.tagNameList.Name)[0]).text();
		}
		
		element = xml.getElementsByTagName(this.tagNameList.Description);
		
		if(element.length > 0){
			var subElement = element[0].getElementsByTagName(this.tagNameList.Title);
			if(subElement.length > 0) data.title = $(subElement[0]).text();
		}
		
		return data;
		
	},
	
	/**********************************************************************************
	* 함수명 : readNamedLayer
	* 설 명 : XML형태의 SLD_BODY에서 NamedLayer부분의 정보를 파싱하고 Object(Json)형태로 return
	* 인 자 : namedLayers (SLD_BODY의 NamedLayer 엘리먼트 == <sld:NamedLayer>)
	* 사용법 : readNamedLayer(namedLayers)
	* 작성일 : 2012.05.23
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	readNamedLayer : function(namedLayers){
		var namedObj = {
			name : "",
			title : "",
			featureTypeName : "",
			userStyle : []
		};
		
		// NamedLayer 이름 ( 예> 제수밸브 )
		var element = namedLayers.getElementsByTagName(this.tagNameList.Name);
		if(element.length > 0) namedObj.name = $(element[0]).text();
		
		// Description (위의 NamedLayer명과 동일)
		element = namedLayers.getElementsByTagName(this.tagNameList.Description);
		if(element.length > 0) {
			var subElement = element[0].getElementsByTagName("se:Title");
			if(subElement.length > 0) namedObj.title = $(subElement[0]).text();
		}
		
		// LayerFeatureConstraints ( NamedLayer의 DB 명칭 : 예> TE_RVLV )
		element = namedLayers.getElementsByTagName(this.tagNameList.LayerFeatureConstraints);
		if(element.length > 0) {
			subElement = element[0].getElementsByTagName(this.tagNameList.FeatureTypeName);
			if(subElement.length > 0) namedObj.featureTypeName = $(subElement[0]).text();
		}
		
		return namedObj;
		
	},
	
	/**********************************************************************************
	* 함수명 : readUserStyle
	* 설 명 : XML형태의 SLD_BODY에서 UserStyle부분의 정보를 파싱하고 Object(Json)형태로 return
	* 		 (현재 상수도 프로젝트에서는 UserStyle를 활용하지 않음.)
	* 인 자 : userStyles (SLD_BODY의 UserStyle 엘리먼트 == <sld:UserStyle>)
	* 사용법 : readUserStyle(userStyles)
	* 작성일 : 2012.05.23
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	readUserStyle : function(userStyles){
		// UserStyle
		var userdObj = {
			name : "",
			title : "",
			featureTypeName : "",
			rules : []
		};
		
		// UserStyle 이름 (현재 상수에선 따로 사용하지 않는다.)
		var element = userStyles.getElementsByTagName(this.tagNameList.Name);
		if(element.length > 0) userdObj.name = $(element[0]).text();
		
		// Description (위의 UserStyle 이름과 동일)
		element = userStyles.getElementsByTagName(this.tagNameList.Description);
		if(element.length > 0) {
			subElement = element[0].getElementsByTagName(this.tagNameList.Title);
			if(subElement.length > 0) userdObj.title = $(subElement[0]).text();
		}
		
		// FeatureTypeStyle (위의 UserStyle 이름과 동일)
		element = userStyles.getElementsByTagName(this.tagNameList.FeatureTypeStyle);
		if(element.length > 0) {
			subElement = element[0].getElementsByTagName(this.tagNameList.FeatureTypeName);
			if(subElement.length > 0) userdObj.featureTypeName = $(subElement[0]).text();
		}
			
		return userdObj;
		
	},
	
	/**********************************************************************************
	* 함수명 : readRule
	* 설 명 : XML형태의 SLD_BODY에서 Rule 정보를 파싱하고 Object(Json)형태로 return
	* 인 자 : rules (SLD_BODY의 Rule 엘리먼트 == <se:Rule>)
	* 사용법 : readRule(rules)
	* 작성일 : 2012.05.23
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 2012.05.24		이경찬		Symbolizer 함수화
	**********************************************************************************/
	readRule : function(rules){
		var ruleObj = {
			name : "",
			filterName : "",
			filterLiteral : "",
			minScale : "",
			maxScale : "",
			symbolizer : {}
		};
		
		// Rule 이름 ( 예> 제수밸브의 개, 폐, 부분 )
		var element = rules.getElementsByTagName(this.tagNameList.Name);
		if(element.length > 0) ruleObj.name = $(element[0]).text();
		
		// Filter (사업소경계중 남부수도사업소만 보여주고 싶을 때)
		element = rules.getElementsByTagName(this.tagNameList.Filter);
		if(element.length > 0) {
			subElement = element[0].getElementsByTagName(this.tagNameList.PropertyIsEqualTo);
			if(subElement.length > 0) {
				ruleObj.filterName_equal = $(subElement[0].getElementsByTagName(this.tagNameList.PropertyName)[0]).text();
				ruleObj.filterLiteral_equal = $(subElement[0].getElementsByTagName(this.tagNameList.Literal)[0]).text();
			}
			
			subElement = element[0].getElementsByTagName(this.tagNameList.PropertyIsGreaterThanOrEqualTo);
			if(subElement.length > 0){
				ruleObj.filterName_more = [];
				ruleObj.more = [];
				for(var i=0,len=subElement.length ; i<len ; i++){
					ruleObj.filterName_more.push($(subElement[i].getElementsByTagName(this.tagNameList.PropertyName)[0]).text());
					ruleObj.more.push($(subElement[i].getElementsByTagName(this.tagNameList.Literal)[0]).text());
				}
			}
			subElement = element[0].getElementsByTagName(this.tagNameList.PropertyIsLessThan);
			if(subElement.length > 0){
				ruleObj.filterName_less = [];
				ruleObj.less = [];
				for(var i=0,len=subElement.length ; i<len ; i++){
					ruleObj.filterName_less.push($(subElement[i].getElementsByTagName(this.tagNameList.PropertyName)[0]).text());
					ruleObj.less.push($(subElement[i].getElementsByTagName(this.tagNameList.Literal)[0]).text());
				}
			}
			
			subElement = element[0].getElementsByTagName(this.tagNameList.PropertyIsGreaterThan);
			if(subElement.length > 0){
				ruleObj.filterName_greater = $(subElement[0].getElementsByTagName(this.tagNameList.PropertyName)[0]).text(); 
				ruleObj.filterLiteral_greater = $(subElement[0].getElementsByTagName(this.tagNameList.Literal)[0]).text();
			}
		}
		// MinScaleDenominator (유효축척의 MinScale값)
		element = rules.getElementsByTagName(this.tagNameList.MinScaleDenominator);
		if(element.length > 0) ruleObj.minScale = $(element[0]).text();
		
		// MaxScaleDenominator (유효축척의 MaxScale값)
		element = rules.getElementsByTagName(this.tagNameList.MaxScaleDenominator);
		if(element.length > 0) ruleObj.maxScale = $(element[0]).text();
		
		// Symbolizer (종류 : PointSymbolizer, LineSymbolizer, PolygonSymbolizer, TextSymbolizer)
		var points = rules.getElementsByTagName(this.tagNameList.PointSymbolizer);
		var lines = rules.getElementsByTagName(this.tagNameList.LineSymbolizer);
		var polygons = rules.getElementsByTagName(this.tagNameList.PolygonSymbolizer);
		var texts = rules.getElementsByTagName(this.tagNameList.TextSymbolizer);
		
		if(points.length > 0) {
			ruleObj.symbolizer["point"] = this.readPointSym(points);
		}
		
		if(lines.length > 0) {
			ruleObj.symbolizer["line"] = this.readLineSym(lines);
		}
		
		if(polygons.length > 0) {
			ruleObj.symbolizer["polygon"] = this.readPolySym(polygons);
		}
		
		if(texts.length > 0) {
			ruleObj.symbolizer["text"] = this.readTextSym(texts);
		}
		
		return ruleObj;
		
	},
	
	/**********************************************************************************
	* 함수명 : readPointSym
	* 설 명 : XML형태의 SLD_BODY에서 Rule내부의 PointSymbolizer 정보를 파싱하고 Object(Json)형태로 return
	* 인 자 : points (SLD_BODY의 PointSymbolizer 엘리먼트 == <se:PointSymbolizer>)
	* 사용법 : readPointSym(points)
	* 작성일 : 2012.05.24
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.24		이경찬		최초 생성
	* 
	**********************************************************************************/
	readPointSym : function(points){
		var pointObj = {};
		
		// PointSymbolizer 타입
		pointObj["type"] = "point";
		
		// PointSymbolizer 버전
		pointObj["version"] = points[0].getAttribute("version");
		
		// PointSymbolizer 이름
		var symbolName = points[0].getElementsByTagName(this.tagNameList.Name);
		if(symbolName.length > 0) pointObj["name"] = $(symbolName[0]).text();
		
		// Point Size 크기
		var svgParam = points[0].getElementsByTagName(this.tagNameList.Size);
		if(svgParam.length > 0) pointObj["size"] = $(svgParam[0]).text();
		
		// Point Opacity 투명도
		svgParam = points[0].getElementsByTagName(this.tagNameList.Opacity);
		//if(svgParam.length > 0) pointObj["opacity"] = svgParam[0].text;
		if(svgParam.length > 0) pointObj["opacity"] = "1.0";
		
		// Point Rotation 회전
		svgParam = points[0].getElementsByTagName(this.tagNameList.Rotation);
		if(svgParam.length > 0) {
			var rotation = svgParam[0].getElementsByTagName(this.tagNameList.PropertyName);
			if(rotation.length > 0) pointObj["rotation"] = $(rotation[0]).text();
		}
		
		
		// Point Displacement X,Y
		svgParam = points[0].getElementsByTagName(this.tagNameList.Displacement);
		if(svgParam.length > 0) {
			var x = svgParam[0].getElementsByTagName(this.tagNameList.DisplacementX);
			if(x.length > 0) pointObj["displacementX"] = $(x[0]).text(0);
			
			var y = svgParam[0].getElementsByTagName(this.tagNameList.DisplacementY);
			if(y.length > 0) pointObj["displacementY"] = $(y[0]).text();
		}
		
		// Point Symbol Image 심볼이미지
		var externalGraphics = points[0].getElementsByTagName(this.tagNameList.ExternalGraphic);
		if(externalGraphics.length > 0) {
			// InlineContent (Base64인코딩된 이미지)
			var inlineContents = externalGraphics[0].getElementsByTagName(this.tagNameList.InlineContent);
			if(inlineContents.length > 0) {
				pointObj["externalGraphic"] = $(inlineContents[0]).text();
				pointObj["encoding"] = inlineContents[0].getAttribute("encoding");
			}
			
			// Format (이미지 형식 : 예> image/png)
			var format = externalGraphics[0].getElementsByTagName(this.tagNameList.Format);
			if(format.length > 0) pointObj["format"] = $(format[0]).text();
		}
		
		// Point Symbol Mark 심볼마커
		var graphic = points[0].getElementsByTagName(this.tagNameList.Graphic);
		if(graphic.length > 0){
			var mark = graphic[0].getElementsByTagName(this.tagNameList.Mark);
			if(mark.length > 0){
				var vendor = mark[0].getElementsByTagName(this.tagNameList.VendorOption);
				for(var i=0, len=vendor.length ; i < len ; i++){
					if(vendor[i].getAttribute("name") == "font-family"){
						pointObj["markFont"] = $(vendor[i]).text();
					}
					else if(vendor[i].getAttribute("name") == "char-code"){
						pointObj["markCharCode"] = $(vendor[i]).text();
					}
					else if(vendor[i].getAttribute("name") == "fill"){
						pointObj["markFill"] = $(vendor[i]).text();
					}
				}
			}
		}
		return pointObj;
		
	},
	
	/**********************************************************************************
	* 함수명 : readLineSym
	* 설 명 : XML형태의 SLD_BODY에서 Rule내부의 LineSymbolizer 정보를 파싱하고 Object(Json)형태로 return
	* 인 자 : lines (SLD_BODY의 LineSymbolizer 엘리먼트 == <se:LineSymbolizer>)
	* 사용법 : readLineSym(lines)
	* 작성일 : 2012.05.24
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.24		이경찬		최초 생성
	* 
	**********************************************************************************/
	readLineSym : function(lines){
		var lineObj = {};
		
		// LineSymbolizer 타입
		lineObj["type"] = "line";
		
		// LineSymbolizer 버전
		lineObj["version"] = lines[0].getAttribute("version");
		
		// LineSymbolizer 이름
		var symbolName = lines[0].getElementsByTagName(this.tagNameList.Name);
		if(symbolName.length > 0) lineObj["name"] = $(symbolName[0]).text();
		
		if(lineObj["name"] == "CompositeLineCap"){
			lineObj.arrow = true;
		}
		if(lineObj["name"] == "CompositeLineMarker"){
			lineObj.marker = true;
		}
		
		// LineSymbolizer 속성
		var svgParam = lines[0].getElementsByTagName(this.tagNameList.SvgParameter);
		for(var l=0, lLen=svgParam.length; l < lLen; l++) {
			// Line 색 ( 예> #ffffff )
			if(svgParam[l].getAttribute("name") == "stroke") {
				lineObj["stroke"] = $(svgParam[l]).text();
			}
			// Line width 두께
			if(svgParam[l].getAttribute("name") == "stroke-width") {
				lineObj["strokeWidth"] = $(svgParam[l]).text();
			}
			// Line opacity 투명도
			if(svgParam[l].getAttribute("name") == "stroke-opacity") {
				lineObj["strokeOpacity"] = $(svgParam[l]).text();
			}
			// Line linecap 모서리 스타일
			if(svgParam[l].getAttribute("name") == "stroke-linecap") {
				lineObj["strokeLinecap"] = $(svgParam[l]).text();
			}
			// Line dasharray 선 스타일
			if(svgParam[l].getAttribute("name") == "stroke-dasharray") {
				var dashArray = 0;
				var arr = $(svgParam[l]).text().split(",");
				
				//점선 2.0,2.0
				if(parseInt(arr[0]) == 2) {
					dashArray = "dot";
				}
				//파선 7.0,3.0								
				else if(parseInt(arr[0]) == 7) {
					dashArray = "dash";
				}
				//일점 쇄선 10.0,2.0,2.0,2.0							
				else if(parseInt(arr[0]) == 10) {
					dashArray = "dashdot";
				}
				else {
					dashArray = "solid";
				}
				/*//이점 쇄선 10.0,2.0,2.0,2.0,2.0,2.0
				else if(dashArray == "10.0,2.0,2.0,2.0,2.0,2.0") {
				}*/
				lineObj["strokeDashArray"] = dashArray;
			}
			// Line linejoin 선 연결지점 모양
			if(svgParam[l].getAttribute("name") == "stroke-linejoin") {
				lineObj["strokeLinejoin"] = $(svgParam[l]).text();
			}
		}
		var svgParam = lines[0].getElementsByTagName(this.tagNameList.VendorOption);
		if(svgParam.length > 0){
			lineObj["cap_style"] = [];
			lineObj["cap_size"] = [];
			lineObj["cap_color"] = [];
			lineObj["cap_fill"] = [];
			lineObj["cap_position"] = [];
		}
		for(var l=0, lLen=svgParam.length; l < lLen; l++) {
			if(svgParam[l].getAttribute("name") == "cap_direction") {
				lineObj["cap_direction"] = $(svgParam[l]).text();
			}
			if(svgParam[l].getAttribute("name") == "cap_angle") {
				lineObj["cap_angle"] = $(svgParam[l]).text();
			}
			if(svgParam[l].getAttribute("name") == "start_cap") {
				lineObj["start_cap"] = $(svgParam[l]).text();
			}
			if(svgParam[l].getAttribute("name") == "end_cap") {
				lineObj["end_cap"] = $(svgParam[l]).text();
			}
			
			if(svgParam[l].getAttribute("name") == "cap_style") {
				lineObj["cap_style"].push($(svgParam[l]).text());
			}
			if(svgParam[l].getAttribute("name") == "cap_marker") {
				lineObj["cap_marker"].push($(svgParam[l]).text());
			}
			if(svgParam[l].getAttribute("name") == "cap_size") {
				lineObj["cap_size"].push($(svgParam[l]).text());
			}
			if(svgParam[l].getAttribute("name") == "cap_color") {
				lineObj["cap_color"].push($(svgParam[l]).text());
			}
			if(svgParam[l].getAttribute("name") == "cap_fill") {
				lineObj["cap_fill"].push($(svgParam[l]).text());
			}
			if(svgParam[l].getAttribute("name") == "cap_position") {
				lineObj["cap_position"].push($(svgParam[l]).text());
			}
			
		}
		return lineObj;
		
	},
	
	/**********************************************************************************
	* 함수명 : readPolySym
	* 설 명 : XML형태의 SLD_BODY에서 Rule내부의 PolygonSymbolizer 정보를 파싱하고 Object(Json)형태로 return
	* 인 자 : polygons (SLD_BODY의 PolygonSymbolizer 엘리먼트 == <se:PolygonSymbolizer>)
	* 사용법 : readPolySym(polygons)
	* 작성일 : 2012.05.24
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.24		이경찬		최초 생성
	* 
	**********************************************************************************/
	readPolySym : function(polygons){
		var polyObj = {};

		// PolygonSymbolizer 타입
		polyObj["type"] = "polygon";
		
		// PolygonSymbolizer 버전
		polyObj["version"] = polygons[0].getAttribute("version");
		
		// PolygonSymbolizer 이름
		var symbolName = polygons[0].getElementsByTagName(this.tagNameList.Name);
		if(symbolName.length > 0) polyObj["name"] = $(symbolName[0]).text();
		
		// PolygonSymbolizer 속성
		svgParam = polygons[0].getElementsByTagName(this.tagNameList.SvgParameter);
		for(var l=0, lLen=svgParam.length; l < lLen; l++) {
			// Polygon fill 면색 ( 예> #ffffff )
			if(svgParam[l].getAttribute("name") == "fill") {
				polyObj["fillColor"] = $(svgParam[l]).text();
			}
			// Polygon opacity 면 투명도
			if(svgParam[l].getAttribute("name") == "fill-opacity") {
				polyObj["fillOpacity"] = $(svgParam[l]).text();
			}
		}
		
		return polyObj;
		
	},
		
	/**********************************************************************************
	* 함수명 : readTextSym
	* 설 명 : XML형태의 SLD_BODY에서 Rule내부의 TextSymbolizer 정보를 파싱하고 Object(Json)형태로 return
	* 인 자 : texts (SLD_BODY의 TextSymbolizer 엘리먼트 == <se:TextSymbolizer>)
	* 사용법 : readTextSym(texts)
	* 작성일 : 2012.05.24
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.24		이경찬		최초 생성
	* 
	**********************************************************************************/
	readTextSym : function(texts){
		var textObj = {};
		
		// TextSymbolizer 타입
		textObj["type"] = "text";
		
		// TextSymbolizer 버전
		textObj["version"] = texts[0].getAttribute("version");
		
		// TextSymbolizer 이름
		var symbolName = texts[0].getElementsByTagName(this.tagNameList.Name);
		if(symbolName.length > 0) textObj["name"] = $(symbolName[0]).text();
		
		// 라벨 명 (DB의 컬럼명)
		element = texts[0].getElementsByTagName(this.tagNameList.Label);
		if(element.length > 0) {
			subElement = element[0].getElementsByTagName(this.tagNameList.PropertyName);
			if(subElement.length > 0) textObj["label"] = $(subElement[0]).text();
		}

		// Text Font 글자 모양
		var fonts = texts[0].getElementsByTagName(this.tagNameList.Font);
		if(fonts.length > 0) {
			svgParam = fonts[0].getElementsByTagName(this.tagNameList.SvgParameter);
			for(var l=0, lLen=svgParam.length; l < lLen; l++) {
				// Text family 서체 ( 예> 맑은고딕 )
				if(svgParam[l].getAttribute("name") == "font-family") {
					textObj["fontFamily"] = $(svgParam[l]).text();
				}
				// Text Size 글자 크기
				else if(svgParam[l].getAttribute("name") == "font-size") {
					textObj["fontSize"] = $(svgParam[l]).text();
				}
				// Text Style 글자 스타일
				else if(svgParam[l].getAttribute("name") == "font-style") {
					textObj["fontStyle"] = $(svgParam[l]).text();
				}
				//  Text weight 글자 두께
				else if(svgParam[l].getAttribute("name") == "font-weight") {
					textObj["fontWeight"] = $(svgParam[l]).text();
				}
			}
		}
		
		var LabelPlacement = texts[0].getElementsByTagName(this.tagNameList.LabelPlacement);
		if(LabelPlacement.length > 0){
			var PointPlacement = LabelPlacement[0].getElementsByTagName(this.tagNameList.PointPlacement);
			var LinePlacement = LabelPlacement[0].getElementsByTagName(this.tagNameList.LinePlacement);
			
			if(PointPlacement.length > 0){
				// Text Displacement
				var Displacement = PointPlacement[0].getElementsByTagName(this.tagNameList.Displacement);
				if(Displacement.length > 0) {
					var DisplacementX = Displacement[0].getElementsByTagName(this.tagNameList.DisplacementX);
					if(DisplacementX.length > 0) textObj["displacementX"] = $(DisplacementX[0]).text();
					
					var DisplacementY = Displacement[0].getElementsByTagName(this.tagNameList.DisplacementY);
					if(DisplacementY.length > 0) textObj["displacementY"] = $(DisplacementY[0]).text();
				}
			}
			
			if(LinePlacement.length > 0){
				var VendorOption = LinePlacement[0].getElementsByTagName(this.tagNameList.VendorOption);
				for(var m=0, mLen=VendorOption.length; m < mLen ; m++){
					// Text text_arrange_pos
					if(VendorOption[m].getAttribute("name") == "text_arrange_pos"){
						textObj["text_arrange_pos"] = $(VendorOption[m]).text();
					}
					// Text text_arrange_line 
					else if(VendorOption[m].getAttribute("name") == "text_arrange_line"){
						textObj["text_arrange_line"] = $(VendorOption[m]).text();
					}
					// Text text_arrange_gap
					else if(VendorOption[m].getAttribute("name") == "text_arrange_gap"){
						textObj["text_arrange_gap"] = $(VendorOption[m]).text();
					}
					// Text text_arrange_gap_value
					else if(VendorOption[m].getAttribute("name") == "text_arrange_gap_value"){
						textObj["text_arrange_gap_value"] = $(VendorOption[m]).text();
					}
				}
			}
		}
		
		var halo = texts[0].getElementsByTagName(this.tagNameList.Halo);
		if(halo.length > 0) {
			var radius = halo[0].getElementsByTagName(this.tagNameList.Radius);
			if(radius.length > 0) textObj["radius"] = $(radius[0]).text();
			
			var haloFill = halo[0].getElementsByTagName(this.tagNameList.Fill);
			if(haloFill.length > 0) {
				svgParam = haloFill[0].getElementsByTagName(this.tagNameList.SvgParameter);
				if(svgParam.length > 0){
					for(m=0, mLen=svgParam.length; m < mLen; m++) {
						if(svgParam[m].getAttribute("name") == "fill") {
							//글자 색
							textObj["haloColor"] = $(svgParam[m]).text();
						}
						else if(svgParam[m].getAttribute("name") == "fill-opacity") {
							//글자 투명도
							textObj["haloOpacity"] = $(svgParam[m]).text();
						}
					}
				}
			}
		}
		
		var fill = texts[0].getElementsByTagName(this.tagNameList.Fill);
		for(l=0; l < fill.length; l++) {
			svgParam = fill[l].getElementsByTagName(this.tagNameList.SvgParameter);
			if(svgParam.length > 0){
				for(m=0, mLen=svgParam.length; m < mLen; m++) {
					if(svgParam[m].getAttribute("name") == "fill") {
						//글자 색
						textObj["fillColor"] = $(svgParam[m]).text();
					}
					else if(svgParam[m].getAttribute("name") == "fill-opacity") {
						//글자 투명도
						textObj["fillOpacity"] = $(svgParam[m]).text();
					}
				}
			}
		}
		
		return textObj;
		
	},
	
	/**********************************************************************************
	* 함수명 : getSLDXML
	* 설 명 : Object(Json)형태의 SLD_BODY를 XML String형태로 변환
	* 인 자 : data (SLD_BODY의 MapTopic 객체)
	* 사용법 : getSLDXML(data)
	* 작성일 : 2012.05.24
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.24		이경찬		최초 생성
	* 
	**********************************************************************************/
	getSLDXML : function(data,defaultLayers,defaultSld) {
		if(defaultLayers){
			this.defaultLayers = defaultLayers.split(",");
		}
		
		var xml = '<?xml version="1.0" encoding="UTF-8" ?>';
		if(data){
			xml += this.writeMapTopic(defaultSld.data,data);
		}
			
		else 
			xml += this.writeMapTopic(this.data);
		
		

		return xml;
	},
	
	/**********************************************************************************
	* 함수명 : writeMapTopic
	* 설 명 : Object(Json)형태의 SLD_BODY에서 MapTopic부분의 정보를 XML형태로 return
	* 인 자 : data (SLD_BODY의 MapTopic 객체)
	* 사용법 : writeMapTopic(data)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	writeMapTopic : function(data, opt){
		var namedObj = data.namedLayers;
		var str;
		str = '<' + this.tagNameList.StyledLayerDescriptor + ' xsi:schemaLocation="" version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:se="http://www.opengis.net/se" xmlns:ogc="http://www.opengis.net/ogc" xmlns:sld="http://www.opengis.net/sld">';
		str += '<' + this.tagNameList.Name + '>' + data.name + '</' + this.tagNameList.Name + '>';
		str += '<' + this.tagNameList.Description + '><' + this.tagNameList.Title + '>' + data.title + '</' + this.tagNameList.Title + '></' + this.tagNameList.Description + '>';
		
		
		/*
		 * layerTool.layers의 순서대로 SLD_BODY를 생성한다. (생성 전 SEQ 정렬 필요)
		 * SLD_BODY의 NamedLayers 순서 (Print 관련됨)
		 * 가장 아래에 놓이는 SLD_BODY가 맨 먼저 와야한다.
		 */
		
		if(opt == "default"){
			for(var l=0, lLen=namedObj.length ; l<lLen ; l++){
				for(var k=0, kLen=this.defaultLayers.length ; k<kLen ; k++){
					if(namedObj[l].name == this.defaultLayers[k]){
						str += this.writeNamedLayer(namedObj[l]);
					}
				}
			}
		}
		else{
			for(var j=0, jLen=layerTool.layers.length ; j<jLen ; j++){
				for(var k=0, kLen=namedObj.length ; k<kLen ; k++){
					if(layerTool.layers[j].alias == namedObj[k].name){
						if(layerTool.layers[j].show == "1"){
							namedObj[k].show = "1";
						}
						else{
							namedObj[k].show = "0";
						}
					}
				}
			}
			
			if(opt == "print"){
				// 거꾸로 생성 = 맵토픽에서 sldbody xml 처음레이어를 가장 하단으로 위치시키기 때문
				for(var i=layerTool.layers.length-1 ; i >= 0 ; i--){
					for(var l=0, lLen=namedObj.length ; l<lLen ; l++){
						if(layerTool.layers[i].alias == namedObj[l].name){
							if(namedObj[l].show == "1"){
								str += this.writeNamedLayer(namedObj[l]);
							}
						}
					}
				}
			}
			else{
				for(var i=0, len=layerTool.layers.length ; i < len ; i++){
					for(var l=0, lLen=namedObj.length ; l<lLen ; l++){
						if(layerTool.layers[i].alias == namedObj[l].name){
							if(namedObj[l].show == "1"){
								str += this.writeNamedLayer(namedObj[l]);
							}
						}
					}
				}
			}
		}
				
		str += '</' + this.tagNameList.StyledLayerDescriptor + '>';
		
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : writeNamedLayer
	* 설 명 : Object(Json)형태의 SLD_BODY에서 NamedLayer부분의 정보를 XML형태로 return
	* 인 자 : namedObj (SLD_BODY의 NamedLayer 객체)
	* 사용법 : writeNamedLayer(namedObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	writeNamedLayer : function(namedObj){
		var userdObj = namedObj.userStyle;
		var str;
		
		str = '<' + this.tagNameList.NamedLayer + '>';
		str += '<' + this.tagNameList.Name + '>' + namedObj.name + '</' + this.tagNameList.Name + '>';
		str += '<' + this.tagNameList.Description + '><' + this.tagNameList.Title + '>' + namedObj.title + '</' + this.tagNameList.Title + '></' + this.tagNameList.Description + '>';
		str += '<' + this.tagNameList.LayerFeatureConstraints + '><' + this.tagNameList.FeatureTypeConstraint + '><' + this.tagNameList.FeatureTypeName + '>';
		str += namedObj.featureTypeName;
		str += '</' + this.tagNameList.FeatureTypeName + '></' + this.tagNameList.FeatureTypeConstraint + '></' + this.tagNameList.LayerFeatureConstraints + '>';
		
		for(var j=0, jLen=userdObj.length ; j < jLen ; j++){
			str += this.writeUserStyle(userdObj[j]);
		}
		
		str += '</' + this.tagNameList.NamedLayer + '>';
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : writeUserStyle
	* 설 명 : Object(Json)형태의 SLD_BODY에서 UserStyle부분의 정보를 XML형태로 return
	* 		 (현재 상수도 프로젝트에서는 UserStyle를 활용하지 않음.)
	* 인 자 : userdObj (SLD_BODY의 UserStyle 객체)
	* 사용법 : writeUserStyle(userdObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	writeUserStyle : function(userdObj){
		var ruleObj = userdObj.rules;
		var str;

		str = '<' + this.tagNameList.UserStyle + '>';
		str += '<' + this.tagNameList.Name + '>' + userdObj.name + '</' + this.tagNameList.Name + '>';
		str += '<' + this.tagNameList.Description + '><' + this.tagNameList.Title + '>' + userdObj.title + '</' + this.tagNameList.Title + '></' + this.tagNameList.Description + '>';
		str += '<' + this.tagNameList.FeatureTypeStyle + '>';
		str += '<' + this.tagNameList.FeatureTypeName + '>' + userdObj.featureTypeName + '</' + this.tagNameList.FeatureTypeName + '>';
		
		for(var k=0, kLen=ruleObj.length ; k < kLen ; k++){
			if(!(ruleObj[k].hidden != null && ruleObj[k].hidden)){
				str += this.writeRule(ruleObj[k]);
			}
		}
		str += '</' + this.tagNameList.FeatureTypeStyle + '>';
		str += '</' + this.tagNameList.UserStyle + '>';
		
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : writeRule
	* 설 명 : Object(Json)형태의 SLD_BODY에서 Rule 정보를 XML형태로 return
	* 		 (ogc:Filter 부분 파싱은 제외되어 있음.)
	* 인 자 : ruleObj (SLD_BODY의 Rule 객체)
	* 사용법 : writeRule(ruleObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	**********************************************************************************/
	writeRule : function(ruleObj,ruleOnOff){
		var points;
		var lines;
		var polygons;
		var texts;
		
		var str;
		
		str = '<' + this.tagNameList.Rule + '>';
		str += '<' + this.tagNameList.Name + '>' + ruleObj.name + '</' + this.tagNameList.Name + '>';
		if(ruleObj.name == "그외관로_주석" || ruleObj.name == "그외관로"){
			str += '<' + this.tagNameList.Filter + '>';
			str += '<' + this.tagNameList.And + ' xmlns="http://www.opengis.net/ogc">';

			str += '<' + this.tagNameList.And + '>';
			str += '<' + this.tagNameList.And + '>';
			str += '<' + this.tagNameList.And + '>';
			str += '<' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
			str += '<' + this.tagNameList.PropertyName + '>';
			str += 'PLINE_KND_SE';
			str += '</' + this.tagNameList.PropertyName + '>';
			str += '<' + this.tagNameList.Literal + '>';
			str += 'SAA006';
			str += '</' + this.tagNameList.Literal + '>';
			str += '</' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
			
			str += '<' + this.tagNameList.PropertyIsLessThan + '>';
			str += '<' + this.tagNameList.PropertyName + '>';
			str += 'PLINE_KND_SE';
			str += '</' + this.tagNameList.PropertyName + '>';
			str += '<' + this.tagNameList.Literal + '>';
			str += 'SAA009';
			str += '</' + this.tagNameList.Literal + '>';
			str += '</' + this.tagNameList.PropertyIsLessThan + '>';
			str += '</' + this.tagNameList.And + '>';
			
			str += '<' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
			str += '<' + this.tagNameList.PropertyName + '>';
			str += 'PLINE_KND_SE';
			str += '</' + this.tagNameList.PropertyName + '>';
			str += '<' + this.tagNameList.Literal + '>';
			str += 'SAA011';
			str += '</' + this.tagNameList.Literal + '>';
			str += '</' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
			str += '</' + this.tagNameList.And + '>';
			
			str += '<' + this.tagNameList.PropertyIsLessThan + '>';
			str += '<' + this.tagNameList.PropertyName + '>';
			str += 'PLINE_KND_SE';
			str += '</' + this.tagNameList.PropertyName + '>';
			str += '<' + this.tagNameList.Literal + '>';
			str += 'SAA030';
			str += '</' + this.tagNameList.Literal + '>';
			str += '</' + this.tagNameList.PropertyIsLessThan + '>';
			str += '</' + this.tagNameList.And + '>';
			
			str += '<' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
			str += '<' + this.tagNameList.PropertyName + '>';
			str += 'PLINE_ET';
			str += '</' + this.tagNameList.PropertyName + '>';
			str += '<' + this.tagNameList.Literal + '>';
			str += '20.0';
			str += '</' + this.tagNameList.Literal + '>';
			str += '</' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
			
			str += '</' + this.tagNameList.And + '>';
			str += '</' + this.tagNameList.Filter + '>';
		}
		else 
		if(ruleObj.filterName_equal || ruleObj.filterLiteral_equal || ruleObj.more || ruleObj.less){
			str += '<' + this.tagNameList.Filter + '>';
			
			if((ruleObj.filterName_equal && ruleObj.filterName_greater)
					|| (ruleObj.filterName_equal && ruleObj.more)){
				str += '<' + this.tagNameList.And + '>';
			}
			if(ruleObj.filterName_equal && ruleObj.filterLiteral_equal) {
				str += '<' + this.tagNameList.PropertyIsEqualTo + ' xmlns="http://www.opengis.net/ogc"><ogc:PropertyName>';
				str += ruleObj.filterName_equal + '</' + this.tagNameList.PropertyName + '>';
				str += '<' + this.tagNameList.Literal + '>' + ruleObj.filterLiteral_equal + '</' + this.tagNameList.Literal + '>';
				str += '</' + this.tagNameList.PropertyIsEqualTo + '>';
			}
			
			if(ruleObj.filterName_greater && ruleObj.filterLiteral_greater){
				str += '<' + this.tagNameList.PropertyIsGreaterThan + '>';
				str += '<' + this.tagNameList.PropertyName + '>';
				str += ruleObj.filterName_greater;
				str += '</' + this.tagNameList.PropertyName + '>';
				str += '<' + this.tagNameList.Literal + '>' + ruleObj.filterLiteral_greater + '</' + this.tagNameList.Literal + '>';
				str += '</' + this.tagNameList.PropertyIsGreaterThan + '>';
			}

			if(ruleObj.more && ruleObj.less){
				var cnt=0;
				str += '<' + this.tagNameList.And + ' xmlns="http://www.opengis.net/ogc">';
				for(var j in ruleObj.more){
					cnt++;
				}
				for(var i=0 ; i<cnt ; i++){
					if(cnt >= 2){
						str += '<' + this.tagNameList.And + '>';
					}
					str += '<' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
					str += '<' + this.tagNameList.PropertyName + '>';
					str += ruleObj.filterName_more[i];
					str += '</' + this.tagNameList.PropertyName + '>';
					str += '<' + this.tagNameList.Literal + '>';
					str += ruleObj.more[i];
					str += '</' + this.tagNameList.Literal + '>';
					str += '</' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
					
					str += '<' + this.tagNameList.PropertyIsLessThan + '>';
					str += '<' + this.tagNameList.PropertyName + '>';
					str += ruleObj.filterName_less[i];
					str += '</' + this.tagNameList.PropertyName + '>';
					str += '<' + this.tagNameList.Literal + '>';
					str += ruleObj.less[i];
					str += '</' + this.tagNameList.Literal + '>';
					str += '</' + this.tagNameList.PropertyIsLessThan + '>';
					if(cnt >= 2){
						str += '</' + this.tagNameList.And + '>';
					}
				}
				str += '</' + this.tagNameList.And + '>';
			}
			else if(ruleObj.more){
				for(var i in ruleObj.more){
					str += '<' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
					str += '<' + this.tagNameList.PropertyName + '>';
					str += ruleObj.filterName_more[i];
					str += '</' + this.tagNameList.PropertyName + '>';
					str += '<' + this.tagNameList.Literal + '>';
					str += ruleObj.more[i];
					str += '</' + this.tagNameList.Literal + '>';
					str += '</' + this.tagNameList.PropertyIsGreaterThanOrEqualTo + '>';
				}
			}
			else if(ruleObj.less){
				for(var i in ruleObj.less){
					str += '<' + this.tagNameList.PropertyIsLessThan + '>';
					str += '<' + this.tagNameList.PropertyName + '>';
					str += ruleObj.filterName_less[i];
					str += '</' + this.tagNameList.PropertyName + '>';
					str += '<' + this.tagNameList.Literal + '>';
					str += ruleObj.less[i];
					str += '</' + this.tagNameList.Literal + '>';
					str += '</' + this.tagNameList.PropertyIsLessThan + '>';
				}
			}
			
			if((ruleObj.filterName_equal && ruleObj.filterName_greater)
					|| (ruleObj.filterName_equal && ruleObj.more)){
				str += '</' + this.tagNameList.And + '>';
			}
			
			str += '</' + this.tagNameList.Filter + '>';
		}
		str += '<' + this.tagNameList.MinScaleDenominator + '>' + ruleObj.minScale + '</' + this.tagNameList.MinScaleDenominator + '>';
		str += '<' + this.tagNameList.MaxScaleDenominator + '>' + ruleObj.maxScale + '</' + this.tagNameList.MaxScaleDenominator + '>';
		
		if(ruleObj.symbolizer["polygon"]){
			polygons = ruleObj.symbolizer["polygon"];
			str += this.writePolySym(polygons);
		}
		if(ruleObj.symbolizer["line"]){
			lines = ruleObj.symbolizer["line"];
			str += this.writeLineSym(lines);	
		}
		if(ruleObj.symbolizer["point"]){
			points = ruleObj.symbolizer["point"];
			str += this.writePointSym(points);
		}
		if(ruleObj.symbolizer["text"]){
			texts = ruleObj.symbolizer["text"];
			str += this.writeTextSym(texts);
		}

		str += '</se:Rule>';
		
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : writePointSym
	* 설 명 : Object(Json)형태의 SLD_BODY에서 Rule내부의 PointSymbolizer 정보를 XML형태로 return
	* 인 자 : points (SLD_BODY의 PointSymbolizer 객체)
	* 사용법 : writePointSym(points)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	writePointSym : function(points){
		var str;
		
		str = '<' + this.tagNameList.PointSymbolizer + ' version="' + points.version + '">';
		str += '<' + this.tagNameList.Name + '>' + points.name + '</' + this.tagNameList.Name + '>';
		
		if(points.name == "CharMarker" || points.name == "CharMarkerAngle"){
			str += '<' + this.tagNameList.Graphic + '>';
			str += '<' + this.tagNameList.Mark + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="font-family">' + points.markFont + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="char-code">' + points.markCharCode + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="fill">' + points.markFill + '</' + this.tagNameList.VendorOption + '>';
			str += '</' + this.tagNameList.Mark + '>';
			str += '<' + this.tagNameList.Opacity + '>' + points.opacity + '</' + this.tagNameList.Opacity + '>';
			str += '<' + this.tagNameList.Size + '>' + points.size + '</' + this.tagNameList.Size + '>';
			
			if(points.name == "CharMarkerAngle"){
				str += '<' + this.tagNameList.Rotation + '>';
				str += '<' + this.tagNameList.PropertyName + '>';
				str += points.rotation;
				str += '</' + this.tagNameList.PropertyName + '>';
				str += '</' + this.tagNameList.Rotation + '>';
			}
			
			str += '<' + this.tagNameList.Displacement + '>';
			str += '<' + this.tagNameList.DisplacementX + '>' + points.displacementX + '</' + this.tagNameList.DisplacementX + '>';
			str += '<' + this.tagNameList.DisplacementY + '>' + points.displacementY + '</' + this.tagNameList.DisplacementY + '>';
			str += '</' + this.tagNameList.Displacement + '>';
		}
		else{
			str += '<' + this.tagNameList.Graphic + '><' + this.tagNameList.ExternalGraphic + '><' + this.tagNameList.InlineContent + ' encoding="' + points.encoding + '">' + points.externalGraphic + '</' + this.tagNameList.InlineContent + '>';
			str += '<' + this.tagNameList.Format + '>' + points.format + '</' + this.tagNameList.Format + '>';
			str += '</' + this.tagNameList.ExternalGraphic + '>';
			str += '<' + this.tagNameList.Opacity + '>' + points.opacity + '</' + this.tagNameList.Opacity + '>';
			str += '<' + this.tagNameList.Size + '>' + points.size + '</' + this.tagNameList.Size + '>';
			str += '<' + this.tagNameList.Rotation + '>' + points.rotation + '</se:Rotation>';
			str += '<' + this.tagNameList.Displacement + '><' + this.tagNameList.DisplacementX + '>' + points.displacementX + '</' + this.tagNameList.DisplacementX + '>';
			str += '<' + this.tagNameList.DisplacementY + '>' + points.displacementY + '</' + this.tagNameList.DisplacementY + '></' + this.tagNameList.Displacement + '>';
		}
		
		str += '</' + this.tagNameList.Graphic + '></' + this.tagNameList.PointSymbolizer + '>';
		
		
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : writeLineSym
	* 설 명 : Object(Json)형태의 SLD_BODY에서 Rule내부의 LineSymbolizer 정보를 XML형태로 return
	* 인 자 : lines (SLD_BODY의 LineSymbolizer 객체>)
	* 사용법 : writeLineSym(lines)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	writeLineSym : function(lines){
		var str;
		
		str = '<' + this.tagNameList.LineSymbolizer + ' version="' + lines.version + '">';
		str += '<' + this.tagNameList.Name + '>' + lines.name + '</' + this.tagNameList.Name + '>';
		str += '<' + this.tagNameList.Stroke + '>';
		
		if(lines.stroke){
			str += '<' + this.tagNameList.SvgParameter + ' name="stroke">' + lines.stroke + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(lines.strokeOpacity){
			str += '<' + this.tagNameList.SvgParameter + ' name="stroke-opacity">' + lines.strokeOpacity + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(lines.strokeWidth){
			str += '<' + this.tagNameList.SvgParameter + ' name="stroke-width">' + lines.strokeWidth + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(lines.strokeLinejoin){
			str += '<' + this.tagNameList.SvgParameter + ' name="stroke-linejoin">' + lines.strokeLinejoin + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(lines.strokeLinecap){
			str += '<' + this.tagNameList.SvgParameter + ' name="stroke-linecap">' + lines.strokeLinecap + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(lines.strokeDashArray && lines.strokeDashArray != "solid"){
			str += '<' + this.tagNameList.SvgParameter + ' name="stroke-dasharray">' + lines.strokeDashArray + '</' + this.tagNameList.SvgParameter + '>';
		}
		
		str += '</' + this.tagNameList.Stroke + '>';
		
		if(lines.cap_direction && lines.cap_angle){
			str += '<' + this.tagNameList.VendorOption + ' name="cap_direction">' + lines.cap_direction + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_angle">' + lines.cap_angle + '</' + this.tagNameList.VendorOption + '>';
			
			str += '<' + this.tagNameList.VendorOption + ' name="start_cap">' + lines.start_cap + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_style">' + lines.cap_style[0] + '</' + this.tagNameList.VendorOption + '>';
			//str += '<' + this.tagNameList.VendorOption + ' name="cap_marker">' + lines.cap_marker[0] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_size">' + lines.cap_size[0] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_color">' + lines.cap_color[0] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_fill">' + lines.cap_fill[0] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_position">' + lines.cap_position[0] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="end_cap">' + lines.end_cap + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_style">' + lines.cap_style[1] + '</' + this.tagNameList.VendorOption + '>';
			//str += '<' + this.tagNameList.VendorOption + ' name="cap_marker">' + lines.cap_marker[1] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_size">' + lines.cap_size[1] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_color">' + lines.cap_color[1] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_fill">' + lines.cap_fill[1] + '</' + this.tagNameList.VendorOption + '>';
			str += '<' + this.tagNameList.VendorOption + ' name="cap_position">' + lines.cap_position[1] + '</' + this.tagNameList.VendorOption + '>';
		}
		str += '</' + this.tagNameList.LineSymbolizer + '>';
		
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : writePolySym
	* 설 명 : Object(Json)형태의 SLD_BODY에서 Rule내부의 PolygonSymbolizer 정보를 XML형태로 return
	* 인 자 : polygons (SLD_BODY의 PolygonSymbolizer 객체)
	* 사용법 : writePolySym(polygons)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	writePolySym : function(polygons){
		var str;
		
		str = '<' + this.tagNameList.PolygonSymbolizer + ' version="' + polygons.version + '">';
		str += '<' + this.tagNameList.Name + '>' + polygons.name + '</' + this.tagNameList.Name + '>';
		str += '<' + this.tagNameList.Fill + '>';
		
		if(polygons.fillColor){
			str += '<' + this.tagNameList.SvgParameter + ' name="fill">' + polygons.fillColor + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(polygons.fillOpacity){
			str += '<' + this.tagNameList.SvgParameter + ' name="fill-opacity">' + polygons.fillOpacity + '</' + this.tagNameList.SvgParameter + '>';
		}
		
		str += '</' + this.tagNameList.Fill + '>';
		str += '</' + this.tagNameList.PolygonSymbolizer + '>';
		
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : writeTextSym
	* 설 명 : Object(Json)형태의 SLD_BODY에서 Rule내부의 TextSymbolizer 정보를 XML형태로 return
	* 인 자 : texts (SLD_BODY의 TextSymbolizer 엘리먼트 == <se:TextSymbolizer>)
	* 사용법 : writeTextSym(texts)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	writeTextSym : function(texts){
		var str;
		
		str = '<' + this.tagNameList.TextSymbolizer + ' version="' + texts.version + '">';
		str += '<' + this.tagNameList.Name + '>' + texts.name + '</' + this.tagNameList.Name + '>';
		if(texts.label){
			str += '<' + this.tagNameList.Label + '><' + this.tagNameList.PropertyName + '>' + texts.label + '</ogc:PropertyName></' + this.tagNameList.Label + '>';
		}
		else{
			str += '<' + this.tagNameList.Label + '/>';
		}
		
		str += '<' + this.tagNameList.Font + '>';
		
		if(texts.fontSize){
			str += '<' + this.tagNameList.SvgParameter + ' name="font-size">' + texts.fontSize + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(texts.fontWeight){
			str += '<' + this.tagNameList.SvgParameter + ' name="font-weight">' + texts.fontWeight + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(texts.fontFamily){
			str += '<' + this.tagNameList.SvgParameter + ' name="font-family">' + texts.fontFamily + '</' + this.tagNameList.SvgParameter + '>';
		}
		if(texts.fontStyle){
			str += '<' + this.tagNameList.SvgParameter + ' name="font-style">' + texts.fontStyle + '</' + this.tagNameList.SvgParameter + '>';
		}
		
		str += '</' + this.tagNameList.Font + '>';
		str += '<' + this.tagNameList.LabelPlacement + '>';
		if(texts.displacementX || texts.displacementY){
			str += '<' + this.tagNameList.PointPlacement + '><' + this.tagNameList.Displacement + '>';
			
			if(texts.displacementX){
				str += '<' + this.tagNameList.DisplacementX + '>' + texts.displacementX + '</' + this.tagNameList.DisplacementX + '>';
			}
			if(texts.displacementY){
				str += '<' + this.tagNameList.DisplacementY + '>' + texts.displacementY + '</' + this.tagNameList.DisplacementY + '>';
			}
			
			str += '</' + this.tagNameList.Displacement + '></' + this.tagNameList.PointPlacement + '>';
		}
		if(texts.text_arrange_pos || texts.text_arrange_line || texts.text_arrange_gap){
			str += '<' + this.tagNameList.LinePlacement + '>';
			
			if(texts.text_arrange_pos){
				str += '<' + this.tagNameList.VendorOption + ' name="text_arrange_pos">' + texts.text_arrange_pos + '</' + this.tagNameList.VendorOption + '>';
			}
			if(texts.text_arrange_line){
				str += '<' + this.tagNameList.VendorOption + ' name="text_arrange_line">' + texts.text_arrange_line + '</' + this.tagNameList.VendorOption + '>';
			}
			if(texts.text_arrange_gap){
				str += '<' + this.tagNameList.VendorOption + ' name="text_arrange_gap">' + texts.text_arrange_gap + '</' + this.tagNameList.VendorOption + '>';
			}
			if(texts.text_arrange_gap_value){
				str += '<' + this.tagNameList.VendorOption + ' name="text_arrange_gap_value">' + texts.text_arrange_gap_value + '</' + this.tagNameList.VendorOption + '>';
			}
			
			str += '</' + this.tagNameList.LinePlacement + '>';
		}
		
		str += '</' + this.tagNameList.LabelPlacement + '>';
		
		if(texts.radius){
			str += '<' + this.tagNameList.Halo + '>';
			str += '<' + this.tagNameList.Radius + '>' + texts.radius + '</' + this.tagNameList.Radius + '>';
			str += '<' + this.tagNameList.Fill + '>';
			
			if(texts.haloColor){
				str += '<' + this.tagNameList.SvgParameter + ' name="fill">' + texts.haloColor + '</' + this.tagNameList.SvgParameter + '>';
			}
			if(texts.haloOpacity){
				str += '<' + this.tagNameList.SvgParameter + ' name="fill-opacity">' + texts.haloOpacity + '</' + this.tagNameList.SvgParameter + '>';
			}
			str += '</' + this.tagNameList.Fill + '>';
			str += '</' + this.tagNameList.Halo + '>';
		}
		
		
		if(texts.fillColor){
			str += '<' + this.tagNameList.Fill + '>';
			if(texts.fillColor){
				str += '<' + this.tagNameList.SvgParameter + ' name="fill">' + texts.fillColor + '</' + this.tagNameList.SvgParameter + '>';
			}
			if(texts.fillOpacity){
				str += '<' + this.tagNameList.SvgParameter + ' name="fill-opacity">' + texts.fillOpacity + '</' + this.tagNameList.SvgParameter + '>';
			}
			str += '</' + this.tagNameList.Fill + '>';
		}
		
		str += '</' + this.tagNameList.TextSymbolizer + '>';
		
		return str;
	},
	
	/**********************************************************************************
	* 함수명 : searchNamedLayer
	* 설 명 : SLD_BODY 객체에서 NameLayer 명칭으로 해당 객체를 검색하는 함수 
	* 인 자 : layerName (namedLayer명)
	* 사용법 : searchNamedLayer(layerName)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	searchNamedLayer : function(layerName){
		var data = this.data;
		var namedLayers = data.namedLayers;
		
		for(var i=0, len=namedLayers.length ; i < len ; i++){
			if(namedLayers[i].name == layerName){
				return namedLayers[i];
			}
		}
	},
	
	/**********************************************************************************
	* 함수명 : searchRule
	* 설 명 : Rule 명칭으로 해당 Rule객체를 검색하는 함수
	* 인 자 : ruleName (rule명), chk(해당 rule의 namedLayer명으로 중복체크)
	* 사용법 : searchRule
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	searchRule : function(ruleName, chk){
		var data = this.data;
		var namedLayers = data.namedLayers;
		
		if(chk){
			var res=[];
			var cnt=0;
			for(var i=0, len=namedLayers.length ; i < len ; i++){
				var userStyle = namedLayers[i].userStyle;
				for(var j=0, jLen=userStyle.length ; j < jLen ; j++){
					var rules = userStyle[j].rules;
					for(var k=0, kLen=rules.length ; k < kLen ; k++){
						if(rules[k].name == ruleName){
							res.push(rules[k]);
							res.push(i);
							cnt++;
						}
					}
				}
			}
			if(cnt > 1){
				for(var i=0,len=res.length ; i<len ; i=i+2){
					if(namedLayers[res[i+1]].name == chk){
						return res[i];
					}
				}
			}
			else if(cnt == 1){
				return res[0];
			}
		}
		else{
			for(var i=0, len=namedLayers.length ; i < len ; i++){
				var userStyle = namedLayers[i].userStyle;
				for(var j=0, jLen=userStyle.length ; j < jLen ; j++){
					var rules = userStyle[j].rules;
					for(var k=0, kLen=rules.length ; k < kLen ; k++){
						if(rules[k].name == ruleName){
							return rules[k];
						}
					}
				}
			}
		}
	},
	
	/**********************************************************************************
	* 함수명 : regNamedLayers
	* 설 명 : MapTopic 객체에 NamedLayers 객체를 등록하는 함수
	* 인 자 : data(MapTopic 객체 // 등록 타겟), namedObj (NamedLayers 객체 // 등록 객체)
	* 사용법 : regNamedLayers(namedObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	regNamedLayers : function(data, namedObj){
		data.namedLayers.push(namedObj);
		
		return data;
	},
	
	/**********************************************************************************
	* 함수명 : regUserStyle
	* 설 명 : NamedLayers 객체에 UserStyle 객체를 등록하는 함수
	* 인 자 : namedObj(NamedLayers 객체 // 등록 타겟), userdObj (UserStyle 객체 // 등록 객체)
	* 사용법 : regUserStyle(namedObj, userdObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	regUserStyle : function(namedObj, userdObj){
		namedObj.userStyle.push(userdObj);
		
		return namedObj;
	},
	
	/**********************************************************************************
	* 함수명 : regRules
	* 설 명 : UserStyle 객체에 Rules 객체를 등록하는 함수
	* 인 자 : userdObj(UserStyle 객체 // 등록 타겟), ruleObj (Rules 객체 // 등록 객체)
	* 사용법 : regRules(userdObj, ruleObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	regRules : function(userdObj, ruleObj){
		userdObj.rules.push(ruleObj);
		
		return userdObj;
	},
	
	/**********************************************************************************
	* 함수명 : regSymbolizer
	* 설 명 : Rules 객체에 Symbolizer 객체를 등록하는 함수
	* 인 자 : ruleObj(Rules 객체 // 등록 타겟), symbolObj (Symbolizer 객체 // 등록 객체)
	* 사용법 : regSymbolizer(ruleObj, symbolObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	regSymbolizer : function(ruleObj, symbolObj){
		
		if(symbolObj.type == "point"){
			ruleObj.symbolizer["point"] = symbolObj;
		}
		else if(symbolObj.type == "line"){
			ruleObj.symbolizer["line"] = symbolObj;
		}
		else if(symbolObj.type == "polygon"){
			ruleObj.symbolizer["polygon"] = symbolObj;
		}
		else if(symbolObj.type == "text"){
			ruleObj.symbolizer["text"] = symbolObj;
		}
		
		return ruleObj;
	},
	
	/**********************************************************************************
	* 함수명 : createMapTopic
	* 설 명 : MapTopic 객체를 생성하기 위한 파라미터값을 인자로 받아 MapTopic 객체 생성
	* 인 자 : params (파라미터 객체)
	* 사용법 : createMapTopic(params)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	createMapTopic : function(params){
		var data = {
				xml : params.xml,
				name : params.name,
				namedLayers : []
		}; 
		
		return data;
	},
	
	/**********************************************************************************
	* 함수명 : createNamedLayer
	* 설 명 : NamedLayer 객체를 생성하기 위한 파라미터값을 인자로 받아 NamedLayer 객체 생성
	* 인 자 : params (파라미터 객체)
	* 사용법 : createNamedLayer(params)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	createNamedLayer : function(params){
		var namedObj = {
				name : params.name,
				title : params.title,
				featureTypeName : params.featureTypeName,
				userStyle : []
		};
		
		return namedObj;
	},
		
	/**********************************************************************************
	* 함수명 : createUserStyle
	* 설 명 : UserStyle 객체를 생성하기 위한 파라미터값을 인자로 받아 UserStyle 객체 생성
	* 인 자 : params (파라미터 객체)
	* 사용법 : createUserStyle(params)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	createUserStyle : function(params){
		var userdObj = {
				name : params.name,
				title : params.title,
				rules : []
		};
		
		return userdObj;
	},
	
	/**********************************************************************************
	* 함수명 : createRule
	* 설 명 : Rule 객체를 생성하기 위한 파라미터값을 인자로 받아 Rule 객체 생성
	* 인 자 : params (파라미터 객체), symbol(심볼 객체)
	* 사용법 : createRule(params)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	createRule : function(params, symbol){
		var ruleObj = {
				name : params.name,
				filterName : params.filterName,
				filterLiteral : params.Literal,
				minScale : params.minScale,
				maxScale : params.maxScale,
				symbolizer : symbol
		};
		return ruleObj;
	},
	
	/**********************************************************************************
	* 함수명 : createSymbolizer
	* 설 명 : Symbolizer 객체를 생성하기 위한 파라미터값을 인자로 받아 Symbolizer 객체 생성
	*		 파라미터에 따라 Point, Line, Polygon, Text로 구분되어서 객체 생성	
	* 인 자 : params (파라미터 객체), type ("point","line","polygon","text")
	* 사용법 : createSymbolizer(params)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.25		이경찬		최초 생성
	* 
	**********************************************************************************/
	createSymbolizer : function(params, type){
		var pointObj;
		var lineObj;
		var polygonObj;
		var textObj;
		var symbolObj = null;
		
		if(type == "point"){
			if(params.name == "CharMarker" || params.name == "CharMarkerAngle"){
				pointObj = {	
						markFill : params.markFill,
						markFont : params.markFont,
						markCharCode : params.markCharCode,
						
						type : "point",
						version : params.version,
						name : params.name,
						size : params.size,
						opacity : params.opacity,
						rotation : params.rotation,
						displacementX : params.displacementX,
						displacementY : params.displacementY
				};
			}
			else{
				pointObj = {	
						type : "point",
						version : params.version,
						name : params.name,
						size : params.size,
						opacity : params.opacity,
						rotation : params.rotation,
						displacementX : params.displacementX,
						displacementY : params.displacementY,
						externalGraphic : params.externalGraphic,
						encoding : params.encoding,
						format : params.format
				};
			}
			
			symbolObj = pointObj;
		}
		else if(type == "line"){
			lineObj = {
					type : "line",
					version : params.version,
					name : params.name,
					stroke : params.stroke,
					strokeWidth : params.strokeWidth,
					strokeOpacity : params.strokeOpacity,
					strokeLinecap : params.strokeLinecap,
					strokeDashArrayarray : params.strokeDashArray,
					strokeLinejoin : params.strokeLinejoin
			};
			symbolObj = lineObj;
		}
		else if(type == "polygon"){
			polygonObj = {
					type : "polygon",
					version : params.version,
					name : params.name,
 					fillColor : params.fillColor,
					fillOpacity : params.fillOpacity
			};
			symbolObj = polygonObj;
		}
		else if(type == "text"){
			textObj = {
					type : "text",
					version : params.version,
					name : params.name,
					label : params.label,
					fontFamily : params.fontFamily,
					fontSize : params.fontSize,
					fontStyle : params.fontStyle,
					fontWeight : params.fontWeight,
					displacementX : params.displacementX,
					displacementY : params.displacementY,
					text_arrange_pos : params.text_arrange_pos,
					text_arrange_line : params.text_arrange_line,
					text_arrange_gap : params.text_arrange_gap,
					radius : params.radius,
					haloColor : params.haloColor,
					haloOpacity : params.haloOpacity,
					fillColor : params.fillColor,
					fillOpacity : params.fillOpacity
			};
			symbolObj = textObj;
		}
		
		return symbolObj;
	},
	
	/**********************************************************************************
	* 함수명 : updateNamedLayer
	* 설 명 : 인자인 NamedLayer 객체가 MapTopic Object내에 존재하면 수정, 존재하지 않으면 추가 
	* 인 자 : nameObj (NamedLayer 객체)
	* 사용법 : updateNamedLayer(nameObj)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	updateNamedLayer : function(nameObj){
		var hasNamedLayer = false;
		var namedLayers = this.data.namedLayers;
		
		for(var i=0, len=namedLayers.length ; i < len ; i++){
			if(namedLayers[i].name == nameObj.name){
				namedLayers[i] = nameObj;
				hasNamedLayer = true;
			}
		}
		
		if(!hasNamedLayer){
			namedLayers.push(nameObj);
		}
	},
	
	/**********************************************************************************
	* 함수명 : delNamedLayer
	* 설 명 : 해당 NamedLayer가 MapTopic Object내에 존재하면 삭제 
	* 인 자 : layerName (NamedLayer 이름)
	* 사용법 : delNamedLayer(layerName)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	delNamedLayer : function(layerName){
		var hasNamedLayer = false;
		var namedLayers = this.data.namedLayers;
		
		for(var i=0, len=namedLayers.length ; i < len ; i++){
			if(namedLayers[i].name == layerName){
				hasNamedLayer = true;
				namedLayers.splice(i,1);
				alert("해당 NamedLayer를 삭제하였습니다.");
			}
		}
		
		if(!hasNamedLayer){
			alert("해당 NamedLayer가 없습니다.");
		}
	},
	
	/**********************************************************************************
	* 함수명 : delRule
	* 설 명 : 해당 Rule이 MapTopic Object내에 존재하면 삭제 
	* 인 자 : ruleName (Rule 이름)
	* 사용법 : delRule(ruleName)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	delRule : function(ruleName){
		var hasRule = false;
		var namedLayers = this.data.namedLayers;
		
		for(var i=0, len=namedLayers.length ; i < len ; i++){
			var userStyle = namedLayers[i].userStyle;

			for(var j=0, jLen=userStyle.length ; j < jLen ; j++){
				var rules = userStyle[j].rules;
				
				for(var k=0, kLen=rules.length ; k < kLen ; k++){
					if(rules[k].name == ruleName){
						hasRule = true;
						rules.splice(k,1);
						alert("해당 Rule을 삭제하였습니다.");
					}
				}
			}
		}
		
		if(!hasRule){
			alert("해당  Rule이 없습니다.");
		}
	},
	
	/**********************************************************************************
	* 함수명 : delSymbolizer
	* 설 명 : 해당 Symbolizer가 MapTopic Object내에 존재하면 삭제
	* 인 자 : SymbolName (Symbolizer 이름)
	* 사용법 : delSymbolizer(SymbolName)
	* 작성일 : 2012.05.25
	* 작성자 : 기술교육팀 이경찬
	* 수정일				수정자			수정내용
	* ----------------------------------------------------------------------
	* 2012.05.23		이경찬		최초 생성
	* 
	**********************************************************************************/
	delSymbolizer : function(SymbolName){
		var hasSymbol = false;
		var namedLayers = this.data.namedLayers;
		
		for(var i=0, len=namedLayers.length ; i < len ; i++){
			var userStyle = namedLayers[i].userStyle;

			for(var j=0, jLen=userStyle.length ; j < jLen ; j++){
				var rules = userStyle[j].rules;
				
				for(var k=0, kLen=rules.length ; k < kLen ; k++){
					var symbol = rules[k].symbolizer;
					if(symbol["point"] && symbol["point"].name == SymbolName){
						delete symbol["point"];
						hasSymbol = true;
					}
					else if(symbol["line"] && symbol["line"].name == SymbolName){
						delete symbol["line"];
						hasSymbol = true;
					}
					else if(symbol["polygon"] && symbol["polygon"].name == SymbolName){
						delete symbol["polygon"];
						hasSymbol = true;
					}
					else if(symbol["text"] && symbol["text"].name == SymbolName){
						delete symbol["text"];
						hasSymbol = true;
					}
				}
			}
		}
		
		if(!hasSymbol){
			alert("해당 Symbolizer가 없습니다.");
		}
		else{
			alert("해당 Symbolizer를 삭제하였습니다.");
		}
	},
	
	CLASS_NAME: "GSLDTool" 
});
