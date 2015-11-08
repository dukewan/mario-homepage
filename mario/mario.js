/**
 * Super Mairo Course Homework Navigation
 * Version 0.1
 * By Yizhao He
 * At 9/6/2015
 * Update at 11/8/2015
 */
var marios = [
                'url(mario/mario.png) 0 -178px',
                'url(mario/mario.png) -65px -178px',
                'url(mario/mario.png) -140px -178px',
                'url(mario/mario.png) -195px -178px'
    ];

var CLOUDTIME = 40000,
    LOADINGSCREENTIME = 5000,
    RIDRECTTIME = 4000,
    RUNSPEED = 15,
    JUMPTIME  = 700,
    MUSICANIMATETIME = 2000,
    MUSROOMANIMATETIME = 2000;

Mario = function () {
    this.dom = $('#mario');
    this.left = parseInt(this.dom.css('left'));
    this.top = parseInt(this.dom.css('top'));
    this.pic = 1;
    this.direction = 1;
};

Mario.prototype.init = function () {
    this.initMario();
    this.initSound();
    this.initAnimation();
    this.eventBind();
};

Mario.prototype.initMario = function () {
    var me = this;

    me.dom.css('left', parseInt($(window).width()) / 2);
};

Mario.prototype.initSound =  function () {
    var me = this;

    soundManager.setup({
        onready: function() {
            me.soundBackground = soundManager.createSound({
                id: 'background',
                url: 'mario/smb3-overworld-1.mp3',
                volume: 100,
                autoLoad: true,
                autoPlay: true,
                loops: 1000
            });

            me.soundJump = soundManager.createSound({
                id: 'jump',
                url: 'mario/smb3_jump.mp3',
                autoLoad: true
            });

            me.soundBump = soundManager.createSound({
                id: 'bump',
                url: 'mario/smb3_bump.mp3',
                autoLoad: true
            });

            me.soundMushroom = soundManager.createSound({
                id: 'mushroom',
                url: 'mario/smb3_mushroom_appears.mp3',
                autoLoad: true
            });

            me.soundCoin = soundManager.createSound({
                id: 'coin',
                url: 'mario/smb3_coin.mp3',
                autoLoad: true
            });
        }
    });
};

Mario.prototype.initAnimation = function () {
    this.animateMusic(true);
    this.animateCloud();
};

Mario.prototype.animateMusic = function (type) {
    var me = this;

    if (type) {
        $('#music').transition({rotate: '+=360'}, MUSICANIMATETIME, 'linear');
        me.musicInterval = window.setInterval(function() {
            $('#music').transition({rotate: '+=360'}, MUSICANIMATETIME, 'linear');
        }, MUSICANIMATETIME);
    } else {
        window.clearInterval(me.musicInterval);
    }
};

Mario.prototype.animateMushroom = function (type) {
    var me = this;

    if (type) {
        $('#loading .mushroom').transition({rotate: '+=360'}, MUSROOMANIMATETIME, 'linear');
        me.mushroomInterval = window.setInterval(function() {
            $('#loading .mushroom').transition({rotate: '+=360'}, MUSROOMANIMATETIME, 'linear');
        }, MUSROOMANIMATETIME);
    } else {
        window.clearInterval(me.mushroomInterval);
    }
};

Mario.prototype.animateCloud = function () {
    var me = this,
        windowWidth = parseInt($(window).width());

    // generate clouds
    var html = me.getCloudHtml(windowWidth);
    $('#clouds').append(html);

    $('.cloud').each(function () {
        var left = $(this).position().left - windowWidth;
        $(this).animate({left: left + 'px'}, CLOUDTIME, 'linear');
    });

    window.setInterval(function() {
        // clear clouds
        $('.cloud').each(function () {
            // console.log($(this).position().left);
            if ($(this).position().left < 0) {
                $(this).remove();
            }
        });

        // genertate clouds
        var html = me.getCloudHtml(windowWidth);
        $('#clouds').append(html);

        $('.cloud').stop();
        $('.cloud').each(function () {
            var left = $(this).position().left - windowWidth;
            $(this).animate({left: left + 'px'}, CLOUDTIME, 'linear');
        });
    }, CLOUDTIME);
};

Mario.prototype.getCloudHtml = function (windowWidth) {
    return '<div class="cloud cloud1" style="left: ' + (200+windowWidth) + 'px; top: 100px;"></div>'
                +'<div class="cloud cloud2" style="left: ' + (350+windowWidth) + 'px; top: 35px;"></div>'
                +'<div class="cloud cloud3" style="left: ' + (500+windowWidth) + 'px; top: 100px;"></div>'
                +'<div class="cloud cloud1" style="left: ' + (800+windowWidth) + 'px; top: 100px;"></div>'
                +'<div class="cloud cloud2" style="left: ' + (950+windowWidth) + 'px; top: 35px;"></div>'
                +'<div class="cloud cloud3" style="left: ' + (1100+windowWidth) + 'px; top: 100px;"></div>';
}

Mario.prototype.setLeft = function (change) {
    var me = this;
    // boundary check
    if ((me.direction == -1 && me.left > 0) || (me.direction == 1 && me.left < parseInt($(window).width()) - 55)) {
        me.left += change;
    } else {
        me.soundBump.play();
    }

    me.dom.css('left', me.left);
};

Mario.prototype.setDirection = function (direction) {
    this.dom.css('-moz-transform', 'scaleX(' + direction + ')');
    this.dom.css('-o-transform', 'scaleX(' + direction + ')');
    this.dom.css('-webkit-transform', 'scaleX(' + direction + ')');
    this.dom.css('transform', 'scaleX(' + direction + ')');
};

Mario.prototype.setPic = function (pic) {
    var me = this,
        pic = pic ? pic : this.pic;

    me.dom.queue(function(){
        me.dom.css('background', marios[pic - 1]);
        $(this).dequeue();
    });
};

Mario.prototype.run = function () {
    var me = this;

    if (me.direction == 1) {
        me.setDirection(-1);
        me.setLeft(RUNSPEED);
    } else {
        me.setDirection(1);
        me.setLeft(-RUNSPEED);
    }

    if (me.pic == 2) {
        me.pic = 3;
    } else {
        me.pic = 2;
    }
    me.setPic();
};

Mario.prototype.jump = function () {
    var me = this;

    me.soundJump.play();

    me.pic = 4;
    me.setPic();

    // top
    me.dom.animate({top: '-=150px'}, JUMPTIME, 'swing');
    me.dom.animate({top: '+=150px'}, JUMPTIME, 'swing');

    me.pic = 1;
    me.setPic();

    // collision check at the peak of Mario position
    window.setTimeout(function() {
        $('#homeworks .hw').each(function () {
            if($(this).objectHitTest({"object":$("#mario")})){
                var id = $(this).attr('data-id');

                me.animateMushroom(true);
                me.soundMushroom.play();
                me.showPrompt('Redirecting to <br/> Homework #' + id + ' <br/>...');
                me.redirect($('a', $(this)).attr('href'));
            }
        });
    }, JUMPTIME);

    // prevent streak jump if space is pressed
    window.setTimeout(function() {
        me.dom.attr('data-finishjump', 'true');
    }, JUMPTIME * 2);
};

Mario.prototype.showPrompt = function (html) {
    $('#loading .help').html(html);
    $('#loading').fadeIn();
};

Mario.prototype.redirect = function (href) {
    window.setTimeout(function () {
        location.href = href;
    }, RIDRECTTIME);
};

Mario.prototype.eventBind = function () {
    var me = this;

    // keyboard control
    $(window).keydown(function(event){
        switch(event.keyCode) {
            case 37:    // left arrow
                me.direction = -1;
                me.run();

                break;
            case 39:    // right arrow
                me.direction = 1;
                me.run();
                break;
            case 32:    // space
                var finish = me.dom.attr('data-finishjump');
                if(finish == 'true') {
                    me.dom.attr('data-finishjump', 'false');
                    me.jump();
                }
                break;
            default:
                break;
        }
    });

    // music control
    $('#music').click(function() {
        var dom = $('#music');
        if (dom.attr('data-play') == 'true') {
            dom.attr('data-play', 'false');
            me.soundBackground.pause();
            me.animateMusic(false);
        } else {
            dom.attr('data-play', 'true');
            me.soundBackground.resume();
            me.animateMusic(true);
        }
    });

    // loading screen
    window.setTimeout(function () {
        $('#loading').fadeOut('slow');
    }, LOADINGSCREENTIME);

    $('#loading .start').click(function () {
        $('#loading').fadeOut('slow');
    });

    // world
    $('#world').click(function () {
        me.soundCoin.play();
    });
};

mario = new Mario();
mario.init();
