import ReactChartCanvas from 'react-chart-canvas';
import Funnel from './funnel';

const FunnelChart = (props) => {
  const tooltip = {
    show: false,
  };
  const options = Object.assign({ tooltip }, props);
  return <ReactChartCanvas Chart={Funnel} {...options}/>;
};

export default FunnelChart;
