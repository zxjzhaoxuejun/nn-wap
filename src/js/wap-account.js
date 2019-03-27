($ => {
  class MessageModel {
    constructor(opt) {
      this.defaults = {
        time: true,
        content: "内容",
        icon: "",
        callback: function() {}
      };
      this.options = $.extend({}, this.defaults, opt || {});
    }

    createHtml() {
      //创建DOM
      let self = this;
      const { time, content, icon } = self.options;
      const html = `<div class="msg-mode">
                    <div class="msg-bg ${time ? "hide" : "show"}"></div>
                    <div class="msg-con">
                      <div class="msg-body ${time ? "msg-body-bg" : ""}">
                        <div class="msg-close ${time ? "hide" : "show"}"></div>
                        <div class="msg-info ${
                          time ? "show-text" : "hide-text"
                        }">
                        <div class="msg-icon ${icon ? icon : ""}"></div>
                        <div class="">${content}</div>
                        </div>
                      </div>
                    </div>
                    </div>`;
      $(html).appendTo("body");
      time ? self.setTimeoutFn() : "";
      $(".msg-close").click(function() {
        self.close();
      });
    }

    close() {
      //关闭弹窗
      $(".msg-mode").fadeOut(function() {
        $(this).remove();
      });
    }

    setTimeoutFn() {
      setTimeout(() => {
        this.close();
      }, 1500);
    }
  }

  $.fn.messageModel = function(options) {
    if (!options) {
      throw new Error("接收参数不能为空！");
    } else {
      let msg = new MessageModel(options);
      msg.createHtml();
    }
  };

  $(".choose").click(function() {
    $(this).modalPopup({
      title: "省市区选择",
      data: provinces(3),
      columns: 3
    });
  });
})(jQuery);
