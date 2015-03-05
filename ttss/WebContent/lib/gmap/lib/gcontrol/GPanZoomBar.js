GPanZoomBar = OpenLayers.Class(OpenLayers.Control.PanZoomBar, {
	/**
	 * 툴바 이미지 정보
	 */
	imgUrl : "/images/content/gmap/panzoombar/",

	/**
	 * 축척 확대 툴바
	 */
	imgZoomIn : "zoom-plus-mini.png",
	
	/**
	 * 축척 축소 툴바
	 */
	imgZoomOut : "zoom-minus-mini.png",
	
	/**
	 * 현재 축척바 위쪽 표현 이미지
	 */
	imgZoomBasic : "",
	
	/**
	 * 현재 축척바 아래쪽 표현 이미지
	 */
	imgZoomBarOn : "zoombar.png",
	
	/**
	 * 현재 축척바
	 */
	imgZoomBar : "slider.png",
	
	/**
	 * 축척 확대/축소 이미지 사이즈
	 */
	size : new GSize(18, 18),
	
	/**
	 * 축척바 사이즈
	 */
	sliderSize : new GSize(20,6),
	
	/**
	 * 정렬 기준 
	 */
	flow : "right",
	
	/**
	 * 축척바 위치
	 */
	zoomPosition : "righttop",
	
	/**
	 *	위치 
	 */
	offsetPixel : new GPixel(0, 0),
	
	/**
     * Constructor: OpenLayers.Control.PanZoom
     * 
     * Parameters:
     * options - {Object}
     */
    initialize: function(options) {
    	if(options.apiServerHost){
    		this.imgUrl = apiServerHost + this.imgUrl; 
    	}
        this.position = new OpenLayers.Pixel(OpenLayers.Control.PanZoom.X,
                                             OpenLayers.Control.PanZoom.Y);
        OpenLayers.Control.prototype.initialize.apply(this, arguments);
    },
    
    setDivSize: function(){
    	var divWidth;
		var divHeight;
		if(this.sliderSize.w >= this.size.w){
			divWidth = this.sliderSize.w;
		}
		else{
			divWidth = this.size.w;
		}
		divHeight = (this.size.h * 2) + (this.zoomStopHeight * this.map.getNumZoomLevels());
		$('.GPanZoomBar').css("width",divWidth + this.position.x);
		$('.GPanZoomBar').css("height",divHeight + this.position.y);
		
		this.setPositionZoomBar(this.zoomPosition);
    },
	
	draw: function(px) {
        OpenLayers.Control.prototype.draw.apply(this, arguments);

		//this.moveToZoomBar();
		
		px = this.position.clone();
		
        // place the controls
        this.buttons = [];
        
		var sz = this.size;
        var centered = new OpenLayers.Pixel(px.x+sz.w/2, px.y);

        /**
		 * 필요 없는 버튼 제거
		 */
        /*this._addButton("zoomin", this.imgUrl + this.imgZoomIn, centered.add(0, sz.h*3+5), sz);
        centered = this._addZoomBar(centered.add(0, sz.h*4 + 5));
        this._addButton("zoomout", this.imgUrl + this.imgZoomOut, centered, sz);*/
        this._addButton("zoomin", this.imgUrl + this.imgZoomIn, px, sz);
        centered = this._addZoomBar(px.add(0, sz.h));
        this._addButton("zoomout", this.imgUrl + this.imgZoomOut, centered, sz);

        // 축척바 DIV의 width와 height값을 셋팅한다.
        this.setDivSize();
        
        return this.div;
    },
	
	moveToZoomBar : function() {
		/**
		 * 우측 정렬일 경우
		 */
		if(this.flow == "right") {
			this.offsetPixel.x = $("#map").width() - this.offsetPixel.x;
		}		
		this.moveTo(this.offsetPixel);
	},
	
	setPositionZoomBar : function(position) {
		this.zoomPosition = position;
		
		if(position.toUpperCase() == "LEFTTOP"){
			$('.GPanZoomBar').css("top","0%");
			$('.GPanZoomBar').css("left","0%");
			$('.GPanZoomBar').css("bottom","");
			$('.GPanZoomBar').css("right","");
			$('.GPanZoomBar').css("margin","10px 0px 0px 10px");
		}
		else if(position.toUpperCase() == "LEFTBOTTOM"){
			$('.GPanZoomBar').css("top","");
			$('.GPanZoomBar').css("left","0%");
			$('.GPanZoomBar').css("bottom","0%");
			$('.GPanZoomBar').css("right","");
			$('.GPanZoomBar').css("margin","0px 0px 10px 10px");
		}
		else if(position.toUpperCase() == "RIGHTTOP"){
			$('.GPanZoomBar').css("top","0%");
			$('.GPanZoomBar').css("left","");
			$('.GPanZoomBar').css("bottom","");
			$('.GPanZoomBar').css("right","5px");
			$('.GPanZoomBar').css("margin","10px 10px 0px 0px");
		}
		else if(position.toUpperCase() == "RIGHTBOTTOM"){
			$('.GPanZoomBar').css("top","");
			$('.GPanZoomBar').css("left","");
			$('.GPanZoomBar').css("bottom","0%");
			$('.GPanZoomBar').css("right","0%");
			$('.GPanZoomBar').css("margin","0px 10px 10px 0px");
		}
	},
	
	_addZoomBar:function(centered) {
		/**
		 * 전체적으로 이미지 경로 수정
		 */
        var imgLocation = this.imgUrl;
        
        var id = this.id + "_" + this.map.id;
        var zoomsToEnd = this.map.getNumZoomLevels() - 1 - this.map.getZoom();
        var slider = OpenLayers.Util.createAlphaImageDiv(id,
                       centered.add(-1, zoomsToEnd * this.zoomStopHeight), 
                       this.sliderSize,
                       imgLocation+this.imgZoomBar,
                       "absolute");
        this.slider = slider;
        
        this.sliderEvents = new OpenLayers.Events(this, slider, null, true,
                                            {includeXY: true});
        this.sliderEvents.on({
            "mousedown": this.zoomBarDown,
            "mousemove": this.zoomBarDrag,
            "mouseup": this.zoomBarUp,
            "dblclick": this.doubleClick,
            "click": this.doubleClick
        });
        
        var sz = new OpenLayers.Size();
        sz.h = this.zoomStopHeight * this.map.getNumZoomLevels();
        sz.w = this.zoomStopWidth;
        var div = null;
        
        if (OpenLayers.Util.alphaHack()) {
            var id = this.id + "_" + this.map.id;
            div = OpenLayers.Util.createAlphaImageDiv(id, centered,
                                      new OpenLayers.Size(sz.w, 
                                              this.zoomStopHeight),
                                      imgLocation + this.imgZoomBarOn, 
                                      "absolute", null, "crop");
            div.style.height = sz.h + "px";
        } else {
            div = OpenLayers.Util.createDiv(
                        'OpenLayers_Control_PanZoomBar_Zoombar' + this.map.id,
                        centered,
                        sz,
                        imgLocation+this.imgZoomBarOn);
        }
		
        this.zoombarDiv = div;
        
        this.divEvents = new OpenLayers.Events(this, div, null, true, 
                                                {includeXY: true});
												
        this.divEvents.on({
            "mousedown": this.divClick,
            "mousemove": this.passEventToSlider,
            "dblclick": this.doubleClick,
            "click": this.doubleClick
        });
        
        this.div.appendChild(div);
		
		/**
		 * 축척바 위쪽 표현 DIV 추가
		 */
        var tmpSize = this.zoomStopHeight * (this.map.getNumZoomLevels() - this.map.getZoom() - 1);
        if(tmpSize < 0){
        	tmpSize = tmpSize * (-1);
        }
        
		this.zoomBasicDiv = OpenLayers.Util.createDiv(
                        'OpenLayers_Control_PanZoomBar_ZoombarBasic' + this.map.id,
                        centered,
                        new OpenLayers.Size(sz.w, tmpSize),
                        imgLocation+this.imgZoomBasic);
						
		this.divEvents = new OpenLayers.Events(this, this.zoomBasicDiv, null, true, 
                                                {includeXY: true});
												
        this.divEvents.on({
            "mousedown": this.divClick,
            "mousemove": this.passEventToSlider,
            "dblclick": this.doubleClick,
            "click": this.doubleClick
        });				
		
		this.div.appendChild(this.zoomBasicDiv);

        this.startTop = parseInt(div.style.top);
        this.div.appendChild(slider);

        this.map.events.register("zoomend", this, this.moveZoomBar);

        centered = centered.add(0, 
            this.zoomStopHeight * this.map.getNumZoomLevels());
        return centered; 
    },
	
	zoomBarUp:function(evt) {
        if (!OpenLayers.Event.isLeftClick(evt)) {
            return;
        }
        if (this.mouseDragStart) {
            this.div.style.cursor="";
            this.map.events.un({
                "mouseup": this.passEventToSlider,
                "mousemove": this.passEventToSlider,
                scope: this
            });
            var deltaY = this.zoomStart.y - evt.xy.y;
            var zoomLevel = this.map.zoom;
            if (!this.forceFixedZoomLevel && this.map.fractionalZoom) {
                zoomLevel += deltaY/this.zoomStopHeight;
                zoomLevel = Math.min(Math.max(zoomLevel, 0), 
                                     this.map.getNumZoomLevels() - 1);
            } else {
                zoomLevel += Math.round(deltaY/this.zoomStopHeight);
            }
			
			/**
			 * 최소, 최대 이상 축척으로 드래그 시 처리
			 */ 			
			if(zoomLevel > this.map.getNumZoomLevels()-1) {
				zoomLevel = this.map.getNumZoomLevels()-1;
			}
			else if(zoomLevel < 0) {
				zoomLevel = 0;
			}
			
            this.map.zoomTo(zoomLevel);
            this.mouseDragStart = null;
            this.zoomStart = null;
            OpenLayers.Event.stop(evt);
        }
    },
	
    moveZoomBar:function() {
        var newTop = 
            ((this.map.getNumZoomLevels()-1) - this.map.getZoom()) * 
            this.zoomStopHeight + this.startTop + 1;
        this.slider.style.top = newTop + "px";
		
		/**
		 * 축척바 위쪽의 DIV 높이 수정
		 */		
		this.zoomBasicDiv.style.height = (this.zoomStopHeight * (this.map.getNumZoomLevels() - this.map.getZoom() - 1)) + "px";
    },
    
    setImg:function(options){
    	// now override default options 
        OpenLayers.Util.extend(this, options);
        this.redraw();
    },
    
    show:function(){
    	$(this.div).show();
    },
    
    hide:function(){
    	$(this.div).hide();
    },
	

	CLASS_NAME: "GPanZoomBar"
});


/**
 * Constant: X
 * {Integer}
 */
OpenLayers.Control.PanZoom.X = 0;

/**
 * Constant: Y
 * {Integer}
 */
OpenLayers.Control.PanZoom.Y = 0;
