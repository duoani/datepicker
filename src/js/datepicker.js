/**
 * Created by duo on 2016/7/11.
 */
(function(factory){
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($, undefined){

    //是否闰年
    function isLeapYear(year){
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    }

    //给定月份的天数
    function getDaysInMonth(year, month){
        return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    //
    function getOptionsFromElem(el, prefix){
        // Derive options from element data-attrs
        var data = $(el).data(),
            out = {}, inkey,
            replace = new RegExp('^' + prefix.toLowerCase() + '([A-Z])');
        prefix = new RegExp('^' + prefix.toLowerCase());
        function lowerCase(_,a){
            return a.toLowerCase();
        }
        for (var key in data){
            if (prefix.test(key)){
                inkey = key.replace(replace, lowerCase);
                out[inkey] = data[key];
            }
        }
        return out;
    }

    function getOptionsFromLocale(lang){
        // Derive options from locale plugins
        var out = {};
        // Check if "de-DE" style date is available, if not language should
        // fallback to 2 letter code eg "de"
        //if (!dates[lang]){
        //    lang = lang.split('-')[0];
        //    if (!dates[lang])
        //        return;
        //}
        //var d = dates[lang];
        //$.each(locale_opts, function(i,k){
        //    if (k in d)
        //        out[k] = d[k];
        //});
        return out;
    }

    var headTemplate = '<thead>'+
        '<tr>'+
        '<th class="prev">&lt;</th>'+
        '<th colspan="5" class="datepicker-switch"></th>'+
        '<th class="next">&gt;</th>'+
        '</tr>'+
        '</thead>';
    var contTemplate = '<tbody><tr><td colspan="7"></td></tr></tbody>';
    var footTemplate = '<tfoot>'+
        '<tr>'+
        '<th colspan="7" class="today"></th>'+
        '</tr>'+
        '<tr>'+
        '<th colspan="7" class="clear"></th>'+
        '</tr>'+
        '</tfoot>';
    var template = '<div class="datepicker">'+
        '<div class="datepicker-days">'+
        '<table class="table-condensed">'+
        headTemplate+
        '<tbody></tbody>'+
        footTemplate+
        '</table>'+
        '</div>'+
        '<div class="datepicker-months">'+
        '<table class="table-condensed">'+
        headTemplate+
        contTemplate+
        footTemplate+
        '</table>'+
        '</div>'+
        '<div class="datepicker-years">'+
        '<table class="table-condensed">'+
        headTemplate+
        contTemplate+
        footTemplate+
        '</table>'+
        '</div>'+
        '</div>';

    var DatePicker = function(element, options){
        this.$element = $(element);

        this.isInput = this.$element.is('input');
        this.$input = this.isInput ? this.$element : this.$element.find('input');
        this.$component = this.$element.hasClass('date') ? this.$element.find('.btn, .add-on, .input-group-addon') : null;
        this.hasInput = this.$component && this.$input.length;
        if(this.$component && !this.$component.length){
            this.$component = null
        }
        this.isInline = !this.$component && this.$element.is('div');
        this.$picker = $(template);
        if(this.isInline){
            this.$picker.addClass('datepicker-inline').appendTo(this.$element);
        }
    };
    DatePicker.prototype = {
        constructor: DatePicker,
        fill: function(){

        }

    };

    var defaults = {
        startDate: -Infinity,
        endDate: Infinity,
        weekStart: 0 //以星期日作为一周的开始
    };

    var Plugin = function(){

    };

    var old = $.fn.datepicker;


    $.fn.datepicker = function(option){
        this.each(function(){
            var $this = $(this),
                data = $this.data('datepicker'),
                optType = typeof option,
                options = optType === 'object' && option;

            if(!data){
                var elopts = getOptionsFromElem(this, 'date'),
                    // Preliminary otions
                    xopts = $.extend({}, defaults, elopts, options),
                    locopts = getOptionsFromLocale(xopts.language),
                    // Options priority: js args, data-attrs, locales, defaults
                    opts = $.extend({}, defaults, locopts, elopts, options);

                data = new DatePicker(this, opts);
                $this.data('datepicker', data);
            }
            if(optType === 'string' && typeof data[option] === 'function'){
                ret = data[option].call(data, args);
            }
            if( ret === undefined || ret instanceof DatePicker){
                return this;
            }
            if (this.length > 1){
                throw new Error('Using only allowed for the collection of a single element (' + option + ' function)');
            }
            else{
                return ret;
            }

        });
        var args = Array.prototype.slice.call(arguments, 1),
            ret;
    };
    /* DATEPICKER NO CONFLICT
     * =================== */

    $.fn.datepicker.noConflict = function(){
        $.fn.datepicker = old;
        return this;
    };
}));