// OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// (4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const d3 = require('d3');
import geometryHelpers from './../../store/modules/geometry/helpers.js'
import modelHelpers from './../../store/modules/models/helpers.js'

export default {
    // ****************** USER INTERACTION EVENTS ****************** //
    /*
    * adds the 'highlight' class to the snapTarget for a mousemove event
    * called on mousemove events
    */
    highlightSnapTarget (e) {
        // unhighlight expired snap targets
        d3.selectAll('#grid .highlight, #grid .gridpoint').remove();

        if (!this.currentSpace && !this.currentShading) { return; }

        const point = this.getEventRWU(e);

        var snapTarget = this.findSnapTarget(point);

        if (snapTarget && snapTarget.snappingEdge) {
            d3.select('#grid svg')
                .append('line')
                .attr('x1', snapTarget.snappingEdgeV1.x)
                .attr('y1', snapTarget.snappingEdgeV1.y)
                .attr('x2', snapTarget.snappingEdgeV2.x)
                .attr('y2', snapTarget.snappingEdgeV2.y)
                .attr('stroke-width', 1)
                .classed('highlight', true)
                .attr('vector-effect', 'non-scaling-stroke');

            snapTarget = snapTarget.scalar;
        }

        if (snapTarget) {
            d3.select('#grid svg')
                .append('ellipse')
                .attr('cx', snapTarget.x)
                .attr('cy', snapTarget.y)
                .attr('rx', this.calcRadius(5, 'x'))
                .attr('ry', this.calcRadius(5, 'y'))
                .classed('highlight', true)
                .attr('vector-effect', 'non-scaling-stroke');
        } else if (!snapTarget && this.gridVisible) {
            // calculate an offset for the gridlines based on the viewbox min_x and min_y
            const xAdjustment = this.min_x % this.x_spacing,
                yAdjustment = this.min_y % this.y_spacing;

            // round point RWU coordinates to nearest gridline
            snapTarget = {
                type: 'vertex',
                x: round(point.x - xAdjustment, this.x_spacing) + xAdjustment,
                y: round(point.y - yAdjustment, this.y_spacing) + yAdjustment
            };

            d3.select('#grid svg')
                .append('ellipse')
                .attr('cx', snapTarget.x)
                .attr('cy', snapTarget.y)
                .attr('rx', this.calcRadius(2, 'x'))
                .attr('ry', this.calcRadius(2, 'y'))
                .classed('gridpoint', true)
                .attr('vector-effect', 'non-scaling-stroke');
        }
        this.drawGuideLines(e, snapTarget);
    },

    /*
    * called by highlightSnapTarget on mousemove events,
    * draws guidelines connecting the snaptarget and the face being drawn depending on drawing tool
    */
    drawGuideLines (e, snapTarget) {
        if (!this.points.length) { return; }

        // remove expired guideline paths
        d3.selectAll('#grid .guideline').remove();

        var guidelinePoints, point;

        // if there is no snapTarget, just use the current mouse location
        if (snapTarget ) {
            point = snapTarget;
        } else {
            point = this.getEventRWU(e);
        }

        // determine how to complete face based on current tool
        if (this.currentTool === 'Polygon') {
            // connect last point in polygon to current mouse location/snap target with a guideline
            guidelinePoints = [point, this.points[this.points.length - 1]];

        } else if (this.currentTool === 'Rectangle' || this.currentTool === 'Eraser') {
            // infer the remaining 2 points in the rectangle based on the first point in the rectangle and the  current mouse location/snap target
            guidelinePoints = [
                this.points[0],
                { x: point.x, y: this.points[0].y },
                point,
                { x: this.points[0].x, y: point.y },
                this.points[0]
            ];
        }

        // draw guideline connecting guideline points
        d3.select('#grid svg').append('path')
            .datum(guidelinePoints)
            .attr('fill', 'none')
            .classed('guideline', true)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', d3.line()
                .x((d) => { return d.x; })
                .y((d) => { return d.y; }))
            // prevent edges from overlapping points - interferes with click events
            .lower();

        // keep grid lines under polygon edges
        d3.selectAll('.vertical, .horizontal').lower();
    },

    /*
    * create and store a RWU grid point
    * called on click events
    */
    addPoint (e) {
        if (this.isDragging) { return; }

        // if no space or shading is selected, disable drawing
        if (!this.currentSpace && !this.currentShading) { return; }

        if (this.currentTool === 'Select') {
            this.$store.dispatch('application/setCurrentSpace', { 'space': null });
            this.$store.dispatch('application/setCurrentShading', { 'shading': null });
        }

        // translate click event coordinates into RWU
        var point = this.getEventRWU(e);

        /*
        * check for snapping - if the click happened within the tolerance range of a
        * vertex: reuse that vertex on the face being created
        * edge: create a new vertex at the scalar projection from the click location to the edge,
        *     set a flag to split the edge at the new vertex
        * origin of polygon: close the polygon being drawn
        */
        const snapTarget = this.findSnapTarget(point);
        if (snapTarget) {
            if (snapTarget.type === 'vertex') {
                // if the snapTarget is the origin of the face being drawn in Polygon mode, close the face
                if (snapTarget === this.points[0] && this.currentTool === 'Polygon') {
                    // store the points in the polygon as a face
                    this.savePolygonFace();
                    return;
                }
                // data store will detect that the new point already has an id value
                // will save a reference to the existing vertex on the new face instead of creating a new vertex
                point = snapTarget;
            } else if (snapTarget.type === 'edge') {
                // create a vertex on the edge at the location closest to the mouse event (scalar projection)
                point = snapTarget.scalar;
                // mark the point so that the edge will be split during face creation
                point.splittingEdge = snapTarget.snappingEdge;
            }
        }
        // if no snapTarget was found and the grid is visible snap to the grid
        else if (this.gridVisible) {
            // calculate an offset for the gridlines based on the viewbox min_x and min_y
            const xAdjustment = this.min_x % this.x_spacing,
                yAdjustment = this.min_y % this.y_spacing;

            // round point RWU coordinates to nearest gridline
            point.x = round(point.x - xAdjustment, this.x_spacing) + xAdjustment;
            point.y = round(point.y - yAdjustment, this.y_spacing) + yAdjustment;
        }

        // if we are in polygon mode and the snapped gridpoint is within the tolerance zone of the origin of the face being drawn, close the face
        if (this.points[0] && this.currentTool === 'Polygon') {
            const distToOrigin = Math.sqrt(
                Math.pow(Math.abs(point.x - this.points[0].x), 2) +
                Math.pow(Math.abs(point.y - this.points[0].y), 2)
            );

            if (distToOrigin < this.$store.getters['project/snapTolerance']) {
                // store the points in the polygon as a face
                this.savePolygonFace();
                return;
            }
        }

        // store the point
        if (this.currentTool === 'Rectangle' || this.currentTool === 'Polygon' || this.currentTool === 'Eraser') {
            this.points.push(point);
        }

        // create a rectangular face if two points have been drawn to the grid in rectangle tool
        if ((this.currentTool === 'Rectangle' || this.currentTool === 'Eraser') && this.points.length === 2) {
            this.currentTool === 'Rectangle' ? this.saveRectuangularFace() : this.eraseRectangularSelection();
        }
    },

    // ****************** PANNING ****************** //
    panStart (e) {
        if (this.currentTool !== 'Map' && this.currentTool !== 'Pan') { return; }
        this.isDragging = false;
        this.$refs.grid.addEventListener('mouseup', this.panEnd);
        this.$refs.grid.addEventListener('mouseout', this.panEnd);
        this.$refs.grid.addEventListener('mousemove', this.panMove);
    },
    panMove (e) {
        if (this.isDragging) {
            const dx = this.originalScales.x(e.movementX),
                dy  = this.originalScales.y(e.movementY);

            this.min_x -= dx;
            this.max_x -= dx;
            this.min_y -= dy;
            this.max_y -= dy;

            this.drawGridLines();
        } else {
            this.points = [];
            this.isDragging = true;
        }
    },
    panEnd (e) {
        this.$refs.grid.removeEventListener('mousemove', this.panMove);
        this.$refs.grid.removeEventListener('mouseout', this.panEnd);
        this.$refs.grid.removeEventListener('mouseup', this.panEnd);

        if (this.isDragging) {
            this.points = [];
            this.drawGridLines();
            this.drawPolygons();
            setTimeout(() => {
                this.isDragging = false;
                this.calcScales();
            })
        }
    },


    // ****************** SAVING FACES ****************** //
    /*
    * create a rectangular face from the two points on the grid
    * save the rectangle as a face for the selected space or shading
    */
    saveRectuangularFace () {
        // infer 4 corners of the rectangle based on the two points that have been drawn
        const payload = {
            points: [
                this.points[0],
                { x: this.points[1].x, y: this.points[0].y },
                this.points[1],
                { x: this.points[0].x, y: this.points[1].y }
            ]
        };

        if (this.currentSpace) {
            payload.space = this.currentSpace;
        } else if (this.currentShading) {
            payload.shading = this.currentShading;
        }
        this.$store.dispatch('geometry/createFaceFromPoints', payload);
        this.points = [];
    },

    /*
    * create a polygon face from all points on the grid
    * save the face for the selected space or shading
    */
    savePolygonFace () {
        const payload = {
            points: this.points
        };
        if (this.currentSpace) {
            payload.space = this.currentSpace;
        } else if (this.currentShading) {
            payload.shading = this.currentShading;
        }

        this.$store.dispatch('geometry/createFaceFromPoints', payload);
        this.points = [];
    },


    // ****************** ERASING FACES ****************** //
    /*
    * cut out a rectangular selection based on the two points on the grid
    * save the rectangle as a face for the selected space or shading
    */
    eraseRectangularSelection () {
        // infer 4 corners of the rectangle based on the two points that have been drawn
        const payload = {
            points: [
                this.points[0],
                { x: this.points[1].x, y: this.points[0].y },
                this.points[1],
                { x: this.points[0].x, y: this.points[1].y }
            ]
        };

        this.$store.dispatch('geometry/eraseSelection', payload);
        this.points = [];
    },


    // ****************** d3 RENDERING ****************** //
    /*
    * render points for the face being created
    */
    drawPoints () {
        // remove expired points
        d3.selectAll('#grid ellipse').remove();

        // draw points
        d3.select('#grid svg')
            .selectAll('ellipse').data(this.points)
            .enter().append('ellipse')
            .attr('cx', (d, i) => { return d.x; })
            .attr('cy', (d, i) => { return d.y; })
            .attr('rx', this.calcRadius(2, 'x'))
            .attr('ry', this.calcRadius(2, 'y'))
            .attr('vector-effect', 'non-scaling-stroke');

        // connect the points with a guideline
        this.connectGridPoints();

        // when the first point in the polygon is clicked, close the shape
        d3.select('#grid svg').select('ellipse')
            .attr('rx', this.calcRadius(7, 'x'))
            .attr('ry', this.calcRadius(7, 'y'))
            .classed('origin', true) // apply custom CSS for origin of polygons
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('fill', 'none');
    },

    /*
    * render a line connecting all points for the face being drawn
    */
    connectGridPoints () {
        // remove expired paths
        d3.selectAll('#grid path').remove();

        // draw edges
        d3.select('#grid svg').append('path')
            .datum(this.points)
            .attr('fill', 'none')
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('d', d3.line()
                .x((d) => { return d.x; })
                .y((d) => { return d.y; }))
            // prevent edges from overlapping points - interferes with click events
            .lower();

        // keep grid lines under polygon edges
        d3.selectAll('.vertical, .horizontal').lower();
    },

    /*
    * render saved faces
    */
    drawPolygons () {
        // remove expired polygons
        d3.select('#grid svg').selectAll('polygon').remove();

        // draw polygons
        d3.select('#grid svg').selectAll('polygon')
            .data(this.polygons).enter()
            .append('polygon')
            .on('click', (d) => {
                if (this.currentTool === 'Select') {
                    d3.event.stopPropagation();
                    const model = modelHelpers.modelForFace(this.$store.state.models, d.face_id);
                    if (model.type === 'space') {
                        this.$store.dispatch('application/setCurrentSpace', { 'space': model });
                    } else if (model.type === 'shading') {
                        this.$store.dispatch('application/setCurrentShading', { 'shading': model });
                    }
                }
            })
            .attr('points', (d, i) => {
                var pointsString = '';
                d.points.forEach((p) => {
                    pointsString += (p.x + ',' + p.y + ' ');
                });
                return pointsString;
            })
            .attr('class', (d, i) => {
                if (this.currentSpace && d.face_id === this.currentSpace.face_id) { return 'currentSpace'; }
                if (this.currentShading && d.face_id === this.currentShading.face_id) { return 'currentShading'; }
            })
            .attr('fill', d => d.color)
            .attr('vector-effect', 'non-scaling-stroke');



        // remove expired points and guidelines
        d3.selectAll('#grid path').remove();
        d3.selectAll('#grid ellipse').remove();
    },

    /*
    * draw lines over the svg for the grid
    */
    drawGridLines () {
        var svg = d3.select('#grid svg');
        svg.selectAll('line').remove();

        // redraw the grid if the grid is visible
        if (!this.$store.state.project.grid.visible) { return; }

        // lines are drawn in RWU
        svg.selectAll('.vertical')
            .data(d3.range(this.min_x / this.x_spacing, this.max_x / this.x_spacing))
            .enter().append('line')
            .attr('x1', (d) => { return d * this.x_spacing; })
            .attr('x2', (d) => { return d * this.x_spacing; })
            .attr('y1', this.min_y)
            .attr('y2', this.max_y)
            .attr('class', 'vertical')
            .attr('vector-effect', 'non-scaling-stroke');

        svg.selectAll('.horizontal')
            .data(d3.range(this.min_y / this.y_spacing, this.max_y / this.y_spacing))
            .enter().append('line')
            .attr('x1', this.min_x)
            .attr('x2', this.max_x)
            .attr('y1', (d) => { return d * this.y_spacing; })
            .attr('y2', (d) => { return d * this.y_spacing; })
            .attr('class', 'horizontal')
            .attr('vector-effect', 'non-scaling-stroke');

        d3.selectAll('.vertical, .horizontal').lower();
    },


    // ****************** SNAPPING TO EXISTING GEOMETRY ****************** //
    /*
    * finds the closest vertex or edge within the snap tolerance zone of a point
    */
    findSnapTarget (point) {
        if (this.isDragging) { return; }

        // unhighlight all edges and vertices
        d3.selectAll('#grid .highlight').remove();

        const snappingVertexData = this.snappingVertexData(point),
            snappingEdgeData = this.snappingEdgeData(point);

        // if a vertex and an edge are both within the cursor's snap tolerance, find the closest one
        if (snappingVertexData && snappingEdgeData) {
            // if we are in polygon mode and the snappingVertex is the origin use the vertex regardless of whether the edge is closer
            if (snappingVertexData === this.points[0]) { return snappingVertexData; }
            return snappingVertexData.dist <= snappingEdgeData.dist ? snappingVertexData : snappingEdgeData;
        } else if (snappingVertexData) {
            return snappingVertexData;
        } else if (snappingEdgeData) {
            return snappingEdgeData;
        }
    },

    /*
    * look up data for the closest vertex within the tolerance zone of a point
    */
    snappingVertexData (point) {
        var snappingCandidates = JSON.parse(JSON.stringify(this.$store.getters['application/currentStoryGeometry'].vertices));

        // add the origin of the current polygon as a snapping candidate
        if (this.points[0] && this.currentTool === 'Polygon') {
            snappingCandidates.push(this.points[0]);
        }
        snappingCandidates = snappingCandidates.filter((v) => {
            const dx = Math.abs(v.x - point.x),
                dy = Math.abs(v.y - point.y);
            return (dx < this.$store.getters['project/snapTolerance'] && dy < this.$store.getters['project/snapTolerance']);
        });

        var nearestVertex;
        if (snappingCandidates.length > 1) {
            nearestVertex = snappingCandidates.reduce((a, b) => {
                const aDx = Math.abs(a.x - point.x),
                    aDy = Math.abs(a.y - point.y),
                    bDx = Math.abs(b.x - point.x),
                    bDy = Math.abs(b.y - point.y);
                return aDx * aDy <= bDx * bDy ? a : b;
            });
        } else {
            nearestVertex = snappingCandidates[0];
        }

        if (nearestVertex) {
            const a = Math.abs(point.x - nearestVertex.x),
                b = Math.abs(point.y - nearestVertex.y),
                c = (a * a) + (b * b);

            nearestVertex.dist = Math.sqrt(c);
            nearestVertex.type = 'vertex';

            return nearestVertex;
        }
    },

    /*
    * look up data for the closest edge within the tolerance zone of a point
    */
    snappingEdgeData (point) {
        // filter all edges within the snap tolerance of the point
        const snappingCandidates = this.currentStoryGeometry.edges.map((e) => {
            const v1 = geometryHelpers.vertexForId(e.v1, this.currentStoryGeometry),
                v2 = geometryHelpers.vertexForId(e.v2, this.currentStoryGeometry);

            if (!v1 || !v2) { debugger; }

            const edgeResult = geometryHelpers.projectToEdge(point, v1, v2);
            return edgeResult ? {
                dist: edgeResult.dist, // dist between original point location and projection to edge
                scalar: edgeResult.scalar, // projection of point to edge
                snappingEdge: e, // snapping edge
                // populated snapping edge vertices - to display snapping point
                snappingEdgeV1: v1,
                snappingEdgeV2: v2
            } : null;
        }).filter((eR) => {
            return eR && eR.dist < this.$store.getters['project/snapTolerance'];
        });

        // use the closest edge if there are multiple edges within the snap tolerance
        var nearestEdge;
        if (snappingCandidates.length > 1) {
            nearestEdge = snappingCandidates.reduce((a, b) => {
                return a.dist <= b.dist ? a : b;
            });
        } else {
            nearestEdge = snappingCandidates[0];
        }

        if (nearestEdge) {
            nearestEdge.type = 'edge';
            return nearestEdge;
        }
    },


    // ****************** HELPERS ****************** //
    /*
    * translates the mouse event coordinates to RWU
    * adjusts incorrect coordinates caused by svg hover
    */
    getEventRWU (e) {
        // when the user hovers over certain SVG child nodes, event locations are incorrect
        return {
            x: this.scaleX(e.offsetX),
            y: this.scaleY(e.offsetY)
        };
    },

    /*
    * calc point radius, adjusting by the minimum x and y values for the grid to prevent stretched points
    */
    calcRadius (pxRad, axis) {
        if (this.isDragging) { return 0; }
        var r;
        if (axis === 'x') {
            r = this.scaleX(pxRad) - this.min_x;
        } else if (axis === 'y') {
            r = this.scaleY(pxRad) - this.min_y;
        }

        return r < 0 ? 0 : r;
    },

    /*
    * generate d3 scaling functions based on the svg viewbox and the pixel size of the svg
    */
    calcScales () {
        if (this.isDragging) { return; }
        this.max_y = (this.$refs.grid.clientHeight / this.$refs.grid.clientWidth) * this.max_x;

        // update scales with new grid boundaries
        this.$store.dispatch('application/setScaleX', {
            scaleX: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientWidth])
                .range([this.min_x, this.max_x])
        });

        this.$store.dispatch('application/setScaleY', {
            scaleY: d3.scaleLinear()
                .domain([0, this.$refs.grid.clientHeight])
                .range([this.min_y, this.max_y])
        });
    },
    imagesStyles (image) {
        return {
            height: this.scaleY.invert(image.height) + 'px',
            left: this.scaleX.invert(image.x) + 'px',
            top: this.scaleY.invert(image.y) + 'px',
            'pointer-events': this.currentTool === 'Drag' ? 'all' : 'none'
        };
    }

}

function round (point, spacing) {
    var result,
        sign = point < 0 ? -1 : 1;
    point = Math.abs(point);
    if (point % spacing < spacing / 2) {
        result = point - (point % spacing);
    } else {
        result = point + spacing - (point % spacing);
    }
    // handle negatives
    result *= sign;
    // floating point precision
    return Math.round(result * 10000000000000) / 10000000000000;
}
