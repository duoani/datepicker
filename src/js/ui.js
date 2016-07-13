!(function ($, undefined) {
    "use strict";

    var hasOwn = Object.prototype.hasOwnProperty;
    if (typeof Object.create != 'function') {
        // Production steps of ECMA-262, Edition 5, 15.2.3.5
        // Reference: http://es5.github.io/#x15.2.3.5
        Object.create = (function () {
            //为了节省内存，使用一个共享的构造器
            function Temp() {
            }

            // 使用 Object.prototype.hasOwnProperty 更安全的引用 

            return function (O) {
                // 1. 如果 O 不是 Object 或 null，抛出一个 TypeError 异常。
                if (typeof O != 'object') {
                    throw 'Object prototype may only be an Object or null';
                }

                // 2. 使创建的一个新的对象为 obj ，就和通过
                //    new Object() 表达式创建一个新对象一样，
                //    Object是标准内置的构造器名
                // 3. 设置 obj 的内部属性 [[Prototype]] 为 O。
                Temp.prototype = O;
                var obj = new Temp();
                Temp.prototype = null; // 不要保持一个 O 的杂散引用（a stray reference）...

                // 4. 如果存在参数 Properties ，而不是 undefined ，
                //    那么就把参数的自身属性添加到 obj 上，就像调用
                //    携带obj ，Properties两个参数的标准内置函数
                //    Object.defineProperties() 一样。
                if (arguments.length > 1) {
                    // Object.defineProperties does ToObject on its first argument.
                    var Properties = Object(arguments[1]);
                    for (var prop in Properties) {
                        if (hasOwn.call(Properties, prop)) {
                            obj[prop] = Properties[prop];
                        }
                    }
                }

                // 5. 返回 obj
                return obj;
            };
        })();
    }

    var inherits = function (superClass, methods) {
        var Class = function () {
            var me = this;
            me.Super = function () {
                superClass.apply(me, arguments);
            };
            me.__init.apply(me, arguments);
        };
        Class.prototype = Object.create(superClass.prototype);
        for (var m in methods) {
            if (hasOwn.call(methods, m)) {
                Class.prototype[m] = methods[m];
            }
        }
        Class.prototype.constructor = Class;
        if (typeof Class.prototype.__init != "function") {
            Class.prototype.__init = function () {
            };
        }
        return Class;
    };

    var slice = Array.prototype.slice;
    var toStr = Object.prototype.toString;
    var UI = function (options, element, name) {
        this.$element = $(element);
        this.options = $.extend({}, this.options || {}, options);
        this._type_ = name || "ui";
    };
    UI.prototype = {
        setOptions: function (key, val) {
            var keyType = toStr.call(key);
            if (!key) {
                return;
            }
            if (keyType === "[object String]") {
                this.options[key] = val;
            } else if (keyType === "[object Object]") {
                $.extend(this.options, key);
            }
        },
        getOptions: function (key) {
            var val;
            if (key) {
                val = this.options[key];
            } else {
                val = this.options;
            }
            return val !== undefined ? val : null;
        },
        render: function () {

        },
        on: function () {
            this.$element.on.apply(this.$element, arguments);
        },
        one: function () {
            this.$element.one.apply(this.$element, arguments);
        },
        fire: function () {
            this.$element.triggerHandler.apply(this.$element, arguments);
        },
        trigger: function () {
            this.$element.triggerHandler.apply(this.$element, arguments);
        },
        off: function () {
            this.$element.off.apply(this.$element, arguments);
        },
        dispose: function () {
            this.$element.data("ui." + this._type_, null);
            this.$element = null;
            this.options = null;
        },
        /**
         * 简单模板引擎
         * @param tpl {String} 模板字符串
         * @param data {Object} 数据
         * @returns {String} 填充数据后的字符串
         *
         * C.tpl('<a href="<%= href %>"><%= text %></a>', {text: '美篮子', href: 'http://www.mlzmall.com'})
         */
        tpl: function (tpl, data) {
            var c = "var p=[],print=function(){p.push.apply(p,arguments);};with(obj){p.push('" + tpl.replace(/[\r\t\n]/g, " ")
                    .split("<%")
                    .join("	")
                    .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                    .replace(/\t=(.*?)%>/g, "',$1,'")
                    .split("	")
                    .join("');")
                    .split("%>")
                    .join("p.push('")
                    .split("\r")
                    .join("\\'") +
                "');}return p.join('');";
            var fn = new Function("obj", c);
            return data ? fn(data) : fn;
        }

    };

    /**
     * 定义UI, 并添加到$.fn内
     * @param {String} name UI控件名称
     * @param {Object} properties UI实例方法及构造方法定义(__init)
     * @returns {UI}
     *
     * //定义控件
     * $.uiDefine("Component", {
     *      __init: function(options, element, componentName){
     *          //call super
     *          this.supr(element, componentName);
     *      },
     *      // other methods
     *      doSomething: function(thing){
     *          console.log("doing...", thing);
     *      }
     * });
     *
     * //实例化控件
     * $("div").Component({...});
     *
     * //调用控件实例方法(调用实例方法前要保证控件已实例化)
     * $("div").Component("doSomething", "homework");
     */
    $.uiDefine = function (name, properties) {
        var old = $.fn[name],
            Class = inherits(UI, properties);

        $.fn[name] = function (options) {
            var args = slice.call(arguments, 1),
                value;
            this.each(function () {
                var $this = $(this),
                    data = $this.data("ui." + name);

                if (!data) {
                    $this.data("ui." + name, new Class(options, this, name));

                } else if (typeof options == 'string') {
                    //不允许调用私有方法(_methodName like)
                    value = data[options] && options.indexOf("_") !== 0 && data[options].apply(data, args);
                }
            });
            return value !== undefined ? value : this;
        };
        $.fn[name].Constructor = Class;
        $.fn[name].noConflict = function () {
            $.fn[name] = old;
            return this;
        };
        return Class;
    };
})(jQuery);
