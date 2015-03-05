/**********************************************************************************
 * 파일명 : GProfile.js
 * 설 명 : 지형단면도
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2012.02.02		최원석				0.1					최초 생성
 * 
**********************************************************************************/

GProfile = OpenLayers.Class(OpenLayers.Control, {
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
	 * 이미지 너비
	 */
	width : 400,
	
	/**
	 * 이미지 높이
	 */
	height : 300,
	
	/**
	 * 버전
	 */	
	version : "1.0.0",
	
	/**
	 * 레이어명
	 */
	layer : "DEM",
	
	/**
	 * 지형 높이 값을 추출할 간격 (단위 : 미터) 
	 */
	interval : 1,
	
	/**
	 * 반환 함수
	 */
	callbacks : null,
	
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
		
		//최고 높이
		maxZ : 0,
		
		//거리(m) 간격 
		posWidth : 0,
		
		//고도(m) 간격
		posHeight : 0,
		
		//x, y, z 값 리스트
		posList : [],
		
		//전체 화면에서 그래프 사이의 간격
		offset : {
			left : 30,
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
			startZ : 0,
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
			this.maxZ = 0;
			this.posList = [];
			this.baseLine = {
				top : 0,
				left : 0,
				bottom : 0,
				right : 0,
				width : 0,
				height : 0
			};
			this.eventDist = {
				move : false,
				startDist : 0,
				startZ : 0,
				endDist : 0,
				endZ : 0,
				startPos : {
					x : 0,
					y : 0
				},
				drawOffset : {
					x : 0,
					y : 0
				}
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
			this.setMaxZ();
			this.setPos();
		},
		
		//최대 높이 초기화
		setMaxZ : function() {
			for(var i=0,len=this.posList.length; i < len; i++) {
				if(this.posList[i].z > this.maxZ) this.maxZ = parseFloat(this.posList[i].z);
			}
		},
		
		setPos : function() {
			this.posWidth = this.baseLine.width / (this.dist-1);
			this.posHeight = this.baseLine.height / this.maxZ;
		},
		
		draw : function(element, callback) {
			var tagStr = "";
			
			tagStr += this.drawBase();
			tagStr += this.drawPosZList();
			tagStr += this.drawLattice();
			tagStr += this.drawEvent();
			
			$(element).html(tagStr);
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
			str += '<v:line id="bottomLine" from="' + this.baseLine.left + ',' + this.baseLine.top + '" to="' + this.baseLine.right + ',' + this.baseLine.top + '" strokecolor="black" strokeweight="1pt" />';
			
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
		
		drawLattice : function() {
			var str = "";
			
			//가로 격자 픽셀 계산
			var LatticeXSize = Math.floor(this.posList.length / 10);
			var cipher = [500, 100, 10, 5];
			for(var i=0, len=cipher.length; i < len; i++) {
				if(LatticeXSize > cipher[i]) {
					while(true) {
						LatticeXSize--;
						if(LatticeXSize%cipher[i]==0) break;
					}
					break;
				}
			}
			
			//가로 격자
			for(var i=LatticeXSize, len=this.posList.length; i < len; i+=LatticeXSize) {
				var pixelX = GUtil.fn_fmt_fix(this.posWidth * i, 2) + this.baseLine.left;
				str += '<v:line id="latticeRow'+i+'" from="' + pixelX + ',' + this.baseLine.top + '" to="' + pixelX + ',' + this.baseLine.bottom + '" strokecolor="black" strokeweight="1pt">';
				str += '<v:stroke dashstyle="dash" />';
				str += '</v:line>';
				
				str += '<v:line id="latticeText" from="' + (pixelX-3) + ',' + (this.baseLine.top-7)  + '" to="' + (pixelX+3) + ',' + (this.baseLine.top-7+0.1) + '">';
				str += '<v:fill on="true" color="black" />';
				str += '<v:path textpathok="true" />';
				str += '<v:textpath on="true" fitpath="false" string="'+i+'m" style="font-size:8pt;font-family:dotum,돋움;font-weight:normal" />';
				str += '</v:line>';
			}
			
			//세로 격자 픽셀 계산
			var LatticeYSize = Math.floor(this.maxZ / 4);
			for(var i=0, len=cipher.length; i < len; i++) {
				if(LatticeYSize > cipher[i]) {
					while(true) {
						LatticeYSize--;
						if(LatticeYSize%cipher[i]==0) break;
					}
					break;
				}
			}
			
			//세로 격자
			for(var i=0; i < this.maxZ; i+=LatticeYSize) {
				var pixelY = this.baseLine.bottom - (this.posHeight * i);
				str += '<v:line id="latticeCell'+i+'" from="' + this.baseLine.left + ',' + pixelY + '" to="' + this.baseLine.right + ',' + pixelY + '" strokecolor="black" strokeweight="1pt">';
				str += '<v:stroke dashstyle="dash" />';
				str += '</v:line>';
				
				str += '<v:line id="latticeText" from="' + (this.baseLine.left-20) + ',' + pixelY  + '" to="' + (this.baseLine.left-10) + ',' + (pixelY+0.1) + '">';
				str += '<v:fill on="true" color="black" />';
				str += '<v:path textpathok="true" />';
				str += '<v:textpath on="true" fitpath="false" string="'+i+'m" style="font-size:8pt;font-family:dotum,돋움;font-weight:normal" />';
				str += '</v:line>';
			}
			
			return str;
		},
		
		drawPosZList : function() {
			var str = "";
			
			str += "<v:shape style='position:absolute;top:0px;left:0px;width:"+this.width+"px;height:"+this.height+"px' stroke='true' strokecolor='black' strokeweight='1' file='true' fillcolor='#08FF08' coordorigin='0 0' coordsize='"+this.width+", "+this.height+"' >";
			str += "<v:path v='m ";
			for(var i=0, len=this.posList.length; i < len; i++) {
				if(i==1) str += " l ";
				else if(i!=0) str += ",";
				str += this.drawPosZ(this.posList[i], i);
			}
			str += ","+this.baseLine.right+","+this.baseLine.bottom+","+this.baseLine.left+","+this.baseLine.bottom;
			str += " x e' />";
			str += "</v:shape>";
			
			$("#txtTest").val(str);
			return str;
		},
		
		drawPosZ : function(pos, i) {
			var pixelX = Math.floor(this.posWidth * i, 2) + this.baseLine.left;
			var pixelY = Math.floor(this.baseLine.bottom - (pos.z * this.baseLine.height / this.maxZ));

			return pixelX+","+pixelY;
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
			str += '<v:textpath on="true" string="" style="font-size:8pt;font-family:dotum,돋움;font-weight:normal;" />';
			str += '</v:line>';
			return str;
		}
	},
	
	initialize: function(options) {
		OpenLayers.Control.prototype.initialize.apply(this, [options]);
			
		this.EVENT_TYPES =
	        GAcss.prototype.EVENT_TYPES.concat(
	        OpenLayers.Control.prototype.EVENT_TYPES
	    );
		
		this.callbacks = OpenLayers.Util.extend(
            {
            	done: this.getFeature
            },
            this.callbacks
        );
		
		this.handlerOptions = OpenLayers.Util.extend(
            {persist: this.persist}, this.handlerOptions
        );
		
        this.handler = new GPath(this, this.callbacks, this.handlerOptions);
	},
	
	getFeature: function(geometry) {
		this.res.clear();
		 
		var searchPoint = "";
		if(geometry.components.length >= 2) {
			for(var i=0, len = geometry.getVertices().length; i < len; i++) {
				if(i!=0) searchPoint += ",";
				searchPoint += geometry.getVertices()[i].x + "," + geometry.getVertices()[i].y;	
			}
			this.insertLabel(geometry);
			 
			var point  = new OpenLayers.Geometry.Point(geometry.getVertices()[geometry.getVertices().length-1].x, geometry.getVertices()[geometry.getVertices().length-1].y);
			this.feature = new OpenLayers.Feature.Vector(point);
			this.handler.layer.addFeatures(this.feature);
			
			this.res.setInitParam(this.width, this.height, geometry.getLength());
			
			var params = GUtil.fn_convert_objToStr({
				SERVICE : "WPS",
				VERSION : this.version,
				REQUEST : "Execute",
				IDENTIFIER : "Profile",
				DATAINPUTS : "[LAYER="+this.layer+";CLIP_LINE="+searchPoint+";INTERVAL="+this.interval+"]",
				RESPONSEDOCUMENT : "PROFILE_OUTPUT"
			});
			
			$("#txtTest").val(params);
			
			var obj = this;
			GMapUtil.sendProxyGet(this.serviceUrl, params, function(res)
				{
					obj.parseRes(res, obj);
				}
			);
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
		var profs = res.getElementsByTagName("prof:MeasurePoint");
		
		if(profs.length >= 0) {
			var profPoints = profs[0].getElementsByTagName("prof:Point");
			
			for(var i=0, len=profPoints.length; i < len; i++) {
				var profXs = profPoints[i].getElementsByTagName("prof:X");
				var profYs = profPoints[i].getElementsByTagName("prof:Y");
				var profZs = profPoints[i].getElementsByTagName("prof:Z");
				
				var pos = {
					x : parseFloat($(profXs[0]).text()),
					y : parseFloat($(profYs[0]).text()),
					z : parseFloat($(profZs[0]).text())
				};
				
				obj.res.posList.push(pos);
			}
			
			obj.res.dist = profPoints.length;
		}
		
		obj.res.setResInit();
    	//트리거 이벤트 실행
		obj.events.triggerEvent(obj.EVENT_TYPES[0]);
		
	},
	
	CLASS_NAME: "GProfile" 
});