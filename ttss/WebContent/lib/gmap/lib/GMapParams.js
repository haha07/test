/**********************************************************************************
 * 파일명 : GMapParams.js
 * 설 명 : Ginno Map Parameters Class
**********************************************************************************/
var g2WebServiceUrl = "http://203.236.216.158:8080/G2DataService/GService?";
var apiServerHost = "http://203.236.216.158:8080/edu";
var gMapImageSaveUrl = apiServerHost + "/map/save.do";

var gMapParams = {
		//최대 지도 영역 : DataViewEditor통해서 확인(xmin,ymin,xmax,ymax)
		maxExtent : [182359.7,435828.6,201031.9,456997.8],
		//최대 해상도 : 1pixel이 표현할 수 있는 범위(m)
		maxResolution : 16.536458699995029296875,
		//투영법
		projection: "SR-ORG:6640",
		//화면투영법
		//displayProjection : "SR-ORG:6640",
		//실제 축척 사용 여부
		fractionalZoom : false,
		//축척 레벨 수
		numZoomLevels : 11
		//지도 기본 단위 값
		//units: 'm',
		//기준 레이어 사용 안 함. 가장 아래에 있는 레이어가 기준 레이어가 됨
		//allOverlays: false
};

var gIndexMapParams = {
		//지도 서비스 주소
		serviceUrl : g2WebServiceUrl,
		//색인도로 사용할 레이어 목록
		layers : 'CML_BADM_A',
		//색인도로 사용할 Theme 목록
		styles : '',
		//해상도
		//maxResolution : 1,
		//투영법
		projection: "SR-ORG:6640"
		// 중심점을 맞추기 위한 화면 픽셀
		//offsetPixel : new GPixel(10,10)
};

var WMSParams = {
		//WMS레이어 이름
		layerName : "Ginno_WMS",
		//WMS 서비스 주소
		serviceURL : g2WebServiceUrl,
		//WMS 서비스 대상 레이어 목록
		layers : "CML_BADM_A",
		//WMS 서비스 대상 레이어의 스타일 목록
		styles : "",
		//좌표계
		crs : "SR-ORG:6640",
		//이미지 형식
		format : "image/png",
		//WMS 버전
		version : "1.3.0",
		//투명도 적용 여부
		transparent: true
};

var WMSOptions = {
		isBaseLayer : true,
		singleTile : true,
		ratio : 1.0,
		projection : "SR-ORG:6640"	
};

var TileCacheParams = {
		//TileCache 레이어 이름
		layerName : "Ginno_WMS",
		//TileCache 서비스 주소
		serviceURL : g2WebServiceUrl,
		//TileCache 서비스 대상 레이어 목록
		layers : "법정읍면동,하천",
		//TileCache 서비스 대상 레이어의 스타일 목록
		styles : "법정읍면동,하천",
		//좌표계
		crs : "SR-ORG:6640",
		//이미지 형식
		format : "image/png",
		//TileCache 버전
		version : "1.3.0",
		//투명도 적용 여부
		transparent: true
};

var TileCacheOptions = {
		isBaseLayer : true,
		singleTile : true,
		ratio : 1.0,
		projection : "SR-ORG:6640"	
};