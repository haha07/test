/**********************************************************************************
 * 파일명 : GVector.js
 * 설 명 : OpenLayers.Layer.Vector 를 상속 받아 수정
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.19		최원석				0.1					최초 생성
 * 
 * 
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GVector = OpenLayers.Class(OpenLayers.Layer.Vector, {
	
	redraw: function() {
        var redrawn = false;
        if (this.map) {

            // min/max Range may have changed
            this.inRange = this.calculateInRange();

            // map's center might not yet be set
            var extent = this.getExtent();

            if (extent && this.inRange && this.visibility) {
                var zoomChanged = true;
                this.moveTo(extent, zoomChanged, false);
                this.events.triggerEvent("moveend",
                    {"zoomChanged": zoomChanged});
                redrawn = true;
            }
        }
		
		//창 닫기 에러 - 조건문 추가
		if(this.map.paddingForPopups) {
			for(var i in this.map.popups) {
				var popup = this.map.popups[i];
				if(popup && popup.attributes && popup.attributes.featureType && popup.attributes.featureType == 'Text' && popup.type == 'draw') {
					if(popup.attributes['font-family']) {
						$("#"+popup.id).css('font-family', popup.attributes['font-family']);
					}
					if(popup.attributes['font-size']) {
						$("#"+popup.id).css('font-size', popup.attributes['font-size']);
					}
					if(popup.attributes['color']) {
						$("#"+popup.id).css('color', popup.attributes['color']);
					}
				}
				
				popup.updateSize();
			}
		}
		
        return redrawn;
    },
	
	parseStyle : function(feature, style) {
		// don't try to draw the feature with the renderer if the layer is not 
	    // drawn itself

	    if (typeof style != "object") {
	        if(!style && feature.state === OpenLayers.State.DELETE) {
	            style = "delete";
	        }
	        var renderIntent = style || feature.renderIntent;
	        style = feature.style || this.style;
	        if (!style) {
	            style = this.styleMap.createSymbolizer(feature, renderIntent);
	        }
	    }

		return style;
	},
    
    addPoint : function(lon, lat, attributes) {
    	var point  = new OpenLayers.Geometry.Point(lon, lat);
    	var feature = new OpenLayers.Feature.Vector(point, attributes);
    	
    	this.addFeatures(feature);
		
		return feature;
    },
    
    getGML : function() {
    	var gml = new OpenLayers.Format.GML();
    	return gml.write(this.features);
    },
    
    setGML : function(str) {
    	var gml = new OpenLayers.Format.GML();
    	var features = gml.read(str);
    	
    	if(features && features.length) {
    		this.addFeatures(features);
    	}
    },
    
	CLASS_NAME: "GVector"
});