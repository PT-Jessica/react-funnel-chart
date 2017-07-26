'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactChartCanvas = require('react-chart-canvas');

var _reactChartCanvas2 = _interopRequireDefault(_reactChartCanvas);

var _funnel = require('./funnel');

var _funnel2 = _interopRequireDefault(_funnel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var FunnelChart = function FunnelChart(props) {
  return React.createElement(_reactChartCanvas2.default, _extends({ Chart: _funnel2.default }, props));
};

exports.default = FunnelChart;