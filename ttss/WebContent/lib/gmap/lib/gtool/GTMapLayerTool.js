/**********************************************************************************
 * 파일명 : GTMapLayerTool.js
 * 설 명 : 주제도 & 레이어 관리 객체
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.05.26		최원석				0.1					최초 생성
 * 2011.06.27		최원석				0.2					클래스 정리 및 수정
 * 2012.02.08		최원석									groups, tMaps, layers, layerGroups 모두 각각 클래스로 구분하면 좋을 것 같음
 * 2012.05.31		최원석				0.3					상수에 맞춰서 수정 (유지 필요성 여부 고려)
 * 
**********************************************************************************/

GTMapLayerTool = OpenLayers.Class({

	/**
	 * 주제도(TMap) 그룹 객체들의 배열
	 * groups = [group1, group2, .... , group99];
	 * 
	 * 주제도 그룹 객체
	 * group = {
	 * 		id : id,		//주제도 그룹 아이디
	 * 		name : name,	//주제도 그룹 이름
	 * 		seq : seq		//주제도 그룹 순서
	 * }
	 * 
	 */
	groups : [],
	
	/**
	 * 
	 * 주제도(TMap) 객체들의 배열
	 * tMaps = [tMap1, tMap2, ..... , tMap99];
	 * 
	 * 주제도 객체
	 * tMap = {
	 * 		id : id,		//주제도 아이디
	 * 		name : name,	//주제도 이름
	 * 		seq : seq,		//주제도 순서
	 * 		group : group	//주제도 그룹 아이디
	 * }
	 */
	tMaps : [],
	
	/**
	 * 레이어 객체들의 배열
	 * layers = [layer1, layer2, .... , layer99];
	 * 
	 * 레이어 객체
	 * layer = {
	 * 		id : id,				//아이디
	 * 		table : table,			//테이블
	 * 		theme : theme,			//THEME 이름
	 * 		alias : alias,			//ALIAS 이름
	 * 		seq   : seq,			//레이어 순서
	 * 		show  : show,			//레이어 화면에 표시 여부 (1:표시, 0:미표시)
	 * 		tmapid  : tmapid,		//주제도 아이디
	 *      layerGroup : layerGroup,	//레이어 그룹 아이디
	 *		attr : attr,				//속성조회 여부
	 *		type : type,				//도형타입 (점,선,면)
	 * }
	 */
	layers : [],
	
	cloneLayers : [],
	
	/**
	 * 
	 * 레이어 그룹 객체들의 배열
	 * layerGroups = [layerGroup1, layerGroup2, ..... , layerGroup99];
	 * 
	 * 주제도 객체
	 * layerGroup = {
	 * 		id : id,		//그룹 아이디
	 * 		name : name		//그룹 이름
	 * }
	 */
	layerGroups : [],
	
	cloneLayerGroups : [],

	/**
	 * 현재 주제도 아이디
	 */
	tMapId : null,
	
	/**
	 * 기본 맵 정의
	 */
	defaultSld : null,
	
	/**
	 * 맵 정의
	 */
	sld : null,
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GLayerManagerTool 객체 생성
	 * 인 자 : layer(배열(레이어객체)), tMaps(배열(주제도객체)), groups(배열(주제도그룹객체))
	 			, tMapId 현재주제도 아이디
	 * 사용법 : new GLayerManagerTool(layers[, tMaps, groups, tMapId])
	 * 작성일 : 2011.05.26
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.26		최원석		최초 생성
	 
	 **********************************************************************************/
	initialize : function(layers, tMaps, groups, layerGroups, options) {
		this.layers = layers;
		
		this.cloneLayers = this.getCloneLayers(layers);
		
		if(tMaps) {
			this.tMaps = tMaps;
		}		
		if(groups) {
			this.groups = groups;			
		}
		if(layerGroups) {
			this.layerGroups = layerGroups;
			this.cloneLayerGroups = this.getCloneLayerGroups(layerGroups);
		}
		 
		//받은 객체 초기화 (-1 값은 null 로 변환)
		this.changeNull(this.layers);
		this.changeNull(this.tMaps);
		this.changeNull(this.groups);
		
		if(options && options.tMapId) {
			this.tMapId = options.tMapId;
		}
		else {
			if(tMaps && tMaps[0] && tMaps[0].id) this.tMapId = tMaps[0].id;
		}
		control = this;
		if(options && options.serviceUrl && options.callback) {
			GRequest.WMS.getStyles(options.serviceUrl,this.getLayers({retAttr:"theme"})+',', function(res) {
				//this.getLayers({retAttr:"theme"})+','
				//"사업소경계,누수복구정보"
				/*
				control.sld = res.xml;
				control.defaultSld = res.xml.cloneNode(true);
				var bool = 0;
				if(options.userStyle) {
					control.setUserStyle(options.userStyle, res);
					bool = 1;
				}
				else {
					control.sld = res;
				}
				*/
				
				// SLD 객체
				control.sld = res;
				
				// SLD 클론 객체
				var sldStr = encodeURIComponent(JSON.stringify(res, replacer));
				var cloneSld = JSON.parse(decodeURIComponent(sldStr.replace('/+/g', "%20")), reviver);
				control.defaultSld = cloneSld;
								
				var bool = 0;
				if(options.userStyle) bool = 1;
				
				options.callback(res, bool);
			});
		}
	},
	setUserStyle : function(userStyle, res) {
		var xml = new OpenLayers.Format.XML();
		var str = decodeURIComponent(userStyle);
		var sldObj = xml.read(str);
		
		
		var userDesc = sldObj.getElementsByTagName("sld:StyledLayerDescriptor");
		var userNamedLayers = userDesc[0].getElementsByTagName("sld:NamedLayer");
		
		var desc = res.xml.getElementsByTagName("sld:StyledLayerDescriptor");
		var namedLayers = desc[0].getElementsByTagName("sld:NamedLayer");
		
		
		for(var i=0, len=userNamedLayers.length; i < len; i++) {
			var userName;
			element = userNamedLayers[i].getElementsByTagName("se:Name");
			if(element.length > 0) userName = $(element[0]).text();
			
			for(var j=0, jLen=namedLayers.length; j < jLen; j++) {
				var name;
				element = namedLayers[j].getElementsByTagName("se:Name");
				if(element.length > 0) name = $(element[0]).text();

				if(userName == name) {
					desc[0].removeChild(namedLayers[j]);
					desc[0].appendChild(userNamedLayers[i]);
				}
			}
		}
		
		this.sld = GRequest.WMS.parseGetStyles(res.xml);
	},
	
	setLayers : function(layers, options) {
		this.layers = layers;
		
		control = this;
		if(options && options.serviceUrl && options.callback) {
			GRequest.WMS.getStyles(options.serviceUrl, this.getLayers({retAttr:"theme"})+',', function(res) {
				/*
				control.defaultSld = res.xml.cloneNode(true);
				var bool = 0;
				if(options.userStyle) {
					control.setUserStyle(options.userStyle, res);
					bool = 1;
				}
				else {
					control.sld = res;
				}
				options.callback(res, bool);
				*/
				// SLD 객체
				control.sld = res;
				
				// SLD 클론 객체
				var sldStr = encodeURIComponent(JSON.stringify(res, replacer));
				var cloneSld = JSON.parse(decodeURIComponent(sldStr.replace('/+/g', "%20")), reviver);
				control.defaultSld = cloneSld;
								
				var bool = 0;
				if(options.userStyle) bool = 1;
				
				options.callback(res, bool);
			});
		}
	},
	
	setLayerGroups : function(){
		var control = this; 
		var layers = this.getThemeShowList('asc');
		var groupsIdx = [];
		
		for(var i in layers){
			for(var j in control.layers){
				if(layers[i] == control.layers[j].theme){
					if(groupsIdx.length == 0 || groupsIdx.length > 0 && groupsIdx[groupsIdx.length-1] != control.layers[j].layerGroup){
						groupsIdx.push(control.layers[j].layerGroup);
					}
				}
			}
		}
	},
	
	getLayerGroups : function() {
		return this.layerGroups;
	},
	
	/**********************************************************************************
	 * 함수명 : getTMapName
	 * 설 명 : 현재 주제도 이름 반환
	 * 반환값 : 성공(현재 주제도 이름), 실패(false)
	 * 사용법 : getTMapName()
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	getTMapName : function() {
		for(var i in this.tMaps) {
			if(this.tMaps[i].id == this.tMapId) {
				return this.tMaps[i].name;
			}
		}
		return false;
	},
	
	/**********************************************************************************
	 * 함수명 : setTMapByName
	 * 설 명 : 주제도 이름으로 현재 주제도 설정
	 * 인 자 : name(주제도 이름)
	 * 반환값 : 성공(true), 실패(false)
	 * 사용법 : setTMapByName(name)
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	setTMapByName : function(name) {
		for(var i in this.tMaps) {
			if(this.tMaps[i].name == name) {
				tMapId = this.tMaps[i].id;
				return true;
			}
		}
		return false;
	},
	
	/**********************************************************************************
	 * 함수명 : setTMapById
	 * 설 명 : 주제도 아이디로 현재 주제도 설정
	 * 인 자 : id  (주제도 이름)
	 * 사용법 : setTMapbyId(id)
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	setTMapbyId : function(id) {
		for(var i in this.tMaps) {
			if(this.tMaps[i].id == id) {
				this.tMapId = id;
				return true;
			}
		}
		return false;
	},
	
	
	/**********************************************************************************
	 * 함수명 : getTMapId
	 * 설 명 : 현재 주제도 아이디 반환
	 * 반환값 : 현재 주제도 아이디
	 * 사용법 : getTMapId()
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	getTMapId : function() {
		return this.tMapId;
	},
	
	getLayerGroups : function(options) {
		if(!options) {
			return this.layerGroups;
		}
		
		var results = [];
		
		var arr = [];
		if(options.con) {
			if(options.conVal) {
				
				for(var i in this.layerGroups) {
					if(options.reverse) {
						if(this.layerGroups[i][options.con] != options.conVal) {
							arr.push(this.layerGroups[i]);
						}
					}
					else {
						if(this.layerGroups[i][options.con] == options.conVal) {
							arr.push(this.layerGroups[i]);
						}
					}
				}
			}
			else {
				for(i in this.layerGroups) {
					if(options.reverse) {
						if(!this.layerGroups[i][options.con]) {
							arr.push(this.layerGroups[i]);
						}
					}
					else {
						if(this.layerGroups[i][options.con]) {
							arr.push(this.layerGroups[i]);
						}
					}
				}
			}
		}
		else {
			for(var i in this.layerGroups) {
				arr.push(this.layerGroups[i]);
			}
		}
		
		if(options.order) {
			this.orderBySeq(arr, 'seq', options.order);
		}
		
		if(options.retAttr) {
			var retAttr = [];
			if(!(options.retAttr instanceof Array)) {
				retAttr = [options.retAttr];
			}
			else {
				retAttr = options.retAttr;
			}
			for(var i in arr) {
				for(var j in retAttr) {
					results.push(arr[i][retAttr[j]]);
				}
			}
		}
		else {
			results = arr;
		}
		
		return results;
	},
	
	/**********************************************************************************
	 * 함수명 : getLayers
	 * 설 명 : 레이어 리스트를 반환
	 * 인 자 : options(객체)
	 * 	options = {
	 * 		con : 조건이 되는 필드명
	 * 		conVal : 찾는 조건 값
	 * 		order : 정렬 ('asc' : 오름차순, 'desc' : 내림차순)
	 * 		retAttr : 반환 필드 명
	 *  }
	 * 반환값 : 조건에 맞는 레이어 리스트
	 * 사용법 : getLayers(options)
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	getLayers : function(options) {
		if(!options) {
			return this.layers;
		}
		
		var results = [];
		
		var arr = [];
		if(options.con) {
			if(options.conVal) {
				
				for(var i in this.layers) {
					if(options.reverse) {
						if(this.layers[i][options.con] != options.conVal) {
							arr.push(this.layers[i]);
						}
					}
					else {
						if(this.layers[i][options.con] == options.conVal) {
							arr.push(this.layers[i]);
						}
					}
				}
			}
			else {
				for(i in this.layers) {
					if(options.reverse) {
						if(!this.layers[i][options.con]) {
							arr.push(this.layers[i]);
						}
					}
					else {
						if(this.layers[i][options.con]) {
							arr.push(this.layers[i]);
						}
					}
				}
			}
		}
		else {
			for(var i in this.layers) {
				arr.push(this.layers[i]);
			}
		}
		
		if(options.order) {
			this.orderBySeq(arr, 'seq', options.order);
		}
		
		if(options.retAttr) {
			var retAttr = [];
			if(!(options.retAttr instanceof Array)) {
				retAttr = [options.retAttr];
			}
			else {
				retAttr = options.retAttr;
			}
			for(var i in arr) {
				for(var j in retAttr) {
					results.push(arr[i][retAttr[j]]);
				}
			}
		}
		else {
			results = arr;
		}
		
		return results;
	},
	
	/**********************************************************************************
	 * 함수명 : getThemeList
	 * 설 명 : 현재 주제도 Theme 리스트 반환
	 * 인 자 : order('asc' : 오름차순, 'desc' : 내림차순)
	 * 반환값 : 현재 주제도 Theme 배열 반환
	 * 사용법 : getThemeList(order)
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	getThemeList : function(order) {
		var options = { 
			con : 'tmapid',
			conVal : this.getTMapId(),
			order : order,
			retAttr : 'theme'
		};
		return this.getLayers(options);
	},
	
	/**********************************************************************************
	 * 함수명 : getThemeShowList
	 * 설 명 : 현재 주제도에서 화면에 보여 줄 Theme 리스트 반환
	 * 인 자 : order('asc' : 오름차순, 'desc' : 내림차순)
	 * 반환값 : Theme 배열
	 * 사용법 : getThemeShowList(order)
	 * 작성일 : 2011.06.29
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.29		최원석		최초 생성
	 
	 **********************************************************************************/
	getThemeShowList : function(order) {
		var options = { 
			con : 'show',
			order : order,
			retAttr : 'theme'
		};
		return this.getLayers(options);
	},
	
	/**********************************************************************************
	 * 함수명 : getAliasList
	 * 설 명 : 현재 주제도 Alias 리스트 반환
	 * 인 자 : order('asc' : 오름차순, 'desc' : 내림차순)
	 * 반환값 : 현재 주제도 Theme 배열 반환
	 * 사용법 : getAliasList(order)
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	getAliasList : function(order) {
		var options = { 
			con : 'tmapid',
			conVal : this.getTMapId(),
			order : order,
			retAttr : 'alias'
		};
		return this.getLayers(options);
	},
	
	/**********************************************************************************
	 * 함수명 : getTableList
	 * 설 명 : 현재 주제도 table 리스트 반환
	 * 인 자 : order('asc' : 오름차순, 'desc' : 내림차순)
	 * 반환값 : 현재 주제도 table 배열 반환
	 * 사용법 : getTableList(order)
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	getTableList : function(order) {
		var options = { 
			con : 'tmapid',
			conVal : this.getTMapId(),
			order : order,
			retAttr : 'table'
		};
		return this.getLayers(options);
	},
	
	/**********************************************************************************
	 * 함수명 : getLayersSize
	 * 설 명 : 현재 layer 리스트의 크기를 반환
	 * 반환값 : layer 리스트의 크기
	 * 사용법 : getLayersSize()
	 * 작성일 : 2011.06.29
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.29		최원석		최초 생성
	 
	 **********************************************************************************/
	getLayersSize : function() {
		return this.layers.length;
	},
	
	/**********************************************************************************
	 * 함수명 : setLayerAttr
	 * 설 명 : 특정 조건에 부합하는 레이어의 속성 설정
	 * 인 자 : options
	 * 	options = {
	 * 		con : 조건이 되는 필드명
	 * 		conVal : 찾는 조건 값
	 * 		attr : 설정할 필드 값 배열 or 문자열
	 * 		value : 설정할 필드 값 배열 or 문자열
	 *  }
	 * 반환값 : 성공(true), 실패(false)
	 * 사용법 : setLayerAttr(options)
	 * 작성일 : 2011.06.29
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.29		최원석		최초 생성
	 
	 **********************************************************************************/
	setLayerAttr : function(options) {
		if(options && options.con && options.conVal && options.attr) {
			var attrs = [];
			var values = [];
			if(!(options.attr instanceof Array)) {
				attrs = [options.attr];
			}
			else {
				attrs = options.attr;
			}
			if(!(options.value instanceof Array)) {
				values = [options.value];
			}
			else {
				values = options.value;
			}
			
			for(var i in this.layers) {
				if(this.layers[i][options.con] == options.conVal) {
					for(var j=0,len=attrs.length; j < len; j++) {
						this.layers[i][attrs[j]] = values[j];	
					}
					return true;
				}
			}
		}
		else {
			return false;
		}
	},
	
	/**********************************************************************************
	 * 함수명 : orderBySeq
	 * 설 명 : 특정 조건에 부합하는 레이어의 속성 설정
	 * 인 자 : arr(기준 배열), field(기준 필드명), order(정렬 기준 : asc[오름차순], desc[내림차순])
	 * 반환값 : 순서 변경된 레이어 리스트
	 * 사용법 : orderBySeq(arr, field, order)
	 * 작성일 : 2011.06.29
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.29		최원석		최초 생성
	 
	 **********************************************************************************/
	orderBySeq : function(arr, field, order) {
		var len = arr.length;
		for(var i=len-1; i > 0; i--) {
			for(var j=0; j < i; j++) {
				if(order.toLowerCase() == 'desc') {
					if(arr[j][field] < arr[j+1][field]) {
						GUtil.Array.fn_swap_element(arr, j, j+1);
					}
				}
				else {
					if(arr[j][field] > arr[j+1][field]) {
						GUtil.Array.fn_swap_element(arr, j, j+1);
					}
				}
			}
		}
	},
	
	
	/**********************************************************************************
	 * 함수명 : changeNull
	 * 설 명 : 배열에 포함된 -1 값을 null 값으로 변환
	 * 인 자 : arr  (배열)
	 * 사용법 : changeNull(arr)
	 * 작성일 : 2011.06.27
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.06.27		최원석		최초 생성
	 
	 **********************************************************************************/
	changeNull : function(arr) {
		for(var i in arr) {
			for(var j in arr[i]) {
				if(arr[i][j] == -1) {
					arr[i][j] = null;
				}
			}
		}
	},
	
	setSld : function(sld) {
		this.sld = sld;
	},

	getSld : function() {
		return this.sld;
	},
	
	getSld_body : function(ruleView, baseLayer) {
		var tempXml = this.sld.xml.cloneNode(true);
		var desc = tempXml.getElementsByTagName("sld:StyledLayerDescriptor");
		var namedLayers = desc[0].getElementsByTagName("sld:NamedLayer");

		var delLayers = [];
		for(var i in this.layers) {
			if(this.layers[i].show != 1) {
				delLayers.push(this.layers[i].theme);
			}
		}
		
		if(baseLayer) {
			for(var i=delLayers.length-1; i >= 0; i--) {
				if(delLayers[i] == baseLayer) {
					delLayers.splice(i, 1);
				}
			}
		}
		
		for(var i=0, len=namedLayers.length; i < len; i++) {
			var name;
			element = namedLayers[i].getElementsByTagName("se:Name");
			if(element.length > 0) name = $(element[0]).text();
			
			for(var j in delLayers) {
				if(delLayers[j] == name) {
					desc[0].removeChild(namedLayers[i]);
				}
			}
		}
		
		if(ruleView) {
			for(var i in this.sld.namedLayers) {
				for(var j in this.sld.namedLayers[i].userStyle) {
					for(var k in this.sld.namedLayers[i].userStyle[j].rules) {
						if(baseLayer) this.sld.namedLayers[i].userStyle[j].rules[k].hidden = false;
						if(this.sld.namedLayers[i].userStyle[j].rules[k].hidden) {
							var featureTypeStyle = namedLayers[i].getElementsByTagName("sld:UserStyle")[j].getElementsByTagName("se:FeatureTypeStyle")[0];
							var rules = featureTypeStyle.getElementsByTagName("se:Rule");
							
							for(var l=0, lLen=rules.length; l < lLen; l++) {
								var ruleName = $(rules[l].getElementsByTagName("se:Name")[0]).text();
								if(this.sld.namedLayers[i].userStyle[j].rules[k].name == ruleName) {
									featureTypeStyle.removeChild(rules[l]);
									break;
								}
							}
						}
					}
				}
			}
		}

		return tempXml.xml;
	},
	
	getDefaultSld : function() {
		return this.defaultSld;
	},
	
	getModifyStr : function() {
		// 화면에 보이는 sld만 저장
		var tempXml = this.sld.xml.cloneNode(true);
		var desc = tempXml.getElementsByTagName("sld:StyledLayerDescriptor");
		var namedLayers = desc[0].getElementsByTagName("sld:NamedLayer");
		
		var delLayers = [];
		for(var i in this.sld.namedLayers) {
			//if(!this.sld.namedLayers[i].modify) {
				//delLayers.push(this.sld.namedLayers[i].name);
			//};
		};
		
		for(var i=0, len=namedLayers.length; i < len; i++) {
			var name;
			element = namedLayers[i].getElementsByTagName("se:Name");
			if(element.length > 0) name = $(element[0]).text();

			for(var j in delLayers) {
				if(delLayers[j] == name) {
					desc[0].removeChild(namedLayers[i]);
				}
			}
		}
		
		return tempXml.xml;
	},
	
	backSld : function(layer) {
				
	},
	
	updateSld : function(layer) {
		layer.modify = true;
		
		/*
		var namedLayers = this.sld.xml.getElementsByTagName("sld:NamedLayer");
		
		for(var i=0, len=namedLayers.length; i < len; i++) {
			var name;
			element = namedLayers[i].getElementsByTagName("se:Name");
			if(element.length > 0) name = $(element[0]).text();
			
			if(layer.name == name) {
				var userStyles = namedLayers[i].getElementsByTagName("sld:UserStyle");
				
				for(var j=0, jLen=userStyles.length; j < jLen; j++) {
					var rules = userStyles[j].getElementsByTagName("se:Rule");
					for(var k=0, kLen=rules.length; k < kLen; k++) {
						var points = rules[k].getElementsByTagName("se:PointSymbolizer");
						var lines = rules[k].getElementsByTagName("se:LineSymbolizer");
						var polygons = rules[k].getElementsByTagName("se:PolygonSymbolizer");
						var texts = rules[k].getElementsByTagName("se:TextSymbolizer");
						
						if(points.length > 0) {
							var externalGraphics = points[0].getElementsByTagName("se:ExternalGraphic");
							if(externalGraphics.length > 0) {
								var inlineContents = externalGraphics[0].getElementsByTagName("se:InlineContent");
								if(inlineContents.length > 0) inlineContents[0].text = layer.userStyle[j].rules[k].symbolizer.point.externalGraphic;
							}
							
							
							var svgParam = points[0].getElementsByTagName("se:Size");
							if(svgParam.length > 0) {
								svgParam[0].text = layer.userStyle[j].rules[k].symbolizer.point.size;
							}
						}
						
						if(lines.length > 0) {
							var svgParam = lines[0].getElementsByTagName("se:SvgParameter");
							
							var exist = 0;
							for(var l=0, lLen=svgParam.length; l < lLen; l++) {
								//선 색 strokeColor
								if(svgParam[l].getAttribute("name") == "stroke") {
									svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.line.stroke;
								}
								//선 두께 strokeWidth
								else if(svgParam[l].getAttribute("name") == "stroke-width") {
									svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.line.strokeWidth;
								}
								//선 투명도 strokeOpacity
								else if(svgParam[l].getAttribute("name") == "stroke-opacity") {
									svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.line.strokeOpacity;
								}
								//모서리 스타일 strokeLinecap
								else if(svgParam[l].getAttribute("name") == "stroke-linecap") {
									svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.line.strokeLinecap;
								}
								else if(svgParam[l].getAttribute("name") == "stroke-dasharray") {
									var selStyle = layer.userStyle[j].rules[k].symbolizer.line.strokeDashArray;
									
									if(selStyle == "dot") {
										svgParam[l].text = "2.0,2.0";
									}
									else if(selStyle == "dash") {
										svgParam[l].text = "7.0,3.0";
									}
									else if(selStyle == "dashdot") {
										svgParam[l].text = "10.0,2.0,2.0,2.0";
									}
									else {
										svgParam[l].parentNode.removeChild(svgParam[l]);
									}
									
									exist = 1;
								}
								
								//모서리 스타일 strokeLinecap
								//else if(svgParam[l].getAttribute("name") == "stroke-linecap") {
								//  strokeLinecap
								//	svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.line.strokeLinecap;
								//}
								
							}
							
							if(svgParam.length > 0 && exist==0) {
								var text = "";
								var selStyle = layer.userStyle[j].rules[k].symbolizer.line.strokeDashArray;
								
								if(selStyle != "solid") {
									if(selStyle == "dot") {
										text = "2.0,2.0";
									}
									else if(selStyle == "dash") {
										text = "7.0,3.0";
									}
									else if(selStyle == "dashdot") {
										text = "10.0,2.0,2.0,2.0";
									}
									
									var node = this.sld.xml.createElement("se:SvgParameter");
									var textNode = this.sld.xml.createTextNode(text);
									node.setAttribute("name", "stroke-dasharray");
									node.appendChild(textNode);
									svgParam[0].parentNode.appendChild(node);
								}
							}
						};
						
						if(polygons.length > 0) {
							svgParam = polygons[0].getElementsByTagName("se:SvgParameter");
							for(l=0, lLen=svgParam.length; l < lLen; l++) {
								//면색 fillColor
								if(svgParam[l].getAttribute("name") == "fill") {
									svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.polygon.fillColor;
								}
								//면투명도 fillOpacity
								else if(svgParam[l].getAttribute("name") == "fill-opacity") {
									svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.polygon.fillOpacity;
								}
							}
						}
						
						if(texts.length > 0) {
							var fonts = texts[0].getElementsByTagName("se:Font");
							if(fonts.length > 0) {
								svgParam = fonts[0].getElementsByTagName("se:SvgParameter");
								for(l=0, lLen=svgParam.length; l < lLen; l++) {
									//서체 fontFamily
									if(svgParam[l].getAttribute("name") == "font-family") {
										svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.text.fontFamily;
									}
									//글자 크기 fontSize
									else if(svgParam[l].getAttribute("name") == "font-size") {
										svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.text.fontSize;
									}
									//글자 스타일 fontStyle
									else if(svgParam[l].getAttribute("name") == "font-style") {
										svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.text.fontStyle;
									}
									//글자 두께 fontWeight
									else if(svgParam[l].getAttribute("name") == "font-weight") {
										svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.text.fontWeight;
									}
								}
							}
							
							var fill = texts[0].getElementsByTagName("se:Fill");
							for(var l=0; l < fill.length; l++) {
								svgParam = fill[l].getElementsByTagName("se:SvgParameter");

								if(fill[l].previousSibling.nodeName == "se:Halo") {
									for(var m=0, mLen=svgParam.length; m < mLen; m++) {
										if(svgParam[l].getAttribute("name") == "fill") {
											//배경 색 haloColor
											svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.text.haloColor;
										}
										else if(svgParam[l].getAttribute("name") == "fill-opacity") {
											//배경 투명도 haloOpacity
											svgParam[l].text = layer.userStyle[j].rules[k].symbolizer.text.haloOpacity;
										}
									}
								}
								else {
									for(var m=0, mLen=svgParam.length; m < mLen; m++) {
										if(svgParam[m].getAttribute("name") == "fill") {
											//글자 색 fillColor
											svgParam[m].text = layer.userStyle[j].rules[k].symbolizer.text.fillColor;
										}
										else if(svgParam[m].getAttribute("name") == "fill-opacity") {
											//글자 투명도 fillOpacity
											svgParam[m].text = layer.userStyle[j].rules[k].symbolizer.text.fillOpacity;;
										}
									}
								}
							}
						}
					}
				}
			}
		}
		*/
		for(var i=0, len=this.sld.data.namedLayers.length; i < len; i++) {
			if(layer.name == this.sld.data.namedLayers[i].name) {
				var userStyles = this.sld.data.namedLayers[i].userStyle;
				
				for(var j=0, jLen=userStyles.length; j < jLen; j++) {
					var rules = userStyles[j].rules;
					for(var k=0, kLen=rules.length; k < kLen; k++) {
						if(rules[k].symbolizer["point"]){
							rules[k].symbolizer["point"].externalGraphic = layer.userStyle[j].rules[k].symbolizer.point.externalGraphic;
							rules[k].symbolizer["point"].size = layer.userStyle[j].rules[k].symbolizer.point.size;
						}
						
						if(rules[k].symbolizer["line"]){
							rules[k].symbolizer["line"].stroke = layer.userStyle[j].rules[k].symbolizer.line.stroke;
							rules[k].symbolizer["line"].strokeWidth = layer.userStyle[j].rules[k].symbolizer.line.strokeWidth;
							rules[k].symbolizer["line"].strokeOpacity = layer.userStyle[j].rules[k].symbolizer.line.strokeOpacity;
							rules[k].symbolizer["line"].strokeLinecap = layer.userStyle[j].rules[k].symbolizer.line.strokeLinecap;
							
							if(rules[k].symbolizer["line"].strokeDashArray){
								var selStyle = layer.userStyle[j].rules[k].symbolizer.line.strokeDashArray;
								
								if(selStyle == "dot") {
									rules[k].symbolizer["line"].strokeDashArray = "2.0,2.0";
								}
								else if(selStyle == "dash") {
									rules[k].symbolizer["line"].strokeDashArray = "7.0,3.0";
								}
								else if(selStyle == "dashdot") {
									rules[k].symbolizer["line"].strokeDashArray = "10.0,2.0,2.0,2.0";
								}
							}
						};
						
						if(rules[k].symbolizer["polygon"]) {
							rules[k].symbolizer["polygon"].fillColor = layer.userStyle[j].rules[k].symbolizer.polygon.fillColor;
							rules[k].symbolizer["polygon"].fillOpacity = layer.userStyle[j].rules[k].symbolizer.polygon.fillOpacity;
						}
						
						if(rules[k].symbolizer["text"]) {
							rules[k].symbolizer["text"].fontFamily = layer.userStyle[j].rules[k].symbolizer.text.fontFamily;
							rules[k].symbolizer["text"].fontSize = layer.userStyle[j].rules[k].symbolizer.text.fontSize;
							rules[k].symbolizer["text"].fontStyle = layer.userStyle[j].rules[k].symbolizer.text.fontStyle;
							rules[k].symbolizer["text"].fontWeight = layer.userStyle[j].rules[k].symbolizer.text.fontWeight;
							rules[k].symbolizer["text"].haloColor = layer.userStyle[j].rules[k].symbolizer.text.haloColor;
							rules[k].symbolizer["text"].haloOpacity = layer.userStyle[j].rules[k].symbolizer.text.haloOpacity;
							rules[k].symbolizer["text"].fillColor = layer.userStyle[j].rules[k].symbolizer.text.fillColor;
							rules[k].symbolizer["text"].fillOpacity = layer.userStyle[j].rules[k].symbolizer.text.fillOpacity;
						}
					}
				}
			}
		}
	},
	
	getTMapGroup : function() {
		return this.groups;
	},
	
	getTMap : function() {
		return this.tMaps;
	},
	
	addTMap : function(obj) {
		this.tMaps.push(obj);
	},
	
	
	/**********************************************************************************
	 * 함수명 : insertGroup
	 * 설 명 : 그룹 이동시 해당 레이어의 Seq값 변경을 위한 함수
	 * 		  기준 그룹의 Seq값을 타겟 그룹의 Seq값으로 변경 후 타겟그룹과 그 두 그룹 사이에 있는
	 * 		  그룹들의 Seq값을 1씩 증가 또는 1씩 감소 시켜준다.
	 * 인 자 : aGroupId(이동할 기준 그룹의 ID값), bGroupId(타겟이 되는 그룹의 ID값)
	 * 사용법 : insertGroup(aGroupId, bGroupId)
	 * 작성일 : 2012.06.08
	 * 작성자 : 기술교육팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 20121.06.08		이경찬			최초 생성
	 * 
	 **********************************************************************************/
	insertGroup : function(aGroupId, bGroupId){
		aGroupId = parseInt(aGroupId);
		bGroupId = parseInt(bGroupId);
		
		// 그룹 리스트 정렬
		this.orderBySeq(this.layerGroups, 'seq', "asc");
		
		var idA; // 기준 그룹의 layerGroups에서의 index값
		var idB; // 타겟 그룹의 layerGroups에서의 index값
		var seqA; // 기준 그룹의 Seq값
		var seqB; // 타겟 그룹의 Seq값
		
		for(var i in this.layerGroups){
			if(this.layerGroups[i].id == aGroupId){
				seqA = this.layerGroups[i].seq; 
				idA = i;
			}
			if(this.layerGroups[i].id == bGroupId){
				seqB = this.layerGroups[i].seq;
				idB = i;
			}
		}
		
		// 기준 그룹이 위로 이동
		if(idA-idB > 0){
			this.layerGroups[idA].seq = this.layerGroups[idB].seq;
			for(var i=idB, len=idA ; i < len ; i++){
				this.layerGroups[i].seq += 1;
			}
		}
		
		// 기준 그룹이 아래로 이동
		else {
			this.layerGroups[idA].seq = this.layerGroups[idB].seq;
			for(var i=idB, len=idA ; i > len ; i--){
				this.layerGroups[i].seq -= 1; 
			}
		}
		
		// 변경된 그룹의 Seq에 의해 그룹내에 포함된 레이어의 Seq값도 변경해준다.
		this.setLayerSeq(this.layerGroups);
	},
	
	/**********************************************************************************
	 * 함수명 : setLayerSeq
	 * 설 명 : 변경된 그룹의 Seq에 의해 그룹내에 포함된 레이어들(this.layers)의 Seq값도 변경해주는 함수
	 * 인 자 : layerGroups(레이어 그룹 배열)
	 * 사용법 : setLayerSeq(layerGroups)
	 * 작성일 : 2012.06.08
	 * 작성자 : 기술교육팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 20121.06.08		이경찬			최초 생성
	 * 
	 **********************************************************************************/
	setLayerSeq : function(layerGroups){
		var layerSeq = 1;
		this.orderBySeq(layerGroups, 'seq', "asc");
		for(var i in layerGroups){
			for(var j in this.layers){
				if(layerGroups[i].id == this.layers[j].layerGroup){
					this.layers[j].seq = layerSeq++;
				}
			}
		}
	},
	
	/**********************************************************************************
	 * 함수명 : insertLayer
	 * 설 명 : 레이어 이동시 해당 레이어의 Seq값을 변경해주는 함수
	 * 		  기준 레이어의 Seq값을 타겟 레이어의 Seq값으로 변경해주고 두 레이어 사이에 있는
	 * 		  레이어들의 Seq값을 1씩 증가 또는 1씩 감소시켜준다.
	 * 인 자 : layerId(기준 레이어 ID값), targetId(타겟 레이어 ID값)
	 * 사용법 : insertLayer(layerId, targetId)
	 * 작성일 : 2012.06.08
	 * 작성자 : 기술교육팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 20121.06.08		이경찬			최초 생성
	 * 
	 **********************************************************************************/
	insertLayer : function(layerId,targetId){
		this.orderBySeq(this.layers, 'seq', "asc");
		var layerIdx; // 기준 레이어의 layers에서의 index값
		var layerSeq; // 기준 레이어의 Seq값
		var targetIdx; // 타겟 레이어의 layers에서의 index값
		var targetSeq; // 타겟 레이어의 Seq값
		
		for(var i in this.layers){
			if(this.layers[i].id == layerId){
				layerSeq = this.layers[i].seq;
				layerIdx = i;
			}
			if(this.layers[i].id == targetId){
				targetSeq = this.layers[i].seq;
				targetIdx = i;
			}
		}
		if(layerIdx-targetIdx > 0){
			this.layers[layerIdx].seq = this.layers[targetIdx].seq;
			for(var i=targetIdx, len=layerIdx ; i < len ; i++){
				this.layers[i].seq += 1;
			}
		}
		else {
			this.layers[layerIdx].seq = this.layers[targetIdx].seq;
			for(var i=targetIdx, len=layerIdx ; i > len ; i--){
				this.layers[i].seq -= 1;
			}
		}
		this.orderBySeq(this.layers, 'seq', "asc");
	},
	
	/**********************************************************************************
	 * 함수명 : getCloneLayerGroups
	 * 설 명 : LayerGroups 객체의 클론 객체를 생성하는 함수
	 * 인 자 : obj(LayerGroups 객체)
	 * 사용법 : getCloneLayerGroups(obj)
	 * 작성일 : 2012.06.08
	 * 작성자 : 기술교육팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 20121.06.08		이경찬			최초 생성
	 * 
	 **********************************************************************************/
	getCloneLayerGroups : function(obj) {
		var arr = [];
		if(obj){
			for(var i=0, len=obj.length; i < len; i++) {
				arr.push(this.cloneObj(obj[i]));
			}
		}
		else{
			for(var i=0, len=this.layerGroups.length; i < len; i++) {
				arr.push(this.cloneObj(this.layerGroups[i]));
			}
		}
		
		return arr;
	},
	
	/**********************************************************************************
	 * 함수명 : getCloneLayers
	 * 설 명 : Layers 객체의 클론 객체를 생성하는 함수
	 * 인 자 : obj(Layers 객체)
	 * 사용법 : getCloneLayers(obj)
	 * 작성일 : 2012.06.08
	 * 작성자 : 기술교육팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 20121.06.08		이경찬			최초 생성
	 * 
	 **********************************************************************************/
	getCloneLayers : function(obj) {
		var arr = [];
		if(obj){
			for(var i=0, len=obj.length; i < len; i++) {
				arr.push(this.cloneObj(obj[i]));
			}
		}
		else{
			for(var i=0, len=this.layers.length; i < len; i++) {
				arr.push(this.cloneObj(this.layers[i]));
			}
		}
		
		return arr;
	},
	
	/**********************************************************************************
	 * 함수명 : cloneObj
	 * 설 명 : 새로운 객체안에 인자로 들어간 obj의 값들을 하나씩 넣어주는 함수
	 * 		  ((사용시 주의 사항)) obj 객체의 값중에 객체 타입이 있을 경우 복사가 아닌 참조 형태로 들어간다.
	 * 인 자 : obj(복제할 객체)
	 * 사용법 : cloneObj(obj)
	 * 작성일 : 2012.06.08
	 * 작성자 : 기술교육팀 이경찬
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 20121.06.08		이경찬			최초 생성
	 * 
	 **********************************************************************************/
	cloneObj : function(obj){
		var clone = {};
		for(var i in obj) {
			clone[i] = obj[i];
		}
		return clone;
	},
	
	CLASS_NAME: "GTMapLayerTool"
});


/*
 * 임시 소스 코드
 * 레이어 순서 조절  임시로 남김 
 * 클라이언트에 따라 조작할 경우 클라이언트 조작이 빠를 경우 순서가 제대로 동작안한느 현상이 있어 보류
changeSeqByMove : function(seq, target) {
	var layer = this.getLayerAttrByAttr('seq', seq);
	this.changeSeqByDelete(seq);
	this.changeSeqByInsert(target);
	layer.seq = parseInt(target);
},
changeSeqByInsert : function(seq) {
	for(var i in this.layers) {
		if(this.layers[i].seq != -1) {
			if(this.layers[i].seq >= seq) {
				this.layers[i].seq++;
			}
		}
	}	
},
changeSeqByDelete : function(seq) {
	for(var i in this.layers) {
		if(this.layers[i].seq != -1) {
			if(this.layers[i].seq > seq) {
				this.layers[i].seq--;
			}
		}
	}
},
*/