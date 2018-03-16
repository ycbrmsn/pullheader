/**
 * 下拉上升下降头部
 * @auto jzw
 * @version 1.0.0
 * @history
 *   1.0.0 2018-02-07 下拉上升下降基本功能
 */
;(function (factory) {
  if (typeof define === "function" && define.amd) {
    // AMD模式
    define([ "jquery" ], factory);
  } else {
    // 全局模式
    factory(jQuery);
  }
}(function ($) {
  $.fn.pullheader = function (options) {
    var defaultOption = {
      left: '', // 拉环距离头部左边的距离
      right: '', // 拉环距离头部右边的距离，如果设置了left，则不起作用
      top: 0, // 拉环距离头部顶点的距离
      width: 50, // 圆环宽度
      height: 0, // 圆环高度，为0时与width相同
      headerTop: 0, // 头部的top值
      knockerImgLine: '../img/knocker_line.png', // 拉环线的图片
      knockerImgTail: '../img/knocker.png', // 拉环圆环的图片
      isPullUp: false // 头部是否被拉上去了
    }
    var opt = $.extend(defaultOption, options);
    initData(opt);
    return this.each(function () {
      var $root = $(this);
      // 初始化
      init($root, opt);
    });
  }

  function init($root, opt) {
    initDoms($root, opt);
    initStyles($root, opt);
    initEvents($root, opt);
  }

  function initData(opt) {
    if (!opt.height) {
      opt.height = opt.width;
    }
    // 拉环初始位置
    opt.knockerTop = - Math.floor(opt.height * 0.6);
    // 拉环悬浮时的位置
    opt.knockerTopHover = - Math.floor(opt.height * 0.75);
    // 拉环点击时要降低到的位置
    opt.knockerTopClick = 0;
    // 拉环容器的高度
    opt.knockerBoxHeight = opt.height * 2;
    // 拉环下方先的高度
    opt.knockerLineBelowHeight = Math.floor(opt.height * 0.25);
  }

  function initDoms($root, opt) {
    var $pullHeaderBox = $('.pullheader-box');
    if ($pullHeaderBox.size()) {
      $pullHeaderBox.remove();
    }
    $root.append('<div class="pullheader-box">'
      + '<img class="pullheader-line pullheader-line__below" src="' + opt.knockerImgLine
        + '" width="' + opt.width + '">'
      + '<div class="pullheader-knocker">'
        + '<img class="pullheader-line" src="' + opt.knockerImgLine
          + '" width="' + opt.width + '" height="' + opt.height + '">'
        + '<img class="pullheader-tail" src="' + opt.knockerImgTail
          + '" width="' + opt.width + '" height="' + opt.height + '">'
      + '</div>'
    + '</div>');
  }

  function initStyles($root, opt) {
    var left = opt.left ? opt.left + 'px' : opt.left;
    var right = opt.right ? opt.right + 'px' : opt.right;
    var top = opt.top ? opt.top + 'px' : opt.top;

    var headerTop = opt.headerTop;
    var boxHeight = opt.height * 2;
    var knockerTop = opt.knockerTop;
    var knockerLineBelowHeight = opt.knockerLineBelowHeight;
    if (opt.isPullUp) {
      // 如果当前是拉上去的状态(上方条件)
      headerTop -= $root.outerHeight();
      boxHeight += $root.outerHeight();
      knockerTop += $root.outerHeight();
      knockerLineBelowHeight += $root.outerHeight();
    }
    // 头部位置
    $root.css({
      'position': 'absolute',
      'top': headerTop + 'px'
    });

    // 拉环位置
    $root.find('.pullheader-box').css({
      'left': left,
      'right': right,
      'top': top,
      'width': opt.width + 'px',
      'height': boxHeight + 'px'
    });

    // 拉环整体样式
    $root.find('.pullheader-knocker').css({
      'top': knockerTop + 'px'
    });

    // 拉环圆环部分位置
    $root.find('.pullheader-tail').css({
      'top': Math.floor(opt.height * 0.9) + 'px'
    });

    // 拉环下方线高度
    $root.find('.pullheader-line__below').attr('height', knockerLineBelowHeight);
  }

  function initEvents($root, opt) {
    // 移入拉环事件
    $root.off('mouseenter', '.pullheader-knocker').on('mouseenter', '.pullheader-knocker', function (e) {
      var knockerTopHover = opt.knockerTopHover;
      if (opt.isPullUp) {
        // 如果当前是拉上去的状态(上方条件)
        knockerTopHover += $root.outerHeight();
      }
      $(this).stop().animate({
        'top': knockerTopHover + 'px'
      });
    });
    // 移出拉环事件
    $root.off('mouseleave', '.pullheader-knocker').on('mouseleave', '.pullheader-knocker', function (e) {
      var knockerTop = opt.knockerTop;
      if (opt.isPullUp) {
        // 如果当前是拉上去的状态(上方条件)
        knockerTop += $root.outerHeight();
      }
      $(this).animate({
        'top': knockerTop + 'px'
      });
    });
    // 点击拉环事件
    $root.off('click', '.pullheader-knocker').on('click', '.pullheader-knocker', function (e) {
      var knockerTopClick = opt.knockerTopClick;
      var knockerTopHover = opt.knockerTopHover;
      if (opt.isPullUp) {
        // 如果当前是拉上去的状态(上方条件)
        knockerTopClick += $root.outerHeight();
        knockerTopHover += $root.outerHeight();
      }
      $(this).stop().animate({
        'top': knockerTopClick + 'px'
      }, 'normal', 'swing').animate({
        'top': knockerTopHover + 'px'
      }, 'normal', 'swing', function () {
        if (opt.isPullUp) {
          // 头部在上方位置(上方条件)
          // 则下移
          moveDown($root, $(this), opt);
        } else {
          // 头部在初始位置(上方条件)
          // 则上移
          moveUp($root, $(this), opt);
        }
        opt.isPullUp = !opt.isPullUp;
      });
    });
  }

  /**
   * [moveUp 头部上移]
   * @param  {[type]} $root    [description]
   * @param  {[type]} $knocker [description]
   * @param  {[type]} opt      [description]
   * @return {[type]}          [description]
   */
  function moveUp($root, $knocker, opt) {
    // 头部移动上去
    $root.animate({
      'top': opt.headerTop - $root.outerHeight() + 'px'
    });
    // // 拉环容器下移
    // $knocker.parent().animate({
    //   'top': opt.top + $root.outerHeight() + 'px'
    // });
    
    $knockerBox = $knocker.parent();
    var $pullHeaderLineBelow = $root.find('.pullheader-line__below');
    // 拉环盒子变高
    $knockerBox.animate({
      'height': opt.height * 2 + $root.outerHeight() + 'px'
    }, {
      step: function (argument) {
        // 拉环线变化
        $pullHeaderLineBelow.attr('height', opt.knockerLineBelowHeight + $knockerBox.height() - opt.height * 2);
      }
    });
    // 拉环部分下移
    $knocker.animate({
      'top': opt.knockerTopHover + $root.outerHeight() + 'px'
    });
  }

  /**
   * [moveDown 头部下移]
   * @param  {[type]} $root    [description]
   * @param  {[type]} $knocker [description]
   * @param  {[type]} opt      [description]
   * @return {[type]}          [description]
   */
  function moveDown($root, $knocker, opt) {
    // 头部移动下来
    $root.animate({
      'top': opt.headerTop + 'px'
    });
    // 拉环容器上移
    // $knocker.parent().animate({
    //   'top': opt.top + 'px'
    // });
    
    $knockerBox = $knocker.parent();
    var $pullHeaderLineBelow = $root.find('.pullheader-line__below');
    // 拉环盒子高度还原
    $knockerBox.animate({
      'height': opt.height * 2 + 'px'
    }, {
      step: function (argument) {
        // 拉环线变化
        $pullHeaderLineBelow.attr('height', opt.knockerLineBelowHeight + $knockerBox.height() - opt.height * 2);
      }
    });
    // 拉环部分上移
    $knocker.animate({
      'top': opt.knockerTopHover + 'px'
    });
  }
}));