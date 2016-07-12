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

    function copyDate(date){
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
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
        '<th class="previous">&lt;</th>'+
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
        this.viewDate = this.options.defaultViewDate;
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
        this.setViewMode(this.options.startView);
        this.fillDow();
        this.update();
        this._bindEvents();
    };
    DatePicker.prototype = {
        constructor: DatePicker,
        setViewMode: function(viewMode){
            this.viewMode = viewMode;
            this.$picker
                .children('div')
                .hide()
                .filter('.datepicker-' + ['days', 'months', 'years'][this.viewMode])
                .show();
            //this.updateNavArrows();
        },
        update: function(){
            this.fill();
        },
        fill: function(){
            var options = this.options,
                d = this.viewDate,
                year = d.getFullYear(),
                month = d.getMonth(),
                focus = d.getDate(),
                date = UTCDate(year, month+1, 0),
                days = date.getDate(),
                dow, preMonthDays, cal = '';

            date.setDate(1);
            dow = date.getDay();
            date.setDate(0);
            preMonthDays = date.getDate();
            var w = 0, j = 0, i = -Math.abs(dow - options.weekStart);
            while(w < 6){
                cal += '<tr>';
                for(j = 0; j<7; j++){
                    var cls = '',
                        t;
                    if(i<0){ //pre month
                        cls += ' old';
                        t = preMonthDays + i + 1;
                    }else if(i > days - 1){ //next month
                        cls += ' new';
                        t = i - days + 1;
                    }else{ //current month
                        t = i + 1;
                    }
                    cal += '<td class="day '+cls+'">'+t+'</td>';
                    i++;
                }
                cal += '</tr>';
                w++;
            }
            this.$picker.find('.datepicker-days tbody').html(cal);
            this.fillMonths();
        },
        fillDow: function(){
            var options = this.options,
                dow = '<tr>';
            for(var i = options.weekStart; i<options.weekStart + 7; i++){
                dow += '<th>'+dates[options.language].daysMin[i%7]+'</th>';
            }
            dow += '</tr>';
            this.$picker.find('.datepicker-days thead').append(dow);
        },
        fillMonths: function(){
            var options = this.options,
                currMonth = this.viewDate.getMonth(),
                mon = '';

            for(var i=0; i<12; i++){
                mon += '<span class="month'+(currMonth === i ? ' focus' : '')+'">'+dates[options.language].monthsShort[i]+'</span>'
            }
            this.$picker.find('.datepicker-months td').html(mon);
        },
        _processOptions: function(opts){
            // Store raw options for reference
            this._o = $.extend({}, this._o, opts);
            // Processed options
            var o = this.options = $.extend({}, this._o);

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
            o.startView = Math.max(Math.min(o.startView, o.maxViewMode), o.minViewMode);

            // true, false, or Number > 0
            if (o.multidate !== true){
                o.multidate = Number(o.multidate) || false;
                if (o.multidate !== false)
                    o.multidate = Math.max(0, o.multidate);
            }
            o.multidateSeparator = String(o.multidateSeparator);

            o.weekStart %= 7;
            o.weekEnd = (o.weekStart + 6) % 7;

            var format = dateHelper.parseFormat(o.format);
            if (o.minDate !== -Infinity){
                if (!!o.minDate){
                    if (o.minDate instanceof Date)
                        o.minDate = _local_to_utc(_zero_time(o.minDate));
                    else
                        o.minDate = dateHelper.parseDate(o.minDate, format, o.language, o.assumeNearbyYear);
                }
                else {
                    o.minDate = -Infinity;
                }
            }
            if (o.maxDate !== Infinity){
                if (!!o.maxDate){
                    if (o.maxDate instanceof Date)
                        o.maxDate = _local_to_utc(_zero_time(o.maxDate));
                    else
                        o.maxDate = dateHelper.parseDate(o.maxDate, format, o.language, o.assumeNearbyYear);
                }
                else {
                    o.maxDate = Infinity;
                }
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
        _bindEvents: function(){
            var me = this;
            this.$picker.on('click', '.previous, .next', function(e){
                var dir = $(this).hasClass('next') ? 1 : -1;
                me.viewDate = me.moveMonth(me.viewDate, dir);
                me.fill();
            })
        },
        moveMonth: function(date, dir){
            date = copyDate(date);
            date.setMonth(date.getMonth() + dir);
            return date;
        }
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

        minDate: -Infinity,
        maxDate: Infinity,
        minTime: false,
        maxTime: false,

        defaultDate: false,
        defaultTime: 'now',

        format:	'Y/m/d H:i',
        formatTime:	'H:i',
        formatDate:	'Y/m/d',

        weekStart: 0, //以星期日作为一周的开始
        language: 'en',
        orientation: 'auto'
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
    dateHelper = $.fn.datepicker.helper = {
        validParts: /dd?|DD?|mm?|MM?|yy(?:yy)?/g,
        nonpunctuation: /[^ -\/:-@\u5e74\u6708\u65e5\[-`{-~\t\n\r]+/g,
        parseFormat: function(format){
            if (typeof format.toValue === 'function' && typeof format.toDisplay === 'function')
                return format;
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts, '\0').split('\0'),
                parts = format.match(this.validParts);
            if (!separators || !separators.length || !parts || parts.length === 0){
                throw new Error("Invalid date format.");
            }
            return {separators: separators, parts: parts};
        },
        parseDate: function(date, format, language, assumeNearby){
            if (!date)
                return undefined;
            if (date instanceof Date)
                return date;
            if (typeof format === 'string')
                format = this.parseFormat(format);
            if (format.toValue)
                return format.toValue(date, format, language);
            var part_re = /([\-+]\d+)([dmwy])/,
                parts = date.match(/([\-+]\d+)([dmwy])/g),
                fn_map = {
                    d: 'moveDay',
                    m: 'moveMonth',
                    w: 'moveWeek',
                    y: 'moveYear'
                },
                dateAliases = {
                    yesterday: '-1d',
                    today: '+0d',
                    tomorrow: '+1d'
                },
                part, dir, i, fn;
            if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)){
                date = new Date();
                for (i=0; i < parts.length; i++){
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    fn = fn_map[part[2]];
                    date = Datepicker.prototype[fn](date, dir);
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            }

            if (date in dateAliases) {
                date = dateAliases[date];
                parts = date.match(/([\-+]\d+)([dmwy])/g);

                if (/^[\-+]\d+[dmwy]([\s,]+[\-+]\d+[dmwy])*$/.test(date)){
                    date = new Date();
                    for (i=0; i < parts.length; i++){
                        part = part_re.exec(parts[i]);
                        dir = parseInt(part[1]);
                        fn = fn_map[part[2]];
                        date = Datepicker.prototype[fn](date, dir);
                    }

                    return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
                }
            }

            parts = date && date.match(this.nonpunctuation) || [];
            date = new Date();

            function applyNearbyYear(year, threshold){
                if (threshold === true)
                    threshold = 10;

                // if year is 2 digits or less, than the user most likely is trying to get a recent century
                if (year < 100){
                    year += 2000;
                    // if the new year is more than threshold years in advance, use last century
                    if (year > ((new Date()).getFullYear()+threshold)){
                        year -= 100;
                    }
                }

                return year;
            }

            var parsed = {},
                setters_order = ['yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'd', 'dd'],
                setters_map = {
                    yyyy: function(d,v){
                        return d.setUTCFullYear(assumeNearby ? applyNearbyYear(v, assumeNearby) : v);
                    },
                    m: function(d,v){
                        if (isNaN(d))
                            return d;
                        v -= 1;
                        while (v < 0) v += 12;
                        v %= 12;
                        d.setUTCMonth(v);
                        while (d.getUTCMonth() !== v)
                            d.setUTCDate(d.getUTCDate()-1);
                        return d;
                    },
                    d: function(d,v){
                        return d.setUTCDate(v);
                    }
                },
                val, filtered;
            setters_map['yy'] = setters_map['yyyy'];
            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
            setters_map['dd'] = setters_map['d'];
            date = UTCToday();
            var fparts = format.parts.slice();
            // Remove noop parts
            if (parts.length !== fparts.length){
                fparts = $(fparts).filter(function(i,p){
                    return $.inArray(p, setters_order) !== -1;
                }).toArray();
            }
            // Process remainder
            function match_part(){
                var m = this.slice(0, parts[i].length),
                    p = parts[i].slice(0, m.length);
                return m.toLowerCase() === p.toLowerCase();
            }
            if (parts.length === fparts.length){
                var cnt;
                for (i=0, cnt = fparts.length; i < cnt; i++){
                    val = parseInt(parts[i], 10);
                    part = fparts[i];
                    if (isNaN(val)){
                        switch (part){
                            case 'MM':
                                filtered = $(dates[language].months).filter(match_part);
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(match_part);
                                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                break;
                        }
                    }
                    parsed[part] = val;
                }
                var _date, s;
                for (i=0; i < setters_order.length; i++){
                    s = setters_order[i];
                    if (s in parsed && !isNaN(parsed[s])){
                        _date = new Date(date);
                        setters_map[s](_date, parsed[s]);
                        if (!isNaN(_date))
                            date = _date;
                    }
                }
            }
            return date;
        },
        formatDate: function(date, format, language){
            if (!date)
                return '';
            if (typeof format === 'string')
                format = this.parseFormat(format);
            if (format.toDisplay)
                return format.toDisplay(date, format, language);
            var val = {
                d: date.getUTCDate(),
                D: dates[language].daysShort[date.getUTCDay()],
                DD: dates[language].days[date.getUTCDay()],
                m: date.getUTCMonth() + 1,
                M: dates[language].monthsShort[date.getUTCMonth()],
                MM: dates[language].months[date.getUTCMonth()],
                yy: date.getUTCFullYear().toString().substring(2),
                yyyy: date.getUTCFullYear()
            };
            val.dd = (val.d < 10 ? '0' : '') + val.d;
            val.mm = (val.m < 10 ? '0' : '') + val.m;
            date = [];
            var seps = $.extend([], format.separators);
            for (var i=0, cnt = format.parts.length; i <= cnt; i++){
                if (seps.length)
                    date.push(seps.shift());
                date.push(val[format.parts[i]]);
            }
            return date.join('');
        }
    }
}));