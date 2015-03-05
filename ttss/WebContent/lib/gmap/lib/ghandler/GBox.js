/**********************************************************************************
 * 파일명 : GBox.js
 * 설 명 : OpenLayers.Control.Box 를 상속 받아 수정
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

GBox = OpenLayers.Class(OpenLayers.Handler.Box, {
	/**
	 * 인덱스 맵에서 사용 여부
	 */
	indexMap : false,
	
	/**********************************************************************************
	 * 함수명 : startBox
	 * 설 명 : 영역 박스 시작
	 * 인 자 : xy (GPixel 좌표객체)
	 * 사용법 : startBox(xy)
	 * 작성일 : 2011.04.26
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.26		최원석		인덱스 맵 일때 새로 그리기 시작 시 기존 영역 박스를 삭제하도록 함
	 * 								
	 **********************************************************************************/
	startBox: function (xy) {
		if(this.indexMap && this.zoomBox) this.removeBox();
		
	    this.zoomBox = OpenLayers.Util.createDiv('zoomBox',
	                                             this.dragHandler.start);
	    this.zoomBox.className = this.boxDivClassName;         
	    this.zoomBox.style.border = "2px solid #000000";
	    this.zoomBox.style.zIndex = this.map.Z_INDEX_BASE["Popup"] - 1;
	    this.map.viewPortDiv.appendChild(this.zoomBox);
	
	    OpenLayers.Element.addClass(
	        this.map.viewPortDiv, "olDrawBox"
	    );
	},
	
	/**********************************************************************************
	 * 함수명 : applyBox
	 * 설 명 : 기준 지도 이동에 따른 색인도의 영역 박스 다시 그림
	 * 인 자 : xy (GBounds 객체)
	 * 사용법 : applyBox(bounds)
	 * 작성일 : 2011.04.26
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.26		최원석		최초 생성
	 * 								
	 **********************************************************************************/
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
    
    /**********************************************************************************
	 * 함수명 : moveBox
	 * 설 명 : 기준 지도 이동에 따른 영역 박스
	 * 인 자 : xy (GBounds 객체)
	 * 사용법 : applyBox(bounds)
	 * 작성일 : 2011.04.26
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.26		최원석		최초 생성
	 * 								
	 **********************************************************************************/
     moveBox: function (xy) {
    	 var startX = this.dragHandler.start.x;
         var startY = this.dragHandler.start.y;
         var deltaX = Math.abs(startX - xy.x);
         var deltaY = Math.abs(startY - xy.y);

         var offset = this.getBoxOffsets();
         this.zoomBox.style.width = (deltaX + offset.width + 1) + "px";
         this.zoomBox.style.height = (deltaY + offset.height + 1) + "px";
         this.zoomBox.style.left = (xy.x < startX ?
             startX - deltaX - offset.left : startX - offset.left) + "px";
         this.zoomBox.style.top = (xy.y < startY ?
             startY - deltaY - offset.top : startY - offset.top) + "px";
     },

	/**********************************************************************************
	 * 함수명 : endBox
	 * 설 명 : 기준 지도 이동에 따른 색인도의 영역 박스 다시 그림
	 * 인 자 : end (GPixel 객체)
	 * 사용법 : endBox(end)
	 * 작성일 : 2011.04.26
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.26		최원석		영역 지정 완료 후 다시 그리거나 초기화 전 까지 삭제 안함 
	 * 								
	 **********************************************************************************/
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
	
	/**********************************************************************************
	 * 함수명 : deactivate
	 * 설 명 : 핸들러 비 활성화
	 * 사용법 : deactivate()
	 * 작성일 : 2011.04.26
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.26		최원석		닫기, 새로고침 시 오류 발생 수정 
	 * 								
	 **********************************************************************************/
	deactivate: function () {
        if (OpenLayers.Handler.prototype.deactivate.apply(this, arguments)) {
            if(this.dragHandler && this.dragHandler.deactivate) this.dragHandler.deactivate();
            return true;
        } else {
            return false;
        }
    },
	
	CLASS_NAME: "GBox"
});