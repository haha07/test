/**********************************************************************************
 * 파일명 : GDrawFeature.js
 * 설 명 : Ginno Draw Feature Class (그리기 도구에 사용되는 도형 Feature)
 * 필요 라이브러리 : OpenLayers
 * 
 * 수정일				수정자				version				Function 명
 * --------------------------------------------------------------------------------
 * 2011.05.04		최원석				0.1					최초 생성
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

GDrawFeature = OpenLayers.Class(OpenLayers.Control.DrawFeature, {
	
	inputTextPopup : null,
	
	seq : 0,
	
	drawFeature: function(geometry, attributes) {
		if (attributes && attributes.featureType && attributes.featureType == 'Text') {
			this.removeInputTextPopup();
		}
		
		attributes.seq = this.seq;
		this.seq++;
		
        var feature = new OpenLayers.Feature.Vector(geometry, attributes);
        var proceed = this.layer.events.triggerEvent(
            "sketchcomplete", {feature: feature}
        );
        if(proceed !== false) {
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent("featureadded",{feature : feature});
        }
		
		if (attributes && attributes.featureType && attributes.featureType == 'Text') {
			this.addInputTextPopup(feature);
		}
		
    },
	
	addInputTextPopup : function(feature) {
		var contentHtml = "";
		contentHtml += 	"<div class='olControlDrawInputText'>";
		contentHtml += 		"<textarea class='olControlDrawInputTextArea'></textarea>";
		
		if(apiServerHost){
			contentHtml += 		"<img class='olControlDrawInputTextConfirm' src='" +apiServerHost + "/images/GMap/DrawText/btn_submit.gif' alt='확인' title='확인' />";
			contentHtml += 		"<img class='olControlDrawInputTextCancel' src='" +apiServerHost + "/images/GMap/DrawText/btn_close.gif' alt='닫기' title='닫기' />";
		}
		else{
			contentHtml += 		"<img class='olControlDrawInputTextConfirm' src='/images/GMap/DrawText/btn_submit.gif' alt='확인' title='확인' />";
			contentHtml += 		"<img class='olControlDrawInputTextCancel' src='/images/GMap/DrawText/btn_close.gif' alt='닫기' title='닫기' />";
		}
		contentHtml +=	"</div>";
		
		var lonlat = new GLonLat(feature.geometry.x, feature.geometry.y);
		this.inputTextPopup = new GPopup("drawInputText", lonlat, null, contentHtml, new OpenLayers.Pixel(0,0));
		
		this.map.addPopup(this.inputTextPopup);

		this.inputTextPopup.updateSize();
		this.inputTextPopup.type = "draw";
		
		$(".olControlDrawInputTextArea").focus();
		
		$(".olControlDrawInputTextConfirm").click(this, function() {
			arguments[0].data.addTextPopup();
		});
		
		$(".olControlDrawInputTextCancel").click(this, function() {
			arguments[0].data.removeInputTextPopup();
		});
	},
	
	removeInputTextPopup : function() {
		if (this.inputTextPopup) {
			this.map.removePopup(this.inputTextPopup);
			this.inputTextPopup = null;
		}
		
		var len = this.layer.features.length;
		for(var i=len-1; i >=0; i--) {
			if(this.layer.features[i].attributes.featureType == "Text") {
				this.layer.removeFeatures(this.layer.features[i]);	
			}
		}
	},
	
	addTextPopup : function() {
		var str = $(".olControlDrawInputTextArea").val();
		
		if(GUtil.fn_trim(str) == "") return;
		
		str = str.replace(/\x20/gi, "&nbsp;");
		str = str.replace(/\x0D\x0A/gi, "<br/>");
		str = str.replace(/\x0D/gi, "<br/>");
		str = str.replace(/\n/gi, "<br/>");
		
		var contentHtml = "";
		contentHtml += "<div class='olControlDrawText off' id='drawText" + this.seq + "'>" + str + "</div>";
		
		var lonlat = this.inputTextPopup.getLonLat();

		var popup = new GPopup("drawPopup" + this.seq, lonlat, null, contentHtml, new OpenLayers.Pixel(0,0));
		
		this.map.addPopup(popup);

		popup.updateSize();
		popup.type = "draw";
		var popupFontColor = "#000000"; 
		if($("#drawText"+this.seq).css('color').split("rgb").length > 1){
			 var rgbArr = GUtil.fn_replaceAll($("#drawText"+this.seq).css('color').replace("rgb(", "").replace(")",""), " ", "").split(",");
			 popupFontColor = "#";
			 for(var i in rgbArr){
				 var hexRGB = rgbArr[i].toString(16); 
				 if(hexRGB.length < 2){
					 hexRGB = "0" + hexRGB;
				 }
				 popupFontColor += hexRGB;
			 }
		}
		popup.attributes = {
			'featureType' : 'Text',
			'fontFamily' : $("#drawText"+this.seq).css('font-family'),
			'fontSize' : $("#drawText"+this.seq).css('font-size').replace("px", ""),
			'fontColor' : popupFontColor,
			'seq' : this.seq,
			'text' : $(".olControlDrawInputTextArea").val(),
			'print' : true
		};
		
		this.seq++;
		
		$(".olControlDrawText").unbind();
		$(".olControlDrawText").click(this.map, function() {
			var map = arguments[0].data;
			if(map.getControl("drawSelect") && map.getControl("drawSelect").active) {
				map.getControl("drawSelect").selectTextPopup(this);
			}
			else if(map.getControl("drawEdit") && map.getControl("drawEdit").active) {
				map.getControl("drawEdit").selectTextPopup(this);
			}
		});
		
		this.removeInputTextPopup();
	},
	
	removeTextPopup : function() {
		var id;
		
		$(".olControlDrawText").each(function() {
			$(this).hasClass("on");
			id = $(this).attr("id");
			return;
		});
		
		for(var i in this.map.popups) {
			if(this.map.popups[i].id == id) {
				this.map.removePopup(this.map.popups[i]);
			}
		}
	},
	
	CLASS_NAME: "GDrawFeature"
});