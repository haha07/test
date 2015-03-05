/**********************************************************************************
 * 파일명 : GMap.js
 * 설 명 : GMapAPI
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.25		최원석				0.1					최초 생성
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GZoomBoxIndex = OpenLayers.Class(OpenLayers.Control.ZoomBox, {
	/**
	 * 기준 지도 객체
	 */
    baseMap : null,

   /**********************************************************************************
	 * 함수명 : draw
	 * 설 명 : 영역 박스를 그림
	 * 사용법 : draw()
	 * 작성일 : 2011.04.21
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.25		최원석		핸들러로 Box 에서 GBox를 등록 하도록 수정
	 * 								indexMap 을 true 로 지정
	 * 								
	 **********************************************************************************/  
    draw: function() {
        this.handler = new GBox( this,
                            {done: this.zoomBox}, {indexMap: true});
    },
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GZoomBoxIndex 객체 생성
	 * 인 자 : baseMap (기준 지도 객체), options(생성 옵션 들)
	 * 사용법 : initialize(baseMap, options)
	 * 작성일 : 2011.04.25
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.25		최원석		최초생성
	 * 
	 **********************************************************************************/  
    initialize: function (baseMap, options) {
    	this.baseMap = baseMap;
    	OpenLayers.Control.prototype.initialize.apply(this, [options]);
    },

    /**********************************************************************************
	 * 함수명 : zoomBox (생성자 함수)
	 * 설 명 : 색인도 안의 영역 박스에 따른 기준 맵의 이동
	 * 인 자 : position (기준 지도 객체), options(생성 옵션 들)
	 * 사용법 : zoomBox(position)
	 * 작성일 : 2011.04.25
	 * 작성자 : 기술개발팀 최원석
	 * 
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.25		최원석		ZoomBox.js 의 zoomBox 함수를 복사
	 * 								색인도의 기능을 하도록 기준 맵의 이동 기능 추가
	 * 
	 **********************************************************************************/
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
	
    CLASS_NAME: 'GZoomBoxIndex'
});
