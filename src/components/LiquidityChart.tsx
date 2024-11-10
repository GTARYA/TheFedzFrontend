import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const LiquidityChart = ({ tickLower, tickUpper, tickSpacing, onTickChange }) => {
  const svgRef = useRef();
  const containerRef = useRef();

  const [dimensions, setDimensions] = useState({ width: 800, height: 300 });
  const [zoomLevel, setZoomLevel] = useState(1);


  useEffect(() => {
    const updateDimensions = () => {
      const width = svgRef.current.clientWidth;
      setDimensions({ width, height: width / 2.4 });
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    if (!dimensions.width) return;

  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  const margin = { top: 20, right: 20, bottom: 50, left: 20 }; // Increased bottom margin
  const width = dimensions.width - margin.left - margin.right;
  const height = dimensions.height - margin.top - margin.bottom;
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const minTick = Math.min(tickLower, tickUpper) - tickSpacing * 10;
  const maxTick = Math.max(tickLower, tickUpper) + tickSpacing * 10;
  const data = d3.range(minTick, maxTick, tickSpacing).map(tick => ({
    tick,
    liquidity: Math.random() * 100
  }));

  const x = d3.scaleLinear()
    .domain([minTick, maxTick])
    .range([0, width]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.liquidity)])
    .range([height, 0]);

  const area = d3.area()
    .x(d => x(d.tick))
    .y0(height)
    .y1(d => y(d.liquidity));

  g.append("path")
    .datum(data)
    .attr("fill", "steelblue")
    .attr("d", area);

  // Modified x-axis
  const xAxis = d3.axisBottom(x)
  .tickFormat(d => d.toFixed(0))
  .tickValues(d3.range(minTick, maxTick, tickSpacing * 5)); // Display fewer ticks

  g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
    .attr("y", 10)
    .attr("x", 9)
    .attr("dy", ".35em")
    .attr("transform", "rotate(45)")
    .style("text-anchor", "start");

  


    const drawTickSelector = (initialTick, color, type) => {
  let tick = initialTick;

  const tickGroup = g.append("g");

  const tickLine = tickGroup.append("line")
    .attr("x1", x(tick))
    .attr("x2", x(tick))
    .attr("y1", 0)
    .attr("y2", height)
    .attr("stroke", color)
    .attr("stroke-width", 2);

  const tickHandle = tickGroup.append("rect")
    .attr("x", x(tick) - 5)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 20)
    .attr("fill", color)
    .style("cursor", "ew-resize");

  const drag = d3.drag()
    .on("start", (event) => {
      tickHandle.raise();
    })
    .on("drag", (event) => {
      const svgNode = svg.node();
      const svgRect = svgNode.getBoundingClientRect();
      const mouseX = event.sourceEvent.clientX - svgRect.left - margin.left;
      
      // Move the selector to the mouse position without snapping
      const newX = Math.max(0, Math.min(width, mouseX));
      tickLine.attr("x1", newX).attr("x2", newX);
      tickHandle.attr("x", newX - 5);
    })
    .on("end", (event) => {
      const svgNode = svg.node();
      const svgRect = svgNode.getBoundingClientRect();
      const mouseX = event.sourceEvent.clientX - svgRect.left - margin.left;
      
      let newTick = Math.round(x.invert(mouseX) / tickSpacing) * tickSpacing;
      // Ensure newTick is within the domain of x scale
      newTick = Math.max(x.domain()[0], Math.min(x.domain()[1], newTick));

      // Ensure tickLower is never above tickUpper
      if (type === 'lower' && newTick >= tickUpper) {
        newTick = tickUpper - tickSpacing;
      } else if (type === 'upper' && newTick <= tickLower) {
        newTick = tickLower + tickSpacing;
      }

      const finalX = x(newTick);
      tickLine.attr("x1", finalX).attr("x2", finalX);
      tickHandle.attr("x", finalX - 5);
      onTickChange(type, newTick);
      tick = newTick;
    });

  tickHandle.call(drag);
};







drawTickSelector(tickLower, "red", 'lower');
drawTickSelector(tickUpper, "green", 'upper');

  }, [dimensions, tickLower, tickUpper, tickSpacing, onTickChange]);

  return (
    <div ref={containerRef} className="w-full card">
        <svg ref={svgRef} width="100%" height={dimensions.height} className='card-body flex flex-col'></svg>
    </div>
  );
};

export default LiquidityChart;
