/**
 * 下拉上升下降头部
 * @auto jzw
 * @version 1.1.0
 * @history
 *   1.0.0 2018-02-07 下拉上升下降基本功能
 *   1.0.1 2018-02-08 下拉上升下降时加上一个回调函数onMoveUp, onMoveDown，
 *     再加上一个额外需要移动的dom节点选择器extraMoveDomSelector
 *   1.1.0 2018-03-16 优化dom结构。增加回调函数afterMoveUp、afterMoveDown。插件可调用pull方法触发点击拉环事件
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
      knockerImgKnocker: '../img/knocker.png', // 拉环圆环的图片
      knockerLineAboveTop: 0, // 拉环线距离拉环底部的距离，为0时为比拉环高度小10的距离
      isPullUp: false, // 头部是否被拉上去了
      pattern: 'follow', // 拉环拉动模式，分为fixed、follow、opposite，不匹配时默认为follow模式
      extraMoveDomSelector: '', // 额外需要移动的dom节点选择器
      onMoveUp: function (height) {}, // 在拉上去的同时
      onMoveDown: function (height) {}, // 在拉下去的同时
      afterMoveUp: function () {}, // 拉上去之后
      afterMoveDown: function () {} // 拉下去之后
    }
    var opt = $.extend(defaultOption, options);
    initData(opt);

    var $root = $(this);
    // 初始化
    init($root, opt);

    return {
      pull: function () {
        $root.find('.pullheader-knocker').trigger('click');
        opt.leaveTimeout = setTimeout(function () {
          $root.find('.pullheader-box').trigger('mouseleave');
        }, opt.leaveActionTime)
      }
    }
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
    // 拉环悬浮时的位置
    opt.knockerTopHover = - Math.floor(opt.height * 0.2);
    // 拉环点击时要降低到的位置
    opt.knockerTopClick = Math.floor(opt.height * 0.3);
    // 拉环容器的高度
    opt.knockerBoxHeight = opt.height * 2;
    // 拉环线距离底部的高度，为0时为比拉环高度小10的距离
    opt.knockerLineAboveTop = opt.knockerLineAboveTop || opt.height - 10;
    // 移出拉环后多久启动动画
    opt.leaveActionTime = 1000;
  }

  function initDoms($root, opt) {
    var $pullHeaderBox = $('.pullheader-box');
    if ($pullHeaderBox.size()) {
      $pullHeaderBox.remove();
    }
    $root.append('<div class="pullheader-box">'
      + '<div class="pullheader-line" style="bottom: ' + opt.knockerLineAboveTop + 'px; width: ' + opt.width + 'px"></div>'
      + '<img class="pullheader-knocker" src="' + opt.knockerImgKnocker
        + '" width="' + opt.width + '" height="' + opt.height + '">'
    + '</div>');
  }

  function initStyles($root, opt) {
    var left = opt.left ? opt.left + 'px' : opt.left;
    var right = opt.right ? opt.right + 'px' : opt.right;
    var top = opt.top ? opt.top + 'px' : opt.top;

    var headerTop = opt.headerTop;
    var boxHeight = opt.height * 2;
    var outerHeight = $root.outerHeight();
    var moveDistance = 0;
    if (opt.isPullUp) {
      // 如果当前是拉上去的状态(上方条件)
      moveDistance = - outerHeight; // 拉动块上移移动块的高度
    }
    /**
     * 头部位置
     */
    $root.css({
      'position': 'absolute',
      'top': headerTop + moveDistance + 'px'
    });
    /**
     * 额外移动块
     */
    var $extraDom = $('' + opt.extraMoveDomSelector);
    if ($extraDom.size()) {
      $extraDom.css({
        'top': parseInt($extraDom.css('top')) + moveDistance + 'px'
      });
    }

    // 拉环位置
    var point = getTopAndHeight(opt.top, opt.knockerBoxHeight, outerHeight, opt.isPullUp, opt.pattern);
    $root.find('.pullheader-box').css({
      'left': left,
      'right': right,
      'top': point.top + 'px',
      'width': opt.width + 'px',
      'height': point.height + 'px'
    });

  }

  function initEvents($root, opt) {
    // 移入拉环事件
    $root.off('mouseenter', '.pullheader-box').on('mouseenter', '.pullheader-box', function (e) {
      // 移入之后，取消拉环移出效果
      if (opt.leaveTimeout) {
        clearTimeout(opt.leaveTimeout);
      }
      var outerHeight = $root.outerHeight();
      var knockerBoxTop = opt.top;
      var knockerBoxHeight = opt.knockerBoxHeight + opt.knockerTopHover;
      // console.log(knockerBoxTop, knockerBoxHeight)
      var point = getTopAndHeight(knockerBoxTop, knockerBoxHeight, outerHeight, opt.isPullUp, opt.pattern);
      animateKnocker($(this), point);
    });

    // 移出拉环事件
    $root.off('mouseleave', '.pullheader-box').on('mouseleave', '.pullheader-box', function (e) {
      var $this = $(this);
      // 移出拉环一定时间后展现移出效果
      opt.leaveTimeout = setTimeout(function () {
        var outerHeight = $root.outerHeight();
        var knockerBoxTop = opt.top;
        var knockerBoxHeight = opt.knockerBoxHeight;
        // console.log(knockerBoxTop, knockerBoxHeight)
        var point = getTopAndHeight(knockerBoxTop, knockerBoxHeight, outerHeight, opt.isPullUp, opt.pattern);
        animateKnocker($this, point, true);
      }, opt.leaveActionTime);
    });
    
    // 点击拉环事件
    $root.off('click', '.pullheader-knocker').on('click', '.pullheader-knocker', function (e) {
      var outerHeight = $root.outerHeight();
      var knockerBoxTop = opt.top;
      var knockerBoxHeight = opt.knockerBoxHeight + opt.knockerTopHover;
      var knockerTopClick = opt.knockerBoxHeight + opt.knockerTopClick;
      var knockerTopHover = opt.knockerBoxHeight + opt.knockerTopHover;
      // 点击后拉环需要达到的位置
      var clickPoint = getTopAndHeight(knockerBoxTop, knockerTopClick, outerHeight, opt.isPullUp, opt.pattern);
      // 移入后拉环需要达到的位置
      var hoverPoint = getTopAndHeight(knockerBoxTop, knockerTopHover, outerHeight, opt.isPullUp, opt.pattern);

      $(this).parent().stop().animate({
        'top': clickPoint.top + 'px',
        'height': clickPoint.height + 'px'
      }, 'normal', 'swing').animate({
        'top': hoverPoint.top + 'px',
        'height': hoverPoint.height + 'px'
      }, 'normal', 'swing', function () {
        var point = getTopAndHeight(knockerBoxTop, knockerBoxHeight, outerHeight, !opt.isPullUp, opt.pattern);
        animateKnocker($(this), point);
        if (opt.isPullUp) {
          // 头部在上方位置(上方条件)，则下移
          moveDown($root, opt);
          if ($.isFunction(opt.onMoveDown)) {
            opt.onMoveDown($root.outerHeight());
          }
        } else {
          // 头部在初始位置(上方条件)，则上移
          moveUp($root, opt);
          if ($.isFunction(opt.onMoveUp)) {
            opt.onMoveUp($root.outerHeight());
          }
        }
        opt.isPullUp = !opt.isPullUp;
      });
    });
  }

  /**
   * [moveUp 头部上移，包含额外节点]
   * @param  {[type]} $root [description]
   * @param  {[type]} opt   [description]
   * @return {[type]}       [description]
   */
  function moveUp($root, opt) {
    // 头部移动上去
    $root.animate({
      'top': opt.headerTop - $root.outerHeight() + 'px'
    }, 'normal', 'swing', function () {
      if ($.isFunction(opt.afterMoveUp)) {
        opt.afterMoveUp();
      }
    });
    // 额外节点上移
    var $extraDom = $('' + opt.extraMoveDomSelector);
    if ($extraDom.size()) {
      $extraDom.animate({
        'top': opt.headerTop + 'px'
      }, 'normal', 'swing');
    }
  }

  /**
   * [moveDown 头部下移，包含额外节点]
   * @param  {[type]} $root [description]
   * @param  {[type]} opt   [description]
   * @return {[type]}       [description]
   */
  function moveDown($root, opt) {
    // 头部移动下来
    $root.animate({
      'top': opt.headerTop + 'px'
    }, 'normal', 'swing', function () {
      if ($.isFunction(opt.afterMoveDown)) {
        opt.afterMoveDown();
      }
    });
    // 额外节点下移
    var $extraDom = $('' + opt.extraMoveDomSelector);
    if ($extraDom.size()) {
      $extraDom.animate({
        'top': opt.headerTop + $root.outerHeight() + 'px'
      }, 'normal', 'swing');
    }
  }

  /**
   * [getTopAndHeight 获得拉环实际应该达到的top与height值]
   * @param  {[type]}  top         [description]
   * @param  {[type]}  height      [description]
   * @param  {[type]}  outerHeight [拉环所在拉动块的高度]
   * @param  {Boolean} isPullUp    [是否拉上去了]
   * @param  {[type]}  pattern     [拉环拉动模式，分为fixed、follow、opposite]
   * @return {[type]}              [description]
   */
  function getTopAndHeight(top, height, outerHeight, isPullUp, pattern) {
    if (isPullUp) { // 当前是拉上去的状态
      if (pattern === 'fixed') { // 如果是固定模式
        // 固定模式下，height变化
        height += outerHeight;
      } else if (pattern === 'follow') { // 如果是跟随模式
        // 跟随模式下无变化
      } else if (pattern === 'opposite') { // 如果是移动模式
        top += outerHeight;
      }
    } else { // 当前是拉下去的状态
      if (pattern === 'fixed') { // 如果是固定模式
        // 固定模式下，height变化

      } else if (pattern === 'follow') { // 如果是跟随模式
        // 移动模式下仅height变化
      } else if (pattern === 'opposite') { // 如果是移动模式
        top -= outerHeight * 2;
      }
    }
    return {
      top: top,
      height: height
    }
  }

  /**
   * [animateKnocker 拉环移动动画]
   * @param  {[type]} $knocker [description]
   * @param  {[type]} point    [description]
   * @param  {[type]} needStop [是否要打断之前的动画]
   * @return {[type]}          [description]
   */
  function animateKnocker($knocker, point, needStop) {
    if (needStop) {
      $knocker.stop();
    }
    $knocker.animate({
      'top': point.top + 'px',
      'height': point.height + 'px'
    });
  }
}));