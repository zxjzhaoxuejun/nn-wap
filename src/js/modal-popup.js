(function($, window) {
  //ModalPopup构造函数
  const ModalPopup = function(ele, opt) {
    var self = this;

    this.$element = ele;

    this.defaults = {
      title: '标题',
      data: [],
      columns: 1,
      result: {
        name: '',
        value: '',
      },
      resultBack:function(res){
        self.$element.val(res.name);
        self.$element.attr('data-num', res.value);
      },
      callback: function() {
        
      },
    };

    this.options = $.extend({}, this.defaults, opt || {});
    this.keyVal = getKey();

    function getKey() {
      let keyString = [];
      for (var key in self.options.data[0]) {
        keyString.push(key);
      }
      return keyString;
    }
  };

  ModalPopup.prototype.createHtmlDom = function() {
    const self = this;

    //弹窗DOM结构
    const htmlDom = `<div class="modal-mask">
        <div class="modal-bg"></div>
        <div class="modal-body">
          <div class="modal-header"> 
            <div class="modal-title">${self.options.title}</div>
            <div class="modal-close"></div>
          </div>
          <div class="choose-answer">
            <span class="choose-answer-items ${
              self.options.columns == 1 || !self.options.columns
                ? 'one-list'
                : ''
            }"><span class="active" id="firstChoose">请选择</span></span>
            <span class="choose-answer-items hide"><span id="secondChoose">请选择</span></span>
            <span class="choose-answer-items hide"><span id="lastChoose">请选择</span></span>
          </div>
          <div class="choose-lists"></div>
        </div>
      </div>`;

    //添加DOM结构
    $(htmlDom).appendTo('body');
    $('.modal-mask').fadeIn();

    self.chooseListHtml(self.options.data, 'choose-items');
    self.columnsClick();
    self.bodyFlex();

    $('.modal-close').click(function() {
      self.modalClose();
    });
  };
  /**
   * 生成选择项列表html
   * @param {数据列表} arrJson
   * @param {生成列表的class名} className
   */
  ModalPopup.prototype.chooseListHtml = function(arrJson, className) {
    const self = this;
    const createHtml = arrJson
      .map(items => {
        return `<div class="${
          !className ? 'choose-items' : className
        }" value="${items[self.keyVal[0]]}">${items[self.keyVal[1]]}</div>`;
      })
      .join('');

    $('.choose-lists')
      .children()
      .remove();

    $('.choose-lists').append(createHtml);
  };

  //子类选择
  ModalPopup.prototype.columnsClick = function() {
    const self = this;
    const firstChooseEle = $('#firstChoose');
    const secondChooseEle = $('#secondChoose');
    const lastChooseEle = $('#lastChoose');
    const { columns, result, callback, data,resultBack } = self.options;

    $('.choose-lists').on('click', '.choose-items', function() {
      const childs = $(this).index();

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
          $('.choose-child-items').click(function() {
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
          $('.choose-lists').on('click', '.choose-child-items', function() {
            const lastIndex = $(this).index();
            if (lastIndex == -1) return;
            secondChooseEle.removeClass('active').text($(this).text());

            lastChooseEle
              .addClass('active')
              .parent()
              .removeClass('hide');

            self.chooseListHtml(
              data[childs][self.keyVal[2]][lastIndex][self.keyVal[2]],
              'choose-last-items'
            );

            $('.choose-last-items').click(function() {
              $('.val').text(
                firstChooseEle.text() + secondChooseEle.text() + $(this).text()
              );

              result.value = $(this).attr('value');

              result.name =
                firstChooseEle.text() + secondChooseEle.text() + $(this).text();

              self.modalClose();
              resultBack(result);
              callback(self.$element);
            });
          });
          break;

        default:
          throw new Error(`尚未配置列数为 ${columns} 的功能！`);
      }

      /**
       * 头部第一列点击事件
       */
      firstChooseEle.click(function() {
        self.chooseListHtml(data);

        firstChooseEle.addClass('active');

        secondChooseEle
          .removeClass('active')
          .text('请选择')
          .parent()
          .addClass('hide');

        lastChooseEle
          .removeClass('active')
          .parent()
          .addClass('hide');
      });

      /**
       * 头部第二列点击事件
       */
      secondChooseEle.click(function() {
        self.secondChooseHtml(childs);

        firstChooseEle.removeClass('active');

        secondChooseEle
          .addClass('active')
          .parent()
          .removeClass('hide');

        lastChooseEle
          .removeClass('active')
          .parent()
          .addClass('hide');
      });
    });
  };

  /**
   * 生成二级子类选择列
   * @param {为二级子类数组的下标} num
   * @param {为dom选择器} _this
   */
  ModalPopup.prototype.secondChooseHtml = function(num, _this) {
    const self = this;
    const { data } = self.options;
    let firstChooseEle = $('#firstChoose');
    let secondChooseEle = $('#secondChoose');

    firstChooseEle
      .text(!_this ? firstChooseEle.text() : _this.text())
      .removeClass('active'); //赋值

    secondChooseEle
      .addClass('active')
      .parent()
      .removeClass('hide');

    if (!data[num][self.keyVal[2]]) return;

    self.chooseListHtml(data[num][self.keyVal[2]], 'choose-child-items');
  };

  //关闭弹窗
  ModalPopup.prototype.modalClose = function() {
    $('.modal-mask').fadeOut(function() {
      $(this).remove();
    });

    this.goTop();
  };

  //弹窗定位禁止背景滚动
  ModalPopup.prototype.bodyFlex = function() {
    $('body')
      .css({ top: '-' + Number($(window).scrollTop()) + 'px' })
      .addClass('bodyFlex');
  };

  // 弹窗定位还原
  ModalPopup.prototype.goTop = function() {
    let toTop = 0;

    toTop = -$('body').position().top;
    $('html,body')
      .removeClass('bodyFlex')
      .scrollTop(toTop);
  };

  $.fn.modalPopup = function(options) {
    if (!options.data.length) {
      throw new Error('接收data参数为数组类型！');
    } else {
      let modalOpen = new ModalPopup(this, options);
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
