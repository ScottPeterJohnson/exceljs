/**
 * Copyright (c) 2016-2017 Guyon Roche
 * LICENCE: MIT - please refer to LICENCE file included with this module
 * or https://github.com/guyonroche/exceljs/blob/master/LICENSE
 */

'use strict';

var utils = require('../../../utils/utils');
var XmlStream = require('../../../utils/xml-stream');

var BaseXform = require('../base-xform');
var TwoCellAnchorXform = require('./two-cell-anchor-xform');

var WorkSheetXform = module.exports = function() {
  this.map = {
    'twoCellAnchor': new TwoCellAnchorXform()
  };
};

utils.inherits(WorkSheetXform, BaseXform, {
  DRAWING_ATTRIBUTES: {
    'xmlns:xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',
    'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main'
  }
}, {
  get tag() { return 'wsDr'; },

  prepare: function(model) {
    var twoCellAnchorXform = this.map['twoCellAnchor'];
    model.anchors.forEach(function(item, index) {
      twoCellAnchorXform.prepare(item, {index: index});
    });
  },

  render: function(xmlStream, model) {
    xmlStream.openXml(XmlStream.StdDocAttributes);
    xmlStream.openNode('xdr:wsDr', WorkSheetXform.DRAWING_ATTRIBUTES);

    var twoCellAnchorXform = this.map['twoCellAnchor'];
    model.anchors.forEach(function(item) {
      twoCellAnchorXform.render(xmlStream, item);
    });

    xmlStream.closeNode();
  },

  parseOpen: function(node) {
    if (this.parser) {
      this.parser.parseOpen(node);
      return true;
    }
    switch (node.name) {
      case this.tag:
        this.reset();
        this.model = {
          anchors: [],
        };
        break;
      default:
        this.parser = this.map[node.name];
        if (this.parser) {
          this.parser.parseOpen(node);
        }
        break;
    }
    return true;
  },

  parseText: function(text) {
    if (this.parser) {
      this.parser.parseText(text);
    }
  },

  parseClose: function(name) {
    if (this.parser) {
      if (!this.parser.parseClose(name)) {
        this.model.anchors.push(this.parser.model);
        this.parser = undefined;
      }
      return true;
    }
    switch (name) {
      case this.tag:
        return false;
      default:
        // could be some unrecognised tags
        return true;
    }
  },

  reconcile: function(model, options) {
    model.anchors.forEach(anchor => {
      this.map['twoCellAnchor'].reconcile(anchor, options);
    });
  }
});
