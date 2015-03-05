/**********************************************************************************
 * 파일명 : GPopup.js
 * 설 명 : Popup 클래스
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2010.04.05		최원석				0.1					updatePosition 함수 생성
 * 2011.04.25		최원석				0.2					GMap API 로 수정 생성
 * 2011.05.03		최원석				0.3					getLonLat 함수 생성
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GPopup = OpenLayers.Class(OpenLayers.Popup, {
	
	/**
	 * 팝업을 거리를 두고 그림
	 */
	offsetPixel : null,
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GMap 객체 생성
	 * 인 자 : div (맵 객체 id)
	 * 사용법 : initialize('map', options)
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		OpenLayers.Map 의 initialize 복사
	 * 								생성 시 옵션 체크 추가
	 * 2011.04.25		최원석		default Control 수정
	 * 
	 **********************************************************************************/
	initialize:function(id, lonlat, contentSize, contentHTML, offsetPixel) {
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
        
        
        this.events.register('mousedown', this, this.mouseDown);
        this.events.register('mouseup', this, this.mouseUp);
        this.events.register('mousemove', this, this.mouseMove);
        // Define a function bound to this used to listen for
        // document mouseout events
        this.docMouseUpProxy = OpenLayers.Function.bind(this.mouseUp, this);

        
    },
	
	/**********************************************************************************
	 * 함수명 : getLonLat
	 * 설 명 : 팝업의 위치 반환
	 * 사용법 : getLonLat()
	 * 
	 * 작성일 : 2011.04.25
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.03		최원석		최초 생성
	 * 								
	 **********************************************************************************/
	getLonLat : function() {
		return this.lonlat;
	},
	
	/**********************************************************************************
	 * 함수명 : moveTo
	 * 설 명 : 화면에 팝업 표시
	 * 인 자 : px (팝업 위치)
	 * 사용법 : moveTo(name)
	 * 
	 * 작성일 : 2011.04.25
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.25		최원석		OpenLayers.Popup의 moveTo 복사
	 * 								지정된 위치에서 약간 이동한 곳에 팝업 생성
	 * 								
	 **********************************************************************************/
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
    
    down: false,
    popPnt: null,
    mapPnt: null,
    popup: null,
    docMouseUpProxy: null,

    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters: 
     * map - {<OpenLayers.Map>} The controls map.
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, [map]);
        this.map.events.register('mousemove', this, this.mouseMove);
    },

    mouseDown: function(evt) {
        //console.log('mouseDown');
        this.down = true;
        this.popPnt = this.events.getMousePosition(evt);
        OpenLayers.Event.observe(document, 'mouseup', this.docMouseUpProxy);
        OpenLayers.Event.stop(evt);
    },

    mouseUp: function(evt) {
        //console.log('mouseUp');
        this.down = false;
        OpenLayers.Event.stopObserving(document, 'mouseup', this.docMouseUpProxy);
        OpenLayers.Event.stop(evt);
    },

    mouseOut: function(evt) {
        //console.log('map.mouseOut');
        this.down = false;
        OpenLayers.Event.stop(evt);
    },

    mouseMove: function(evt) {
        //console.log('mouseMove');
        if (this.down) {
            var mapPntPx = this.map.events.getMousePosition(evt);
            mapPntPx = mapPntPx.add((this.popPnt.x*-1), (this.popPnt.y*-1));
            this.lonlat = this.map.getLonLatFromViewPortPx(mapPntPx);
            this.updatePosition();
        }
        OpenLayers.Event.stop(evt);
    },

    destroy: function() {
        // Remove listeners
        this.events.unregister('mousedown', this, this.mouseDown);
        this.events.unregister('mouseup', this, this.mouseUp);
        this.events.unregister('mousemove', this, this.mouseMove);
        this.map.events.unregister('mousemove', this, this.mouseMove);
        // Clear object references
        this.popPnt = null;
        // allow our superclass to tidy up
        OpenLayers.Control.prototype.destroy.apply(this, []);
    },
    
    /** 
     * Method: ondblclick
     * Ignore double-clicks, but allowing default browser handling
     * 
     * Parameters:
     * evt - {Event} 
     */
    ondblclick: function (evt) {
        OpenLayers.Event.stop(evt, true);
    },
		
	CLASS_NAME: "GPopup"
});