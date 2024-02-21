import "./App.css";

import { useMemo, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import * as highchartsSankey from "highcharts/modules/sankey";

import { client, useConfig, useElementData, useElementColumns } from "@sigmacomputing/plugin";

highchartsSankey(Highcharts);

client.config.configureEditorPanel([
  { name: "source", type: "element" },
  { name: "scatters", type: "column", source: "source", allowMultiple: true },
  { name: "lines", type: "column", source: "source", allowMultiple: true }
]);

function App() {
  const config = useConfig();
  const sigmaData = useElementData(config.source);
  const sigmaColumns = useElementColumns(config.source);
  const ref = useRef();
  const options = useMemo(() => {
    const scatterColumns = config.scatters;
    const lineColumns = config.lines;

    // scatter: create object with array of arrays for each scatter column 
    let scatterObj = {};
    for (let i = 0; i < scatterColumns.length; i++) {
      try {
        let columnValues = sigmaData[scatterColumns[i]];
        let key = sigmaColumns[scatterColumns[i]].name; // Key corresponds to the line column name
        scatterObj[key] = []
        for (let j = 0; j < columnValues.length; j++) {
          if (columnValues[j]) {
            let point = JSON.parse(columnValues[j]);
            scatterObj[key].push(point);
          }
        }
      } catch {
        return null
      }
    }
    // console.log(scatterObj)

    // line: create object with array of arrays for each line column 
    let lineObj = {};
    for (let i = 0; i < lineColumns.length; i++) {
      try {
        let columnValues = sigmaData[lineColumns[i]];
        let key = sigmaColumns[lineColumns[i]].name; // Key corresponds to the line column name
        lineObj[key] = []
        for (let j = 0; j < columnValues.length; j++) {
          // Check if columnValues[j] is not null before parsing
          if (columnValues[j]) {
            let point = JSON.parse(columnValues[j]);
            lineObj[key].push(point);
          }
        }
      } catch {
        return null
      }
    }
    // console.log(lineObj)


    // Build series for highcharts plot
    let series = [];

    for (let key in scatterObj) {
      let dataObj = {
        type: 'scatter',
        name: key,
        data: scatterObj[key],
        marker: { radius: 6 }
      };
      series.push(dataObj);
    }

    for (let key in lineObj) {
      let dataObj = {
        type: 'line',
        name: key,
        data: lineObj[key],
        enableMouseTracking: false,
      };
      series.push(dataObj);
    }
    // console.log(series);

    const options = {
      title: {
          text: 'Bernard Chart'
      },
      xAxis: {
          min: 0
      },
      yAxis: {
          min: 0
      },
      legend:{ enabled:false },
      chart: {
          backgroundColor: 'rgba(0,0,0,0)',
      },
      plotOptions: { 
        series: { 
          states: { inactive: { opacity: 1 } },
          animation: false 
        } 
      },
      series: series
    };
    return options;

  }, [config, sigmaData]);


if (sigmaData) {
  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} ref={ref} />
    </div>
  );
} else {
  return null
}

}

export default App;