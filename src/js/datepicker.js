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
    function UTCDate(){
        return new Date(Date.UTC.apply(Date, arguments));
    }
    function UTCToday(){
        var today = new Date();
        return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    }
    function isUTCEquals(date1, date2) {
        return (
            date1.getUTCFullYear() === date2.getUTCFullYear() &&
            date1.getUTCMonth() === date2.getUTCMonth() &&
            date1.getUTCDate() === date2.getUTCDate()
        );
    }
    //是否闰年
    function isLeapYear(year){
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    }

    //给定月份的天数
    function getDaysInMonth(year, month){
        return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
    }

    function _utc_to_local(utc){
        return utc && new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
    }
    function _local_to_utc(local){
        return local && new Date(local.getTime() - (local.getTimezoneOffset()*60000));
    }

    function _zero_time(local){
        return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
    }
    function _zero_utc_time(utc){
        return utc && new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate()));
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
        this._processOptions(options);
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

        },
        _processOptions: function(opts){
            // Store raw options for reference
            this._o = $.extend({}, this._o, opts);
            // Processed options
            var o = this.o = $.extend({}, this._o);

            // Check if "de-DE" style date is available, if not language should
            // fallback to 2 letter code eg "de"
            var lang = o.language;
            if (!dates[lang]){
                lang = lang.split('-')[0];
                if (!dates[lang])
                    lang = defaults.language;
            }
            o.language = lang;

            // Retrieve view index from any aliases
            o.startView = this._resolveViewName(o.startView, 0);
            o.minViewMode = this._resolveViewName(o.minViewMode, 0);
            o.maxViewMode = this._resolveViewName(o.maxViewMode, 2);

            // Check that the start view is between min and max
            o.startView = Math.min(o.startView, o.maxViewMode);
            o.startView = Math.max(o.startView, o.minViewMode);

            // true, false, or Number > 0
            if (o.multidate !== true){
                o.multidate = Number(o.multidate) || false;
                if (o.multidate !== false)
                    o.multidate = Math.max(0, o.multidate);
            }
            o.multidateSeparator = String(o.multidateSeparator);

            o.weekStart %= 7;
            o.weekEnd = (o.weekStart + 6) % 7;

            var format = parseFormat(o.format);
            if (o.startDate !== -Infinity){
                if (!!o.startDate){
                    if (o.startDate instanceof Date)
                        o.startDate = _local_to_utc(this._zero_time(o.startDate));
                    else
                        o.startDate = parseDate(o.startDate, format, o.language, o.assumeNearbyYear);
                }
                else {
                    o.startDate = -Infinity;
                }
            }
            if (o.endDate !== Infinity){
                if (!!o.endDate){
                    if (o.endDate instanceof Date)
                        o.endDate = _local_to_utc(_zero_time(o.endDate));
                    else
                        o.endDate = parseDate(o.endDate, format, o.language, o.assumeNearbyYear);
                }
                else {
                    o.endDate = Infinity;
                }
            }

            o.daysOfWeekDisabled = o.daysOfWeekDisabled||[];
            if (!$.isArray(o.daysOfWeekDisabled))
                o.daysOfWeekDisabled = o.daysOfWeekDisabled.split(/[,\s]*/);
            o.daysOfWeekDisabled = $.map(o.daysOfWeekDisabled, function(d){
                return parseInt(d, 10);
            });

            o.daysOfWeekHighlighted = o.daysOfWeekHighlighted||[];
            if (!$.isArray(o.daysOfWeekHighlighted))
                o.daysOfWeekHighlighted = o.daysOfWeekHighlighted.split(/[,\s]*/);
            o.daysOfWeekHighlighted = $.map(o.daysOfWeekHighlighted, function(d){
                return parseInt(d, 10);
            });

            o.datesDisabled = o.datesDisabled||[];
            if (!$.isArray(o.datesDisabled)) {
                o.datesDisabled = [
                    o.datesDisabled
                ];
            }
            o.datesDisabled = $.map(o.datesDisabled,function(d){
                return parseDate(d, format, o.language, o.assumeNearbyYear);
            });

            var plc = String(o.orientation).toLowerCase().split(/\s+/g),
                _plc = o.orientation.toLowerCase();
            plc = $.grep(plc, function(word){
                return /^auto|left|right|top|bottom$/.test(word);
            });
            o.orientation = {x: 'auto', y: 'auto'};
            if (!_plc || _plc === 'auto')
                ; // no action
            else if (plc.length === 1){
                switch (plc[0]){
                    case 'top':
                    case 'bottom':
                        o.orientation.y = plc[0];
                        break;
                    case 'left':
                    case 'right':
                        o.orientation.x = plc[0];
                        break;
                }
            }
            else {
                _plc = $.grep(plc, function(word){
                    return /^left|right$/.test(word);
                });
                o.orientation.x = _plc[0] || 'auto';

                _plc = $.grep(plc, function(word){
                    return /^top|bottom$/.test(word);
                });
                o.orientation.y = _plc[0] || 'auto';
            }
            if (o.defaultViewDate) {
                var year = o.defaultViewDate.year || new Date().getFullYear();
                var month = o.defaultViewDate.month || 0;
                var day = o.defaultViewDate.day || 1;
                o.defaultViewDate = UTCDate(year, month, day);
            } else {
                o.defaultViewDate = UTCToday();
            }
        },
        _resolveViewName: function(view, defaults){
            if (view === 0 || view === 'days' || view === 'month') {
                return 0;
            }
            if (view === 1 || view === 'months' || view === 'year') {
                return 1;
            }
            if (view === 2 || view === 'years' || view === 'decade') {
                return 2;
            }
            if (view === 3 || view === 'decades' || view === 'century') {
                return 3;
            }
            if (view === 4 || view === 'centuries' || view === 'millennium') {
                return 4;
            }
            return defaults === undefined ? false : defaults;
        },
    };

    var Plugin = function(option){
        var args = Array.prototype.slice.call(arguments, 1),
            ret;
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

    };

    var old = $.fn.datepicker;


    $.fn.datepicker = Plugin;
    /* DATEPICKER NO CONFLICT
     * =================== */

    $.fn.datepicker.noConflict = function(){
        $.fn.datepicker = old;
        return this;
    };

    var defaults = $.fn.datepicker.defaults = {
        startDate: -Infinity,
        endDate: Infinity,
        format: 'yyyy/mm/dd',
        weekStart: 0, //以星期日作为一周的开始
        language: 'en'
    };
    var dates = $.fn.datepicker.dates = {
        en: {
            days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            daysMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: "Today",
            clear: "Clear",
            titleFormat: "MM yyyy"
        }
    };
}));