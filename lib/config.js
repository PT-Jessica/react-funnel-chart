'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fontHeight = 10;

var getOffsetPixel = exports.getOffsetPixel = function getOffsetPixel(width, height) {
  var totalRatio = 1;
  // 绘图比例
  var drawRatioW = 0.5;
  var drawRatioH = 0.7;
  return {
    w: width * drawRatioW,
    h: height * drawRatioH,
    x: width * ((totalRatio - drawRatioW) / 2),
    y: height * ((totalRatio - drawRatioH) / 2),
    size: width / 10
  };
};

var getLineCoord = function getLineCoord(percent, maxWidth) {
  var divide = (1 - percent) / 2;
  return [maxWidth * divide, maxWidth * (percent + divide)];
};

var computedCoord = function computedCoord(_ref) {
  var topLineCoord = _ref.topLineCoord,
      bottomLineCoord = _ref.bottomLineCoord,
      distance = _ref.distance,
      maxHeight = _ref.maxHeight,
      offset = _ref.offset;
  var x = offset.x,
      y = offset.y;

  return _.flattenDeep([topLineCoord, bottomLineCoord.slice().reverse()]).map(function (value, ind) {
    if (ind <= 1) {
      return [value + x, distance + y];
    }
    return [value + x, distance + maxHeight + y];
  });
};

var generateListObject = exports.generateListObject = function generateListObject(_ref2) {
  var list = _ref2.list,
      offset = _ref2.offset,
      gap = _ref2.gap;

  var copyList = list.map(function (item) {
    return Object.assign({}, item, { value: parseFloat(item.value) || 0 });
  });
  var w = offset.w,
      h = offset.h,
      x = offset.x,
      y = offset.y,
      size = offset.size;

  var coordList = [];
  var leftTextList = [];
  var leftLineList = [];
  var rightTextList = [];
  var rightLineList = [];
  var centerTextList = [];
  var fillStyleList = [];

  var maxValue = _.max(_.map(copyList, 'value'));
  var len = _.size(copyList);
  // 满足当前需求
  var gapValue = len - 2 < 0 ? 0 : len - 2; // len - 1
  var lenValue = len <= 1 ? 1 : len - 1; // len
  var maxHeight = (h - gapValue * gap) / lenValue;
  // 排序从大到小，目前暂不需要
  // const sortList = _.sortBy(copyList, 'value').reverse();

  copyList.forEach(function (item, index, array) {
    var currentValue = item.value || 0;
    var after = array[index + 1] || {};
    var afeterValue = after.value || 0;
    var topPercent = currentValue / maxValue;
    var bottomPercent = afeterValue / maxValue;
    var distance = maxHeight * index + gap * index;

    var topLineCoord = getLineCoord(topPercent, w);
    var bottomLineCoord = getLineCoord(bottomPercent, w);
    if (len === 1 || index < len - 1) {
      coordList.push(computedCoord({ topLineCoord: topLineCoord, bottomLineCoord: bottomLineCoord, distance: distance, maxHeight: maxHeight, offset: offset }));
      fillStyleList.push(item.backgroundColor);
      if (len > 1) {
        var leftX = x - size * 1;
        var leftTextY = distance + y + maxHeight / 2 + fontHeight - 1;
        var tateText = '\u8F6C\u5316\u7387 ' + (bottomPercent / topPercent * 100).toFixed(2) + '%';
        leftTextList.push([tateText, leftX, leftTextY]);
        leftLineList.push({
          x1: leftX + 10,
          x2: topLineCoord[0] + x + (bottomLineCoord[0] - topLineCoord[0]) / 2
        });
      }
    }
    var rightX = w + x + size * 1;
    var rightTextY = distance + y + fontHeight - 1;
    centerTextList.push([item.label || item.value, w / 2 + x, rightTextY + fontHeight * 2]);

    rightTextList.push([item.name, rightX, rightTextY]);
    rightLineList.push({
      x1: topLineCoord[1] + x,
      x2: rightX - 10
    });
  });
  return { coordList: coordList, leftTextList: leftTextList, rightTextList: rightTextList, leftLineList: leftLineList, rightLineList: rightLineList, centerTextList: centerTextList, fillStyleList: fillStyleList };
};

var rayCasting = function rayCasting(p, poly) {
  var px = p.x;
  var py = p.y;
  var flag = false;
  var len = poly.length;

  for (var i = 0, j = len - 1; i < len; j = i, i += 1) {
    var sx = poly[i].x;
    var sy = poly[i].y;
    var tx = poly[j].x;
    var ty = poly[j].y;

    if (sx === px && sy === py || tx === px && ty === py) return true;
    if (sy < py && ty >= py || sy >= py && ty < py) {
      var x = sx + (py - sy) * (tx - sx) / (ty - sy);
      if (x === px) return true;
      if (x > px) flag = !flag;
    }
  }
  return !!flag;
};

var inWitchArea = exports.inWitchArea = function inWitchArea(_ref3) {
  var coordList = _ref3.coordList,
      eventPosition = _ref3.eventPosition;

  if (!eventPosition) return null;
  var x = eventPosition.x * 2;
  var y = eventPosition.y * 2;
  var ind = null;
  coordList.forEach(function (item, index) {
    var poly = item.map(function (coord) {
      return {
        x: coord[0],
        y: coord[1]
      };
    });
    var flag = rayCasting({ x: x, y: y }, poly);

    if (flag) ind = index;
  });
  return ind;
};