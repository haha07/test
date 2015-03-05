/**********************************************************************************
 * 파일명 : GPathMeasure.js
 * 설 명 : 거리 측정을 위한 클래스
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자		Function 명
 * --------------------------------------------------------------------------------
 * 2010-04-05     	최원석		거리 측정 실행 시 결과 출력까지의 딜레이 생기는 부분을 수정하기 위해서 OpenLayers.Control.Measure 클래스의 거리 측정하는 것을 참고로 함수(measureDistance)를 생성
 *	 							거리 측정 실행 결과 중간 지점마다 팝업으로 생성하는 부분 추가
 * 							  	거리 측정 실행 후 다른 컨트롤을 실행하더라도 결과창이 없어지지 않게 수정
 * 2010-04-07		최원석		지도위의 DIV 클릭 시에도 거리가 찍히는 현상을 위해 수정(마우스 업의 내용을 마우스 다운으로 옮김)
 * 2010-06-21     	최원석		거리 계산을 MeasureControl이 아닌 이 객체에서 바로 하도록 수정
 * 2010-10-01     	최원석		거리 측정 조건을 외부 옵션을 통해 조절이 가능하도록 수정
 * 							  	소스 및 주석 정리
 * 2011-04-22		최원석		GMAP API 작업으로 인해 수정 및 정리
 * 2012-06-05		최원석		부분거리 추가, 이동 시 팝업 UI 변경
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/


/**************************************************************************************

 *  
 ***************************************************************************************/

GPathMeasure = OpenLayers.Class(OpenLayers.Handler.Path, {
	/*
	 * 외부에서 사용하던 팝업을 내부로 이동
	 */
	popup : null,
	
	/**
	 * 마우스 이동 시 팝업 생성 여부
	 */
	movePopup : true,
	
	/**
	 * 중간 거리
	 */
	partDist : [],
	
	/**********************************************************************************
	 * 함수명 : measureDistance
	 * 설 명 : 지도에서 그린 선의 거리를 계산한다.
	 * 사용법 : measureDistance()
	 * 작성일 : 2010.06.21
	 *
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2010-06-21		최원석		최초 생성
	 * 
	 **********************************************************************************/ 
	measureDistance : function(geometry) {
		//geometry.getLength() - geometry의 거리를 구함
		var subLength = geometry.getLength();
		//단위 계산을 위해 tempLength로 거리를 저장
    	var tempLength = subLength;
    	//기본 거리 단위
    	var unit = "";
    	
    	//tempLength 에 km 단위를 적용
    	tempLength *= (OpenLayers.INCHES_PER_UNIT["m"] / OpenLayers.INCHES_PER_UNIT['km']);
        
    	//km 단위를 적용 후 거리가  1km 이상일 경우 km 단위를 사용 
        if(tempLength > 1) {
        	subLength = tempLength.toFixed(2);
        	unit = "km";
        }
        else {
        	subLength = subLength.toFixed(2);
        	unit = "m";
        }
        
        //계산 결과 값을 리턴
		return [subLength, unit];
	},
	
	/**********************************************************************************
	 * 함수명 : measureDistancePart
	 * 설 명 : 지도에서 그린 마지막 선의 거리를 계산한다.
	 * 사용법 : measureDistancePart()
	 * 작성일 : 2012.06.05
	 *
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2012.06.05		최원석		최초 생성
	 * 
	 **********************************************************************************/ 
	measureDistancePart : function() {
		// 현재 거리 측정에 사용된 geometry값의 복사본을 가져옴
		var geometry = this.geometryClone();
		
		//마지막 선분 추출
		var vertices = geometry.getVertices();
		var points = [
		    new OpenLayers.Geometry.Point(vertices[vertices.length-2].x, vertices[vertices.length-2].y),
		    new OpenLayers.Geometry.Point(vertices[vertices.length-1].x, vertices[vertices.length-1].y)
		];
		var lineString = new OpenLayers.Geometry.LineString(points);
		
		return this.measureDistance(lineString);		
	},
	
	/**********************************************************************************
	 * 함수명 : measureDistanceAll
	 * 설 명 : 지도에서 그린 전체 선의 거리를 계산한다.
	 * 사용법 : measureDistanceAll()
	 * 작성일 : 2012.06.05
	 *
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2012.06.05		최원석		최초 생성
	 * 
	 **********************************************************************************/ 
	measureDistanceAll : function() {
		// 현재 거리 측정에 사용된 geometry값의 복사본을 가져옴
		var geometry = this.geometryClone();
		
		return this.measureDistance(geometry);		
	},
	
	/**********************************************************************************
	 * 함수명 : mousedown
	 * 설 명 : 지도에서 마우스 다운 이벤트가 발생할 때 실행되는 함수
	 * 인 자 : evt (이벤트 객체)
	 * 사용법 : mousedown(evt)
	 * 
	 * 작성일 : 2010.06.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2010.06.21		최원석		최초 생성
	 * 								마우스 다운 시 feature, popup 생성
	 * 2011.04.25		최원석		지도 API 작업에 맞게 수정								
	 * 
	 **********************************************************************************/
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
    	pointFeature.type = "measure" + GPathMeasureINDEX;
    	pointFeature.attributes.featureType = "Point";
    	//point Feature 등록
    	this.layer.addFeatures(pointFeature);
    	
		var popup;
    	//처음 일 경우 시작 메시지 팝업창 생성
        if(!this.count) {
			var contentHtml = "<div id='measureStart' class='olControlMeasurePopup olControlMeasurePopupStart'><span class='MeasureColor'>시작</span></div>";
			popup = new GPopup("measurePopup", lonlat, null, contentHtml, new OpenLayers.Pixel(5,5));
			
			popup.attributes = {
					'featureType' : 'Text',
					//'fontFamily' : 'dotum',
					'fontSize' : '12',
					'fontColor' : '#000000',
					//'seq' : this.seq,
					'text' : "시작",
					'print' : true // 지도 이미지 저장에 포함하고 싶으면 True, 아니면 False
			};
			
			if(this.movePopup) {
				contentHtml = '<div class="olControlMeasureContent">'
					+ '<div class="measureDist" >'
					+ '<span class="measureResTit">상대거리</span>'
					+ '<span class="measureResCon"></span>'
					+ '<span class="measureResUnit"></span>'
					+ '</div>'
					+ '<div class="MeasureAllDist" >'
					+ '<span class="measureResTit">총거리</span>'
					+ '<span class="measureResCon"></span>'
					+ '<span class="measureResUnit"></span>'
					+ '</div>'
					+ '<div class="MeasureEndDescript">마우스 오른쪽 버튼을 누르시면 끝마칩니다</div>'
					+ '</div>';
	        	this.popup = new GPopup("measurePopup", lonlat, null, contentHtml, new OpenLayers.Pixel(10,10));
	        	this.map.addPopup(this.popup);
				
				this.popup.updateSize();
				this.popup.type = "measure" + GPathMeasureINDEX;
			}
			
	    	//클릭 횟수 저장 변수를 생성 및 초기화
            this.count = 1;
	    }
        //처음 클릭이 아닐 경우
	    else {
	    	contentHtml = "<div class='olControlMeasurePopup olControlMeasurePopupDefault'><span class='MeasureColor'>"+ this.partDist[0] + "</span> " + this.partDist[1] + "</div>";
	    	popup = new GPopup("measurePopup", lonlat, null, contentHtml, new OpenLayers.Pixel(5,5));
	    	popup.attributes = {
					'featureType' : 'Text',
					//'fontFamily' : 'dotum',
					'fontSize' : '12',
					'fontColor' : '#000000',
					//'seq' : this.seq,
					'text' : this.partDist[0] + this.partDist[1],
					'print' : true // 지도 이미지 저장에 포함하고 싶으면 True, 아니면 False
			};
	    	//클릭 횟수 증가
            this.count += 1;
	    }
		
		if (popup) {
			this.map.addPopup(popup);
			popup.type = "measure" + GPathMeasureINDEX;
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
	
	addPoint: function(pixel) {
        this.layer.removeFeatures([this.point]);
        var lonlat = this.control.map.getLonLatFromPixel(pixel);
        this.point = new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(lonlat.lon, lonlat.lat)
        );
        this.line.geometry.addComponent(
            this.point.geometry, this.line.geometry.components.length
        );
        this.callback("point", [this.point.geometry, this.getGeometry()]);
        this.callback("modify", [this.point.geometry, this.getSketch()]);
        this.line.type = "measure" + GPathMeasureINDEX;
        this.drawFeature();
    },
	
	/**********************************************************************************
	 * 함수명 : mousemove
	 * 설 명 : 마우스 이동 이벤트
	 * 인 자 : evt (이벤트 객체)
	 * 사용법 : mousemove(evt)
	 * 
	 * 작성일 : 2011.04.25
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.25		최원석		측정 결과를 마우스 포인터를 따라 다니게 한다.
	 * 
	 **********************************************************************************/
	mousemove: function (evt) {
        if(this.drawing) { 
            if(this.mouseDown && this.freehandMode(evt)) {
                this.addPoint(evt.xy);
            } else {
                this.modifyFeature(evt.xy);
				
				//팝업을 마우스 포인터를 따라 다니게 한다.
				if(this.popup) {
					var resDist = this.measureDistancePart();
					var allDist = this.measureDistanceAll();
					$(this.popup.contentDiv).find(".measureDist .measureResCon").text(resDist[0]);
					$(this.popup.contentDiv).find(".measureDist .measureResUnit").text(" " + resDist[1]);
					$(this.popup.contentDiv).find(".MeasureAllDist .measureResCon").text(allDist[0]);
					$(this.popup.contentDiv).find(".MeasureAllDist .measureResUnit").text(" " + allDist[1]);
					this.partDist = this.measureDistancePart();
					this.popup.updateSize();
					evt.xy.x -= $(this.popup.div).parent().offset().left;
					evt.xy.y -= $(this.popup.div).parent().offset().top;
	                this.popup.moveTo(evt.xy);	
				}
            }
        }
        return true;
    },
	
	/**********************************************************************************
	 * 함수명 : rightclick
	 * 설 명 : 마우스 우 클릭 시 거리 측정 종료
	 * 인 자 : evt (이벤트 객체)
	 * 사용법 : rightclick(evt)
	 * 
	 * 작성일 : 2010.04.07
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2010.04.07		최원석		최초 생성
	 * 
	 **********************************************************************************/
	rightclick: function(evt) {
    	this.dblclick(evt);
    	return false;
    },
	
	/**********************************************************************************
	 * 함수명 : dblclick
	 * 설 명 : 더블 클릭 시 거리 측정 종료.
	 * 인 자 : evt (이벤트 객체)
	 * 사용법 : dblclick(evt)
	 * 
	 * 작성일 : 2010.04.07
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2010.04.07		최원석		마우스 포인터에 따라다니는 팝업 삭제
	 * 
	 **********************************************************************************/
	dblclick: function(evt) {
		if(this.map.popups[this.map.popups.length-1].type == "measure") {
			this.map.removePopup(this.map.popups[this.map.popups.length-1]);
		}
		
		//point Feature를 나타낼 지도 좌표를 구함
        var lonlat = this.map.getLonLatFromPixel(evt.xy);
        var allDist = this.measureDistanceAll();
		var contentHtml = "<div class='olControlMeasurePopup olControlMeasurePopupEnd'>총거리 : <span class='MeasureColor'>"+ allDist[0] + "</span> " + allDist[1] + "</div>";
	    var popup = new GPopup("measurePopup", lonlat, null, contentHtml, new OpenLayers.Pixel(5,5));
	    popup.attributes = {
				'featureType' : 'Text',
				//'fontFamily' : 'dotum',
				'fontSize' : '12',
				'fontColor' : '#000000',
				//'seq' : this.seq,
				'text' : "총거리 : " + allDist[0] + allDist[1],
				'print' : true // 지도 이미지 저장에 포함하고 싶으면 True, 아니면 False
		};
		this.map.addPopup(popup);
		popup.type = "measure" + GPathMeasureINDEX;
		popup.updateSize();
		
		//현재 결과 삭제
		/*contentHtml = '<div class="olControlMeasureClose"><input type="hidden" value="measure' + GPathMeasureINDEX + '" /><img src="/images/egovframework/ginnoframework/gmap/draw/measureClose.gif" alt="닫기" /></div>';
		var closePopup = new GPopup("measurePopup", lonlat, null, contentHtml, new OpenLayers.Pixel(7,-7));
		this.map.addPopup(closePopup);
		closePopup.type = "measure" + GPathMeasureINDEX;
		closePopup.updateSize();*/
		
		var gmap = this.layer.map;
		$(".olControlMeasureClose").click(function() {
			var remTyp = $(this).find("input").val();
			
			var map = gmap;
			var popups = map.popups;
			for(var i=map.layers.length-1; i >= 0; i--) {
				if(map.layers[i].type == "measure") {
					for(var j=map.layers[i].features.length-1; j >= 0; j--) {
						if(map.layers[i].features[j].type == remTyp) {
							map.layers[i].removeFeatures(map.layers[i].features[j]);
						}
					}
				}
			}
			
			for(var i = popups.length-1; i >= 0; i--) {
				if(popups[i].type == remTyp) {
					map.removePopup(popups[i]);
				}
			}
		});
		
		//팝업 최대 수 증가
		GPathMeasureINDEX++;
		
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
		this.drawing = false;
        return false;
    },
    
    activate: function() {
        if(!OpenLayers.Handler.prototype.activate.apply(this, arguments)) {
            return false;
        }
        // create temporary vector layer for rendering geometry sketch
        // TBD: this could be moved to initialize/destroy - setting visibility here
        var options = OpenLayers.Util.extend({
            displayInLayerSwitcher: false,
            // indicate that the temp vector layer will never be out of range
            // without this, resolution properties must be specified at the
            // map-level for this temporary layer to init its resolutions
            // correctly
            calculateInRange: OpenLayers.Function.True
        }, this.layerOptions);
        this.layer = new GVector(this.CLASS_NAME, options);
        this.layer.type = "measure";
        this.map.addLayer(this.layer);
        
        return true;
    },
    
 	 /**********************************************************************************
	 * 함수명 : deactivate
	 * 설 명 : 컨트롤 비 활성화
	 * 사용법 : deactivate()
	 * 
	 * 작성일 : 2010.04.07
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2010.04.07		최원석		컨트롤 비 활성 화 시 측정 결과 유지
	 * 
	 **********************************************************************************/
    deactivate: function() {
		if(this.drawing) {
			//alert('거리 측정 기능 종료 후 실행하여 주십시오.');
			return false;
		}
		 
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
        
        this.layer = null;
        return true;
    },
	
	/**********************************************************************************
	 * 함수명 : removePopup
	 * 설 명 : 측정 팝업 삭제
	 * 사용법 : removePopup()
	 * 
	 * 작성일 : 2011.04.25
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.25		최원석		측정 결과 팝업 삭제
	 * 
	 **********************************************************************************/
	removePopup : function() {
		var len = this.map.popups.length;
		for(var i=len-1; i >= 0; i--) {
			if(this.map.popups[i].type == "measure") {
				this.map.removePopup(this.map.popups[i]);
			}
		}
	},
	
    CLASS_NAME: "GPathMeasure"
});

GPathMeasureINDEX = 0;

