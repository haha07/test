/**********************************************************************************
 * 파일명 : GBounds.js
 * 설 명 : Ginno Bounds Class (지돈영역)
 * 필요 라이브러리 : OpenLayers (OpenLayers.Bounds)
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.18		최원석				0.1					최초 생성(namespace 만 GBounds 로 변경)
 * 
**********************************************************************************/
GBounds = OpenLayers.Class(OpenLayers.Bounds, {
	CLASS_NAME: "GBounds"
});

GBounds.fromString = function(str, ch) {
	if(!ch) {
		var ch = ",";
	}
	
	var bounds = str.split(ch);
	return GBounds.fromArray(bounds);
};

GBounds.fromArray = function (bbox) {
	return new GBounds(parseFloat(bbox[0]),parseFloat(bbox[1]),parseFloat(bbox[2]),parseFloat(bbox[3]));
};