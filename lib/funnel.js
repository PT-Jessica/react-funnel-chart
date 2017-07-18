'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _colorConversionRgb = require('color-conversion-rgb');

var _config = require('./config');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
* props: {
    list: [
      { name: 'Q1', value: 500, backgroundColor: '', ... },
      { name: 'Q2', value: 400, backgroundColor: '' },
      { name: 'Q3', value: 300, backgroundColor: '' },
      { name: 'Q4', value: 200, backgroundColor: '' },
    ],
    isGradient: false,
    labelStyle: '#333',
    dataStyle: '#000',
    strokeStyle: '#000',
    tooltipStyle: {},
    minPercent: 0.2,
* }
*/

var Funnel = function Funnel(props) {
  _classCallCheck(this, Funnel);

  _initialiseProps.call(this);

  this.setValue(props);
};

var _initialiseProps = function _initialiseProps() {
  var _this = this;

  this.setValue = function () {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _this.labelStyle = props.labelStyle || _this.labelStyle || '#333';
    _this.dataStyle = props.dataStyle || _this.dataStyle || '#000';
    _this.strokeStyle = props.strokeStyle || _this.strokeStyle || '#000';
    if (_this.isGradient === undefined) {
      _this.isGradient = props.isGradient === undefined ? false : props.isGradient;
    } else {
      _this.isGradient = props.isGradient === undefined ? _this.isGradient : props.isGradient;
    }

    _this.ratio = props.ratio || _this.ratio || 1;
    _this.list = props.list || _this.list || [];
    _this.gap = props.gap || _this.gap || 2;
    _this.width = props.width || _this.width || 250;
    _this.height = props.height || _this.height || 250;
    _this.fontSize = props.fontSize || _this.fontSize || 12;
    _this.minPercent = props.minPercent || _this.minPercent || 0.2;
    // 事件
    _this.eventPosition = props.eventPosition;
    _this.event = props.event;
    // generate
    _this.offset = (0, _config.getOffsetPixel)(_this.width, _this.height);
    _this.hasText = _this.width > 600;
    var object = (0, _config.generateListObject)({ list: _this.list, offset: _this.offset, gap: _this.gap, minPercent: _this.minPercent });

    _this.coordList = object.coordList;
    _this.leftTextList = object.leftTextList;
    _this.leftLineList = object.leftLineList;
    _this.rightTextList = object.rightTextList;
    _this.rightLineList = object.rightLineList;
    _this.centerTextList = object.centerTextList;
    _this.fillStyleList = object.fillStyleList;
  };

  this.update = function (props, ctx) {
    _this.setValue(props);
    _this.currentArea = (0, _config.inWitchArea)({
      coordList: _this.coordList,
      eventPosition: _this.eventPosition,
      offset: _this.offset,
      ctx: ctx
    });
    _this.draw(ctx);
    var item = _this.list[_this.currentArea];
    if (item) {
      var nextItem = _this.list[+_this.currentArea + 1] || {};
      var rateText = _.get(_this.leftTextList[_this.currentArea] || [], ['0'], '转化率 0%');
      return Object.assign({ rateText: rateText, nextItem: nextItem }, item);
    }
    return null;
  };

  this.getTextWidth = function (ctx, fillX, direction) {
    return function (text) {
      var _ctx$measureText = ctx.measureText(text),
          width = _ctx$measureText.width;

      if (direction === 'start') {
        return width + fillX > _this.width;
      }
      return fillX - width < 0;
    };
  };

  this.computedDrawText = function (ctx, param, direction) {
    // 文字的宽度是否超出canvas
    var fillText = param[0];
    var fillX = param[1];
    var fillY = param[2];
    var curryGetTextWidth = _this.getTextWidth(ctx, fillX, direction);
    var textList = [];
    if (direction === 'end') {
      var isExceed = curryGetTextWidth(fillText);
      if (isExceed) {
        textList = fillText.split(' ');
        if (_.size(textList) < 1) {
          textList = (0, _config.getTextList)(fillText, curryGetTextWidth);
        }
      } else {
        textList.push(fillText);
      }
    } else {
      textList = (0, _config.getTextList)(fillText, curryGetTextWidth);
    }
    var size = _.size(textList);
    if (size > 1) {
      fillY -= 10 * size;
    }
    textList.forEach(function (value, index) {
      ctx.fillText(value, fillX, fillY + index * 25);
    });
  };

  this.drawText = function (ctx) {
    var realFontSize = _this.fontSize * _this.ratio;
    var lineWidth = 2;
    ctx.font = realFontSize + 'px Helvetica Neue For Number';
    ctx.fillStyle = _this.labelStyle;
    ctx.strokeStyle = _this.strokeStyle;
    ctx.lineWidth = lineWidth;

    if (_this.hasText) {
      ctx.textAlign = 'start';
      var rightLen = _.size(_this.rightTextList);
      _this.rightTextList.forEach(function (param, index) {
        var initY = param[2] - 10;
        // 额外计算两图表之间的缝隙
        var y = rightLen === 1 ? initY + lineWidth : index === rightLen - 1 ? initY - lineWidth : initY + lineWidth;
        var coordX = _this.rightLineList[index];
        ctx.beginPath();
        ctx.moveTo(coordX.x1, y);
        ctx.lineTo(coordX.x2, y);
        ctx.stroke();
        ctx.closePath();

        _this.computedDrawText(ctx, param, ctx.textAlign);
      });

      ctx.textAlign = 'end';
      _this.leftTextList.forEach(function (param, index) {
        var initY = param[2] - 10;
        var y = initY + lineWidth / 2;
        var coordX = _this.leftLineList[index];
        ctx.beginPath();
        ctx.moveTo(coordX.x1, y);
        ctx.lineTo(coordX.x2, y);
        ctx.stroke();
        ctx.closePath();

        _this.computedDrawText(ctx, param, ctx.textAlign);
      });
    }

    ctx.textAlign = 'center';
    _this.centerTextList.forEach(function (param, index) {
      if (index === _this.currentArea) {
        ctx.fillStyle = '#fff';
      } else {
        ctx.fillStyle = _this.dataStyle;
      }
      ctx.fillText.apply(ctx, _toConsumableArray(param));
    });
  };

  this.drawFunnel = function (ctx) {
    ctx.translate(0, 0);
    ctx.clearRect(0, 0, _this.width, _this.height);
    _this.coordList.forEach(function (item, index) {
      ctx.beginPath();
      var start = void 0;
      var end = void 0;
      item.forEach(function (param, ind) {
        if (ind === 0) {
          ctx.moveTo.apply(ctx, _toConsumableArray(param));
          start = param[1];
        } else {
          ctx.lineTo.apply(ctx, _toConsumableArray(param));
          end = param[1];
        }
      });
      var color = _this.fillStyleList[index];
      if (index === _this.currentArea) {
        ctx.fillStyle = (0, _colorConversionRgb.getHoverRgbColor)(color);
      } else if (_this.isGradient) {
        var gradient = ctx.createLinearGradient(0, start, 0, end);
        gradient.addColorStop('0', (0, _colorConversionRgb.getHoverRgbColor)(color, 1));
        gradient.addColorStop('1', (0, _colorConversionRgb.getHoverRgbColor)(color, 0.2));
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = color;
      }
      ctx.closePath();
      ctx.fill();
    });
  };

  this.draw = function (ctx) {
    _this.drawFunnel(ctx);
    _this.drawText(ctx);
  };
};

exports.default = Funnel;