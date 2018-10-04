import d3 from 'd3';
import React from 'react';
import { PolygonLayer } from 'deck.gl';
import { flatten } from 'lodash';
import DeckGLContainer from './../DeckGLContainer';
import { commonLayerProps, fitViewport } from './common';
import { colorScalerFactory } from '../../../modules/colors';
import sandboxedEval from '../../../modules/sandbox';
import createAdaptor from '../createAdaptor';

function getPoints(features) {
  return flatten(features.map(d => d.polygon), true);
}

function getLayer(formData, payload, onAddFilter, onTooltip) {
  const fd = formData;
  const fc = fd.fill_color_picker;
  const sc = fd.stroke_color_picker;
  let data = [...payload.data.features];
  const mainMetric = payload.data.metricLabels.length ? payload.data.metricLabels[0] :  null;

  let colorScaler;
  if (mainMetric) {
    const ext = d3.extent(data, d => d[mainMetric]);
    const scaler = colorScalerFactory(fd.linear_color_scheme, null, null, ext, true);
    colorScaler = (d) => {
      const c = scaler(d[mainMetric]);
      c[3] = (fd.opacity / 100.0) * 255;
      return c;
    };
  }

  if (fd.js_data_mutator) {
    // Applying user defined data mutator if defined
    const jsFnMutator = sandboxedEval(fd.js_data_mutator);
    data = jsFnMutator(data);
  }

  return new PolygonLayer({
    id: `path-layer-${fd.slice_id}`,
    data,
    filled: fd.filled,
    stroked: fd.stroked,
    getFillColor: colorScaler || [fc.r, fc.g, fc.b, 255 * fc.a],
    getLineColor: [sc.r, sc.g, sc.b, 255 * sc.a],
    getLineWidth: fd.line_width,
    extruded: fd.extruded,
    fp64: true,
    ...commonLayerProps(fd, onAddFilter, onTooltip),
  });
}

function deckPolygon(props) {
  const {
    formData,
    payload,
    setControlValue,
    onAddFilter,
    onTooltip,
    viewport: originalViewport,
  } = props;

  const viewport = formData.autozoom
    ? fitViewport(originalViewport, getPoints(payload.data.features))
    : originalViewport;

  const layer = getLayer(formData, payload, onAddFilter, onTooltip);

  return (
    <DeckGLContainer
      mapboxApiAccessToken={payload.data.mapboxApiKey}
      viewport={viewport}
      layers={[layer]}
      mapStyle={formData.mapbox_style}
      setControlValue={setControlValue}
    />
  );
}

// function deckPolygon(slice, payload, setControlValue) {
//   const layer = getLayer(slice.formData, payload, slice);
//   const fd = slice.formData;
//   let viewport = {
//     ...slice.formData.viewport,
//     width: slice.width(),
//     height: slice.height(),
//   };

//   if (fd.autozoom) {
//     viewport = fitViewport(viewport, getPoints(payload.data.features));
//   }

//   ReactDOM.render(
//     <DeckGLContainer
//       mapboxApiAccessToken={payload.data.mapboxApiKey}
//       viewport={viewport}
//       layers={[layer]}
//       mapStyle={slice.formData.mapbox_style}
//       setControlValue={setControlValue}
//     />,
//     document.getElementById(slice.containerId),
//   );
// }

module.exports = {
  default: createAdaptor(deckPolygon),
  getLayer,
};
