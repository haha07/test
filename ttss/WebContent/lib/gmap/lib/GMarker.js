/**********************************************************************************
 * 파일명 : GMarker.js
 * 설 명 : Ginno Marker Class (색인도)
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2014.07.02		이경찬				0.1					최초 생성
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/
GMarker = OpenLayers.Class(OpenLayers.Marker, {
	addToGMap: function(){
		gMap.getLayersByName('markersLayer')[0].addMarker(this);
	},
	
    CLASS_NAME: "GMarker"
});