/**********************************************************************************
 * 파일명 : GRequest.js
 * 설 명 : Ginno Request Class (WMS, WFS, WPS Service XML을 생성)
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.18		최원석				0.1					최초 생성
 * 2014.06.17		이경찬				0.2					OpenLayers 2.13.1버전으로 변경
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/
var GRequest = {};

GRequest.WMS = {

	service : "WMS",
	
	version : "1.3.0",
	
	request : null,
	
	getCapability : function(serviceUrl, callback) {
		var params = {
			service : this.service,
			version : this.version,
			request : "GetCapabilities"
		};
		
		var obj = this;
		GMapUtil.sendProxyGet(serviceUrl, GUtil.fn_convert_objToStr(params), function(res) {
			obj.parseGetCapability(res, callback);
		});
	},
	
	parseGetCapability : function(res, callback) {
		var arr = [];
		
		var totalLayers = res.getElementsByTagName("Layer");
		
		for(var i=0, len=totalLayers.length; i < len; i++) {
			var grpLayers = totalLayers[i].getElementsByTagName("Layer");
			if(grpLayers.length > 0 && $(totalLayers[i].getElementsByTagName("Title")[0]).text() != "BASIC") {
				var groupArr = {
					title : $(totalLayers[i].getElementsByTagName("Title")[0]).text(),
					layers : []
				};
				
				for(var j=0, jLen=grpLayers.length; j < jLen; j++) {
					var obj = {
						name :  $(grpLayers[j].getElementsByTagName("Name")[0]).text(),
						style : $(grpLayers[j].getElementsByTagName("Style")[0]).text(),
						title : $(grpLayers[j].getElementsByTagName("Title")[0]).text(),
						left : $(grpLayers[j].getElementsByTagName("westBoundLongitude")[0]).text(),
						bottom : $(grpLayers[j].getElementsByTagName("southBoundLatitude")[0]).text(),
						right : $(grpLayers[j].getElementsByTagName("eastBoundLongitude")[0]).text(),
						top : $(grpLayers[j].getElementsByTagName("northBoundLatitude")[0]).text()
					};
					groupArr.layers.push(obj);
				}
				
				arr.push(groupArr);
			}
		}
		
		callback(arr);
	},
	
	getLegendGraphic : function(serviceUrl, parameters) {
		var params = {
			service : this.service,
			version : this.version,
			request : "GetLegendGraphic",
			layer : "",
			style : "",
			rule : "",
			sld_version : "1.1.0",
			format : "image/png",
			width : 16,
			height : 16
		};
		
		$.extend(params, parameters);
		return serviceUrl + GUtil.fn_convert_objToStr(params);
	},
	
	getStyles : function(serviceUrl, layers, callback) {
		var params = {
			service : this.service,
			version : this.version,
			request : "GetStyles",
			layers : layers
		};
		
		var obj = this;
		GMapUtil.sendProxyPost(serviceUrl, GUtil.fn_convert_objToStr(params), function(res)
			{
				//obj.parseGetStyles(res, callback);
				callback(new GSLDTool(res,"xml"));
				//callback(GUtil.fn_convert_xmlToJson(res));
			}
		);
	},
	
	parseGetStyles : function(res, callback) {
		var obj = {
			xml : res,
			name : "",
			namedLayers : []
		};
		
		var element = res.getElementsByTagName("se:Name");
		if(element.length > 0) {
			obj.name = $(res.getElementsByTagName("se:Name")[0]).text();
		}
		
		var namedLayers = res.getElementsByTagName("sld:NamedLayer");
		for(var i=0, len=namedLayers.length; i < len; i++) {
			var namedObj = {
				name : "",
				title : "",
				featureTypeName : "",
				userStyle : []
			};
			
			element = namedLayers[i].getElementsByTagName("se:Name");
			if(element.length > 0) namedObj.name = $(element[0]).text();
			
			element = namedLayers[i].getElementsByTagName("se:Description");
			if(element.length > 0) {
				var subElement = element[0].getElementsByTagName("se:Title");
				if(subElement.length > 0) namedObj.title = $(subElement[0]).text();
			}
			
			element = namedLayers[i].getElementsByTagName("sld:LayerFeatureConstraints");
			if(element.length > 0) {
				subElement = element[0].getElementsByTagName("se:FeatureTypeName");
				if(subElement.length > 0) namedObj.featureTypeName = $(subElement[0]).text();
			}
			
			var userStyles = namedLayers[i].getElementsByTagName("sld:UserStyle");
			for(var j=0, jLen=userStyles.length; j < jLen; j++) {
				var userdObj = {
					name : "",
					title : "",
					rules : []
				};
				
				element = userStyles[j].getElementsByTagName("se:Name");
				if(element.length > 0) userdObj.name = $(element[0]).text();
				
				element = userStyles[j].getElementsByTagName("se:Description");
				if(element.length > 0) {
					subElement = element[0].getElementsByTagName("se:Title");
					if(subElement.length > 0) userdObj.title = $(subElement[0]).text();
				}
				
				element = userStyles[j].getElementsByTagName("se:FeatureTypeStyle");
				if(element.length > 0) {
					subElement = element[0].getElementsByTagName("se:FeatureTypeName");
					if(subElement.length > 0) userdObj.title = $(subElement[0]).text();
				}
				
				var rules = userStyles[j].getElementsByTagName("se:Rule");
				for(var k=0, kLen=rules.length; k < kLen; k++) {
					var ruleObj = {
						name : "",
						minScale : "",
						maxScale : "",
						symbolizer : {}
					};
					
					element = rules[k].getElementsByTagName("se:Name");
					if(element.length > 0) ruleObj.name = $(element[0]).text();
					element = rules[k].getElementsByTagName("se:MinScaleDenominator");
					if(element.length > 0) ruleObj.minScale = $(element[0]).text();
					element = rules[k].getElementsByTagName("se:MaxScaleDenominator");
					if(element.length > 0) ruleObj.maxScale = $(element[0]).text();
					
					var points = rules[k].getElementsByTagName("se:PointSymbolizer");
					var lines = rules[k].getElementsByTagName("se:LineSymbolizer");
					var polygons = rules[k].getElementsByTagName("se:PolygonSymbolizer");
					var texts = rules[k].getElementsByTagName("se:TextSymbolizer");
					
					if(points.length > 0) {
						var pointObj = {};
						
						var svgParam = points[0].getElementsByTagName("se:Size");
						if(svgParam.length > 0) pointObj["size"] = $(svgParam[0]).text();
						
						var externalGraphics = points[0].getElementsByTagName("se:ExternalGraphic");
						if(externalGraphics.length > 0) {
							var inlineContents = externalGraphics[0].getElementsByTagName("se:InlineContent");
							if(inlineContents.length > 0) pointObj["externalGraphic"] = $(inlineContents[0]).text();
						}
						
						ruleObj.symbolizer["point"] = pointObj;
					}
					
					if(lines.length > 0) {
						var lineObj = {};
						
						var svgParam = lines[0].getElementsByTagName("se:SvgParameter");
						for(var l=0, lLen=svgParam.length; l < lLen; l++) {
							//선 색 strokeColor
							if(svgParam[l].getAttribute("name") == "stroke") {
								lineObj["stroke"] = $(svgParam[l]).text();
							}
							//선 두께 strokeWidth
							else if(svgParam[l].getAttribute("name") == "stroke-width") {
								lineObj["strokeWidth"] = $(svgParam[l]).text();
							}
							//선 투명도 strokeOpacity
							else if(svgParam[l].getAttribute("name") == "stroke-opacity") {
								lineObj["strokeOpacity"] = $(svgParam[l]).text();
							}
							//모서리 스타일 strokeLinecap
							else if(svgParam[l].getAttribute("name") == "stroke-linecap") {
								lineObj["strokeLinecap"] = $(svgParam[l]).text();
							}
							//선 스타일 strokeLinecap
							else if(svgParam[l].getAttribute("name") == "stroke-dasharray") {
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
								
								/*
								//이점 쇄선 10.0,2.0,2.0,2.0,2.0,2.0
								else if(dashArray == "10.0,2.0,2.0,2.0,2.0,2.0") {
								}
								*/
								
								lineObj["strokeDashArray"] = dashArray;
							}
							/*
							//모서리 스타일 strokeLinecap
							else if(svgParam[l].getAttribute("name") == "stroke-linecap") {
								lineObj["strokeLinecap"] = svgParam[l].text;
							}
							*/
						}
						
						if(!lineObj["strokeDashArray"]) {
							lineObj["strokeDashArray"] = "solid";
						}
						
						ruleObj.symbolizer["line"] = lineObj;
					};
					
					if(polygons.length > 0) {
						var polyObj = {};
						
						svgParam = polygons[0].getElementsByTagName("se:SvgParameter");
						for(l=0, lLen=svgParam.length; l < lLen; l++) {
							//면색 fillColor
							if(svgParam[l].getAttribute("name") == "fill") {
								polyObj["fillColor"] = $(svgParam[l]).text();
							}
							//면투명도 fillOpacity
							else if(svgParam[l].getAttribute("name") == "fill-opacity") {
								polyObj["fillOpacity"] = $(svgParam[l]).text();
							}
						}
						
						ruleObj.symbolizer["polygon"] = polyObj;
					}
					
					if(texts.length > 0) {
						var textObj = {};
						
						element = texts[0].getElementsByTagName("se:Label");
						if(element.length > 0) {
							subElement = element[0].getElementsByTagName("PropertyName");
							if(subElement.length > 0) textObj.label = $(subElement[0]).text();
						}

						var fonts = texts[0].getElementsByTagName("se:Font");
						if(fonts.length > 0) {
							svgParam = fonts[0].getElementsByTagName("se:SvgParameter");
							for(l=0, lLen=svgParam.length; l < lLen; l++) {
								//서체 fontFamily
								if(svgParam[l].getAttribute("name") == "font-family") {
									textObj["fontFamily"] = $(svgParam[l]).text();
								}
								//글자 크기 fontSize
								else if(svgParam[l].getAttribute("name") == "font-size") {
									textObj["fontSize"] = $(svgParam[l]).text();
								}
								//글자 스타일 fontStyle
								else if(svgParam[l].getAttribute("name") == "font-style") {
									textObj["fontStyle"] = $(svgParam[l]).text();
								}
								//글자 두께 fontWeight
								else if(svgParam[l].getAttribute("name") == "font-weight") {
									textObj["fontWeight"] = $(svgParam[l]).text();
								}
							}
						}
						
						var fill = texts[0].getElementsByTagName("se:Fill");
						for(var l=0; l < fill.length; l++) {
							svgParam = fill[l].getElementsByTagName("se:SvgParameter");

							if(fill[l].previousSibling.nodeName == "se:Halo") {
								for(var m=0, mLen=svgParam.length; m < mLen; m++) {
									if(svgParam[l].getAttribute("name") == "fill") {
										//배경 색
										textObj["haloColor"] = $(svgParam[m]).text();
									}
									else if(svgParam[l].getAttribute("name") == "fill-opacity") {
										//배경 투명도
										textObj["haloOpacity"] = $(svgParam[m]).text();
									}
								}
							}
							else {
								for(var m=0, mLen=svgParam.length; m < mLen; m++) {
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
						ruleObj.symbolizer["text"] = textObj;
					}
					userdObj.rules.push(ruleObj);
				}
				namedObj.userStyle.push(userdObj);
			}
			obj.namedLayers.push(namedObj);
		}
		
		if(callback) {
			callback(obj);	
			return true;
		}
		else {
			return obj;
		}
	},
	
	getFeatureInfo : function(serviceUrl, map, options, callback, callbackParams) {
		var params = {
			service : this.service,
	    	version : this.version,
	    	request : "GetFeatureInfo",
	    	layers : "",
	    	styles : "",
	    	query_layers : "",
	    	crs : "EPSG:4326",
	    	info_format : "text/xml",
	    	format : "image/jpeg",
	    	feature_count : 9999,
	    	bbox : map.getExtent().toBBOX(),
	    	i : parseInt(map.getSize().w/2),
	    	j : parseInt(map.getSize().h/2),
	    	height : map.getSize().h,
	    	width : map.getSize().w
		};
		
		if(options.layers && !options.styles) {
			options.styles = options.layers;
		}
		if(options.layers && !options.query_layers) {
			options.query_layers = options.layers;
		}
		
		$.extend(params, options);
		
		var obj = this;
		GMapUtil.sendProxyGet(serviceUrl, GUtil.fn_convert_objToStr(params), function(res) {
			obj.parseGetFeatureInfo(res, callback, callbackParams);
		});
	},
	
	parseGetFeatureInfo : function(res, callback, callbackParams) {
		var arr = [];
		
		var layers = res.getElementsByTagName("Layer");
		
		for (var i = 0, len = layers.length; i < len; i++) {
			var obj = {};
			
			obj.name = layers[i].getAttribute("name");
			obj.fields = {};
			
			fields = layers[i].getElementsByTagName("Field");
			
			for(var j=0, fLen = fields.length; j < fLen; j++) {
				obj.fields[fields[j].getAttribute("name")] = $(fields[j]).text();
			}
			
			arr.push(obj);
		}
		
		callback(arr, callbackParams);
	}
};

GRequest.WFS = {
		
	SERVICES : "WFS",
	
	VERSION : "1.1.0",
	
	REQUEST : null,
	
	format : {
		gml : new OpenLayers.Format.GML(),
		filter : new OpenLayers.Format.Filter({ version : "1.1.0" , stringifyOutput : true}),
		xml : new OpenLayers.Format.XML()
	},
	
	getCapability : function(serviceUrl, callback) {
		var params = GUtil.fn_convert_objToStr({
			SERVICE : this.SERVICES,
			VERSION : this.VERSION,
			REQUEST : "GetCapabilities"
		});
		
		GMapUtil.sendProxyGet(serviceUrl, params, function(res) {
			var format = new OpenLayers.Format.WFSCapabilities({version : "1.1.0"});
			callback(format.read(res.xml));
		});
	},
	
	extendParams : function(params, options) {
		OpenLayers.Util.extend(params, options);
		
		if(options.tables && !(options.tables instanceof Array)) {
			params.tables = [options.tables];
		}
		if(options.fields && !(options.values instanceof Array)) {
			params.fields = [options.fields];
		}
		if(options.values && !(options.values instanceof Array)) {
			params.values = [options.values];
		}
		if(options.sortFields && !(options.sortFields instanceof Array)) {
			params.sortFields = [options.sortFields];
		}
		if(options.sortOrders && !(options.sortOrders instanceof Array)) {
			params.sortOrders = [options.sortOrders];
		}
	},
	
	getSortBy : function(fields, orders) {
		var str = "";
		
		str += "<ogc:SortBy>";
		
		for(var i=0, len=fields.length; i < len; i++) {
			str += "<ogc:SortProperty>";
			str += "<ogc:PropertyName>";
			str += fields[i];
			str += "</ogc:PropertyName>";
			str += "<ogc:SortOrder>";
			str += orders[i]?orders[i]:"ASC";
			str += "</ogc:SortOrder>";
			str += "</ogc:SortProperty>";
		}
		
		str += "</ogc:SortBy>";
		
		return str;
	},
	
	getFeatureById : function(serviceUrl, parameters, callback, options) {
		var params = {
			maxFeatures : 9999,
			prefix : "",
			tables : [],
			values : [],
			sortFields : [],
			sortOrders : [],
			useDomain : false
		};
		
		this.extendParams(params, parameters);
		
		var queryStr = '';
		for(var i=0, len=params.tables.length; i < len; i++) {
			var useDomain = params.useDomain?'useDomain="true"':'';
			queryStr += '<wfs:Query typeName="' + params.prefix + ':' + params.tables[i] + '" ' + useDomain + '  >';
			
			if(i < params.values.length)
				queryStr += '<ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\"><ogc:FeatureId fid=\"' + params.tables[i] + '.' + params.values[i] + '\"/></ogc:Filter>';
			
			if(params.sortFields.length > 0)
				queryStr += this.getSortBy(params.sortFields, params.sortOrders);
			
			queryStr += '</wfs:Query>';
		}
		
		this.getFeature(serviceUrl, params, queryStr, callback, options);
	},
	
	getFeatureByComparison : function(serviceUrl, parameters, callback, options) {
		var params = {
			maxFeatures : 9999,
			prefix : "",
			type : "==",
			tables : [],
			fields : [],
			values : [],
			sortFields : [],
			sortOrders : [],
			useDomain : false
		};
		
		this.extendParams(params, parameters);

		var queryStr = '';		
		for(var i=0, len=params.tables.length; i < len; i++) {
			var useDomain = params.useDomain?'useDomain="true"':'';
			queryStr += '<wfs:Query typeName="' + params.prefix + ':' + params.tables[i] + '" ' + useDomain + '  >';
			var filter = new OpenLayers.Filter.Comparison({
				type : params.type,
				property : params.fields[i],
				value : params.values[i]
			});
			//queryStr += this.format.filter.write(filter).xml;
			queryStr += this.format.filter.write(filter);
			
			if(params.sortFields.length > 0)
				queryStr += this.getSortBy(params.sortFields, params.sortOrders);
			
			queryStr += '</wfs:Query>';
		}
		
		this.getFeature(serviceUrl, params, queryStr, callback, options);
	},
	
	getFeatureByDWithin : function(serviceUrl, parameters, callback, options) {
		var params = {
			maxFeatures : 9999,
			prefix : "",
			type : OpenLayers.Filter.Spatial.DWITHIN,
			tables : [],
			distance : 100,
			values : [],
			sortFields : [],
			sortOrders : [],
			useDomain : false
		};
		
		this.extendParams(params, parameters);
		
		var queryStr = '';		
		for (var i = 0, len = params.tables.length; i < len; i++) {
			var useDomain = params.useDomain?'useDomain="true"':'';
			queryStr += '<wfs:Query typeName="' + params.prefix + ':' + params.tables[i] + '" ' + useDomain + '  >';
			var filter = new OpenLayers.Filter.Spatial({
				type: params.type,
				property : "G2_SPATIAL",
				value: params.values[0],
				distance: params.distance,
				distanceUnits: 'm'
			});
			/*
			filterStr += this.format.xml.write(this.format.filter.write(filter));
			filterStr += '</wfs:Query>';
			*/
			
//			queryStr += this.format.filter.write(filter).xml;
			
			queryStr += this.format.filter.write(filter);
			
			if(params.sortFields.length > 0)
				queryStr += this.getSortBy(params.sortFields, params.sortOrders);
			
			queryStr += '</wfs:Query>';

		}
		
		//this.getFeature(serviceUrl, params, filterStr, callback, options);
		this.getFeature(serviceUrl, params, queryStr, callback, options);
	},
	
	getFeatureByGeometry : function(serviceUrl, parameters, callback, options) {
		var params = {
			maxFeatures : 9999,
			prefix : "",
			type : OpenLayers.Filter.Spatial.INTERSECTS,
			tables : [],
			values : [],
			sortFields : [],
			sortOrders : [],
			useDomain : false
		};
		this.extendParams(params, parameters);
		
		var queryStr = '';		
		for (var i = 0, len = params.tables.length; i < len; i++) {
			var useDomain = params.useDomain?'useDomain="true"':'';
			queryStr += '<wfs:Query typeName="' + params.prefix + ':' + params.tables[i] + '" ' + useDomain + '  >';
			var filter = new OpenLayers.Filter.Spatial({
				type: params.type,
				property : "G2_SPATIAL",
				value: params.values[0]
			});
			/*
			filterStr += this.format.xml.write(this.format.filter.write(filter));
			filterStr += '</wfs:Query>';
			*/
			
			//queryStr += this.format.filter.write(filter).xml;
			queryStr += this.format.filter.write(filter);
			
			if(params.sortFields.length > 0)
				queryStr += this.getSortBy(params.sortFields, params.sortOrders);
			
			queryStr += '</wfs:Query>';
		}
		this.getFeature(serviceUrl, params, queryStr, callback, options);
		//this.getFeature(serviceUrl, params, filterStr, callback, options);
	},
	
	getFeature : function(serviceUrl, params, filter, callback, options) {
		var wfsStr = '';
		wfsStr += '<wfs:GetFeature service="WFS" version="1.1.0" maxFeatures="' + params.maxFeatures + '" xmlns:ehmp="http://health-e-waterways.org" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">';
		wfsStr += filter;
		wfsStr += '</wfs:GetFeature>';
		
		var control = this;
		GMapUtil.sendProxyPost(
			serviceUrl,
			wfsStr,
			function(res) {
				control.parseGetFeature(res, callback, options);
			}
		);
	},
	
	parseGetFeature : function(res, callback, options) {
		if(res.responseXML) {
			res = res.responseXML;
		}
		
		var arr = [];
		var success = true;
		
		var browserNm = GUtil.getBrowserName();
		
		var featureCollection;
		if(browserNm == "msie" || browserNm == "firefox") {
			featureCollection = res.getElementsByTagName("wfs:FeatureCollection");
		}
		else {
			featureCollection = res.getElementsByTagName("FeatureCollection");
		}
		
		if(featureCollection && featureCollection[0]) {
			if(featureCollection[0].getAttribute("numberOfFeatures") != 0) {
				var featureMembers;
				if(browserNm == "msie" || browserNm == "firefox") {
					featureMembers = featureCollection[0].getElementsByTagName("gml:featureMember");
				}
				else {
					featureMembers = featureCollection[0].getElementsByTagName("featureMember");
				}
				
				for(var i=0, len = featureMembers.length; i < len; i++) {
					var tmpArr = featureMembers[i].firstChild.getAttribute("fid").split(".");
					
					//같은 테이블인지 체크 후 테이블 아래로 여러 레코드 들이 들어가게 함
					var tmpTable = tmpArr[0];
					var index = null;
					for(var j in arr) {
						if(arr[j].table == tmpTable) {
							index = j;
							break;
						}; 
					}
					
					if(!index) {
						var obj = {
							table : tmpTable,	//테이블 명
							results : []		//레코드 들
						};
						arr.push(obj);
					}
					else {
						obj = arr[index];
					}
					
					//한개의 레코드
					var result = {
						g2id : tmpArr[1],	//G2_ID 필드 (PK)
						feature : null,		//도형
						title : tmpArr[1],	//제목
						fields : {}			//필드들
					};
					
					var field = featureMembers[i].firstChild.firstChild;
					while(field) {
						//도형
						if(field.tagName.replace(field.prefix+":", "").toLowerCase() == "g2_spatial") {
							result["feature"] = this.format.gml.parseFeature(field);
						}
						//속성
						else {
							//대표 속성
							if(options && options.titles && options.titles[obj.table] && field.tagName.replace(field.prefix+":", "").toLowerCase() == options.titles[obj.table].toLowerCase()) {
								result.title = $(field).text();
							}
							//속성
							if(field.tagName.replace(field.prefix+":", "").toLowerCase() != "boundedby") {
								if(!$(field).text()) result.fields[field.tagName.replace(field.prefix+":", "").toLowerCase()] = $(field).text();
								else result.fields[field.tagName.replace(field.prefix+":", "").toLowerCase()] = $(field).text();
							}
						}
						
						field = field.nextSibling;
					}
					
					obj.results.push(result);
				}
			}
		}
		else {
			success = false; 
		}
		
		if(options && options.alias) {
			this.getRequestAlias(arr, success, callback, options);
		}
		else {
			callback({
				data : arr,
				success : function() {
					return success;
				}
			});
		}
	},
	
	

	insert : function(serviceUrl, features, prefix, table, fields, values, callback, srsName) {
		if(features && !(features instanceof Array)) {
			features = [features];
		}
		
		var srs = "EPSG:4326";
		if(srsName && srsName.length > 0){
			srs = srsName;
		}
		var wfsStr = '';
		wfsStr += '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ogc="http://www.opengis.net/ogc" xmlns:sf="http://cite.opengeospatial.org/gmlsf">';
		wfsStr += '<wfs:Insert srsName="' + srs + '">';
		wfsStr += '<' + prefix + ':' + table + ' xmlns:' + prefix + '="http://geogate.g-inno.com/dataserver/' + prefix + '">';
		wfsStr += '<' + prefix + ':G2_SPATIAL>';
		wfsStr += this.createGmlXml(features);
		wfsStr += '</' + prefix + ':G2_SPATIAL>';
		if(fields && fields.length > 0) wfsStr += this.createAttrXml(prefix, fields, values);
		wfsStr += '</' + prefix + ':' + table + '>';
		wfsStr += '</wfs:Insert>';
		wfsStr += '</wfs:Transaction>';
		
		$("#txtTest").val(wfsStr);
		
		var control = this;
		GMapUtil.sendProxyPost(
			serviceUrl,
			wfsStr,
			function(res) {
				var transactionResponse = res.getElementsByTagName("wfs:TransactionResponse");
				
				if(transactionResponse.length > 0) {
					var arr = [];
					
					var totalInserted = transactionResponse[0].getElementsByTagName("wfs:totalInserted");
					var featureId = transactionResponse[0].getElementsByTagName("ogc:FeatureId");
					
					for(var i=0, len=featureId.length; i < len; i++) {
						arr.push(featureId[i].getAttribute("fid"));
					}
					
					if(callback) {
						callback({
							count : $(totalInserted[0]).text(),
							ids : arr 
						});
					}
				}
			}
		);
	},
	
	update : function(serviceUrl, features, prefix, table, fields, values, value, callback) {
		if(features && !(features instanceof Array)) {
			features = [features];
		}

		var wfsStr = '';
		wfsStr += '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ogc="http://www.opengis.net/ogc" xmlns:sf="http://cite.opengeospatial.org/gmlsf">';
		
		wfsStr += '<wfs:Update typeName="' + prefix + ':' + table + '" xmlns:' + prefix + '="http://geogate.g-inno.com/dataserver/' + prefix + '">';
		wfsStr += '<wfs:Property>';
		wfsStr += '<wfs:Name>G2_SPATIAL</wfs:Name>';
		wfsStr += '<wfs:Value>';
		wfsStr += this.createGmlXml(features);
		wfsStr += '</wfs:Value>';
		wfsStr += '</wfs:Property>';

		if(fields && fields.length > 0) wfsStr += this.updateAttrXml(fields, values);
		
		wfsStr += '<ogc:Filter>';
		wfsStr += '<ogc:PropertyIsEqualTo matchCase="true">';
		wfsStr += '<ogc:PropertyName>' + table + '.G2_ID</ogc:PropertyName> ';
		wfsStr += '<ogc:Literal>' + value + '</ogc:Literal> ';
		wfsStr += '</ogc:PropertyIsEqualTo>';
		wfsStr += '</ogc:Filter>';
		
		wfsStr += '</wfs:Update>';
		wfsStr += '</wfs:Transaction>';
		
		var control = this;
		GMapUtil.sendProxyPost(
			serviceUrl,
			wfsStr,
			function(res) {
				var transactionResponse = res.getElementsByTagName("wfs:TransactionResponse");
				
				if(transactionResponse.length > 0) {
					var totalUpdated = transactionResponse[0].getElementsByTagName("wfs:totalUpdated");
					
					if(callback) {
						callback({
							count : $(totalUpdated[0]).text()
						});
					}
				}
			}
		);
	},
	
	del : function(prefix, table, value, callback) {
		var wfsStr = '';
		wfsStr += '<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:ogc="http://www.opengis.net/ogc" xmlns:sf="http://cite.opengeospatial.org/gmlsf" releaseAction="ALL">';
		wfsStr += '<wfs:Delete typeName="' + prefix + ':' + table + '">';
		wfsStr += '<ogc:Filter xmlns:ogc=\"http://www.opengis.net/ogc\"><ogc:FeatureId fid=\"' + table + '.' + value + '\"/></ogc:Filter>';
		wfsStr += '</wfs:Delete>';
		wfsStr += '</wfs:Transaction>';
		
		var control = this;
		GMapUtil.sendProxyPost(
			serviceUrl,
			wfsStr,
			function(res) {
				var transactionResponse = res.getElementsByTagName("wfs:TransactionResponse");
				
				if(transactionResponse.length > 0) {
					var totalDeleted = transactionResponse[0].getElementsByTagName("wfs:totalDeleted");
					
					if(callback) {
						callback({
							count : $(totalDeleted[0]).text()
						});
					}
				}
			}
		);
	},
	
	createGmlXml :function(features) {
		var lineCount = 0;
		for ( var i in features) {
			if (features[i].geometry.CLASS_NAME == "OpenLayers.Geometry.LineString")
				lineCount++;
		}
		
		var xmlStr = "";
		
		if (features[0].geometry.CLASS_NAME == "OpenLayers.Geometry.Point") {
			xmlStr += this.createPointXml(features[0].geometry);
		}
		//LineString 이 1개
		if (lineCount == 1) {
			xmlStr += '<gml:LineString xmlns:gml="http://www.opengis.net/gml">';
			xmlStr += this.createLineStringXml(features[0].geometry);
			xmlStr += '</gml:LineString>';
		}
		//LineString 이 2 개 이상이면 MultiLineString (MultiCurve 는 WMS 오류 있음)
		else if (lineCount > 1) {
			xmlStr += '<gml:MultiLineString xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:4326">';
			for ( var i in features) {
				if (features[i].geometry.CLASS_NAME == "OpenLayers.Geometry.LineString") {
					xmlStr += '<gml:lineStringMember><gml:LineString>';
					xmlStr += this.createLineStringXml(features[i].geometry);
					xmlStr += '</gml:LineString></gml:lineStringMember>';
				}
			}
			xmlStr += '</gml:MultiLineString>';
		}
		
		if(features[0].geometry.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
			xmlStr += '<gml:Polygon xmlns:gml="http://www.opengis.net/gml">';
			xmlStr += '<gml:exterior>';
			xmlStr += '<gml:LinearRing>';
			xmlStr += this.createPolygonXml(features[0].geometry.components[0]);
			xmlStr += '</gml:LinearRing>';
			xmlStr += '</gml:exterior>';
			xmlStr += '</gml:Polygon>';
		}
		if(features[0].geometry.CLASS_NAME == "OpenLayers.Geometry.MultiPolygon"){
			xmlStr += '<gml:MultiPolygon xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:4326">';
			for(var i in features[0].geometry.components){
				xmlStr += '<gml:polygonMember>';
				xmlStr += '<gml:Polygon xmlns:gml="http://www.opengis.net/gml">';
				xmlStr += '<gml:outerBoundaryIs>';
				xmlStr += '<gml:LinearRing>';
				xmlStr += this.createMultiPolygonXml(features[0].geometry.components[i]);
				xmlStr += '</gml:LinearRing>';
				xmlStr += '</gml:outerBoundaryIs>';
				xmlStr += '</gml:Polygon>';
				xmlStr += '</gml:polygonMember>';
			}
			xmlStr += '</gml:MultiPolygon>';
		}
		
		return xmlStr;
	},
	
	//point XML 생성
	createPointXml : function(geometry) {
		var str = '';
		str += '<gml:Point xmlns:gml="http://www.opengis.net/gml"><gml:pos>';
		str += geometry.x + " ";
		str += geometry.y;
		str += '</gml:pos></gml:Point>';
		return str;
	},
	
	//line String XML 을 생성
	createLineStringXml : function(geometry) {
		var str = '';
		str += '<gml:posList>';
		for ( var i in geometry.components) {
			str += geometry.components[i].x + " ";
			str += geometry.components[i].y + " ";
		}
		str += '</gml:posList>';
		return str;
	},
	
	//polygon String XML 을 생성
	createPolygonXml : function(geometry){
		var str = '';
		str += '<gml:posList srsDimension="2" dimension="2">';
		for (var i in geometry.components) {
			str += geometry.components[i].x + " ";
			str += geometry.components[i].y + " ";
		}
		str += '</gml:posList>';
		return str;
	},
	
	createMultiPolygonXml : function(geometry){
		var str = '';
		str += '<gml:coordinates>';
		for (var i in geometry.components[0].components) {
			str += geometry.components[0].components[i].x + ",";
			str += geometry.components[0].components[i].y + " ";
		}
		str = str.substring(0, str.length-1);
		str += '</gml:coordinates>';
		return str;
	},
	
	
	createAttrXml : function(prefix, fields, values) {
		var str = '';
		for(var i=0,len=fields.length; i<len; i++) {
			str += '<'+prefix+':'+fields[i]+'>'+values[i]+'</'+prefix+':'+fields[i]+'>';
		}
		return str;
	},
	
	updateAttrXml : function(fields, values) {
		var str = '';
		for(var i=0,len=fields.length; i<len; i++) {
			str += "<wfs:Property>";
			str += "<wfs:Name>" + fields[i] + "</wfs:Name>";
			str += "<wfs:Value>" + values[i] + "</wfs:Value>";
			str += "</wfs:Property>";
		}
		return str;
	},
	
	/**********************************************************************************
	 * 함수명 : getRequestAlias
	 * 설 명 : layer, field 명을 alias 명으로 변환
	 * 인 자 : obj (속성정보 결과 배열)
	 * 사용법 : getRequestAlias(obj)
	 * 작성일 : 2011.05.19
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.19		최원석		최초 생성
	 * 
	 **********************************************************************************/
	getRequestAlias : function(arr, success, callback, options) {
		var control = this;

		var tables = [];
		var fields = [];
		for(var i=0, len=arr.length; i < len; i++) {
			for (var j in arr[i].results[0].fields) {
				tables.push(arr[i].table);
				fields.push(j);
			}
		}
		
		$.post(
			"/gmap/attr/getAlias.do",
			{
				tables : tables.join(),
				fields : fields.join()
			}, 
			function (res) {
				for(var i=0, len=arr.length; i < len; i++) {
					arr[i].alias = res.data[i];
				}
				
				//트리거 이벤트 실행
				callback({
					data : arr,
					success : function() {
						return success;
					}
				});
			},
			"json"
		);
	},
	
	orderGetFeatureArr : function(arr, field, order) {
		var len = arr.length;
		for(var i=len-1; i > 0; i--) {
			for(var j=0; j < i; j++) {
				if(order.toLowerCase() == 'desc') {
					if(arr[j]["fields"][field] < arr[j+1]["fields"][field]) {
						GUtil.Array.fn_swap_element(arr, j, j+1);
					}
				}
				else {
					if(arr[j]["fields"][field] > arr[j+1]["fields"][field]) {
						GUtil.Array.fn_swap_element(arr, j, j+1);
					}
				}
			}
		}				
	}
};


GRequest.WPS = {
		
	SERVICES : "WPS",
	
	VERSION : "1.0.0",
	
	format : {
		gml : new OpenLayers.Format.GML(),
		filter : new OpenLayers.Format.Filter({ version : "1.0.0" })
	},
	
	/*
	dataInputs = {
		layer : null,
		position : null,
		distance : null,
		count : null,
		result : null,
		field : null
	};
	*/
	getNearFeature : function(serviceUrl, dataInputs, callback) {
		var params = {
			Service : this.SERVICES,
			Version : this.VERSION,
			Request : "Execute",
			Identifier : "NearFeature",
			DataInputs : "",
			Responsedocument : "NEARFEATURE_OUTPUT"
		};
		
		params.DataInputs = "[";
		params.DataInputs += GUtil.fn_convert_objToStr(dataInputs, ";");
		params.DataInputs += "]";
		
		var control = this;
		GMapUtil.sendProxyPost(
			serviceUrl,
			GUtil.fn_convert_objToStr(params),
			function(res) {
				control.parseGetFeature(res, callback);
			}
		);
	},
	
	parseGetFeature : function(res, callback) {
		var arr = [];
		var success = true;
		
		var featureCollection = res.getElementsByTagName("wfs:FeatureCollection");
		
		if(featureCollection && featureCollection[0]) {
			var featureMembers = featureCollection[0].getElementsByTagName("gml:featureMember");
			
			for(var i=0, len = featureMembers.length; i < len; i++) {
				for(var i=0, len = featureMembers.length; i < len; i++) {
					var tables = featureMembers[i].firstChild;
					
					var tmpTable = tables.tagName;
					var index = null;
					for(var j in arr) {
						if(arr[j].table == tmpTable) {
							index = j;
							break;
						}; 
					}
					
					if(!index) {
						var obj = {
							table : tmpTable,	//테이블 명
							results : []		//레코드 들
						};
						arr.push(obj);
					}
					else {
						obj = arr[index];
					}
					
					//한개의 레코드
					var result = {
						feature : null,		//도형
						fields : {}			//필드들
					};
					
					var field = featureMembers[i].firstChild.firstChild;
					while(field) {
						//도형
						if(field.tagName.toLowerCase() == "geometry") {
							result["feature"] = this.format.gml.parseFeature(field);
						}
						//속성
						else {
							result.fields[field.tagName.toLowerCase()] = $(field).text();
						}
						field = field.nextSibling;
					}
					obj.results.push(result);
				}
			}
		}
		else {
			success = false; 
		}
		
		callback({
			data : arr,
			success : function() {
				return success;
			}
		});
	},
	
	getHoldWaterInfo : function(serviceUrl, dataInputs, callback){
		var params = {
			Service : this.SERVICES,
			Version : this.VERSION,
			Request : "Execute",
			Identifier : "HoldWater",
			DataInputs : "",
			Responsedocument : "HOLDWATER_OUTPUT"
		};
		/*
  		params.DataInputs += "LOCTABLE=";
		params.DataInputs += 테이블명("TE_SMALL_BLCK") + ";";
		params.DataInputs += "LOCFIELD=";
		params.DataInputs += 테이블필드명("SMALL_BLCK_ID") + ";";
		params.DataInputs += "LOCVALUE=";
		params.DataInputs += 테이블필드값("K0000100") + ";";
		params.DataInputs += "DISTANCE=";
		params.DataInputs += 버퍼("10") + ";";
		params.DataInputs += "PIPEDISTANCE=";
		params.DataInputs += 관로버퍼("0.3") + ";";
		params.DataInputs += "ENDDISTANCE=";
		params.DataInputs += 관말버퍼("0.3");
		*/
		params.DataInputs = "[";
		params.DataInputs += GUtil.fn_convert_objToStr(dataInputs, ";");
		params.DataInputs += "]";
		
		var control = this;
		GMapUtil.sendProxyPost(
			serviceUrl,
			GUtil.fn_convert_objToStr(params),
			function(res) {
				control.parseHoldWaterInfo(res, callback);
			}
		);
	},
	
	parseHoldWaterInfo : function(res, callback) {
		var arr = [];
		var success = true;
		var results = {};
		var holdWater = res.getElementsByTagName("prof:HoldWater");
		
		var obj = {
			results : []	
		};
		arr.push(obj);
		
		var result = {
				pipes : [],
				valves : [],
				fires : []
		};
		
		if(holdWater && holdWater[0]){
			var field = holdWater[0].firstChild;
			while(field){
				if(field.tagName.toLowerCase().split(":")[1] == "pipes"){
					result["pipes"].push($(field).text());
				}
				else if(field.tagName.toLowerCase().split(":")[1] == "valves"){
					result["valves"].push($(field).text());
				}
				else if(field.tagName.toLowerCase().split(":")[1] == "fires"){
					result["fires"].push($(field).text());
				}
				field = field.nextSibling;
			}
			obj.results.push(result);
		}
		else {
			success = false; 
		}
		
		callback({
			data : arr,
			success : function() {
				return success;
			}
		});
	}
};
