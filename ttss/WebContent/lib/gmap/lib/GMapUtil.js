/**********************************************************************************
 * 파일명 : GMapUtil.js
 * 설 명 : Ginno Map Util Class (G2WebService에 Get, Post 방식으로 Service를 요청)
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.18		최원석				0.1					최초 생성
 * 2014.06.17		이경찬				0.2					OpenLayers 2.13.1버전으로 변경
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/
OpenLayers.Util.getImagesLocation = function() {
	return "";
    //return OpenLayers.ImgPath || (OpenLayers._getScriptLocation() + "img/");
};

/**
 * DPI 재설정
 */
OpenLayers.DOTS_PER_INCH = 96;

var GMapUtil = {
	sendProxyGet : function(serviceUrl, params, callback) {
		$.get(
			"http://203.236.216.158:8080/edu/gmap/proxyGet.do",
			{
				url : encodeURIComponent(serviceUrl),
				params : encodeURIComponent(params)
			}, 
			function (res) {
				callback(res);
			}
		);
	},
	
	sendProxyPost : function(serviceUrl, params, callback) {
		$.post(
			"http://203.236.216.158:8080/edu/gmap/proxyPost.do",
			{
				url : encodeURIComponent(serviceUrl),
				params : encodeURIComponent(params)
			}, 
			function (res) {
				callback(res);
			}
		);
	}
};
