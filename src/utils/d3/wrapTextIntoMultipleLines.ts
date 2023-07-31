import * as d3 from 'd3';

// Helper function to wrap long text strings into multiple lines
const wrapTextIntoMultipleLines = (
  text: d3.Selection<any, any, any, any>,
  breakWidth: number
) => {
  const lineHeight = 1.2; // Set the line height to a fixed value
  const words = text.text().split(/\s+/).reverse();
  let line: string[] = [];
  let lineNumber = 0;
  const y = text.attr('y');
  const dy = parseFloat(text.attr('dy')) || 0;
  let tspan = text
    .text(null)
    .append('tspan')
    .attr('x', 0)
    .attr('y', y)
    .attr('dy', `${lineNumber * lineHeight + dy}px`);
  let word = words.pop();
  while (word) {
    line.push(word);
    tspan.text(line.join(' '));
    if (tspan.node()!.getComputedTextLength() > breakWidth) {
      line.pop();
      tspan.text(line.join(' '));
      line = [word];
      lineNumber += 1;
      tspan = text
        .append('tspan')
        .attr('x', 0)
        .attr('y', y)
        .attr('dy', `${lineNumber * lineHeight + dy}px`)
        .text(word);
    }
    word = words.pop();
  }
};

export default wrapTextIntoMultipleLines;
