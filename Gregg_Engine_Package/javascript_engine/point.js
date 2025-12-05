/**
 * ============================================================================
 * POINT UTILITIES - 2D Point/Vector Operations
 * ============================================================================
 *
 * PURPOSE:
 * Provides 2D point and vector operations for SVG coordinate calculations.
 * Used by char.js for stroke positioning and pen movement.
 *
 * COORDINATE SYSTEM:
 * - Origin (0, 0) at top-left
 * - X increases rightward
 * - Y increases downward (standard SVG coordinates)
 *
 * SOURCE:
 * Adapted from Grascii editor's point.js
 * Original: https://github.com/grascii/grascii-editor
 *
 * ============================================================================
 */

/**
 * Point constructor - Creates a 2D point
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 */
function Point(x, y) {
  this.x = x;
  this.y = y;
}

/**
 * Move point by polar coordinates (radius + angle)
 * @param {number} r - Radius (distance to move)
 * @param {number} deg - Angle in degrees (0° = right, 90° = down)
 * @returns {Point} this (for chaining)
 */
Point.prototype.pmove = function(r, deg) {
  this.x += r * Math.cos(deg * Math.PI / 180);
  this.y += r * Math.sin(deg * Math.PI / 180);
  return this;
};

/**
 * Move point by Cartesian offset
 * @param {number} dx - X offset
 * @param {number} dy - Y offset
 * @returns {Point} this (for chaining)
 */
Point.prototype.move = function(dx, dy) {
  this.x += dx;
  this.y += dy;
  return this;
};

/**
 * Add another point's coordinates to this point
 * @param {Point} pt - Point to add
 * @returns {Point} this (for chaining)
 */
Point.prototype.add = function(pt) {
  this.x += pt.x;
  this.y += pt.y
  return this;
};

/**
 * Scale point coordinates
 * @param {number} sx - X scale factor
 * @param {number} sy - Y scale factor (optional, defaults to sx)
 * @returns {Point} this (for chaining)
 */
Point.prototype.scale = function(sx, sy) {
  this.x *= sx;
  if (typeof(sy) != 'undefined') {
    this.y *= sy
  }
  return this;
};

/**
 * Set point coordinates to absolute values
 * @param {number} x - New X coordinate
 * @param {number} y - New Y coordinate
 * @returns {Point} this (for chaining)
 */
Point.prototype.set = function(x, y) {
  this.x = x;
  this.y = y;
  return this;
};

/**
 * Set point using polar coordinates
 * @param {number} r - Radius from origin
 * @param {number} deg - Angle in degrees
 * @returns {Point} this (for chaining)
 */
Point.prototype.pset = function(r, deg) {
  this.x = r * Math.cos(deg * Math.PI / 180);
  this.y = r * Math.sin(deg * Math.PI / 180);
  return this;
};

/**
 * Convert point to string representation
 * @returns {string} "x,y" format
 */
Point.prototype.toString = function() {
  return this.x + "," + this.y;
};

/**
 * Convert point to SVG move command
 * @returns {string} SVG path "m" command
 */
Point.prototype.m = function() {
  return "m" + this.x + "," + this.y;
};

/**
 * Helper function: Create point from Cartesian coordinates
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Point} New point
 */
p = function(x, y) {
  return new Point(x, y);
};

/**
 * Helper function: Create point from polar coordinates
 * @param {number} r - Radius from origin
 * @param {number} deg - Angle in degrees
 * @returns {Point} New point
 */
pp = function(r, deg) {
  return new Point(r * Math.cos(deg * Math.PI / 180), r * Math.sin(deg * Math.PI / 180));
};
