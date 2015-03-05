/**********************************************************************************
 * 파일명 : GAcss.js
 * 설 명 : Ginno Acss Class (횡단면도)
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.05.20		최원석				0.1					최초 생성
 * 
**********************************************************************************/

GAcss = OpenLayers.Class(OpenLayers.Control, {
	/**
	 * 이벤트 타입
	 */
	EVENT_TYPES: ['callback'],
	
	/**
	 * 서비스 주소
	 */
	serviceUrl : null,
	
	/**
	 * 도형 영속성
	 */
	persist : true,
	
	/**
	 * 레이어 목록
	 */
	layers : [],
	
	/**
	 * 스타일 목록
	 */
	styles : [],	
	
	/**
	 * alias 목록
	 */
	alias : [],
	
	/**
	 * 타입 목록
	 */
	types : [],
	
	/**
	 * 이미지 너비
	 */
	width : 400,
	
	/**
	 * 이미지 높이
	 */
	height : 300,
	
	/**
	 * 이미지 타입
	 */
	format : "image/png",
	
	/**
	 * 좌표계
	 */
	crs : "EPSG:4326",
	
	/**
	 * 버전
	 */	
	version : "1.0.0",
	
	/**
	 * 배경 이미지
	 */
	 bgcolor : "0xffffff",
	 
	 /**
	  * 반환 타입
	  */
	 resultType : "XML",
	
	/**
	 * 반환 함수
	 */
	callbacks : null,
	
	/**
	 * 호출 경로 
	 */
	 imgPath : null,
	 
	 /**
	  * 위치 표시 객체
	  */
	 feature : null,
	
	/**
	 * default map style 정의
	 */
	handlerOptions : {
		//라인 데이터 유지
		multiLine : true,
		//컨트롤 비 활성화 시 라인 유지 여부
		persistControl : true,
		//레이어 옵션
		layerOptions: {
			styleMap: new OpenLayers.StyleMap({
				'default': new OpenLayers.Style(null, {
					rules: [new OpenLayers.Rule({
						symbolizer : {
							"Point": {
								pointRadius: 4,
								graphicName: "circle",
								fillColor: "#ffffff",
								fillOpacity: 1,
								strokeWidth: 1,
								strokeOpacity: 1,
								strokeColor: "#333333"
							},
							"Line" : {
								strokeWidth: 2,
								strokeOpacity: 1,
								strokeColor: "#ff0000"
							},
							"Polygon": {
								strokeWidth: 3,
								strokeOpacity: 1,
								strokeColor: "#ff0000",
								fillColor: "#ee9900",
								fillOpacity: 0
							}
						}
					})]
				})
			})
		}
	},
	
	res : {
		//총 거리
		dist : 0,
		
		//결과 너비
		width : 0,
		
		//결과 높이
		height : 0,
		
		//최고 심도
		maxDep : 0,
		
		//검색 지점 위치
		searchPoint : {
			start : {
				x : 0,
				y : 0
			},
			end : {
				x : 0,
				y : 0
			},
			dist : {
				x : 0,
				y : 0,
				signX : 0,
				signY : 0
			}
		},

		//시설물 리스트
		facilities : [],
		
		//도로 리스트
		roads : [],
		
		//전체 화면에서 그래프 사이의 간격
		offset : {
			left : 10,
			bottom : 20,
			right : 10,
			top : 40
		},
		
		//그래프 기준 선
		baseLine : {
			top : 0,
			left : 0,
			bottom : 0,
			right : 0,
			width : 0,
			height : 0
		},
		
		eventDist : {
			move : false,
			startDist : 0,
			startDep : 0,
			endDist : 0,
			endDep : 0,
			startPos : {
				x : 0,
				y : 0
			},
			drawOffset : {
				x : 0,
				y : 0
			}
		},
		
		//객체 초기화
		clear : function() {
			this.dist = 0;
			this.width = 0;
			this.height = 0;
			this.maxDep = 0;
			this.searchPoint = {
				start : {
					x : 0,
					y : 0
				},
				end : {
					x : 0,
					y : 0
				},
				dist : {
					x : 0,
					y : 0,
					signX : 0,
					signY : 0
				}
			};
			this.facilities = [];
			this.roads = [];
			this.distList = [];
			this.baseLine = {
				top : 0,
				left : 0,
				bottom : 0,
				right : 0,
				width : 0,
				height : 0
			};
		},
		
		//횡단면도 실행시 초기화
		setInitParam : function(width, height, dist) {
			this.setSize(width, height);
			this.setBaseLine();
			this.dist = parseFloat(dist);
		},
		
		//크기 초기화
		setSize : function(width, height) {
			this.width = width;
			this.height = height;
		},

		//기준 선 초기화
		setBaseLine : function() {
			this.baseLine.left = parseFloat(this.offset.left);
			this.baseLine.bottom = parseFloat(this.height - this.offset.bottom);
			this.baseLine.right = parseFloat(this.width - this.offset.right);
			this.baseLine.top = parseFloat(this.offset.top);
			this.baseLine.width = parseFloat(this.width - (this.offset.left + this.offset.right));
			this.baseLine.height = parseFloat(this.height - (this.offset.bottom + this.offset.top));
		},
		
		//결과 값 받은 후 초기화
		setResInit : function() {
			this.setMaxDep();
		},
		
		//최대 깊이 초기화
		setMaxDep : function() {
			for(var i=0,len=this.facilities.length; i < len; i++) {
				if(this.facilities[i].dep > this.maxDep) this.maxDep = parseFloat(this.facilities[i].dep);
			}
		},
		
		//그래프 그리기		
		draw : function(element, callback) {
			var tagStr = "";
			
			tagStr += this.drawBase();
			tagStr += this.drawRoads();
			tagStr += this.drawFacilities();
			tagStr += this.drawDistList();
			tagStr += this.drawEvent();
			
			$(element).html(tagStr);
			
			$("#eventDistLine", element).hide();
		},
		
		//그래프 기본 틀 
		drawBase : function() {
			var str = '';
			
			//왼쪽 세로 라인
			str += '<v:line id="leftLine" from="' + this.baseLine.left + ',' + this.baseLine.top + '" to="' + this.baseLine.left + ',' + (this.baseLine.bottom + 5) + '" strokecolor="black" strokeweight="1pt" />';
			
			//왼쪽 세로 라인 위 'A' 텍스트
			str += '<v:line id="startText" from="' + (this.baseLine.left-5) + ',' + (this.baseLine.top/2) + '" to="' + (this.baseLine.left+5) + ',' + (this.baseLine.top/2+0.1) + '">';
			str += '<v:fill on="true" color="black" />';
			str += '<v:path textpathok="true" />';
			str += '<v:textpath on="true" fitpath="false" string="A" style="font-size:12pt;font-family:dotum,돋움;font-weight:normal" />';
			str += '</v:line>';
			
			//아래쪽 가로 라인
			str += '<v:line id="bottomLine" from="' + this.baseLine.left + ',' + this.baseLine.bottom + '" to="' + this.baseLine.right + ',' + this.baseLine.bottom + '" strokecolor="black" strokeweight="1pt" />';
			
			//위쪽 가로 라인
			str += '<v:line id="bottomLine" from="' + this.baseLine.left + ',' + this.baseLine.top + '" to="' + this.baseLine.right + ',' + this.baseLine.top + '" strokecolor="black" strokeweight="1pt">';
			str += '<v:stroke dashstyle="dash" />';
			str += '</v:line>';
			
			//오른쪽 세로 라인
			str += '<v:line id="rightLine" from="' + this.baseLine.right + ',' + this.baseLine.top + '" to="' + this.baseLine.right + ',' + (this.baseLine.bottom + 5) + '" strokecolor="black" strokeweight="1pt" />';
			//오른쪽 세로 라인 위 'B' 텍스트
			str += '<v:line id="endText" from="' + (this.baseLine.right-5) + ',' + (this.baseLine.top/2) + '" to="' + (this.baseLine.right+5) + ',' + (this.baseLine.top/2+0.1) + '">';
			str += '<v:fill on="true" color="black" />';
			str += '<v:path textpathok="true" />';
			str += '<v:textpath on="true" fitpath="false" string="B" style="font-size:12pt;font-family:dotum,돋움;font-weight:normal" />';
			str += '</v:line>';
			
			return str;
		},
		
		//시설물
		drawFacilities : function() {
			var str = '';
			
			for(var i=0,len=this.facilities.length; i < len; i++) {
				//시설물 그림
				str += this.drawFacility(this.facilities[i], i);
			}
			
			return str;
		},
		
		//시설물 그림
		drawFacility : function(fac, i) {
			var str = '';
			
			var pixelX = GUtil.fn_fmt_fix(fac.dist * this.baseLine.width / this.dist, 2) + this.baseLine.left;
			
			//시설물 심도
			var pos = {
				x : pixelX - 3,
				top : this.baseLine.top + 30,
				bottom : this.baseLine.bottom - 20
			};
			
			//심도 표현 높이 영역
			var posY = pos.top;
			if(this.maxDep && fac.dep != 0) {
				posY = (fac.dep * (pos.bottom - pos.top)) / Math.ceil(this.maxDep);
			}
			
			//구경(fac.dip)에 따른 윈 크기 변경
			var ovalObj = {
					posX : "",
					posY : "",
					width : "",
					height : ""
			};
			if(fac.dip >= 0 && fac.dip <= 50){
				ovalObj.posX = pos.x;
				ovalObj.posY = posY;
				ovalObj.size = 6;
			}
			else if(fac.dip > 50 && fac.dip <= 100){
				ovalObj.posX = pos.x - 1;
				ovalObj.posY = posY - 1;
				ovalObj.size = 8;
			}
			else if(fac.dip > 100 && fac.dip <= 200){
				ovalObj.posX = pos.x - 2;
				ovalObj.posY = posY - 2;
				ovalObj.size = 10;
			}
			else if(fac.dip > 200 && fac.dip <= 300){
				ovalObj.posX = pos.x - 3;
				ovalObj.posY = posY - 3;
				ovalObj.size = 12;
			}
			else if(fac.dip > 300 && fac.dip <= 400){
				ovalObj.posX = pos.x - 4;
				ovalObj.posY = posY - 4;
				ovalObj.size = 14;
			}
			else if(fac.dip > 400){
				ovalObj.posX = pos.x - 5;
				ovalObj.posY = posY - 5;
				ovalObj.size = 16;
			}
			str += '<v:oval id="underPoi' + i + '" class="underPoi" strokecolor="' + fac.color + '" fillcolor="' + fac.color + '" style="position:absolute; left:' + ovalObj.posX + 'px; top:' + (ovalObj.posY) + 'px; width:' + ovalObj.size + 'px; height:' + ovalObj.size + 'px;" />';
			
			//시설물 라인
			str += '<v:line id="underFac' + i + '" table="' + fac.table + '" class="underFac" from="' + pixelX + ',' + this.baseLine.top + '" to="' + pixelX + ',' + this.baseLine.bottom + '" strokeweight="1pt">';
			str += '<v:stroke color="' + fac.color + '" />';
			str += '</v:line>';
			
			//높이 표시
			str += '<v:line from="' + (pos.x-3) + ',' + (posY) + '" to="' + (pos.x - 3 + 0.1) + ',' + (posY - 20) + '">';
			str += '<v:fill on="true" color="black" />';
			str += '<v:path textpathok="true" />';
			str += '<v:textpath on="true" fitpath="false" string="' + fac.dep + '" style="font-size:6pt;font-family:dotum,돋움;font-weight:normal" />';
			str += '</v:line>';
			
			return str;
		},
		
		drawRoads : function() {
			var str = "";
			
			for(var i=0,len=this.roads.length; i < len; i++) {
				str += this.drawRoad(this.roads[i], i);
			}
			
			return str;
		},
		
		drawRoad : function(road, i) {
			var offset = {
				dist : -30,
				rect : -15
			};
			
			var str = "";
			var roadSX = GUtil.fn_fmt_fix(road.dist * this.baseLine.width / this.dist, 2)+this.baseLine.left;
			var roadEX = GUtil.fn_fmt_fix(road.distEnd * this.baseLine.width / this.dist, 2)+this.baseLine.left;

			//오른쪽 선을 넘어가는 부분은 나타내지 않음
			if(roadSX <= this.baseLine.left) roadSX = this.baseLine.left;
			if(roadEX > this.baseLine.width+this.baseLine.left) roadEX = this.baseLine.width+this.baseLine.left;
			
			//도로 폭
			var destSE = roadEX - roadSX;
			
			//도로 표시
			str += '<v:rect strokecolor="#ffffff" fillcolor="' + road.color + '" style="position:absolute;top:' + (this.baseLine.top+offset.rect) + 'px; left:' + roadSX + 'px; width:' + destSE + 'px; height:15px" />';
			
			//도로 시작점 라인
			if(roadSX != this.baseLine.left) {
				str += '<v:line from="' + roadSX + ',' + this.baseLine.top + '" to="' + roadSX + ',' + this.baseLine.bottom + '" strokeweight="1pt" >';
				str += '<v:stroke dashstyle="dot" color="' + road.color + '" />';
				str += '</v:line>';
			}
			
			//도로 끝점 라인
			str += '<v:line from="' + roadEX + ',' + this.baseLine.top + '" to="' + roadEX + ',' + this.baseLine.bottom + '" strokeweight="1pt" >';
			str += '<v:stroke dashstyle="dot" color="' + road.color + '" />';
			str += '</v:line>';

			return str;
		},
		
		drawDistList : function() {
			var distList = [];
			
			distList.push(0);
			for(var i=0,len=this.facilities.length; i < len; i++) {
				distList.push(parseFloat(this.facilities[i].dist));
			}
			for(var i=0,len=this.roads.length; i < len; i++) {
				if(this.roads[i].dist > 0) distList.push(parseFloat(this.roads[i].dist));
				var endDist = parseFloat(parseFloat(this.roads[i].distEnd));
				if(endDist < this.dist) distList.push(endDist);
			}
			distList.push(this.dist);
			
			for(var i=distList.length-1; i > 0; i--) {
				for(var j=0; j < i; j++) {
					if(distList[j] > distList[j+1]) {
						var temp = distList[j];
						distList[j] = distList[j+1];
						distList[j+1] = temp;
					}
				}
			}
			
			var str = "";
			for(var i=0,len=distList.length-1; i < len; i++) {
				str += this.drawFacDist(distList[i], distList[i+1], i);
			}
			return str;
		},
		
		drawFacDist : function(start, end, i) {
			if(start == this.baseLine.left) {
				return "";
			}
			
			var offsetX = 5;
			var offsetY;
			if(i%2 == 0) {
				offsetY = 8;	
			}
			else {
				offsetY = -8;
			}
			
			var facDist = GUtil.fn_fmt_fix(end - start, 2);
			var facDistX = GUtil.fn_fmt_fix((start + (facDist/2)) * this.baseLine.width / this.dist, 2) + this.offset.left;
			
			if(facDist == 0) {
				return "";
			}
			
			var str = "";
			str += '<v:line from="' + (facDistX-offsetX) + ',' + (this.baseLine.bottom - offsetY) + '" to="' + (facDistX+offsetX) + ',' + (this.baseLine.bottom - offsetY - 0.1) + '">';
			str += '<v:fill on="true" color="black" />';
			str += '<v:path textpathok="true" />';
			str += '<v:textpath on="true" fitpath="false" string="' + facDist + '" style="font-size:6pt;font-family:dotum,돋움;font-weight:normal" />';
			str += '</v:line>';
			return str;
		},
		
		drawEvent : function() {
			var str = "";
			//거리 측정 Line
			str += '<v:line id="eventDistLine" from="0,0" to="0,0" strokecolor="red" strokeweight="1pt" />';
			//거리 측정 결과
			str += '<v:line id="eventDistStr" from="0,0" to="0,0">';
			str += '<v:fill on="true" color="red" />';
			str += '<v:stroke color="red" />';
			str += '<v:path textpathok="true" />';
			str += '<v:textpath on="true" string="" style="font-size:6pt;font-family:dotum,돋움;font-weight:normal;" />';
			str += '</v:line>';

			//속성조회 심볼
			str += "<div class='acssAttr'>";
			str += "<div style='margin-bottom:5px;'><span class='titLyr'></span></div>";
			str += "<div><span class='tit'>구경</span> : <span class='dip'></span></div>";
			str += "<div><span class='tit'>심도</span> : <span class='dep'></span></div>";
			str += "</div>";
			return str;
		}
	},
	
	initEvent : function(element) {
		$(element).unbind("mousemove");
		
		$(".underPoi", element).unbind("click");
		
		$(".underFac", element).unbind("mouseover");
		$(".underFac", element).unbind("mouseout");
		$(".underFac", element).unbind("click");
	},
	
	//위치 확인 이벤트 설정
	positionEvent : function(element) {
		$(element).bind("mousemove", this, function(evt) {
			var control = evt.data;
			
			if(evt.offsetX >=10 && evt.offsetX <= 590) {
				var diffX = (control.res.searchPoint.dist.x * (evt.offsetX-10)) / 580;
				var diffY = (control.res.searchPoint.dist.y * (evt.offsetX-10)) / 580;
				
				var lon = parseFloat(control.res.searchPoint.start.x) + parseFloat(diffX * control.res.searchPoint.dist.signX);
				var lat = parseFloat(control.res.searchPoint.start.y) + parseFloat(diffY * control.res.searchPoint.dist.signY);
				var lonlat = new OpenLayers.LonLat(lon, lat);
				control.feature.move(lonlat);	
			}
		});
	},
	
	//속성조회 이벤트 설정
	attrEvent : function(element, callback) {
		$(".underFac", element).bind("mouseover", this.res, function(evt) {
			var id = $(this).attr("id").replace("underFac", "");
			$(".acssAttr span.dip", element).text(evt.data.facilities[id].dip);
			$(".acssAttr span.dep", element).text(evt.data.facilities[id].dep);
			$(".acssAttr span.titLyr", element).text(evt.data.facilities[id].layer);
			$(".acssAttr", element).css("left", $(this).offset().left);
			$(".acssAttr", element).css("top", evt.clientY - $(element).position().top);
			$(".acssAttr", element).show();
		});
		
		$(".underFac", element).bind("mouseout", this.res, function(evt) {
			$(".acssAttr", element).hide();
		});
		
		$(".underFac", element).bind("click", this.res, function(evt) {
			var id = $(this).attr("id").replace("underFac", "");
			
			if(callback) {
				callback(evt.data.facilities[id].table, evt.data.facilities[id].id);
			}
		});
	},
	
	distEvent : function(element) {
		
		this.res.eventDist.drawOffset.x = $(element).position().left + 10;
		this.res.eventDist.drawOffset.y = $(element).position().top + 10;
		
		$(".underPoi", element).bind("click", this.res, function(evt) {
			var id = $(this).attr("id").replace("underPoi", "");
			if(evt.data.eventDist.move) {
				evt.data.eventDist.move = false;
				evt.data.eventDist.endDist = evt.data.facilities[id].dist;
				evt.data.eventDist.endDep = evt.data.facilities[id].dep;
				var distance =  Math.abs(evt.data.eventDist.endDist - evt.data.eventDist.startDist);
				var dep =  Math.abs(evt.data.eventDist.endDep - evt.data.eventDist.startDep);
				
				var left = evt.clientX - evt.data.eventDist.drawOffset.x + 15;
				
				
				var top = evt.clientY - evt.data.eventDist.drawOffset.y;
				
				$("#eventDistStr", element).attr("from", left+","+top);
				$("#eventDistStr", element).attr("to", (parseFloat(left)+10)+","+(parseFloat(top)+0.1));
				$("#eventDistStr textpath", element).attr("string", GUtil.fn_fmt_fix(Math.sqrt(distance*distance + dep*dep), 2));
				$(element).unbind("mousemove");
			}
			else {
				evt.data.eventDist.move = true;
				evt.data.eventDist.startDist = evt.data.facilities[id].dist;
				evt.data.eventDist.startDep = evt.data.facilities[id].dep;
				
				var left = $(this).css("left").replace("px", "");
				var top = $(this).css("top").replace("px", "");
				$("#eventDistLine", element).attr("from", (parseFloat(left)+4) + "," + (parseFloat(top)+3));
				$("#eventDistLine", element).attr("to", (parseFloat(left)+4) + "," + (parseFloat(top)+3));
				$("#eventDistLine", element).show();
				
				$(element).bind("mousemove", evt.data, function(evt) {
					var control = evt.data;
					var left = evt.clientX - evt.data.eventDist.drawOffset.x;
					var top = evt.clientY - evt.data.eventDist.drawOffset.y;
					$("#eventDistLine", element).attr("to", left + "," + top);
				});
			}
		});
		
		
	},
	
	activeEvent : function(element, type, callback) {
		this.initEvent(element);
		
		if(type == 'p') {
			this.positionEvent(element);
		}
		else if(type == 'd') {
			this.distEvent(element);
		}
		else if(type == 'a') {
			this.attrEvent(element, callback);
		}
	},
	
	/**********************************************************************************
	 * 함수명 : initialize (생성자 함수)
	 * 설 명 : GAcss 생성자 함수
	 * 인 자 : handler (handler 객체), options(옵션 들)
	 * 사용법 : initialize(handler, options)
	 * 작성일 : 2011.04.18
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.04.18		최원석		OpenLayers.Map 의 initialize 복사
	 * 								생성 시 옵션 체크 추가
	 * 2011.04.20		최원석		default Control 수정
	 * 
	 **********************************************************************************/
	initialize: function(options) {
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
		
		this.EVENT_TYPES =
            GAcss.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );
		
        this.callbacks = OpenLayers.Util.extend(
            {
                mouseup : this.getFeature
            },
            this.callbacks
        );
		
        this.handlerOptions = OpenLayers.Util.extend(
            {persist: this.persist}, this.handlerOptions
        );
		
        this.handler = new GPath(this, this.callbacks, this.handlerOptions);
	},	
	
	/**********************************************************************************
	 * 함수명 : setStyle
	 * 설 명 : GMeasure 객체 생성
	 * 인 자 : obj (styleOptions)
	 * 사용법 : setStyle(obj)
	 * 작성일 : 2011.05.17
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.17		최원석		속성 조회의 스타일을 변경
	 * 
	 **********************************************************************************/
	setStyle : function(obj) {
		for(var i in obj) {
			for(var j in obj[i]) {
				this.handlerOptions['layerOptions']['styleMap']['styles']['default']['rules'][0]['symbolizer'][i][j] = obj[i][j];
			}
		}
		
		this.handler.handlerOptions = this.handlerOptions;
	},
	
	/**********************************************************************************
	 * 함수명 : getAcss
	 * 설 명 : 횡단면도 요청
	 * 인 자 : geometry (Point Geometry)
	 * 사용법 : getFeature(geometry)
	 * 작성일 : 2011.05.20
	 * 작성자 : 기술개발팀 최원석
	 * 수정일				수정자			수정내용
	 * ----------------------------------------------------------------------
	 * 2011.05.20		최원석		최초 생성
	 * 
	 **********************************************************************************/
	 getFeature: function(point, geometry) {
		 this.res.clear();
		 
		 var searchPoint = "";
		 var offsetX = 2;
		 var offsetY = 2;
		 
		 // 시작점 선택시
		 if(geometry.components.length == 2) {
			 
		 }
		 
		 // 끝점 선택시
		 if(geometry.components.length == 3) {
			 searchPoint = geometry.getVertices()[0].x + "," + geometry.getVertices()[0].y+",";		 
			 searchPoint += geometry.getVertices()[1].x + "," + geometry.getVertices()[1].y;
			 this.handler.finish();
			 
			 var point  = new OpenLayers.Geometry.Point(geometry.getVertices()[1].x, geometry.getVertices()[1].y);
			 this.feature = new OpenLayers.Feature.Vector(point);
			 this.handler.layer.addFeatures(this.feature);
			 this.res.setInitParam(this.width, this.height, geometry.getLength());
			 
			 // 시작점과 끝점에 A, B 라벨 표시
			 this.insertLabel(geometry);
			 
			var params = GUtil.fn_convert_objToStr({
				SERVICE : "ACSS",
				VERSION : this.version,
				REQUEST : "GetCSView",
				LAYERS : this.layers.join(),
				STYLES : this.styles.join(),
				TYPES : this.types.join(),
				SEARCHPOINT : searchPoint,
				CRS : this.crs,
				WIDTH : this.width,
				HEIGHT : this.height,
				FORMAT : this.format,
				BGCOLOR : this.bgcolor,
				RESULTTYPE : this.resultType
			});
			
			var obj = this;
			if(this.resultType == "VIEW") {
				this.imgPath = this.serviceUrl+params;
				//트리거 이벤트 실행
				this.events.triggerEvent(this.EVENT_TYPES[0]);
			}
			else {
				GMapUtil.sendProxyGet(this.serviceUrl, params, function(res)
					{
						obj.parseRes(res, obj);
					}
				);
			}
			
			$("*").css("cursor", "default");
		 }
    },
    
    insertLabel : function(geometry){
   		var offset = 2;
   		var offsetX;
   		var offsetY;
   		
   		var styleA = {
				label : "A",
				fontSize : 20,
				fontWeight : "bold"
		};
   		var styleB = {
				label : "B",
				fontSize : 20,
				fontWeight : "bold"
		};
   		
   		if((geometry.getVertices()[0].x - geometry.getVertices()[1].x) < 0){
   			offsetX = offset * (-1);
   		}
   		else{
   			offsetX = offset;
   		}
   		if((geometry.getVertices()[0].y - geometry.getVertices()[1].y) < 0){
   			offsetY = offset * (-1);
   		}
   		else{
   			offsetY = offset;
   		}  
   		var posA  = new OpenLayers.Geometry.Point(geometry.getVertices()[0].x + offsetX, geometry.getVertices()[0].y + offsetY);
   		
   		if((geometry.getVertices()[geometry.getVertices().length-1].x - geometry.getVertices()[geometry.getVertices().length-2].x) < 0){
   			offsetX = offset * (-1);
   		}
   		else{
   			offsetX = offset;
   		}
   		if((geometry.getVertices()[geometry.getVertices().length-1].y - geometry.getVertices()[geometry.getVertices().length-2].y) < 0){
   			offsetY = offset * (-1);
   		}
   		else{
   			offsetY = offset;
   		}
   		var posB  = new OpenLayers.Geometry.Point(geometry.getVertices()[geometry.getVertices().length-1].x + offsetX, geometry.getVertices()[geometry.getVertices().length-1].y + offsetY);
		
    	
		var labelA = new OpenLayers.Feature.Vector(posA, null, styleA);
		var labelB = new OpenLayers.Feature.Vector(posB, null, styleB);
		
		this.handler.layer.addFeatures(labelA);
		this.handler.layer.addFeatures(labelB);
    },
    
    parseRes : function(res, obj) {
    	
    	var result = res.getElementsByTagName("CrossSectionResult");
    	
    	obj.res.distList.push(0);
    	
    	var underFacility, roads;
    	if(result.length > 0) {
    		var searchPoint = result[0].getElementsByTagName("SearchPoint");
    		underFacility = result[0].getElementsByTagName("UnderFacility");
    		roads = result[0].getElementsByTagName("Road");
    		
    		if(searchPoint.length > 0) {
    			var start = searchPoint[0].getElementsByTagName("StartPoint");
    			var end = searchPoint[0].getElementsByTagName("EndPoint");
    			var len = searchPoint[0].getElementsByTagName("Length");
    			
    			var x, y;
    			if(start.length > 0) {
    				x = start[0].getElementsByTagName("X");
    				y = start[0].getElementsByTagName("Y");
    				
    				if(x.length >= 0) obj.res.searchPoint.start.x = $(x[0]).text();
    				if(y.length >= 0) obj.res.searchPoint.start.y = $(y[0]).text();
    			}
    			
    			if(end.length > 0) {
    				x = end[0].getElementsByTagName("X");
    				y = end[0].getElementsByTagName("Y");
    				
    				if(x.length >= 0) obj.res.searchPoint.end.x = $(x[0]).text();
    				if(y.length >= 0) obj.res.searchPoint.end.y = $(y[0]).text();
    			}
    			
    			if(len.length > 0) {
    				obj.res.dist = $(len[0]).text();
    			}
    			
    			if(obj.res.searchPoint.start.x - obj.res.searchPoint.end.x > 0) obj.res.searchPoint.dist.signX = -1;
    			else obj.res.searchPoint.dist.signX = 1;
    			
    			if(obj.res.searchPoint.start.y - obj.res.searchPoint.end.y > 0) obj.res.searchPoint.dist.signY = -1;
    			else obj.res.searchPoint.dist.signY = 1;
    			 
    			obj.res.searchPoint.dist.x = Math.abs(obj.res.searchPoint.start.x - obj.res.searchPoint.end.x);
    			obj.res.searchPoint.dist.y = Math.abs(obj.res.searchPoint.start.y - obj.res.searchPoint.end.y);
    		}
    	}
    	
    	
    	if(underFacility.length > 0) {
    		var features = underFacility[0].getElementsByTagName("Feature");
    		
    		if(features.length > 0) {
    			for(var i=0, len=features.length; i < len; i++) {
    				var feature = {
    					dist : 0,
    					table : "",
    					layer : "",
    					id : 0,
    					dep : 0,
    					dip : 0,
    					color : "",
    					type : "fac"
    				};
    				
    				var dist = features[i].getElementsByTagName("Distance");
    				var table = features[i].getElementsByTagName("DataSetName");
    				var layer = features[i].getElementsByTagName("LayerName");
    				var id = features[i].getElementsByTagName("FeatureID");
    				var dep = features[i].getElementsByTagName("Depth");
    				var dip = features[i].getElementsByTagName("Diameter");
    				var color = features[i].getElementsByTagName("Color");
    				
    				if(dist.length > 0) feature.dist = parseFloat($(dist[0]).text());
    				if(table.length > 0) feature.table = $(table[0]).text();
    				if(layer.length > 0) feature.layer = $(layer[0]).text();
    				if(id.length > 0) feature.id = $(id[0]).text();
    				if(dep.length > 0) feature.dep = parseFloat($(dep[0]).text());
    				if(dip.length > 0) feature.dip = parseFloat($(dip[0]).text());
    				if(color.length > 0) feature.color = "#" + $(color[0]).text().substring(3);
    				
    				obj.res.facilities.push(feature);
    			}
    		}
    	}
    	
    	if(roads.length > 0) {
    		var features = roads[0].getElementsByTagName("Feature");
    			
    		if(features.length > 0) {
    			for(var i=0, len=features.length; i < len; i++) {
	    			var feature = {
						dist : 0,
						table : "",
						layer : "",
						id : 0,
						color : "",
						type : "road"
					};
	    			
	    			var dist = features[i].getElementsByTagName("Distance1");
	    			var distEnd = features[i].getElementsByTagName("Distance2");
	    			var table = features[i].getElementsByTagName("DataSetName");
	    			var layer = features[i].getElementsByTagName("LayerName");
	    			var id = features[i].getElementsByTagName("FeatureID");
	    			var color = features[i].getElementsByTagName("Color");
	    			
	    			if(dist.length > 0) feature.dist = parseFloat($(dist[0]).text());
	    			if(distEnd.length > 0) feature.distEnd = parseFloat($(distEnd[0]).text());
	    			if(table.length > 0) feature.table = $(table[0]).text();
	    			if(layer.length > 0) feature.layer = $(layer[0]).text();
	    			if(id.length > 0) feature.id = $(id[0]).text();
	    			if(color.length > 0) feature.color = "#" + $(color[0]).text().substring(3);
	    			
	    			obj.res.roads.push(feature);
    			}
    		}
    	}
    	
    	//obj.orderBySeq(obj.res.facilities, 'dist', 'asc');
    	//obj.orderBySeq(obj.res.roads, 'dist', 'asc');
    	
    	obj.res.setResInit();
    	//트리거 이벤트 실행
		obj.events.triggerEvent(obj.EVENT_TYPES[0]);
    },
    
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
	
	getAlias : function() {
		return this.alias;
	},
    
    getLayers : function() {
    	return this.layers;
    },
    
    getStyles : function() {
    	return this.styles;
    },
    
    getImgPath : function() {
    	return this.imgPath;
    },
    
	CLASS_NAME: "GAcss" 
});