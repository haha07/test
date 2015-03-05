var GError = {
	debug : false,
	
	create_obj : function(obj, msg) {
		if(this.debug) alert(obj.CLASS_NAME + " 객체 생성 오류 : " + msg + "은(는) 필수 프로퍼티 입니다.");
	},
	
	//일단 보류
	call_function : function(obj, fnName, msg) {
		//if(this.debug) alert(obj.CLASS_NAME + " : " + fnName + " : "
	}
}
