'use strict';

(function ($, window) {
  //ModalPopup构造函数
  var ModalPopup = function ModalPopup(ele, opt) {
    var self = this;

    this.$element = ele;

    this.defaults = {
      title: '标题',
      data: [],
      columns: 1,
      result: {
        name: '',
        value: ''
      },
      resultBack: function resultBack(res) {
        self.$element.val(res.name);
        self.$element.attr('data-num', res.value);
      },
      callback: function callback() {}
    };

    this.options = $.extend({}, this.defaults, opt || {});
    this.keyVal = getKey();

    function getKey() {
      var keyString = [];
      for (var key in self.options.data[0]) {
        keyString.push(key);
      }
      return keyString;
    }
  };

  ModalPopup.prototype.createHtmlDom = function () {
    var self = this;

    //弹窗DOM结构
    var htmlDom = '<div class="modal-mask">\n        <div class="modal-bg"></div>\n        <div class="modal-body">\n          <div class="modal-header"> \n            <div class="modal-title">' + self.options.title + '</div>\n            <div class="modal-close"></div>\n          </div>\n          <div class="choose-answer">\n            <span class="choose-answer-items ' + (self.options.columns == 1 || !self.options.columns ? 'one-list' : '') + '"><span class="active" id="firstChoose">\u8BF7\u9009\u62E9</span></span>\n            <span class="choose-answer-items hide"><span id="secondChoose">\u8BF7\u9009\u62E9</span></span>\n            <span class="choose-answer-items hide"><span id="lastChoose">\u8BF7\u9009\u62E9</span></span>\n          </div>\n          <div class="choose-lists"></div>\n        </div>\n      </div>';

    //添加DOM结构
    $(htmlDom).appendTo('body');
    $('.modal-mask').fadeIn();

    self.chooseListHtml(self.options.data, 'choose-items');
    self.columnsClick();
    self.bodyFlex();

    $('.modal-close').click(function () {
      self.modalClose();
    });
  };
  /**
   * 生成选择项列表html
   * @param {数据列表} arrJson
   * @param {生成列表的class名} className
   */
  ModalPopup.prototype.chooseListHtml = function (arrJson, className) {
    var self = this;
    var createHtml = arrJson.map(function (items) {
      return '<div class="' + (!className ? 'choose-items' : className) + '" value="' + items[self.keyVal[0]] + '">' + items[self.keyVal[1]] + '</div>';
    }).join('');

    $('.choose-lists').children().remove();

    $('.choose-lists').append(createHtml);
  };

  //子类选择
  ModalPopup.prototype.columnsClick = function () {
    var self = this;
    var firstChooseEle = $('#firstChoose');
    var secondChooseEle = $('#secondChoose');
    var lastChooseEle = $('#lastChoose');
    var _self$options = self.options,
        columns = _self$options.columns,
        result = _self$options.result,
        callback = _self$options.callback,
        data = _self$options.data,
        resultBack = _self$options.resultBack;


    $('.choose-lists').on('click', '.choose-items', function () {
      var childs = $(this).index();

      switch (columns) {
        case 0:
        case 1:
        case !columns:
          //一级选择项
          result.value = $(this).attr('value');
          result.name = $(this).text();

          self.modalClose();
          resultBack(result);
          callback(self.$element);

          break;
        case 2:
          //二级选择项
          self.secondChooseHtml(childs, $(this));
          $('.choose-child-items').click(function () {
            result.value = $(this).attr('value');
            result.name = $('#firstChoose').text() + $(this).text();
            self.modalClose();
            resultBack(result);
            callback(self.$element);
          });

          break;
        case 3:
          //三级选择项
          self.secondChooseHtml(childs, $(this));
          $('.choose-lists').on('click', '.choose-child-items', function () {
            var lastIndex = $(this).index();
            if (lastIndex == -1) return;
            secondChooseEle.removeClass('active').text($(this).text());

            lastChooseEle.addClass('active').parent().removeClass('hide');

            self.chooseListHtml(data[childs][self.keyVal[2]][lastIndex][self.keyVal[2]], 'choose-last-items');

            $('.choose-last-items').click(function () {
              $('.val').text(firstChooseEle.text() + secondChooseEle.text() + $(this).text());

              result.value = $(this).attr('value');

              result.name = firstChooseEle.text() + secondChooseEle.text() + $(this).text();

              self.modalClose();
              resultBack(result);
              callback(self.$element);
            });
          });
          break;

        default:
          throw new Error('\u5C1A\u672A\u914D\u7F6E\u5217\u6570\u4E3A ' + columns + ' \u7684\u529F\u80FD\uFF01');
      }

      /**
       * 头部第一列点击事件
       */
      firstChooseEle.click(function () {
        self.chooseListHtml(data);

        firstChooseEle.addClass('active');

        secondChooseEle.removeClass('active').text('请选择').parent().addClass('hide');

        lastChooseEle.removeClass('active').parent().addClass('hide');
      });

      /**
       * 头部第二列点击事件
       */
      secondChooseEle.click(function () {
        self.secondChooseHtml(childs);

        firstChooseEle.removeClass('active');

        secondChooseEle.addClass('active').parent().removeClass('hide');

        lastChooseEle.removeClass('active').parent().addClass('hide');
      });
    });
  };

  /**
   * 生成二级子类选择列
   * @param {为二级子类数组的下标} num
   * @param {为dom选择器} _this
   */
  ModalPopup.prototype.secondChooseHtml = function (num, _this) {
    var self = this;
    var data = self.options.data;

    var firstChooseEle = $('#firstChoose');
    var secondChooseEle = $('#secondChoose');

    firstChooseEle.text(!_this ? firstChooseEle.text() : _this.text()).removeClass('active'); //赋值

    secondChooseEle.addClass('active').parent().removeClass('hide');

    if (!data[num][self.keyVal[2]]) return;

    self.chooseListHtml(data[num][self.keyVal[2]], 'choose-child-items');
  };

  //关闭弹窗
  ModalPopup.prototype.modalClose = function () {
    $('.modal-mask').fadeOut(function () {
      $(this).remove();
    });

    this.goTop();
  };

  //弹窗定位禁止背景滚动
  ModalPopup.prototype.bodyFlex = function () {
    $('body').css({ top: '-' + Number($(window).scrollTop()) + 'px' }).addClass('bodyFlex');
  };

  // 弹窗定位还原
  ModalPopup.prototype.goTop = function () {
    var toTop = 0;

    toTop = -$('body').position().top;
    $('html,body').removeClass('bodyFlex').scrollTop(toTop);
  };

  $.fn.modalPopup = function (options) {
    if (!options.data.length) {
      throw new Error('接收data参数为数组类型！');
    } else {
      var modalOpen = new ModalPopup(this, options);
      modalOpen.createHtmlDom();
    }
  };
})(jQuery, window);

//调用实例
// $(document).modalPopup({
//   title:'贷款目的',
//   data:provinces(3),
//   columns:3
// }
// )