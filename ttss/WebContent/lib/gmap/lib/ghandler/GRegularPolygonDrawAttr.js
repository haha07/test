GRegularPolygonDrawAttr = OpenLayers.Class(OpenLayers.Handler.RegularPolygon, {
	
	attributes : null,
	
	dragStartX : 0,
	
	dragStartY : 0,
	
	down: function(evt) {
        this.fixedRadius = !!(this.radius);
        var maploc = this.map.getLonLatFromPixel(evt.xy);
        this.origin = new OpenLayers.Geometry.Point(maploc.lon, maploc.lat);
        // create the new polygon
        if(!this.fixedRadius || this.irregular) {
            // smallest radius should not be less one pixel in map units
            // VML doesn't behave well with smaller
            this.radius = this.map.getResolution();
        }
        if(this.persist) {
            this.clear();
        }
        this.feature = new OpenLayers.Feature.Vector();
        this.createGeometry();
        this.callback("create", [this.origin, this.feature]);
        this.layer.addFeatures([this.feature], {silent: true});
        this.layer.drawFeature(this.feature, this.style);
        
        //point Feature를 나타낼 지도 좌표를 구함
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
        
        this.dragStartX = lonlat.lon;
        this.dragStartY = lonlat.lat;
        
        var popup;
    	//처음 일 경우 시작 메시지 팝업창 생성
		var contentHtml = "<div class='olControlMeasurePopup olControlCircleAttr'><span class='MeasureColor'>0.0m</span></div>";
    	this.popup = new GPopup("measurePopup", lonlat, null, contentHtml, new OpenLayers.Pixel(5,5));
    	this.removePrevPopup();
    	this.map.addPopup(this.popup);
		
		this.popup.updateSize();
		this.popup.type = "attrCircle";
    },
    
    removePrevPopup: function(){
    	for(var i in this.map.popups){
    		if(this.map.popups[i].id == "measurePopup"){
    			this.map.removePopup(this.map.popups[i]);
    		}
    	}
    },
    
    /**
     * APIMethod: deactivate
     * Turn off the handler.
     *
     * Returns:
     * {Boolean} The handler was successfully deactivated
     */
    deactivate: function() {
    	// 비활성화 될 때 측정 팝업내용 삭제
    	this.removePrevPopup();
    	
        var deactivated = false;
        if(OpenLayers.Handler.Drag.prototype.deactivate.apply(this, arguments)) {
            // call the cancel callback if mid-drawing
            if(this.dragging) {
                this.cancel();
            }
            // If a layer's map property is set to null, it means that that
            // layer isn't added to the map. Since we ourself added the layer
            // to the map in activate(), we can assume that if this.layer.map
            // is null it means that the layer has been destroyed (as a result
            // of map.destroy() for example.
            if (this.layer.map != null) {
                this.layer.destroy(false);
                if (this.feature) {
                    this.feature.destroy();
                }
            }
            this.layer = null;
            this.feature = null;
            deactivated = true;
        }
        return deactivated;
    },
    
    move: function(evt) {
        var maploc = this.map.getLonLatFromPixel(evt.xy);
        var point = new OpenLayers.Geometry.Point(maploc.lon, maploc.lat);
        if(this.irregular) {
            var ry = Math.sqrt(2) * Math.abs(point.y - this.origin.y) / 2;
            this.radius = Math.max(this.map.getResolution() / 2, ry);
        } else if(this.fixedRadius) {
            this.origin = point;
        } else {
            this.calculateAngle(point, evt);
            this.radius = Math.max(this.map.getResolution() / 2,
                                   point.distanceTo(this.origin));
        }
        this.modifyGeometry();
        if(this.irregular) {
            var dx = point.x - this.origin.x;
            var dy = point.y - this.origin.y;
            var ratio;
            if(dy == 0) {
                ratio = dx / (this.radius * Math.sqrt(2));
            } else {
                ratio = dx / dy;
            }
            this.feature.geometry.resize(1, this.origin, ratio);
            this.feature.geometry.move(dx / 2, dy / 2);
        }
        this.layer.drawFeature(this.feature, this.style);
        
        //팝업을 마우스 포인터를 따라 다니게 한다.
		if(this.popup) {
			var lonlat = this.map.getLonLatFromPixel(evt.xy);
			
			var dragEndX = Math.abs(lonlat.lon);
			var dragEndY = Math.abs(lonlat.lat);

			this.radiusDist = GUtil.fn_fmt_fix(Math.sqrt(Math.pow(dragEndX-this.dragStartX,2)+Math.pow(dragEndY-this.dragStartY,2)),1);
			
			contentHtml = "<div class='olControlMeasurePopup olControlCircleAttr'><span class='MeasureColor'>" + this.measureDistance(this.radiusDist) + "</span></div>";
			this.popup.setContentHTML(contentHtml);
			this.popup.updateSize();
            this.popup.moveTo(evt.xy);	
		}
    },
    
    measureDistance : function(subLength) {
		//단위 계산을 위해 tempLength로 거리를 저장
    	var tempLength = subLength;
    	
    	//tempLength 에 km 단위를 적용
    	tempLength *= (OpenLayers.INCHES_PER_UNIT["m"] / OpenLayers.INCHES_PER_UNIT['km']);
        
    	//km 단위를 적용 후 거리가  1km 이상일 경우 km 단위를 사용 
        if(tempLength > 1) subLength = tempLength.toFixed(2) + "km";
        
        //그렇지 않을 경우 m 단위를 사용
        else subLength = subLength.toFixed(2) + "m";
        
        //계산 결과 값을 리턴
		return subLength;
	},
    
    up: function(evt) {
        this.finalize();
        // the mouseup method of superclass doesn't call the
        // "done" callback if there's been no move between
        // down and up
        if (this.start == this.last) {
            this.callback("done", [evt.xy]);
        }
    },
	
	callback: function (name, args) {
        // override the callback method to always send the polygon geometry
        if (this.callbacks[name]) {
            this.callbacks[name].apply(this.control,
                                       [this.feature.geometry.clone(), this.attributes]);
        }
        // since sketch features are added to the temporary layer
        // they must be cleared here if done or cancel
        if(!this.persist && (name == "done" || name == "cancel")) {
            this.clear();
        }
    },

	CLASS_NAME: "GRegularPolygonDrawAttr"
});