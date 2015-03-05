/**********************************************************************************
 * 파일명 : GChartTool.js
 * 설 명 : 지도 위에 표현될 Chart를 관리
 * 필요 라이브러리 : OpenLayers, Google API
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2014.11.11		이경찬				0.1					최초 생성
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * Google API
 * 출처 : http://google.com
 * 
**********************************************************************************/
GChartTool = OpenLayers.Class({
	gMap : null,
	
	initialize : function(gMap, options){
		this.gMap = gMap;
		var chartLayer = new GVector("chartLayer");
		gMap.addLayer(chartLayer);
		
		this.fn_set_layerStyle(options);
	    this.fn_get_data(options);
	},
	
	resetChart : function(options){
		this.fn_set_layerStyle(options);
	    this.fn_get_data(options);
	},
	
	fn_set_layerStyle : function(options){
		var symbol = this;
        var gMap = this.gMap;
        
		// 기본 심볼 설정
		this.Geometry(options.symbol.type, options.symbol.maxSize, options.symbol.maxValue);

        var context = {
			// 심볼사이즈 계산함수
            getSize: function(feature) {
                return (options.symbol.minSize*1) + Math.round(symbol.getSize(feature.attributes[options.chart.sumName]) * Math.pow(2,gMap.getZoom()-1));
            },
            // Google Chart 요청 Request 생성 함수
            getChartURL: function(feature) {
            	var values = "";
            	var sectionName = "";
            	for(var i in options.chart.subName){
            		values += feature.attributes[options.chart.subName[i]];
            		sectionName += feature.attributes[options.chart.subName[i]];
            		if(options.chart.subName.length-1 != i){
            			values += ',';
            			sectionName += '|';
            		}
            	}
                var size = (options.symbol.minSize*1) + Math.round(symbol.getSize(feature.attributes[options.chart.sumName]) * Math.pow(2,gMap.getZoom()-1));
                
                // cht : 차트 종류, chd : 차트 데이터, chs : 차트 사이즈, chf : 차트색상설정
                // ** Google Chart API 사이트 참조
                var charturl = 'https://chart.googleapis.com/chart?cht=' + options.chart.type + '&chd=t:' + values + '&chs=' + size + 'x' + size + '&chf=' + options.chart.style;
                debugger;
                return charturl;
            }
        };

        var template = {
            fillOpacity: 1.0,
            externalGraphic: "${getChartURL}",
            graphicWidth: "${getSize}",
            graphicHeight: "${getSize}",
            strokeWidth: 0
        };

        var style = new OpenLayers.Style(template, {context: context});
	    var styleMap = new OpenLayers.StyleMap({'default': style, 'select': {fillOpacity: 0.7}});
	    gMap.getLayerByName("chartLayer").styleMap = styleMap;
	},
	
	fn_get_data : function(options){
		var geometry = this.gMap.getExtent().toGeometry();
		var t = this;

		GRequest.WFS.getFeatureByGeometry(
			g2WebServiceUrl, 
			{
				prefix : options.data.prefix, // 데이터하우스명
				tables : options.data.tables, 
				values : [geometry]
			}, 
			function(res) {
				var data = t.fn_make_data(res,options);
				t.fn_draw_data(data);
			}
		);
	},
	
	// getFeature 결과를 geojson형태로 변환
	// 사업별 커스터마이징 필요!!
	fn_make_data : function(res, options){
		var data = res.data[0].results;
		var resData = {
				"type" : "FeatureCollection",
				"features" : []
		};
		for(var i in data){
			var feature = data[i].feature;
			var fields = data[i].fields;
			var g2id = data[i].g2id;
			var centroid = feature.geometry.getCentroid();
			
			var ranPopulation = Math.floor(Math.random() * 1000000) + 100000;
			var ranPop_0_14 = Math.floor(Math.random() * 100) + 1;
			var ranPop_15_59 = Math.floor(Math.random() * (100-ranPop_0_14)) + 1;
			var ranPop_60_above = 100 - ranPop_0_14 - ranPop_15_59;
			
			var tmpObj = {
					"type" : "Feature",
					"id" : g2id,
					"geometry" : {
						"type" : "Point",
						"coordinates" : [centroid.x + eval(options.data.coordOffsetx), centroid.y + eval(options.data.coordOffsety)]
					},
					"properties" : {
						"population":ranPopulation,
						"pop_0_14":ranPop_0_14,
						"pop_15_59":ranPop_15_59,
						"pop_60_above":ranPop_60_above
					}
			};
			
			for(var j in fields){
				tmpObj.properties[j] = fields[j];
			}
			
			resData.features.push(tmpObj);
		}
		
		return resData;
		
	},
	
	// 지도에 geojson Feature 그리기
	fn_draw_data : function(data){
		 var geojson_format = new OpenLayers.Format.GeoJSON();
		 this.gMap.getLayerByName("chartLayer").addFeatures(geojson_format.read(data));
		 this.gMap.getLayerByName("chartLayer").redraw();
	},
	
	Geometry : function(symbol, maxSize, maxValue){
	    this.symbol = symbol;
	    this.maxSize = maxSize;
	    this.maxValue = maxValue;
	
	    this.getSize = function(value){
	        switch(this.symbol) {
	            case 'circle': // Returns radius of the circle
	            case 'square': // Returns length of a side
	                return Math.sqrt(value/this.maxValue)*this.maxSize;
	            case 'bar': // Returns height of the bar
	                return (value/this.maxValue)*this.maxSize;
	            case 'sphere': // Returns radius of the sphere
	            case 'cube': // Returns length of a side
	                return Math.pow(value/this.maxValue, 1/3)*this.maxSize;
	        }
	    };
	},
	
	/*serialize : function() {
        var Msg = "<strong>" + vectors.selectedFeatures[0].attributes["name"] + "</strong><br/>";
        Msg    += "Population: " + vectors.selectedFeatures[0].attributes["population"] + "<br/>";
        Msg    += "0-14 years: " + vectors.selectedFeatures[0].attributes["pop_0_14"] + "%<br/>";
        Msg    += "15-59 years: " + vectors.selectedFeatures[0].attributes["pop_15_59"] + "%<br/>";
        Msg    += "60 and over: " + vectors.selectedFeatures[0].attributes["pop_60_above"] + "%<br/>";
        document.getElementById("info").innerHTML = Msg;
    },*/
	
	CLASS_NAME: "GChartTool"
		
});

// GeoJSON 형태의 지도 정보
/*{
	"type" : "FeatureCollection",
	"features":[
		{
			"type":"Feature",
			"id":4,
			"geometry":{
				"type":"Point",
				"coordinates":[65.216,33.677]
			},
			"properties":{
					"name":"Afghanistan",
					"population":25067407,
					"pop_0_14":47,
					"pop_15_59":49.3,
					"pop_60_above":3.7
			}
		},
		{
			"type":"Feature",
			"id":8,
			"geometry":{
				"type":"Point",
				"coordinates":[20.068,41.143]
			},
			"properties":{
				"name":"Albania",
				"population":3153731,
				"pop_0_14":26.3,
				"pop_15_59":61.4,
				"pop_60_above":12.3
			}
		}
	]
}*/