OpenLayers.DOTS_PER_INCH = 96;

//TileCache 클래스 상속하여 수정
OpenLayers.Layer.TileCacheCustom = OpenLayers.Class(OpenLayers.Layer.TileCache, {

	//초기화 함수 오버라이딩
	initialize: function(name, url, layername, options) {
        this.layername = layername;
        OpenLayers.Layer.Grid.prototype.initialize.apply(this,
                                                         [name, url, {}, options]);
        this.extension = this.format.split('/')[1].toLowerCase();
		//jpg를 jpeg로 변경하는 부분을 막음
        //this.extension = (this.extension == 'jpg') ? 'jpeg' : this.extension;
    },   
	
	//ImageMapper 에 맞게 영역 계산 하는 부분 수정
	getURL: function(bounds) {
    
        var res = this.map.getResolution();
        var bbox = this.maxExtent;
        var size = this.tileSize;
        /*
        var tileX = Math.round((bounds.left - bbox.left) / (res * size.w));
        var tileY = Math.round((bounds.bottom - bbox.bottom) / (res * size.h));
        var tileZ = this.serverResolutions != null ?
        */
        var tileX = bounds.bottom;
        var tileY = bounds.left;
        var tileZ = this.serverResolutions != null ?
            OpenLayers.Util.indexOf(this.serverResolutions, res) :
            this.map.getZoom();
        /**
         * Zero-pad a positive integer.
         * number - {Int} 
         * length - {Int} 
         *
         * Returns:
         * {String} A zero-padded string
         */
        
        function zeroPad(number, length) {
            number = String(number);
            var zeros = [];
            for(var i=0; i<length; ++i) {
                zeros.push('0');
            }
            return zeros.join('').substring(0, length - number.length) + number;
        }
        var components = [
            this.layername,
            zeroPad(tileZ, 2),
            /**
            zeroPad(parseInt(203676.18 / 1000000), 3),
            zeroPad((parseInt(203676.18 / 1000) % 1000), 3),
            zeroPad((parseInt(203676.18) % 1000), 3),
            zeroPad(parseInt(197361.87 / 1000000), 3),
            zeroPad((parseInt(197361.87 / 1000) % 1000), 3),
            zeroPad((parseInt(197361.87 ) % 1000), 3) + '.' + this.extension
            */
            zeroPad(parseInt(tileX / 1000000), 3),
            zeroPad((parseInt(tileX / 1000) % 1000), 3),
            zeroPad((parseInt(tileX) % 1000), 3),
            zeroPad(parseInt(tileY / 1000000), 3),
            zeroPad((parseInt(tileY / 1000) % 1000), 3),
            zeroPad((parseInt(tileY ) % 1000), 3) + '.' + this.extension
        ]; 
        var path = components.join('/');  
		/*
		 * 버전정보가 설정 되어 있을 경우 버전 정보에 맞게 수정
		 */
		if(this.version) path += "?v=" + this.version;
        var url = this.url;
        if (url instanceof Array) {
            url = this.selectUrl(path, url);
        } 
        url = (url.charAt(url.length - 1) == '/') ? url : url + '/';
        return url + path;
    },

	CLASS_NAME: "OpenLayers.Layer.TileCacheCustom"
});



//인덱스 맵 이벤트 객체
OpenLayers.Control.indexMapCustom = OpenLayers.Class(OpenLayers.Control.ZoomBox, {

	//기준 맵
    baseMap : null,

	//Box Handler 오버라이딩
    draw: function() {
        this.handler = new OpenLayers.Handler.BoxCustom( this,
                            {done: this.zoomBox}, {indexMap: true});
    },
	
	//생성자 함수
    initialize: function (baseMap, options) {
    	this.baseMap = baseMap;
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

	//zoomBox 에 따른 기준 지도 영역 이동
    zoomBox: function (position) {
    	if(position instanceof OpenLayers.Bounds) {
    		if (!this.out) {
                var minXY = this.map.getLonLatFromPixel(
                            new OpenLayers.Pixel(position.left, position.bottom));
                var maxXY = this.map.getLonLatFromPixel(
                            new OpenLayers.Pixel(position.right, position.top));
                var bounds = new OpenLayers.Bounds(minXY.lon, minXY.lat,
                                               maxXY.lon, maxXY.lat);
            } else {
                var pixWidth = Math.abs(position.right-position.left);
                var pixHeight = Math.abs(position.top-position.bottom);
                var zoomFactor = Math.min((this.map.size.h / pixHeight),
                    (this.map.size.w / pixWidth));
                var extent = this.map.getExtent();
                var center = this.map.getLonLatFromPixel(
                    position.getCenterPixel());
                var xmin = center.lon - (extent.getWidth()/2)*zoomFactor;
                var xmax = center.lon + (extent.getWidth()/2)*zoomFactor;
                var ymin = center.lat - (extent.getHeight()/2)*zoomFactor;
                var ymax = center.lat + (extent.getHeight()/2)*zoomFactor;
                var bounds = new OpenLayers.Bounds(xmin, ymin, xmax, ymax);
            }
    		this.baseMap.zoomToExtent(bounds, true);
    	}
    	else { // it's a pixel
    		this.baseMap.setCenter(this.map.getLonLatFromPixel(position), this.baseMap.numZoomLevels-1);
    	}
    },
	
    CLASS_NAME: 'OpenLayers.Control.indexMapCustom'
});



//인덱스 맵에 따른 박스 그리기 핸들러 수정
OpenLayers.Handler.BoxCustom = OpenLayers.Class(OpenLayers.Handler.Box, {
	//인덱스 맵에서 사용 여부
	indexMap : false,
	
	//영역 박스 시작 부분 수정
	startBox: function (xy) {
		if(this.indexMap && this.zoomBox) this.removeBox();
		
	    this.zoomBox = OpenLayers.Util.createDiv('zoomBox',
	                                             this.dragHandler.start);
	    this.zoomBox.className = this.boxDivClassName;                                         
	    this.zoomBox.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
	    this.map.viewPortDiv.appendChild(this.zoomBox);
	
	    OpenLayers.Element.addClass(
	        this.map.viewPortDiv, "olDrawBox"
	    );
	},
	
	//기준 지도 이동에 따른 색인도 영역 박스 다시 그림
	applyBox: function (bounds) {
		if(this.indexMap && this.zoomBox) this.removeBox();
		
		this.dragHandler.start = this.map.getPixelFromLonLat(new OpenLayers.LonLat(bounds.left, bounds.top));
		var endPixel = this.map.getPixelFromLonLat(new OpenLayers.LonLat(bounds.right, bounds.bottom));
		var width = endPixel.x - this.dragHandler.start.x;
		var height = endPixel.y - this.dragHandler.start.y;
		
		this.zoomBox = OpenLayers.Util.createDiv('zoomBox', this.dragHandler.start);
		this.zoomBox.className = this.boxDivClassName;
		this.zoomBox.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
		this.map.viewPortDiv.appendChild(this.zoomBox);
		this.zoomBox.style.width = width + "px";
		this.zoomBox.style.height = height + "px";
    },

	//영역 지정 완료 후 다시 그리거나 초기화 전 까지 삭제 안함
	endBox: function(end) {
	    var result;
	    if (Math.abs(this.dragHandler.start.x - end.x) > 5 ||    
	        Math.abs(this.dragHandler.start.y - end.y) > 5) {   
	        var start = this.dragHandler.start;
	        var top = Math.min(start.y, end.y);
	        var bottom = Math.max(start.y, end.y);
	        var left = Math.min(start.x, end.x);
	        var right = Math.max(start.x, end.x);
	        result = new OpenLayers.Bounds(left, bottom, right, top);
	    } else {
	        result = this.dragHandler.start.clone(); // i.e. OL.Pixel
	    } 
		
		if(!this.indexMap) {
			this.removeBox();
		} 

	    this.callback("done", [result]);
	},
	
	CLASS_NAME: "OpenLayers.Handler.BoxCustom"
});


//면적 측정
OpenLayers.Handler.PolygonMeasureCustom = OpenLayers.Class(OpenLayers.Handler.Polygon, {
	popup : null,
	
	//면적 계산
	measureArea : function() {
		//현재 거리 측정에 사용된 geometry값의 복사본을 가져옴
		var geometry = this.geometryClone();
		
		//geometry.getArea() - geometry의 면적을 구함
		var subLength = geometry.getArea();
		//단위 계산을 위해 tempLength로 거리를 저장
		var tempLength = subLength;
		
		//tempLength 에  km의 제곱 단위를 적용
		tempLength *= Math.pow(OpenLayers.INCHES_PER_UNIT["m"] / OpenLayers.INCHES_PER_UNIT['km'], 2);
	    
		//km의 제곱 단위를 적용 후 결과가 1 이상일 경우에만 km 제곱 단위를 사용
	    if(tempLength > 1) subLength = tempLength.toFixed(2) + "km" + "<sup>2</" + "sup>";
	    //그렇지 않을 경우 m 단위를 사용
	    else subLength = subLength.toFixed(2) + "m" + "<sup>2</" + "sup>";
	    
	    //계산 결과 값을 리턴
		return subLength;
	},


	//마우스 다운 이벤트
	mousedown: function(evt) {
		if (this.lastDown && this.lastDown.equals(evt.xy)) {
	       return false;
	    }
		if(this.lastDown == null) {
	    	// 멀티 라인일 경우 이전 측정 결과를 삭제 하지 않음
			if(!this.multiLine) {
				if(this.persist) { this.destroyFeature();  }
				this.removePopup();
			}
	        this.createFeature(evt.xy);
	    } else if((this.lastUp == null) || !this.lastUp.equals(evt.xy)) {
	        this.addPoint(evt.xy);
	    }
	    this.lastDown = evt.xy;
	    this.drawing = true;
		
		//마우스 다운 시 생성 되도록 mouseup 의 소스를 이동
        if(this.freehandMode(evt)) {
            this.removePoint();
            this.finalize();
        } else {
            if(this.lastUp == null) {
               this.addPoint(evt.xy);
            }
            this.lastUp = evt.xy;
        }
		
		//point Feature를 나타낼 지도 좌표를 구함
	    var lonlat = this.map.getLonLatFromPixel(evt.xy);
		
		//point Feature를 나타낼 지도 좌표를 구함
    	var pointFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat));
    	//point Feature 등록
    	this.layer.addFeatures(pointFeature);
		
		var popup;
	    /* 마우스 다운 이벤트 작동 수를 저장 */
	    if(!this.count) {
        	contentHtml = "<div class='olControlMeasurePopup'>시작</div>";
        	popup = new PopupCustom("measurePopup", lonlat, null, contentHtml, this.layer.map, new OpenLayers.Pixel(5,5));
        	
			contentHtml = "<div class='olControlMeasurePopup'>"+ this.measureArea() +"</div>";
        	this.popup = new PopupCustom("measurePopup", lonlat, null, contentHtml, this.layer.map, new OpenLayers.Pixel(5,5));
        	
        	this.map.addPopup(this.popup);
			
			this.popup.updateSize();
			this.popup.type = "measure";
			
	    	//클릭 횟수 저장 변수를 생성 및 초기화
            this.count = 1;
	    }
	    else {
			if(this.count > 1) {
				contentHtml = "<div class='olControlMeasurePopup'>"+ this.measureArea() +"</div>";
	        	popup = new PopupCustom("measurePopup", lonlat, null, contentHtml, this.layer.map, new OpenLayers.Pixel(5,5));
			}

	        this.count += 1;
	    }
		
		if (popup) {
			this.map.addPopup(popup);
			popup.type = "measure";
			popup.updateSize();
		}
    	
    	//마우스 우클릭 일때 실행
    	if(evt.button == "2") {
			this.rightclick(evt);
	        return true;
		}
	    
	    return false;
	},
	
	//마우스 이동 이벤트
	mousemove: function (evt) {
        if(this.drawing) { 
            if(this.mouseDown && this.freehandMode(evt)) {
                this.addPoint(evt.xy);
            } else {
                this.modifyFeature(evt.xy);
				
				//팝업을 마우스 포인터를 따라 다니게 한다.
				if(this.popup) {
					contentHtml = "<div class='olControlMeasurePopup'>"+ this.measureArea() +"</div>";
					this.popup.setContentHTML(contentHtml);
					this.popup.updateSize();
	                this.popup.moveTo(evt.xy);	
				}
            }
        }
        return true;
    },
	
	//마우스 우클릭(종료) 이벤트
	rightclick: function(evt) {
    	this.dblclick(evt);
    	return false;
    },
	
	//더블클릭 (종료) 이벤트
	dblclick: function(evt) {
		if(this.count < 3) {
			alert('면적은 3개 이상의 지점을 선택해야 합니다.');
			return false;
		}
		
		// 더블클릭시 클릭 카운트 초기화
		this.count = 0;
        if(!this.freehandMode(evt)) {
            var index = this.line.geometry.components.length - 1;
            this.line.geometry.removeComponent(this.line.geometry.components[index]);
            this.removePoint();
            this.finalize();
        }
        
		if(this.popup) {
			this.map.removePopup(this.popup);
			this.popup = null;
		}
        
        return false;
    },
    
 	 //컨트롤 비활성화
    deactivate: function() {
        if(!OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            return false;
        }
        // call the cancel callback if mid-drawing
        if(this.drawing) {
            this.cancel();
        }
        //this.destroyFeature();
        
        // If a layer's map property is set to null, it means that that layer
        // isn't added to the map. Since we ourself added the layer to the map
        // in activate(), we can assume that if this.layer.map is null it means
        // that the layer has been destroyed (as a result of map.destroy() for
        // example.

        //컨트롤 비 활성 시 측정 결과 유지 여부
        if(!this.persistControl) {
        	this.layer.destroy(false);
			this.removePopup();
        }
		
        this.layer.prevLayer = true;

        this.layer = null;
        return true;
    },
	
	//측정팝업 삭제
	removePopup : function() {
		var len = this.map.popups.length;
		for(var i=len-1; i >= 0; i--) {
			if(this.map.popups[i].type == "measure") {
				this.map.removePopup(this.map.popups[i]);
			}
		}
	},
	
    CLASS_NAME: "OpenLayers.Handler.PolygonMeasureCustom"
});


//거리 측정
OpenLayers.Handler.PathMeasureCustom = OpenLayers.Class(OpenLayers.Handler.Path, {
	popup : null,
	
	//거리 측정
	measureDistance : function() {
		// 현재 거리 측정에 사용된 geometry값의 복사본을 가져옴
		var geometry = this.geometryClone();
		
		//geometry.getLength() - geometry의 거리를 구함
		var subLength = geometry.getLength();
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
	
	//마우스 다운 이벤트
	mousedown: function(evt) {
		if (this.lastDown && this.lastDown.equals(evt.xy)) {
	        return false;
	    }
		if(this.lastDown == null) {
	    	// 멀티 라인일 경우 이전 측정 결과를 삭제 하지 않음
			if(!this.multiLine) {
				if(this.persist) { this.destroyFeature();  }
				this.removePopup();
			}
	        this.createFeature(evt.xy);
	    } else if((this.lastUp == null) || !this.lastUp.equals(evt.xy)) {
	        this.addPoint(evt.xy);
	    }
	    this.lastDown = evt.xy;
	    this.drawing = true;
		
		//마우스 다운 시 생성 되도록 mouseup 의 소스를 이동
        if(this.freehandMode(evt)) {
            this.removePoint();
            this.finalize();
        } else {
            if(this.lastUp == null) {
               this.addPoint(evt.xy);
            }
            this.lastUp = evt.xy;
        }
        
        //point Feature를 나타낼 지도 좌표를 구함
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
        
        //point Feature 생성
    	var pointFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat));
    	//point Feature 등록
    	this.layer.addFeatures(pointFeature);
    	
		var popup;
    	//처음 일 경우 시작 메시지 팝업창 생성
        if(!this.count) {
			var contentHtml = "<div class='olControlMeasurePopup'>시작</div>";
			popup = new PopupCustom("measurePopup", lonlat, null, contentHtml, this.layer.map, new OpenLayers.Pixel(5,5));
			
			contentHtml = "<div class='olControlMeasurePopup'>"+ this.measureDistance() +"</div>";
        	this.popup = new PopupCustom("measurePopup", lonlat, null, contentHtml, this.layer.map, new OpenLayers.Pixel(5,5));

        	this.map.addPopup(this.popup);
			
			this.popup.updateSize();
			this.popup.type = "measure";
			
	    	//클릭 횟수 저장 변수를 생성 및 초기화
            this.count = 1;
	    }
        //처음 클릭이 아닐 경우
	    else {
	    	contentHtml = "<div class='olControlMeasurePopup'>"+ this.measureDistance() + "</div>";
	    	popup = new PopupCustom("measurePopup", lonlat, null, contentHtml, this.layer.map, new OpenLayers.Pixel(5,5));
	    	//클릭 횟수 증가
            this.count += 1;
	    }
		
		if (popup) {
			this.map.addPopup(popup);
			popup.type = "measure";
			popup.updateSize();
		}
        
        //마우스 우클릭 일때 실행
        if(evt.button == "2") {
			this.rightclick(evt);
	        return true;
		}
        
        /* 거리 계산 결과 출력 팝업 추가 끝 */
        return false;
	},
	
	//마우스 이동 이벤트
	mousemove: function (evt) {
        if(this.drawing) { 
            if(this.mouseDown && this.freehandMode(evt)) {
                this.addPoint(evt.xy);
            } else {
                this.modifyFeature(evt.xy);
				
				//팝업을 마우스 포인터를 따라 다니게 한다.
				if(this.popup) {
					contentHtml = "<div class='olControlMeasurePopup'>"+this.measureDistance()+"</div>";
					this.popup.setContentHTML(contentHtml);
					this.popup.updateSize();
	                this.popup.moveTo(evt.xy);	
				}
            }
        }
        return true;
    },
	
	//마우스 우클릭(종료) 이벤트
	rightclick: function(evt) {
    	this.dblclick(evt);
    	return false;
    },
	
	//더블클릭(종료) 이벤트
	dblclick: function(evt) {
		// 더블클릭시 클릭 카운트 초기화
		this.count = 0;
        if(!this.freehandMode(evt)) {
            var index = this.line.geometry.components.length - 1;
            this.line.geometry.removeComponent(this.line.geometry.components[index]);
            this.removePoint();
            this.finalize();
        }
        
		if(this.popup) {
			this.map.removePopup(this.popup);
			this.popup = null;
		}
        
        return false;
    },
    
 	 //컨트롤 비 활성화
    deactivate: function() {
        if(!OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            return false;
        }
        // call the cancel callback if mid-drawing
        if(this.drawing) {
            this.cancel();
        }
        //this.destroyFeature();
        
        // If a layer's map property is set to null, it means that that layer
        // isn't added to the map. Since we ourself added the layer to the map
        // in activate(), we can assume that if this.layer.map is null it means
        // that the layer has been destroyed (as a result of map.destroy() for
        // example.

        //컨트롤 비 활성 시 측정 결과 유지 여부
        if(!this.persistControl) {
        	this.layer.destroy(false);
			this.removePopup();
        }
		
        this.layer.prevLayer = true;

        this.layer = null;
        return true;
    },
	
	//측정팝업 삭제
	removePopup : function() {
		var len = this.map.popups.length;
		for(var i=len-1; i >= 0; i--) {
			if(this.map.popups[i].type == "measure") {
				this.map.removePopup(this.map.popups[i]);
			}
		}
	},
	
    CLASS_NAME: "OpenLayers.Handler.PathMeasureCustom"
});


//팝업
PopupCustom = OpenLayers.Class(OpenLayers.Popup, {
	
	//선택한 위치와의 거리
	offsetPixel : null,
	
	initialize:function(id, lonlat, contentSize, contentHTML, map, offsetPixel) {
		if(offsetPixel) {
			this.offsetPixel = offsetPixel;
		}
		
        if (id == null) {
            id = OpenLayers.Util.createUniqueID(this.CLASS_NAME + "_");
        }

        this.id = id;
        this.lonlat = lonlat;

        this.contentSize = (contentSize != null) ? contentSize 
                                  : new OpenLayers.Size(
                                                   OpenLayers.Popup.WIDTH,
                                                   OpenLayers.Popup.HEIGHT);
        if (contentHTML != null) { 
             this.contentHTML = contentHTML;
        }
        this.backgroundColor = OpenLayers.Popup.COLOR;
        this.opacity = OpenLayers.Popup.OPACITY;
        this.border = OpenLayers.Popup.BORDER;

        this.div = OpenLayers.Util.createDiv(this.id, null, null, 
                                             null, null, null, "hidden");
        this.div.className = this.displayClass;
        
        var groupDivId = this.id + "_GroupDiv";
        this.groupDiv = OpenLayers.Util.createDiv(groupDivId, null, null, 
                                                    null, "relative", null,
                                                    "hidden");

        var id = this.div.id + "_contentDiv";
        this.contentDiv = OpenLayers.Util.createDiv(id, null, this.contentSize.clone(), 
                                                    null, "relative");
        this.contentDiv.className = this.contentDisplayClass;
        this.groupDiv.appendChild(this.contentDiv);
        this.div.appendChild(this.groupDiv);

		/*
		 * 닫기 버튼 사용 안할 것으로 판단되어 삭제
        if (closeBox) {
            this.addCloseBox(closeBoxCallback);
        } 
        */

        this.registerEvents();
    },
	
	//팝업 위치 반환
	getLonLat : function() {
		return this.lonlat;
	},
	
	//이동에 따른 팝업 위치 변경
    moveTo: function(px) {
        if ((px != null) && (this.div != null)) {
			// x, y 좌표의 픽셀을 offset으로 지정한 값만큼 증가 시킴
	    	if(this.offsetPixel) {
				px = px.add(this.offsetPixel.x, this.offsetPixel.y);
	    	}
			
			this.div.style.left = px.x + "px";
        	this.div.style.top = px.y + "px";
        }
    },
		
	CLASS_NAME: "PopupCustom"
});

//객체 선택
OpenLayers.Control.ClickFeature = OpenLayers.Class(OpenLayers.Control, {
	
	initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },
	
	/**
     * APIMethod: activate
     */
    activate: function() {
        if (OpenLayers.Control.prototype.activate.apply(this, arguments)) {
            this.map.events.register('mousemove', this, this.redraw);
            this.redraw();
            return true;
        } else {
            return false;
        }
    },
    
    /**
     * APIMethod: deactivate
     */
    deactivate: function() {
        if (OpenLayers.Control.prototype.deactivate.apply(this, arguments)) {
            this.map.events.unregister('mousemove', this, this.redraw);
            this.element.innerHTML = "";
            return true;
        } else {
            return false;
        }
    },

	CLASS_NAME : "OpenLayers.Control.ClickFeature"
});

//클릭 이벤트 
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.onClick,
                            'dblclick': this.onDblclick 
                        }, this.handlerOptions
                    );
                }, 

                onClick: function(evt) {
                    var output = document.getElementById(this.key + "Output");
                    var msg = "click " + evt.xy;
                    output.value = output.value + msg + "\r\n";
                },

                onDblclick: function(evt) {  
                    var output = document.getElementById(this.key + "Output");
                    var msg = "dblclick " + evt.xy;
                    output.value = output.value + msg + "\n";
                }   

});
OpenLayers.Control.CustomGetFeature = OpenLayers.Class(OpenLayers.Control.GetFeature, {
	polygon : false,
	
	regularPolygon : false,
	
	line : false,
	
	all : false,
	
	map : null,
	
	initialize : function(options) {
		OpenLayers.Control.GetFeature.prototype.initialize.apply(this, [options]);
	
		if(this.polygon) {
        	this.handlers.polygon = new OpenLayers.Handler.Polygon(
        			this, {
        				done : this.selectPolygon
        			});
        }
		
        if(this.regularPolygon) {
        	this.handlers.regularPolygon = new OpenLayers.Handler.RegularPolygon(
        			this,{done : this.selectRegularPolygon},{
        				sides : 50,
        				persist : false
        			});
        }
        
        if(this.line) {
        	this.handlers.path = new OpenLayers.Handler.Path(
        			this, 
        			{
        				done : this.selectPath
        			});
        }
        
        if(this.all) {
        	var bounds = this.map.getExtent();
        	this.setModifiers(this.map.events);
        	this.request(bounds);
        }
	},
    selectRegularPolygon : function(evt) {
    	var bounds = evt.getBounds();
        this.setModifiers(this.handlers.regularPolygon.evt);
        this.request(bounds);
        OpenLayers.Util.deletePopup(); // popup 메뉴를 삭제한다.
    	
    },
    
    selectPolygon : function(evt) {
    	var bounds = evt.getBounds();
        this.setModifiers(this.handlers.polygon.evt);
        this.request(bounds);
    },
    
    selectPath : function(evt) {
    	var bounds = evt.getBounds();
    	this.setModifiers(this.handlers.path.evt);
    	this.request(bounds);
    },
	CLASS_NAME: "OpenLayers.Control.CustomGetFeature"
});
