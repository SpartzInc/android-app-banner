/**
 * jQuery Android App Banner
 * Copyright (c) 2015 Spartz, Inc.
 * Based on 'jQuery Smart Banner' by Arnold Daniels <arnold@jasny.net>
 */
(function($) {
    var SmartBanner = function(options) {
        // Get the original margin-top of the HTML element so we can take that into account.
        this.origHtmlMargin = parseFloat($('html').css('margin-top'));
        this.options = $.extend({}, $.smartbanner.defaults, options);

        // Check if it's already a standalone web app or running within
        // a web UI view of an app (not mobile safari).
        var standalone = navigator.standalone,
            isAndroidDevice = (navigator.userAgent.match(/Android/i) !== null);

        // Don't show the banner if the device isn't Android, the website is loaded in app or the
        // user dismissed the banner.
        if (!isAndroidDevice ||
            standalone ||
            this.getCookie('sb-closed') ||
            this.getCookie('sb-installed')) {

            return;
        }

        // Calculate scale.
        this.scale = this.options.scale === 'auto' ? $(window).width() / window.screen.width : this.options.scale;
        if (this.scale < 1) {
            this.scale = 1;
        }

        // Get info from meta data
        var meta = $('meta[name="google-play-app"]');
        if (meta.length === 0) {
            return;
        }

        // Try to pull the appId out of the meta tag and store the result
        var parsedMetaContent = /app-id=([^\s,]+)/.exec(meta.attr('content'));
        if (!parsedMetaContent) {
            return;
        }
        this.appId = parsedMetaContent[1];

        this.title = this.options.title;
        if (!this.title) {
            this.title = meta.data('title') || $('title').text().replace(/\s*[|\-·].*$/, '');
        }

        this.author = this.options.author ? this.options.author : meta.data('author');
        if (!this.author) {
            var authorMeta = $('meta[name="author"]');
            if (authorMeta.length) {
                this.author = authorMeta.attr('content');
            } else {
                this.author = window.location.hostname;
            }
        }
        this.iconUrl = meta.data('icon-url');
        this.price = meta.data('price');

        // Set default onInstall callback if not set in options.
        if (typeof this.options.onInstall === 'function') {
            this.options.onInstall = this.options.onInstall;
        } else {
            this.options.onInstall = function() {};
        }

        // Set default onClose callback if not set in options.
        if (typeof this.options.onClose === 'function') {
            this.options.onClose = this.options.onClose;
        } else {
            this.options.onClose = function() {};
        }

        // Set default onCreate callback if not set in options
        if (typeof this.options.onCreate === 'function') {
            this.options.onCreate = this.options.onCreate;
        } else {
            this.options.onCreate = function() {};
        }

        // Create banner.
        this.create();
        this.show();
        this.listen();
    };

    SmartBanner.prototype = {

        constructor: SmartBanner,

        create: function() {
            var iconURL,
                link = this.options.url ? this.options.url : ('market://details?id=' + this.appId),
                price = this.price || this.options.price,
                inStore = price ? price + ' - ' + (this.options.inGooglePlay || '') : '';

            if (this.options.googlePlayParams) {
                link = link + '&referrer=' + this.options.googlePlayParams;
            }

            var banner = '<div id="smartbanner" class="android' +
                (this.options.animate ? ' animate' : '') + '"><div class="sb-container">' +
                '<a href="#" class="sb-close">&times;</a><span class="sb-icon"></span>' +
                '<div class="sb-info"><strong>' + this.title + '</strong><span>' + this.author +
                '</span><span>' + inStore + '</span></div><a href="' + link +
                '" class="sb-button"><span>' + this.options.button + '</span></a></div></div>';
            if (this.options.layer) {
                $(this.options.appendToSelector).append(banner);
            } else {
                $(this.options.appendToSelector).prepend(banner);
            }

            // Get a reference to our created Smart Banner element.
            var $smartbanner = $('#smartbanner');

            if (this.options.icon) {
                iconURL = this.options.icon;
            } else if (this.iconUrl) {
                iconURL = this.iconUrl;
            } else if ($('link[rel="apple-touch-icon-precomposed"]').length > 0) {
                iconURL = $('link[rel="apple-touch-icon-precomposed"]').attr('href');
            } else if ($('link[rel="apple-touch-icon"]').length > 0) {
                iconURL = $('link[rel="apple-touch-icon"]').attr('href');
            }

            if (iconURL) {
                $smartbanner.find('.sb-icon').css('background-image', 'url(' + iconURL + ')');
            } else {
                $smartbanner.addClass('no-icon');
            }

            this.bannerHeight = $smartbanner.outerHeight() + 2;

            if (this.scale > 1) {
               $smartbanner
                    .css('top', parseFloat($('#smartbanner').css('top')) * this.scale)
                    .css('height', parseFloat($('#smartbanner').css('height')) * this.scale)
                    .hide();
                $smartbanner.find('.sb-container')
                    .css('-webkit-transform', 'scale(' + this.scale + ')')
                    .css('-msie-transform', 'scale(' + this.scale + ')')
                    .css('-moz-transform', 'scale(' + this.scale + ')')
                    .css('width', $(window).width() / this.scale);
            }
            $smartbanner.css('position', (this.options.layer) ? 'absolute' : 'static');

            // Call the user supplied onCreate method if supplied.
            this.options.onCreate($smartbanner);
        },

        listen: function() {
            $('#smartbanner .sb-close').on('click', $.proxy(this.close, this));
            $('#smartbanner .sb-button').on('click', $.proxy(this.install, this));
        },

        show: function(callback) {
            var banner = $('#smartbanner');

            if (!this.options.animate) {
                banner.show().addClass('shown');
                return;
            }

            banner.stop();

            if (this.options.layer) {
                banner.animate({
                    top: 0,
                    display: 'block'
                }, this.options.speedIn).addClass('shown').show();

                $(this.pushSelector).animate({
                    paddingTop: this.origHtmlMargin + (this.bannerHeight * this.scale)
                }, this.options.speedIn, 'swing', callback);
            } else {
                if ($.support.transition) {
                    banner.animate({
                        top: 0
                    }, this.options.speedIn).addClass('shown');

                    var transitionCallback = function() {
                        $('html').removeClass('sb-animation');
                        if (callback) {
                            callback();
                        }
                    };

                    $(this.pushSelector)
                        .addClass('sb-animation')
                        .one($.support.transition.end, transitionCallback)
                        .emulateTransitionEnd(this.options.speedIn)
                        .css('margin-top', this.origHtmlMargin + (this.bannerHeight * this.scale));
                } else {
                    banner.slideDown(this.options.speedIn).addClass('shown');
                }
            }
        },

        hide: function(callback) {
            var banner = $('#smartbanner');

            if (!this.options.animate) {
                banner.hide().removeClass('shown');
                return;
            }

            banner.stop();

            if (this.options.layer) {
                banner.animate({
                    top: -1 * this.bannerHeight * this.scale,
                    display: 'block'
                }, this.options.speedIn).removeClass('shown');

                $(this.pushSelector).animate({
                    paddingTop: this.origHtmlMargin
                }, this.options.speedIn, 'swing', callback);
            } else {
                if ($.support.transition) {
                    banner.css({
                        display: 'none'
                    }).removeClass('shown');

                    var transitionCallback = function() {
                        $('html').removeClass('sb-animation');
                        if (callback) {
                            callback();
                        }
                    };

                    $(this.pushSelector)
                        .addClass('sb-animation')
                        .one($.support.transition.end, transitionCallback)
                        .emulateTransitionEnd(this.options.speedOut)
                        .css('margin-top', this.origHtmlMargin);
                } else {
                    banner.slideUp(this.options.speedOut).removeClass('shown');
                }
            }
        },

        close: function(e) {
            e.preventDefault();
            this.hide();
            this.setCookie('sb-closed', 'true', this.options.daysHidden);
            this.options.onClose(e);
        },

        install: function(e) {
            if (this.options.hideOnInstall) {
                this.hide();
            }
            this.setCookie('sb-installed', 'true', this.options.daysReminder);
            this.options.onInstall(e);
        },

        setCookie: function(name, value, exdays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            value = encodeURI(value) + ((exdays === null) ? '' : '; expires=' + exdate.toUTCString());
            document.cookie = name + '=' + value + '; path=/;';
        },

        getCookie: function(name) {
            var i,
                x,
                y,
                ARRcookies = document.cookie.split(";");

            for(i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g,"");
                if (x === name) {
                    return decodeURI(y);
                }
            }
            return null;
        },

        // Demo only
        switchType: function() {
          var that = this;

          this.hide(function() {
              var meta = $('meta[name="google-play-app"]').attr('content');
              that.appId = /app-id=([^\s,]+)/.exec(meta)[1];

              $('#smartbanner').detach();
              that.create();
              that.show();
          });
      }
    };

    $.smartbanner = function(option) {
        var $window = $(window),
            data = $window.data('smartbanner'),
            options = typeof option === 'object' && option;

        if (!data) {
            $window.data('smartbanner', (data = new SmartBanner(options)));
        }
        if (typeof option === 'string') {
            data[option]();
        }
    };

    // override these globally if you like (they are all optional)
    $.smartbanner.defaults = {
        title: null, // What the title of the app should be in the banner (defaults to <title>)
        author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
        price: 'FREE', // Price of the app
        inGooglePlay: 'In Google Play', // Text of price for Android
        googlePlayParams: null, // Aditional parameters for the market
        icon: null, // The URL of the icon (defaults to <meta name="apple-touch-icon">)
        button: 'VIEW', // Text for the install button
        url: null, // The URL for the button. Keep null if you want the button to link to the app store.
        scale: 'auto', // Scale based on viewport size (set to 1 to disable)
        animate: true, // Whether the showing / hiding of the app banner should be animated.
        speedIn: 300, // Show animation speed of the banner
        speedOut: 400, // Close animation speed of the banner
        daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner)
        daysReminder: 90, // Duration to hide the banner after "VIEW" is clicked *separate from when the close button is clicked* (0 = always show banner)
        hideOnInstall: true, // Hide the banner after "VIEW" is clicked.
        layer: false, // Display as overlay layer or slide down the page
        appendToSelector: 'body', //Append the banner to a specific selector
        pushSelector: 'html' // What element is going to push the site content down; this is where the banner append animation will start.
    };

    $.smartbanner.Constructor = SmartBanner;

    // ============================================================
    // Bootstrap transition
    // Copyright 2011-2014 Twitter, Inc.
    // Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)

    function transitionEnd() {
        var el = document.createElement('smartbanner');

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {end: transEndEventNames[name]};
            }
        }

        return false; // explicit for ie8 (  ._.)
    }

    if ($.support.transition !== undefined) {
        return; // Prevent conflict with Twitter Bootstrap
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false, $el = this;
        $(this).one($.support.transition.end, function() {
            called = true;
        });
        var callback = function() {
            if (!called) {
                $($el).trigger($.support.transition.end);
            }
        };
        setTimeout(callback, duration);
        return this;
    };

    $(function() {
        $.support.transition = transitionEnd();
    });
    // ============================================================

}(window.jQuery));
