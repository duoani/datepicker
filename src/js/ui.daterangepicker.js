
+(function(){
    "use strict";
    function UTCDate(){
        return new Date(Date.UTC.apply(Date, arguments));
    }
    function UTCToday(){
        var today = new Date();
        return UTCDate(today.getFullYear(), today.getMonth(), today.getDate());
    }
    $.uiDefine('daterangepicker', {
        options: {
            format: 'yyyy-mm-dd',
            startDate: -Infinity,
            endDate: Infinity,
            fromDate: new Date(),
            toDate: new Date()
        },
        template: {
            container: '<div class="daterangepicker"><div class="datepicker-container datepicker-left"></div><div class="datepicker-container datepicker-right"></div></div>'
        },
        __init: function(options, element, name){
            this.Super(options, element, name);
            this._processOptions(this.options);
            this._trick = 0;
            this.range = [];
            var $range = $(this.template.container).appendTo(this.$element);
            this.$pickerLeft = $range.find('.datepicker-left').datepicker({
                startDate: this.options.startDate,
                endDate: this.options.endDate,
                format: this.options.format,
                maxViewMode: 2,
                defaultViewDate: {
                    year: this.options.fromDate.getUTCFullYear(),
                    month: this.options.fromDate.getUTCMonth(),
                    day: 10
                }
            });
            this.$pickerRight = $range.find('.datepicker-right').datepicker({
                startDate: this.options.startDate,
                endDate: this.options.endDate,
                format: this.options.format,
                maxViewMode: 2,
                defaultViewDate: {
                    year: this.options.fromDate.getUTCFullYear(),
                    month: this.options.fromDate.getUTCMonth()+1,
                    day: 10
                }
            });
            this.pickers = $.map($range.find('.datepicker-container'), function(i){
                return $.data(i, 'datepicker');
            });
            this.initRange();
            this._bindEvent();
        },
        _processOptions: function(options){
            options.fromDate = this.parseDate(options.fromDate);
            options.toDate = this.parseDate(options.toDate);
            options.startDate = this.parseDate(options.startDate, -Infinity);
            options.endDate = this.parseDate(options.endDate, Infinity);
            this.range = [options.fromDate, options.toDate];
        },
        _bindEvent: function(){
            var me = this;
            this.$pickerLeft
                .on('changeDate', function(e){
                    me.setRange(e.date);
                    me.trigger('changeRange.daterangepicker', me.getRange());
                })
                .on('changeMonth', function(e){
                    me.$pickerRight.datepicker('moveMonthTo', new Date(e.date), 1, true);
                });
            this.$pickerRight
                .on('changeDate', function(e){
                    me.setRange(e.date);
                    me.trigger('changeRange.daterangepicker', me.getRange());
                })
                .on('changeMonth', function(e){
                    me.$pickerLeft.datepicker('moveMonthTo', new Date(e.date), -1, true);
                });
        },
        initRange: function(){
            var fromDate = this.options.fromDate,
                toDate = this.options.toDate;

            if(fromDate > toDate){
                var tem = fromDate;
                fromDate = toDate;
                toDate = tem;
            }
            this.range = [fromDate, toDate];
            $.each(this.pickers, function(){
                this.dates.replace([fromDate, toDate]);
            });
            this.updateRanges(this.range);
        },
        getRange: function(){
            return $.map(this.range, this._utc_to_local);
        },
        setRange: function(date){
            var fromDate, toDate;
            date = this._local_to_utc(date);
            this._trick = (this._trick + 1) % 2;
            if(this._trick){
                fromDate = date;
                toDate = date;
            }else{
                if(this.range[0] > date){
                    fromDate = date;
                    toDate = this.range[0];
                }else{
                    fromDate = this.range[0];
                    toDate = date;
                }
            }
            this.range = [fromDate, toDate];
            $.each(this.pickers, function(){
                this.dates.replace([fromDate, toDate]);
            });
            this.updateRanges(this.range);
        },
        updateRanges: function(range){
            range = $.map(range, function(d){
                return d.valueOf();
            });
            $.each(this.pickers, function(i, p){

                p.setRange(range);
            });
        },
        parseDate: function(date, defaults){
            if (!!date){
                if (date instanceof Date)
                    date = this._local_to_utc(this._zero_time(date));
                else
                    date = this.$element.datepicker.DPGlobal.parseDate(date, this.options.format);
            }
            else {
                date = defaults !== undefined ? defaults : this._zero_time(UTCToday());
            }
            return date;
        },
        _utc_to_local: function(utc){
            return utc && new Date(utc.getTime() + (utc.getTimezoneOffset()*60000));
        },
        _local_to_utc: function(local){
            return local && new Date(local.getTime() - (local.getTimezoneOffset()*60000));
        },
        _zero_time: function(local){
            return local && new Date(local.getFullYear(), local.getMonth(), local.getDate());
        }
    });

})(jQuery);