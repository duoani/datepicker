!(function(){
    "use strict";
    var noop = function(){};
    $.uiDefine("LayerPanel", {
        options: {
            trigger: false,
            onRender: noop,
            onDestroy: noop,
            onShow: noop,
            onHide: noop,
            position: 'absolute',
            width: 0,
            height: 0,
            alignRefs: null,
            alignX: 'left',   //{left|center|right}
            alignY: 'bottom', //{top|center|bottom}
            offsetX: 0,
            offsetY: 0,
            caret: false,
            open: false
        },
        __init: function(options, element, name){
            var me = this;
            this.Super(options, element, name);

            this._closeHandle = function(e){
                if(!$(e.target).closest(me.$element).length && !$(e.target).closest(me.$alignRefs).length){
                    me.close();
                }
            };
            this._triggerHandle = function(e){
                me.toggle();
            };
            this._render();
        },
        _render: function(){
            var options = this.options;
            this.$element.css('position', options.position);
            if(options.width){
                this.$element.width(options.width);
            }
            if(options.height){
                this.$element.height(options.height);
            }
            if(options.trigger){
                var $trigger = $(options.trigger);
                this.$trigger = $trigger.on('click', this._triggerHandle);
                this.$alignRefs = $trigger;
            }else{
                this.$alignRefs = $(options.alignRefs);
            }
            if(options.caret){
                this.initCaret();
            }
            $(document).on('click', this._closeHandle);
            options.onRender.call(this.$element[0], this);
            if(options.open){
                this.toggle(true);
            }
        },
        initCaret: function(){
            var options = this.options,
                classes = '';
            if(options.alignY == 'top'){
                classes = 'ow-caret-b ' + this.getAlignXClass(options.alignX);
            }else if(options.alignY == 'bottom'){
                classes = 'ow-caret-t ' + this.getAlignXClass(options.alignX);
            }else if(options.alignX == 'left'){
                classes = 'ow-caret-r ' + this.getAlignYClass(options.alignY);
            }else if(options.alignX == 'right'){
                classes = 'ow-caret-l ' + this.getAlignYClass(options.alignY);
            }

            this.$element.append('<i class="ow-caret '+classes+'"></i>');
        },
        getAlignXClass: function(alignX){
            if(alignX == 'left'){
                return 'ow-caret-hl';
            }else if(alignX == 'right'){
                return 'ow-caret-hr';
            }
            return 'ow-caret-hc';
        },
        getAlignYClass: function(alignY){
            if(alignY == 'top'){
                return 'ow-caret-vt';
            }else if(alignY == 'bottom'){
                return 'ow-caret-vb';
            }
            return 'ow-caret-vc';
        },
        toggle: function(open){
            var isOpened = this.$element.hasClass('open');
            var toBe = open === void 0 ? !isOpened : !!open;
            if(toBe == isOpened){
                return;
            }

            this.$element.toggleClass("open", toBe);
            if(toBe){
                this.pos();
                this.options.onShow.call(this.$element[0], this);
            }else{
                this.options.onHide.call(this.$element[0], this);
            }
        },
        open: function(){
            this.toggle(true);
        },
        close: function(){
            this.toggle(false);
        },
        pos: function(){
            var options = this.options;
            if(this.$alignRefs.length){
                var hAdjoin = options.alignY == 'center',
                    btnOffset = this.$alignRefs.offset(),
                    btnWidth = this.$alignRefs.outerWidth(),
                    btnHeight = this.$alignRefs.outerHeight(),
                    panelWidth = this.$element.outerWidth(),
                    panelHeight = this.$element.outerHeight();

                this.$element
                    .css('left', this[hAdjoin ? 'getLeftByAlignAdjoin' : 'getLeftByAlign'](options.alignX, btnOffset.left, btnWidth, panelWidth) + options.offsetX)
                    .css('top', this.getTopByAlignAdjoin(options.alignY, btnOffset.top, btnHeight, panelHeight) + options.offsetY);
            }else{
                //TODO
            }
        },
        //水平方面同边对齐
        getLeftByAlign: function(align, aL, aW, bW){
            var left;
            switch(align){
                case 'left':
                    left = aL;
                    break;
                case 'center':
                    left = aL + aW/2 - bW/2;
                    break;
                case 'right':
                    left = aL + aW - bW;
                    break;
                default:
                    throw TypeError("Horizontal Position Type error. Use 'left', 'center' or 'right' only.'");
            }
            return left;
        },
        getLeftByAlignAdjoin: function(align, aL, aW, bW){
            var left;
            switch(align){
                case 'left':
                    left = aL - bW;
                    break;
                case 'center':
                    left = aL + aW/2 - bW/2;
                    break;
                case 'right':
                    left = aL + aW;
                    break;
                default:
                    throw TypeError("Horizontal Position Type error. Use 'left', 'center' or 'right' only.'");
            }
            return left;
        },
        //垂直方向邻边对齐
        getTopByAlignAdjoin: function(align, aT, aH, bH){
            var top;
            switch(align){
                case 'top':
                    top = aT - bH;
                    break;
                case 'center':
                    top = aT + aH/2 - bH/2;
                    break;
                case 'bottom':
                    top = aT + aH;
                    break;
                default:
                    throw TypeError("Vertical Position Type error. Use 'top', 'center' or 'bottom' only.'");
            }
            return top;
        },
        destroy: function(){
            this.options.onDestroy.call(this.$element[0], this);
            this.$element.removeData("ui.LayerPanel");
            $(document).off('click', this._closeHandle);
            this.$element = null;
            if(this.options.trigger){
                this.$trigger.off('click', this._triggerHandle);
                this.$trigger = null;
            }
        }
    });

    var tipsDefault = {};
    $.fn.tips = function(content, options){
        return this.each(function(){
            $('<div class="ow-tips"><div class="ow-layer-content">'+content+'</div></div>')
                .appendTo(document.body)
                .LayerPanel($.extend({
                    alignRefs: this,
                    open: true,
                    onHide: function(){
                        $(this).LayerPanel('destroy').remove();
                    }
                }, tipsDefault, options))
        });
    }
})();
