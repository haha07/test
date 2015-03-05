/**********************************************************************************
 * 파일명 : GTextDraw.js
 * 설 명 : 그리기도구 글자 그리기
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.04.26		최원석				0.1					최초 생성
 * 
 * 참고 자료
 * --------------------------------------------------------------------------------
 * OpenLayers
 * 출처 : http://openlayers.org/
 * 
 * 
**********************************************************************************/

GTextDraw = OpenLayers.Class(OpenLayers.Handler.Point, {
	
	attributes : null,
	
	mousedown: function(evt) {
        // check keyboard modifiers
        if(!this.checkModifiers(evt)) {
            return true;
        }
        // ignore double-clicks
        if(this.lastDown && this.lastDown.equals(evt.xy)) {
            return true;
        }
        this.drawing = true;
        if(this.lastDown == null) {
            if(this.persist) {
                this.destroyFeature();
            }
            this.createFeature(evt.xy);
        } else {
            this.modifyFeature(evt.xy);
        }
        this.lastDown = evt.xy;
		
        return false;
    },
	
	mousedown: function(evt) {
	    drawObject.closeTextAddPopup();
	    
	    //화면좌표를 지도좌표로 변환
	    var lonLat = this.map.getLonLatFromPixel(evt.xy);
	    
	    var attributes = {
	    	featureType : "labelPoint"
	    }
	    
	    drawObject.textAddFeature = new OpenLayers.Feature.Vector(this.geometryClone(), attributes);
	    drawObject.layer.addFeatures(drawObject.textAddFeature);
	    
	    var popupSize = new OpenLayers.Size(376, 75);
	    var content = "<div style='width:360px;border:1px solid #768349;position:relative;padding:7px;background:#ffffff;z-index:99997'>";
	    content += "<label for='keyword' class='blind'>글씨입력</label><textarea name='keyword' id='keyword' style='width:310px;height:50px'></textarea>";
	    content += "<a href='#' style='position:absolute;bottom:8px;right:7px;'><img src='/gg_pb/images/btn/btn_ly_confirm.gif' alt='확인' class='vam' onclick='drawObject.addTextPopup()' /></a>";
	    content += "<p style='position:absolute;top:11px;right:7px;'><a href='#' onclick='drawObject.closeTextAddPopup();'><img src='/gg_pb/images/btn/btn_close2.gif' alt='닫기'  /></a></p></div>";
	    
	    drawObject.textAddPopup = new OpenLayers.Popup.AnchoredBubbleCustom("text", lonLat, popupSize, content);
	    drawObject.textAddPopup.setBackgroundColor("");
	    
	    map.addPopup(drawObject.textAddPopup);
        
	    return false;
	},
	
	finalize: function(cancel) {
        var key = cancel ? "cancel" : "done";
        this.drawing = false;
        this.mouseDown = false;
        this.lastDown = null;
        this.lastUp = null;
        this.callback(key, [this.geometryClone(), this.attributes]);
        if(cancel || !this.persist) {
            this.destroyFeature();
        }
    },

	CLASS_NAME: "GTextDraw"
});