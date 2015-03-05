GSelectFeature = OpenLayers.Class(OpenLayers.Control.SelectFeature, {
	
	/**
	 * 초기화
	 * box 옵션 추가시 GBox 사용
	 */
	initialize: function(layers, options) {
        // concatenate events specific to this control with those from the base
		// openlayers 버전업으로 인해 필요 없어진 소스
        /*this.EVENT_TYPES =
            OpenLayers.Control.SelectFeature.prototype.EVENT_TYPES.concat(
            OpenLayers.Control.prototype.EVENT_TYPES
        );*/
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        if(this.scope === null) {
            this.scope = this;
        }
        this.initLayer(layers);
        var callbacks = {
            click: this.clickFeature,
            clickout: this.clickoutFeature
        };
        if (this.hover) {
            callbacks.over = this.overFeature;
            callbacks.out = this.outFeature;
        }
             
        this.callbacks = OpenLayers.Util.extend(callbacks, this.callbacks);
        this.handlers = {
            feature: new OpenLayers.Handler.Feature(
                this, this.layer, this.callbacks,
                {geometryTypes: this.geometryTypes}
            )
        };

        if (this.box) {
            this.handlers.box = new GBox(
                this, {done: this.selectBox},
                {boxDivClassName: "olHandlerBoxSelectFeature"}
            ); 
        }
    },
	
	/**
	 * hover 시에도 click 이벤트가 실행 되도록 수정
	 * @param {Object} feature
	 */
	clickFeature: function(feature) {
		if(!this.hover) {
	        var selected = (OpenLayers.Util.indexOf(
	            feature.layer.selectedFeatures, feature) > -1);
	        if(selected) {
	            if(this.toggleSelect()) {
	                this.unselect(feature);
	            } else if(!this.multipleSelect()) {
	                this.unselectAll({except: feature});
	            }
	        } else {
	            if(!this.multipleSelect()) {
	                this.unselectAll({except: feature});
	            }
	            this.select(feature);
	        }
	    }
		else {
			if(this.onHoverClick) this.onHoverClick.call(this.scope, feature); 
		}
	},
	
	onUnselectAll: function() {},
	
	unselectAll: function(options) {
        // we'll want an option to supress notification here
        var layers = this.layers || [this.layer];
        var layer, feature;
        for(var l=0; l<layers.length; ++l) {
            layer = layers[l];
            for(var i=layer.selectedFeatures.length-1; i>=0; --i) {
                feature = layer.selectedFeatures[i];
                if(!options || options.except != feature) {
                    this.unselect(feature);
                }
            }
        }
		
		$(".olControlDrawText").each(function() {
			$(this).removeClass("on");
			$(this).addClass("off");
		});
		
		this.onUnselectAll();
    },
	
	selectTextPopup : function(element) {
    	/*
		var active = $(element).hasClass("on");
		
		this.unselectAll();
		
		if(!active) {
			$(element).removeClass("off");
			$(element).addClass("on");
			
			var popup = this.map.getPopup($(element).attr("id"));
			
			popup.attributes = {
				'fontFamily' : $(element).css('font-family'),
				'fontSize' : $(element).css('font-size'),
				'fontColor' : $(element).css('color')
			};
		}
		*/
	},

	CLASS_NAME: "GSelectFeature"
});