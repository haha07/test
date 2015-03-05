/**********************************************************************************
 * 파일명 : TileCache.js
 * 설 명 : OpenLayers.Layer.TileCache 를 상속 받아 수정
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

GTileCache = OpenLayers.Class(OpenLayers.Layer.TileCache, {
	/**
	 * 버전 정보 - 파일 별로 타일이 갱신 될 경우 캐쉬 되어있는 이미지를 요청 하지 않는 부분 수정을 위해서 사용
	 */
	version : null,
	
	/**
	 * 지도 조작 이벤트
	 */
	transitionEffect: 'resize',
	
	/**
	 * 속도 문제로 인해서 버퍼를 사용 안함
	 */
	buffer: 0,

	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GTileCache 객체 생성
	 * 작성일 : 2011.04.19
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.19		최원석		생성 시 'jpg'를 'jpeg' 로 변형하는 것을 막음
	 * 								생성 시 옵션 체크 추가
	 * 
	 **********************************************************************************/
	initialize: function(name, url, layername, options) {
		//필수 파라미터 체크
		if(GError.debug) this.chkParams(name, url, layername, options);
		
		this.layername = layername;
        OpenLayers.Layer.Grid.prototype.initialize.apply(this,
                                                         [name, url, {}, options]);
        this.extension = this.format.split('/')[1].toLowerCase();
        //this.extension = (this.extension == 'jpg') ? 'jpeg' : this.extension;
    },
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GTileCache 객체 생성
	 * 작성일 : 2011.04.19
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.19		최재훈		파일 호출 디렉토리 구조를 G-inno 에 맞게 수정
	 * 2011.04.19		최원석		버전 정보를 외부에서 조작 가능하도록 수정
	 * 
	 **********************************************************************************/
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
	
	/**********************************************************************************
	 * 함수명 : chkParams
	 * 설 명 : options 을 체크 하고 변형 생성한다.
	 * 인 자 : name (레이어 명), url (타일 서비스 주소), layername (타일 서비스 이름), options (Layer options 들)
	 * 사용법 : chkParams(options)
	 * 작성일 : 2011.04.19
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.19		최원석		OpenLayers.Map 의 initialize 복사
	 * 								생성 시 옵션 체크 추가
	 * 
	 **********************************************************************************/
	chkParams : function(name, url, layername, options){
		//name 체크
		if(!name) {
			GError.create_obj(this, "Layer Name(레이어 명)");
		}
		if(!url) {
			GError.create_obj(this, "Url (서비스 주소)");
		}
		if(!layername) {
			GError.create_obj(this, "TileCache Layer Name (타일 서비스 이름)");
		}
	},

	CLASS_NAME: "GTileCache"
});
