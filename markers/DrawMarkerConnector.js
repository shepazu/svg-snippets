/*
Draws a connector line between two points, with scaling markers at start (dot) and end (self-orienting arrow). Assumes this is being called from an SVG file (with *.html file extension) or an HTML file with an existing SVG element.

Parameters:
data: an array of object with the following optional keys:
- x1:
- y1:
- x2:
- y2:
- color: fill and stroke color of the line and markers
- width: stroke-width of the line
- container: SVG DOM element where the line is going to be drawn

container: SVG DOM element where the lines is going to be drawn
*/
export class DrawMarkerConnector {
  constructor(data, container) {
    this.svgns = `http://www.w3.org/2000/svg`;
    this.data = data;
    this.container = container;

    this.init()
  }

  init () {
    this.create_markers();
    this.draw_lines();
  }

  normalize_id ( id ) {
    // remove all characters not allowed in id values
    return id.replace(/^[^a-z]+|[^\w:.-]+/gi, ``);
  }

  create_markers () {
    let defs = document.createElementNS(this.svgns, `defs`);
    defs.id = `markers`;
    this.container.prepend(defs);

    this.data.forEach((line) => {
      let color = line.color || `hsl(0, 0%, 20%)`;
      const id_color = this.normalize_id(color);
      // look for existing set of markers with this color, so it doesn't duplicate
      const existing_marker = document.querySelector(`[id^=marker_][id$=-${id_color}]`);
      if (!existing_marker) {
        let dot_marker = document.createElementNS(this.svgns, `marker`);
        dot_marker.id = `marker_dot-${id_color}`;
        dot_marker.setAttribute(`viewBox`, `-3 -3 6 6`);
        dot_marker.setAttribute(`markerUnits`, `strokeWidth`);
        dot_marker.setAttribute(`markerWidth`, `2.8`);
        dot_marker.setAttribute(`markerHeight`, `2.8`);
        //dot_marker.setAttribute(`stroke`, color);
        dot_marker.setAttribute(`fill`, color);

        let dot = document.createElementNS(this.svgns, `circle`);
        dot.setAttribute(`r`, 3 );
        dot_marker.appendChild(dot);

        defs.appendChild(dot_marker);

        let arrow_marker = document.createElementNS(this.svgns, `marker`);
        arrow_marker.id = `marker_arrow-${id_color}`;
        arrow_marker.setAttribute(`viewBox`, `-13 -6 37.5 30`);
        arrow_marker.setAttribute(`markerUnits`, `strokeWidth`);
        arrow_marker.setAttribute(`refX`, `-4`);
        arrow_marker.setAttribute(`refY`, `0`);
        arrow_marker.setAttribute(`markerWidth`, `10`);
        arrow_marker.setAttribute(`markerHeight`, `20`);
        arrow_marker.setAttribute(`orient`, `auto`);
        arrow_marker.setAttribute(`stroke`, color);
        arrow_marker.setAttribute(`fill`, color);

        let arrow = document.createElementNS(this.svgns, `path`);
        arrow.setAttribute(`d`, `M-10,-5 L0,0 -10,5 Z`);
        arrow.setAttribute(`stroke-linejoin`, `round`);
        arrow.setAttribute(`stroke-linecap`, `round`);
        arrow_marker.appendChild(arrow);

        defs.appendChild(arrow_marker);
      }
    });
  }

  draw_lines () {
    //  create dataline group
    this.data.forEach((line) => {
      const color = line.color || `hsl(0, 0%, 20%)`;
      const container = line.container || this.container;

      const dot_ref = this.normalize_id(`marker_dot-${color}`);
      const arrow_ref = this.normalize_id(`marker_arrow-${color}`);

      const line_el = document.createElementNS(this.svgns, `path`);
      line_el.setAttribute(`d`, `M${line.x1 || 0},${line.y1 || 0} L${line.x2 || 0},${line.y2 || 0}`);
      line_el.setAttribute(`marker-start`, `url(#${dot_ref})`);
      line_el.setAttribute(`marker-end`, `url(#${arrow_ref})`);
      line_el.setAttribute(`stroke`, color);
      line_el.setAttribute(`stroke-width`, (line.width || 2));
      line_el.setAttribute(`stroke-linejoin`, `round`);
      line_el.setAttribute(`stroke-linecap`, `round`);
      line_el.setAttribute(`fill`, `none`);
      container.appendChild(line_el);
    });
  }
}
