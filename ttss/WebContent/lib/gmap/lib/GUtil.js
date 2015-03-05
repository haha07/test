/**********************************************************************************
 * 파일명 : GUtil.js
 * 설 명 : GInno 공통 유틸리티
 * 필요 라이브러리 : jQuery
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.15		최원석				1.0					최초 생성
 * 
 * 
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * Base64 Encoding, Decoding
 * 출처 : http://www.webtoolkit.info/javascript-base64.html
 * 
 * 
  **********************************************************************************/
GUtil = {
	/**********************************************************************************
	 * Common Section
	 **********************************************************************************/

	 /**********************************************************************************
	 * 함수명 : fn_deactive_rightClick
	 * 설 명 : 마우스 우클릭 방지
	 * 사용법 : GUtil.fn_deactive_rightClick()
	 * 작성일 : 2011.04.28
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_deactive_rightClick : function() {
		document.oncontextmenu = function(){return false;};
	},
	
	/**********************************************************************************
	 * 함수명 : fn_redirect_page
	 * 설 명 : 페이지 이동
	 * 인 자 : url (이동 할 url)
	 * 사용법 : GUtil.fn_redirect_page("http://www.g-inno.com")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_redirect_page : function(url) {
		document.location.href = url;
	},
	
	/**********************************************************************************
	 * 함수명 : fn_enc_base64
	 * 설 명 : 페이지 이동
	 * 인 자 : str (문자열)
	 * 사용법 : GUtil.fn_enc_base64("test")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_enc_base64 : function(str) {
		return Base64.encode(str);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_dec_base64
	 * 설 명 : 페이지 이동
	 * 인 자 : str (문자열)
	 * 사용법 : GUtil.fn_dec_base64("dGVzdA==")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_dec_base64 : function(str) {
		return Base64.decode(str);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_pop_win
	 * 설 명 : 페이지 이동
	 * 인 자 : url (팝업으로 열 주소), name (팝업 타켓 or 팝업명), options (팝업 옵션)
	 * 	options
	 		- name : 팝업 명
	 		- width : 팝업 가로 사이
	 		- height : 팝업 높이 
	 		- scrollbars : 스크롤 여부
	 		- toolbar : 툴 바
	 		- menubars : 메뉴 바
	 		- locationbar : 로케이션 바
	 		- statusbar : 상태 바
	 		- resizable : 리 사이징
	 		- titlebar : 타이틀 바
	 		- left : 팝업 가로 위치
	 		- top : 팝업 세로 위치
	 		- message : 팝업 창이 막혀 있을 때 메시지
	 		
	 * 사용법 : GUtil.fn_pop_win(url, options)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_pop_win : function(url, name, options) {
		//url Check
		if(!url) {
			alert("Url(주소)는 필수 입력 대상 입니다.");
			return;
		}
		
		//default 항상 새 창으로
		if(!name) {
			name = "_blank";
		}
		
		//default options
		var optObj = {
		    'width'  : '300px' ,
		    'height' : '300px' ,
		    'scrollbars' : 'yes' ,
		    'toolbar' : 'no'    ,
		    'menubars' : 'no'   ,
		    'locationbar' : 'no'  ,
		    'statusbar'   : 'no'  ,
		    'resizable'   : 'no' ,
		    'titlebar'    : 'no'  ,
		    'left'    : '0px'  ,
		    'top'     : '0px'  ,
		    'message' : '팝업차단을 해제해주세요.'
		};
		
		$.extend(optObj, options);
		
		
		//pixel or int type Check
		if(!(optObj.width = this.fn_convert_pixel(optObj.width))) {
			return;
		}
		if(!(optObj.height = this.fn_convert_pixel(optObj.height))) {
			return;
		}
		if(!(optObj.left = this.fn_convert_pixel(optObj.left))) {
			return;
		}
		if(!(optObj.top = this.fn_convert_pixel(optObj.top))) {
			return;
		}
		
		var optStr = this.fn_convert_objToStr(optObj, ",");
		
		var popup = window.open(url, name, optStr);
		
		if(!popup) {
			alert(optObj.message);
			return false;
		}
		else {
			popup.focus();	
		}
	},
	
	// cssOptions를 적용한 Control 버튼을 controlDiv에 추가한다.
    addControlButton: function (controlName, controlDiv, cssOptions) {
    	var control = "";
    	var controlObj = gMap.getControl(controlName);
    	if(controlObj){
    		control = controlObj;
    	}
    	else{
    		control = controlName;
    	}
    	
    	var controlID = "";
    	var cursorStyle = "default";
    	var str = '';
    	
    	if(typeof control === "object") {
    		controlID = control.id;
    	}
    	else{
    		controlID = control;
    	}
    	
    	if(cssOptions && cssOptions.imgURL){
    		str += '<a href="#" id="' + 'btn' + controlID + '">';
        	str += '<img src="' + cssOptions.imgURL + '" alt="' + controlID + '" />';
        	str += '</a>';
    	}
    	else{
    		str += '<button id="' + 'btn' + controlID + '">' + controlID + '</button>';
    	}
    	
    	if(cssOptions && cssOptions.cursorStyle){
    		cursorStyle = cssOptions.cursorStyle;
    	}
    	
    	$('#' + controlDiv).append(str);
    	
		switch(controlName)
        {
                case "maxExtent":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.zoomToMaxExtent();
	                	});
	                	break;
                case "prev":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.movePrev();
	                	});
	                	break;
                case "next":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.moveNext();
	                	});
	                	break;
                case "redraw":
	                	$('#' + 'btn' + controlID).click(function(){
	                		for(var i in gMap.layers){
	                			gMap.layers[i].redraw();
	                		}
	                	});
	                	break;
                case "clean":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.cleanMap();
	                	});
	                	break;
                case "upFeature":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.drawTool.upFeature();
	                		$(gMap.div).css("cursor", "default");
	                	});
	                	break;
                case "downFeature":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.drawTool.downFeature();
	                		$(gMap.div).css("cursor", "default");
	                	});
	                	break;
                case "topFeature":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.drawTool.topFeature();
	                		$(gMap.div).css("cursor", "default");
	                	});
	                	break;
                case "bottomFeature":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.drawTool.bottomFeature();
	                		$(gMap.div).css("cursor", "default");
	                	});
	                	break;
                case "deleteFeature":
	                	$('#' + 'btn' + controlID).click(function(){
	                		gMap.drawTool.deleteFeature();
	                		$(gMap.div).css("cursor", "default");
	                	});
	                	break;
                default:
			        	$('#' + 'btn' + controlID).click(function(){
			        		gMap.activeControls(controlID);
			        		$(gMap.div).css("cursor", cursorStyle);
			        		return false;
			        	});
			        	break;
        }
		return false;
    	
    	/*for(var i in cssOptions){
    		$('#' + 'btn' + controlID).css(i, cssOptions[i]);
    	}*/
    	
        return false;
    },
    
	/**********************************************************************************
	 * convert Section
	 **********************************************************************************/
	/**********************************************************************************
	 * 함수명 : fn_convert_pixel
	 * 설 명 : int 형 픽셀을 받아서 "px"를 리턴해준다.
	 * 인 자 : pixel (픽셀 값)
	 * 사용법 : GUtil.fn_convert_pixel(20)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_convert_pixel : function(pixel) {
		if(!this.fn_chk_pixel(pixel)) {
			if(!this.fn_chk_num(pixel)) {
				alert("숫자형 또는 pixel 형이 아닙니다. ex)123  or  123px");
				return false;
			}
			else {
				return pixel += "px";
			}
		}
		else {
			return pixel;
		}
	},
	
	/**********************************************************************************
	 * 함수명 : fn_convert_objToStr
	 * 설 명 : object 를 String의 연결 형태로 변형해준다.(1차 object 만 가능)
	 * 인 자 : obj (변형할 object), ch(연결 문자열)
	 * 사용법 : GUtil.fn_convert_objToStr(obj, ch)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_convert_objToStr : function(obj, ch) {
		var retVal = "";
		
		if(!ch) {
			ch = "&";
		}
		
		for(var i in obj) {
			retVal += ch;
			retVal += i;
			retVal += "=";
			retVal += obj[i];
		}
		
		return retVal.substr(1);
	},
	
	// Changes XML to JSON
	fn_convert_xmlToJson : function (xml) {
		// Create the return object
		var obj = {};
		if (xml.nodeType == 1) { // element
			// do attributes
			if (xml.attributes.length > 0) {
			obj["@attributes"] = {};
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
				}
			}
		} else if (xml.nodeType == 3) { // text
			obj = xml.nodeValue;
		}

		// do children
		if (xml.hasChildNodes()) {
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				var nodeName = item.nodeName;
				if (typeof(obj[nodeName]) == "undefined") {
					obj[nodeName] = this.fn_convert_xmlToJson(item);
				} else {
					if (typeof(obj[nodeName].push) == "undefined") {
						var old = obj[nodeName];
						obj[nodeName] = [];
						obj[nodeName].push(old);
					}
					obj[nodeName].push(this.fn_convert_xmlToJson(item));
				}
			}
		}
		return obj;
	},
	
	
	
	
	
	
	
	
	
	
	
	
	/**********************************************************************************
	 * String Section
	 **********************************************************************************/
	
	/**********************************************************************************
	 * 함수명 : fn_set_lpad
	 * 설 명 : 지정된 길이만큼 좌측에 특정문자열 채움
	 * 인 자 : str (기준문자열)
	 * 		  len (길이)
	 *        ch  (특정문자)	
	 * 사용법 : GUtil.fn_set_lpad("test",10,"0")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_set_lpad : function(str, len, ch) {
		var retVal = '';
		for(var i=str.length; i < len; i++) {
			if(ch) retVal += ch;
			else retVal += "0";
		}
		retVal += str;
		return retVal;
	},
	
	/**********************************************************************************
	 * 함수명 : fn_set_rpad
	 * 설 명 : 지정된 길이만큼 우측에 특정문자열 채움
	 * 인 자 : str (기준문자열)
	 * 		  len (길이)
	 *        ch  (특정문자)	
	 * 사용법 : GUtil.fn_set_rpad("test",10,"0")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_set_rpad : function(str, len, ch) {
		var retVal = '';
		retVal += str;
		for(var i=str.length; i < len; i++) {
			if(ch) retVal += ch;
			else retVal += "0";
		}
		return retVal;
	},
	
	/**********************************************************************************
	 * 함수명 : fn_replaceall
	 * 설 명 : 지정된 길이만큼 우측에 특정문자열 채움
	 * 인 자 : str (기준문자열)
	 * 		  from (변경될문자열)
	 *        to  (변경할문자열)	
	 * 사용법 : GUtil.fn_replaceall("test","")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_replaceAll : function(str, from, to) {
		return str.replace(new RegExp(from, "g"), to);
	},
	
	
	/**********************************************************************************
	 * 함수명 : fn_ltrim
	 * 설 명 : 좌측 공백 제거
	 * 인 자 : str (문자열)
	 * 사용법 : GUtil.fn_ltrim("   t  e s  t    ")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_ltrim : function(str) {
		return str.replace(/^\s\s*/, '');
	},
	
	/**********************************************************************************
	 * 함수명 : fn_rtrim
	 * 설 명 : 우측 공백 제거
	 * 인 자 : str (문자열)
	 * 사용법 : GUtil.fn_rtrim("   t  e s  t    ")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_rtrim : function(str) {
		return str.replace(/\s\s*$/, '');
	},
	
	/**********************************************************************************
	 * 함수명 : fn_trim
	 * 설 명 : 공백 제거
	 * 인 자 : str (문자열)
	 * 사용법 : GUtil.fn_trim("   t  e s  t    ")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_trim : function(str) {
		return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},
	
	/**********************************************************************************
	 * 함수명 : fn_remove_space
	 * 설 명 : 문자열 공백 제거
	 * 인 자 : String (문자열)
	 * 사용법 : GUtil.fn_remove_space("   t  e s  t    ")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_remove_space : function(str) {
		return str.replace(/\s/g, '');
	},
	
	
	
	
	
	
	
	
	
	
	
	
	
	/**********************************************************************************
	 * Date & Time Section
	 **********************************************************************************/
	/**********************************************************************************
	 * 함수명 : fn_getDateTime
	 * 설 명 : 현재 날짜 시간 리턴
	 * 인 자 : type (반환할 타입)
	 *	  options
	 		- y	: 년도
	 		- m	: 월
	 		- h : 시간
	 		- M : 분
	 		- s : 초
	 * 사용법 :  GUtil.fn_getDateTime()
	 * 			GUtil.fn_getDateTime('y')
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_get_now : function(type) {
		var date = new Date();
		switch(type) {
			case 'y' : return date.getYear();
			case 'm' : return date.getMonth()+1;
			case 'd' : return date.getDate();
			case 'h' : return date.getHours();
			case 'M' : return date.getMinutes();
			case "s" : return date.getSeconds(); 
		}
		
		return date;
	},
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	/**********************************************************************************
	 * Format Section
	 **********************************************************************************/
	
	/**********************************************************************************
	 * 함수명 : fn_fmt_cur
	 * 설 명 : 통화 형태 반환
	 * 인 자 : number (숫자)
	 * 사용법 : GUtil.fn_fmt_cur(3215647)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_fmt_cur : function(number) {
		if(this.fn_chk_num(number)) {
			number += "";
		}
		
		return number.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
	},
	
	/**********************************************************************************
	 * 함수명 : fn_fmt_fix
	 * 설 명 : 소수 점 아래 자리수
	 * 인 자 : number (실수), length (소수 아래 자리수)
	 * 사용법 : GUtil.fn_fmt_fix(256.1234, 2)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_fmt_fix : function(number, length) {
		var temp = Math.pow(10, length);
		
		return Math.round(number * temp) / temp;
	},
	
	/**********************************************************************************
	 * 함수명 : fn_convert_color
	 * 설 명 : 8자리 Color(#ff000000)를 0~100사이 투명도와 4자리 Color로 변환
	 * 		  인자에 따라 반대의 전환도 가능
	 * 인 자 : color (8자리 색상)
	 * 사용법 : GUtil.fn_convert_color("#ff000000")
	 * 		   GUtil.fn_convert_color([100,"#000000"])
	 * 작성일 : 2013.01.03
	 * 작성자 : 제품개발팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2013.01.03		이경찬			최초 생성
	 * 
	 **********************************************************************************/
	fn_convert_color : function(color){
		// 8자리 color -> 0~100투명도, 6자리 color
		if(typeof color == "string"){
			var res = [];
			// #를 제외한 앞에 2자리 = 투명도
			res.push(Math.round(parseInt(color.substring(1,3),16) * 100 / 255));
			res.push("#" + color.substring(3,color.length));
			
			return res;
		}
		// 0~100투명도, 6자리 color -> 8자리 color
		else{
			var res = "#";
			var opa = Math.round(color[0] * 255 / 100).toString(16); 
			if(opa.length < 2){
				opa = "0" + opa;
			}
			res += opa;
			res += color[1].substring(1,color[1].length);
			return res;
		}
	},
	
	
	
	
	
	
	
	
	
	
	/**********************************************************************************
	 * Validation Section
	 **********************************************************************************/
	
	/**********************************************************************************
	 * 함수명 : fn_chk_length
	 * 설 명 : 문자 길이 체크
	 * 인 자 : str (문자열), len (길이)
	 * 사용법 : GUtil.fn_chk_length("test", 4)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_chk_length : function(str, len) {
		return (str.length == len);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_chk_number
	 * 설 명 : 숫자형 여부 체크
	 * 인 자 : str (문자열)
	 * 사용법 : GUtil.fn_chk_length(1234)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_chk_num : function(str) {
		var regExp = /^([+-]?)(?=\d|\.\d)\d*(\.\d*)?([Ee]([+-]?\d+))?$/;
		return regExp.test(str);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_chk_tel
	 * 설 명 : 전화번호 여부 체크
	 * 인 자 : str (전화번호 '-'으로 구분된)
	 * 사용법 : GUtil.fn_chk_tel(010-000-0000)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_chk_tel : function(str) {
		var regExp = /^\d{2,3}-\d{3,4}-\d{4}$/;
		return regExp.test(str);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_chk_ema
	 * 설 명 : email 여부 체크
	 * 인 자 : email (email)
	 * 사용법 : GUtil.fn_chk_tel(010-000-0000)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_chk_ema : function(str) {
		var regExp = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return regExp.test(str);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_chk_pixel
	 * 설 명 : pixel 형식 여부 확인 (크로스 브라우징 문제 해결)
	 * 인 자 : pixel (픽셀 값)
	 * 사용법 : GUtil.fn_chk_pixel(50)
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_chk_pixel : function(pixel) {
		var regExp = /^\d+px/;
		return regExp.test(pixel);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_chk_url
	 * 설 명 : Url 형식 여부 확인 (크로스 브라우징 문제 해결)
	 * 인 자 : str (url)
	 * 사용법 : GUtil.fn_chk_url("http://www.g-inno.com")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_chk_url : function(str) {
		var regExp = /(\w+):\/\/([^\/:]+)(:\d*)?([^# ]*)/;
		return regExp.test(str);
	},
	
	/**********************************************************************************
	 * 함수명 : fn_chk_ip
	 * 설 명 : IP 형식 여부 확인 (크로스 브라우징 문제 해결)
	 * 인 자 : str (IP Adress)
	 * 사용법 : GUtil.fn_chk_ip("203.236.231.7")
	 * 작성일 : 2011.04.15
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_chk_ip : function(str) {
		var regExp = /^(1|2)?\d?\d([.](1|2)?\d?\d){3}$/;
		return regExp.test(str);
	}
};




/**********************************************************************************
 * 외부 자료 가져 옴
 * Base64 Encoding, Decoding
 * 출처 : http://www.webtoolkit.info/javascript-base64.html
 **********************************************************************************/
var Base64 = {
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
		return string;
	}
};



GUtil.Array = {
	/**********************************************************************************
	 * Array Section
	 **********************************************************************************/
	/**********************************************************************************
	 * 함수명 : fn_contain
	 * 설 명 : 배열에 포함 여부 반환
	 * 인 자 : arr (기준 배열), str (찾을 문자열 값)
	 * 사용법 : GUtil.Array.fn_contain(['a','b','c','d'], 'a')
	 * 작성일 : 2011.05.20
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 
	 **********************************************************************************/
	fn_contain : function(arr, str) {
		for(var i in arr) {
			if(arr[i] == str) {
				return true;
			}
		}
		return false; 
	},
	
	/**********************************************************************************
	 * 함수명 : fn_swap_element
	 * 설 명 : 배열 원소 
	 * 인 자 : arr (기준 배열), origin (변경할 배열인덱스), target (대상 배열 인덱스)
	 * 사용법 : GUtil.Array.fn_swap_element(['a','b','c','d'], 1, 3)
	 * 작성일 : 2011.05.26
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.26		최원석			최초 생성
	 * 
	 **********************************************************************************/
	fn_swap_element : function(arr, origin, target) {
		var tmp = arr[origin];
		arr[origin] = arr[target];
		arr[target] = tmp;
	},
	
	/**********************************************************************************
	 * 함수명 : fn_isArray
	 * 설 명 : 배열 여부 판별
	 * 인 자 : arr (대상 객체)
	 * 사용법 : GUtil.Array.fn_isArray(['a','b','c','d'])
	 * 작성일 : 2011.07.06
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.07.06		최원석			최초 생성
	 * 
	 **********************************************************************************/
	fn_isArray : function(arr) {
		if(arr instanceof Array) {
			return true;
		}
		else {
			return false;
		}
	}
};

/**
 * Constant: BROWSER_NAME
 * {String}
 * A substring of the navigator.userAgent property.  Depending on the userAgent
 *     property, this will be the empty string or one of the following:
 *     * "opera" -- Opera
 *     * "msie"  -- Internet Explorer
 *     * "safari" -- Safari
 *     * "firefox" -- Firefox
 *     * "mozilla" -- Mozilla
 */
GUtil.BROWSER_NAME = (function() {
    var name = "";
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("opera") != -1) {
        name = "opera";
    } else if (ua.indexOf("msie") != -1 || ua.indexOf("rv:11.0") != -1) {
        name = "msie";
    } else if (ua.indexOf("safari") != -1) {
        name = "safari";
    } else if (ua.indexOf("mozilla") != -1) {
        if (ua.indexOf("firefox") != -1) {
            name = "firefox";
        } else {
            name = "mozilla";
        }
    }
    else{
    	name = "chrome";
    }
    return name;
})();

/**
 * Function: getBrowserName
 * 
 * Returns:
 * {String} A string which specifies which is the current 
 *          browser in which we are running. 
 * 
 *          Currently-supported browser detection and codes:
 *           * 'opera' -- Opera
 *           * 'msie'  -- Internet Explorer
 *           * 'safari' -- Safari
 *           * 'firefox' -- Firefox
 *           * 'mozilla' -- Mozilla
 * 
 *          If we are unable to property identify the browser, we 
 *           return an empty string.
 */
GUtil.getBrowserName = function() {
    return GUtil.BROWSER_NAME;
};



