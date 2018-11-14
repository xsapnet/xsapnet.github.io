sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";
	jQuery.sap.require("sap.gantt.def.cal.Calendar");
	jQuery.sap.require("sap.gantt.def.cal.CalendarDefs");
	jQuery.sap.require("sap.gantt.def.cal.TimeInterval");
	return Controller.extend("sap.gantt.sample.BasicGanttChart.BasicGanttChart", {
		onPress: function(){
			var ta = this._createTimeAxis1();
			sap.ui.getCore().byId("__xmlview0--ganttView").setTimeAxis(ta);
            sap.ui.getCore().byId("__xmlview0--GanttChartContainer").setTimeZoomRate(1);
            sap.ui.getCore().byId("__xmlview0--ganttView").jumpToPosition(new Date("2015/01/01"));
		},
		
		onInit: function() {
			var oGanttChartContainer = this.getView().byId("GanttChartContainer");
			var oGanttChartWithTable = oGanttChartContainer.getGanttCharts()[0];
			var sPath = jQuery.sap.getModulePath("sap.gantt.sample.BasicGanttChart", "/data.json");
			this._oModel = new JSONModel();
			var that = this;
			$.ajax({
				url: sPath
			}).then(function(data){
				that._oModel.setData(data);
				// configuration of GanttChartContainer
				oGanttChartContainer.setModel(that._oModel, "test");
				oGanttChartContainer.setLegendContainer(that._createLegendContainer());
				oGanttChartContainer.setToolbarSchemes(that._createToolbarSchemes());
				oGanttChartContainer.setContainerLayouts(that._createContainerLayouts());
				oGanttChartContainer.setContainerLayoutKey("sap.test.gantt_layout");
				oGanttChartContainer.addCustomToolbarItem(that._createCustomToolbar());

				// configuration of GanttChartWithTable
				oGanttChartWithTable.bindAggregation("rows",
						{
							path: "test>/root",
							parameters: {
								arrayNames: ["children"]
							}
						}
				);
				oGanttChartWithTable.bindAggregation("relationships",
						{
							path: "test>/root/relationship"
						}
				);
				oGanttChartWithTable.setCalendarDef(new sap.gantt.def.cal.CalendarDefs({
					defs: {
						path: "test>/root/calendar",
						template: new sap.gantt.def.cal.Calendar({
							key: "{test>id}",
							timeIntervals: {
								path: "test>data",
								templateShareable: true,
								template: new sap.gantt.def.cal.TimeInterval({
									startTime: "{test>startTime}",
									endTime: "{test>endTime}"
								})
							}
						})
					}
				})
				);
				
				oGanttChartWithTable.setTimeAxis(that._createTimeAxis());
				oGanttChartWithTable.setShapeDataNames(["top", "order", "milestone", "constraint", "relationship", "nwt", "nwtForWeekends"]);
				oGanttChartWithTable.setShapes(that._configShape());
				oGanttChartWithTable.setToolbarSchemes(that._createToolbarSchemes());
				oGanttChartWithTable.setSelectionMode(sap.gantt.SelectionMode.Multiple);
			});

			
		},
		
		onAfterRendering: function(){
			var that = this;
			setTimeout(function(){
				var oGanttChartContainer = that.getView().byId("GanttChartContainer");
				var oGanttChartWithTable = oGanttChartContainer.getGanttCharts()[0];
				oGanttChartWithTable.jumpToPosition(new Date("2015-01-01"));
			},1000);
		},

		/*
		 * Create CustomToolbar
		 * @private
		 * @returns {Object} oToolbar
		 */
		_createCustomToolbar: function() {
			var that = this;
			var oToolbar = new sap.m.Toolbar({
				content: [
					new sap.m.Link({
						text: "Create Task",
						press: function() {
							that.createTask();
						}
					}),
					new sap.m.ToolbarSpacer({width: "10px"}),
					new sap.m.Link({
						text: "Delete Task",
						press: function() {
							that.deleteTask();
						}
					}),
					new sap.m.ToolbarSpacer({width: "10px"}),
					new sap.m.ToolbarSeparator()
				]
			});

			return oToolbar;
		},

		/*
		 * Create ToolbarSchemes
		 * @private
		 * @returns {Array} aToolbarSchemes
		 */
		_createToolbarSchemes: function() {
			var aToolbarSchemes = [
				new sap.gantt.config.ToolbarScheme({
					key: "GLOBAL_TOOLBAR",
					customToolbarItems: new sap.gantt.config.ToolbarGroup({
						position: "R2",
						overflowPriority: sap.m.OverflowToolbarPriority.High
					}),
					timeZoom: new sap.gantt.config.ToolbarGroup({
						position: "R4",
						overflowPriority: sap.m.OverflowToolbarPriority.NeverOverflow
					}),
					legend: new sap.gantt.config.ToolbarGroup({
						position: "R3",
						overflowPriority: sap.m.OverflowToolbarPriority.Low
					}),
					settings: new sap.gantt.config.SettingGroup({
						position: "R1",
						overflowPriority: sap.m.OverflowToolbarPriority.Low,
						items: sap.gantt.config.DEFAULT_TOOLBAR_SETTING_ITEMS
					}),
					toolbarDesign: sap.m.ToolbarDesign.Transparent
				}),
				new sap.gantt.config.ToolbarScheme({
					key: "LOCAL_TOOLBAR"
				})
			];

			return aToolbarSchemes;
		},

		/*
		 * Create ContainerLayouts
		 * @private
		 * @returns {Array} aContainerLayouts
		 */
		_createContainerLayouts: function() {
			var aContainerLayouts = [
				new sap.gantt.config.ContainerLayout({
					key: "sap.test.gantt_layout",
					text: "Gantt Layout",
					toolbarSchemeKey: "GLOBAL_TOOLBAR"
				})
			];

			return aContainerLayouts;
		},

		/*
		 * Create Legend
		 * @private
		 * @returns {Object} oLegend
		 */
		_createLegendContainer: function() {
			var sSumTaskColor = "#FAC364";
			var sTasksColor = "#5CBAE5";
			var sRelColor = "#848F94";
			var sTextColor = sap.ui.getCore().getConfiguration().getTheme() === "sap_hcb" ? "white" : "";
			var oLegend = new sap.gantt.legend.LegendContainer({
				legendSections: [
					new sap.m.Page({
						title: "Tasks",
						content:[
							new sap.ui.core.HTML({
								content: "<div width='100%' height='50%' style='margin-top: 25px'><svg width='180px' height='60px'><g>" +
									"<g style='display: block;'>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25" ) + "' y='2' width='20' height='20' fill=" + sSumTaskColor + " style='stroke: " + sSumTaskColor + "; stroke-width: 2px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55" ) + "' y='16' font-size='0.875rem' fill=" + sTextColor + ">Summary task</text></g>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25" ) + "' y='32' width='20' height='20' fill=" + sTasksColor + " style='stroke: " + sTasksColor + "; stroke-width: 2px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55" ) + "' y='46' font-size='0.875rem' fill=" + sTextColor + ">Task</text></g>" +
									"</g></g></svg></div>"
							})
						]
					}),
					new sap.m.Page({
						title: "Relationships",
						content:[
							new sap.ui.core.HTML({
								content: "<div width='100%' height='50%' style='margin-top: 25px'><svg width='180px' height='25px'><g>" +
									"<g style='display: block;'>" +
									"<g><rect x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "155" : "25" ) + "' y='8' width='20' height='1' fill=" + sRelColor + " style='stroke: " + sRelColor + "; stroke-width: 1px;'></rect>" +
									"<text x='" + (sap.ui.getCore().getConfiguration().getRTL() ? "125" : "55" ) + "' y='12.5' font-size='0.875rem' fill=" + sTextColor + ">Relationship</text></g>" +
									"</g></g></svg></div>"
							})
						]
					})
				]
			});

			return oLegend;
		},

		/*
		 * Configuration of Shape.
		 * @private
		 * @returns {Array} aShapes
		 */
		_configShape: function() {
			var aShapes = [];

			sap.ui.define(["sap/gantt/shape/Group"], function (Group) {
				var RectangleGroup = Group.extend("sap.test.RectangleGroup");

				RectangleGroup.prototype.getRLSAnchors = function(oRawData, oObjectInfo) {
					var shapes = this.getShapes();
					var rectangleShapeClass;
					var _x, _y;

					for (var i in shapes) {
						if (shapes[i] instanceof sap.gantt.shape.Rectangle) {
							rectangleShapeClass = shapes[i];
						}
					}

					_x = rectangleShapeClass.getX(oRawData);
					_y = rectangleShapeClass.getY(oRawData, oObjectInfo) + rectangleShapeClass.getHeight() / 2;

					return {
						startPoint: {
							x: _x,
							y: _y,
							height:rectangleShapeClass.getHeight(oRawData)
						},
						endPoint: {
							x: _x + rectangleShapeClass.getWidth(oRawData),
							y: _y,
							height:rectangleShapeClass.getHeight(oRawData)
						}
					};
				};

				return RectangleGroup;
			}, true);

			sap.ui.define(["sap/gantt/shape/Rectangle"], function (Rectangle) {
				var shapeRectangle = Rectangle.extend("sap.test.shapeRectangle");

				shapeRectangle.prototype.getFill = function (oRawData) {
					switch (oRawData.level) {
					case "1":
						return "#FAC364";
					default:
						return "#5CBAE5";
					}
				};

				return shapeRectangle;
			}, true);

			sap.ui.define(["sap/gantt/shape/SelectedShape"], function (SelectedShape) {
				var selectRectange = SelectedShape.extend("sap.test.selectRectange");

				selectRectange.prototype.getStroke = function (oRawData) {
					switch (oRawData.level) {
					case "1":
						return "#B57506";
					default:
						return "#156589";
					}
				};
				selectRectange.prototype.getStrokeWidth = function () {
					return 2;
				};

				return selectRectange;
			});
			
			// define a milestone (diamond)
			sap.ui.define(["sap/gantt/shape/ext/Diamond", "sap/ui/core/Core"], function (Diamond, Core) {
				var milestone = Diamond.extend("sap.test.Milestone");			
				return milestone;
			}, true);
			
			// define a constraint (triangle)
			sap.ui.define(["sap/gantt/shape/ext/Triangle", "sap/ui/core/Core"], function (Triangle, Core) {
				var constraint = Triangle.extend("sap.test.Constraint");
				return constraint;
			}, true);

			var oTopShape = new sap.gantt.config.Shape({
				key: "top",
				shapeDataName: "order",
				shapeClassName: "sap.test.shapeRectangle",
				selectedClassName: "sap.test.selectRectange",
				level: 5,
				shapeProperties: {
					time: "{startTime}",
					endTime: "{endTime}",
					height: 20,
					isDuration: true,
					enableDnD: true
				}
			});

			var oOrderShape = new sap.gantt.config.Shape({
				key: "order",
				shapeDataName: "order",
				shapeClassName: "sap.test.RectangleGroup",
				selectedClassName: "sap.test.selectRectange",
				level: 5,
				shapeProperties: {
					time: "{startTime}",
					endTime: "{endTime}",
					height: 20,
					isDuration: true,
					enableDnD: true
				},
				groupAggregation: [
					new sap.gantt.config.Shape({
						shapeClassName: "sap.test.shapeRectangle",
						selectedClassName: "sap.test.selectRectange",
						shapeProperties: {
							time: "{startTime}",
							endTime: "{endTime}",
							title: "{tooltip}",
							height: 20,
							isDuration: true,
							enableDnD: true
						}
					})
				]
			});
			// define a milestone config
			var oDiamondConfig = new sap.gantt.config.Shape({
				key: "diamond",
				shapeClassName: "sap.test.Milestone",
				shapeDataName: "milestone",
				level: 5,
				shapeProperties: {
					time: "{endTime}",
					strokeWidth: 2,
					title: "{tooltip}",
					verticalDiagonal: 18,
					horizontalDiagonal: 18,
					yBias: -1,
					fill: "#666666"
				}
			});
			// define a constraint config
			var oTriangleConfig = new sap.gantt.config.Shape({
				key: "triangle",
				shapeClassName: "sap.test.Constraint",
				shapeDataName: "constraint",
				level: 5,
				shapeProperties: {
					time: "{time}",
					strokeWidth: 1,
					title: "{tooltip}",
					fill: "#666666",
					rotationAngle: "{ratationAngle}",
					base: 6,
					height: 6,
					distanceOfyAxisHeight: 3,
					yBias: 7
				}
			});

			var oRelShape = new sap.gantt.config.Shape({
				key: "relationship",
				shapeDataName: "relationship",
				level: 30,
				shapeClassName: "sap.gantt.shape.ext.rls.Relationship",
				shapeProperties: {
					isDuration: false,
					lShapeforTypeFS: true,
					showStart: false,
					showEnd: true,
					stroke: "#848F94",
					strokeWidth: 1,
					type: "{relation_type}",
					fromObjectPath:"{fromObjectPath}",
					toObjectPath:"{toObjectPath}",
					fromDataId:"{fromDataId}",
					toDataId:"{toDataId}",
					fromShapeId:"{fromShapeId}",
					toShapeId:"{toShapeId}",	
					title: "{tooltip}",
					id: "{guid}"
				}
			});

			var oCalendarConfig = new sap.gantt.config.Shape({
				key: "nwt",
				shapeClassName: "sap.gantt.shape.cal.Calendar",
				shapeDataName: "nwt",
				level: 32,
				shapeProperties: {
					calendarName: "{id}"
				}
			});

			var oCalendarConfigForWeekends = new sap.gantt.config.Shape({
				key: "nwtForWeekends",
				shapeClassName: "sap.gantt.shape.cal.Calendar",
				shapeDataName: "nwtForWeekends",
				level: 32,
				shapeProperties: {
					calendarName: "{id}"
				}
			});

			aShapes = [oTopShape, oOrderShape, oDiamondConfig, oTriangleConfig, oRelShape, oCalendarConfig, oCalendarConfigForWeekends];

			return aShapes;
		},

		/*
		 * Handle Date Change.
		 * @public
		 * @param {Object} event
		 * @returns undefined
		 */
		handleDateChange: function(event) {
			var oDatePicker = event.getSource();
			var aCells = oDatePicker.getParent().getCells();

			if (oDatePicker === oDatePicker.getParent().getCells()[1]) {
				this._checkDate(aCells[1], aCells[2], true);
			} else {
				this._checkDate(aCells[1], aCells[2], false);
			}
		},

		/*
		 * Check Date.
		 * @private
		 * @param {Object} startCell, {Object} endCell, {Boolean} bIsChangeStart
		 * @returns undefined
		 */
		_checkDate: function(startCell, endCell, bIsChangeStart) {
			if (bIsChangeStart === undefined) {
				jQuery.sap.log.error("bIsChangeStart is not defined!");
				return;
			}

			if (startCell.getValue() > endCell.getValue()) {
				this._showNotAllowedMsg();
				if (bIsChangeStart) {
					startCell.setValue(endCell.getValue());
				} else {
					endCell.setValue(startCell.getValue());
				}
			}
		},

		/*
		 * Show "Not Allowed" message.
		 * @private
		 * @returns undefined
		 */
		_showNotAllowedMsg: function() {
			MessageToast.show("Not allowed");
		},

		/*
		 * Handle event of shapeDragEnd
		 * @public
		 * @param {Object} [oEvent] event context
		 * @returns {Boolean} if Drag and Drop succeed
		 */
		handleShapeDragEnd: function(oEvent) {
			var oParam = oEvent.getParameters();
			var aSourceShapeData = oParam.sourceShapeData;
			var oSourceShapeData = aSourceShapeData[0].shapeData;
			var sSourceId = aSourceShapeData[0].objectInfo.id;
			var oTargetData = oParam.targetData;

			//change the form of date from millis to timestamp
			var sTarStartTime = sap.gantt.misc.Format.dateToAbapTimestamp(new Date(oTargetData.mouseTimestamp.startTime));
			var sTarEndTime = sap.gantt.misc.Format.dateToAbapTimestamp(new Date(oTargetData.mouseTimestamp.endTime));
			
			if (!oTargetData.objectInfo) {
				this._showNotAllowedMsg();
				return false;
			}

			var sTargetId = oTargetData.objectInfo.id;
			var sId = aSourceShapeData[0].objectInfo.id;
			
			if (this._checkDropSameRow(sSourceId, sTargetId) && this._selectOnlyOneRow(aSourceShapeData)) {
				//oSourceShapeData is a reference, so we only need to change startTime and endTime, then reset data model 
				oSourceShapeData.startTime = sTarStartTime;
				oSourceShapeData.endTime = sTarEndTime;
				var oModelData = this._oModel.getData();
				this._oModel.setData(oModelData);
				return true;
			} else {
				this._showNotAllowedMsg();
				return false;
			}
		},

		/*
		 * Check if drop the selected task to the same row
		 * @private
		 * @param {String} [sSourceId] source id
		 * @param {String} [sTargetId] target id
		 * @returns {Boolean} if drop the selected task in the same row
		 */
		_checkDropSameRow: function(sSourceId, sTargetId) {
			if (sSourceId === sTargetId) {
				return true;
			} else {
				return false;
			}
		},

		/*
		 * Check if only select one row of chart
		 * @private
		 * @param {Array} [aSourceShapeData] array of source data
		 * @returns {Boolean} if only select one row of chart
		 */
		_selectOnlyOneRow: function(aSourceShapeData) {
			if (aSourceShapeData.length === 1) {
				return true;
			} else {
				return false;
			}
		},

		/*
		 * Create TimeAxis
		 * @private
		 * @returns {Object} oTimeAxis
		 */
		_createTimeAxis: function() {
			var oTimeAxis = new sap.gantt.config.TimeAxis({
				planHorizon: new sap.gantt.config.TimeHorizon({
					startTime: "20131228000000",
					endTime: "20170101000000"
				}),
				// specify initHorizon rather than the default one
				initHorizon: new sap.gantt.config.TimeHorizon({
					startTime: "20161001000000",
					endTime: "20161201000000"
				}),
				zoomStrategy: {
					"1day": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							pattern: "MMM yyyy,'Week' ww"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							pattern: "EEE dd"
						}
					},
					"1week": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							pattern: "MMMM yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							pattern: "'CW' w"
						}
					},
					"1month": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							pattern: "yyyy, QQQ"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							pattern: "MMM"
						}
					},
					"1quarter": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							pattern: "yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							pattern: "QQQ"
						}
					},
					"1year": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 10,
							pattern: "yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							pattern: "yyyy"
						}
					}
				},
				granularity: "1week",
				finestGranularity:  "1day",
				coarsestGranularity:  "1year",
				rate:  1
			});

			return oTimeAxis;
		},
		
		_createTimeAxis1: function() {
			var oTimeAxis = new sap.gantt.config.TimeAxis({
				planHorizon: new sap.gantt.config.TimeHorizon({
					startTime: "20071228000000",
					endTime: "20270101000000"
				}),
				initHorizon: new sap.gantt.config.TimeHorizon({
					
				}),
				zoomStrategy: {
					"1day": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							format: "MMM yyyy,'Week' ww"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.day,
							span: 1,
							format: "EEE dd"
						}
					},
					"1week": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							format: "MMMM yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.week,
							span: 1,
							format: "'CW' w"
						}
					},
					"1month": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							format: "yyyy, QQQ"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 1,
							format: "MMM"
						}
					},
					"1quarter": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							format: "yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.month,
							span: 3,
							format: "QQQ"
						}
					},
					"1year": {
						innerInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							range: 90
						},
						largeInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 10,
							format: "yyyy"
						},
						smallInterval: {
							unit: sap.gantt.config.TimeUnit.year,
							span: 1,
							format: "yyyy"
						}
					}
				},
				granularity: "1quarter",
				finestGranularity:  "1day",
				coarsestGranularity:  "1year",
				rate:  1
			});

			return oTimeAxis;
		},

		/*
		 * Create task
		 * @public
		 * @returns undefined
		 */
		createTask: function() {
			var oGanttChartContainer = this.getView().byId("GanttChartContainer");
			var aSelectedRows = oGanttChartContainer.getSelectedRows(0)[0].selectedRows;

			if (this._checkSelectedRow(aSelectedRows)) {
				this._addRows(aSelectedRows);
			}
			var aIds = [];
			for (var i = 0; i < aSelectedRows.length; i++) {
				aIds.push(aSelectedRows[i].id);
			}
			setTimeout(function(){
				oGanttChartContainer.deselectRows(0);
				oGanttChartContainer.selectRows(0, aIds);//reselect rows
			}, 300);
		},

		/*
		 * Check if one or more rows selected
		 * @public
		 * @param {Array} [aSelectedRows] array contain selected rows
		 * @returns {Boolean} if one or more tasks selected
		 */
		_checkSelectedRow: function(aSelectedRows) {
			if (aSelectedRows.length >= 1) {
				return true;
			} else {
				MessageToast.show("Plase select one or more rows");
				return false;
			}
		},

		/*
		 * Add one or more rows
		 * @public
		 * @param {Array} [aSelectedRows] array contain selected rows
		 * @returns undefined
		 */
		_addRows: function(aSelectedRows) {
			var oModelData = this._oModel.getData(); //data in model
			var aTreeData = oModelData.root.children; //data of root level

			for (var i = 0, len = aSelectedRows.length; i < len; i++) {
				var sId = aSelectedRows[i].id;
				this._addRow(aTreeData, sId);
			}

			this._oModel.setData(oModelData); //update data of model
		},

		/*
		 * Add one row
		 * @public
		 * @param {Array} [aTreeNodes] array contain selected rows
		 * @param {String} [sId] id of selected row
		 * @returns undefined
		 */
		_addRow: function(aTreeNodes, sId) {
			if (!aTreeNodes || !aTreeNodes.length){
				return;
			}

			for (var i = 0, len = aTreeNodes.length; i < len; i++) {
				var oNode = aTreeNodes[i];
				var aChildNodes = oNode.children;

				//find object of corresponding sId and add a new object
				if (oNode.id === sId) {
					var oNewNode = $.extend(true, {}, oNode);//deep copy oNode
					oNewNode.id = oNode.id + " - Copy" + Math.floor((Math.random() * 1000) + 1);
					oNewNode.name = oNode.name + " - Copy";
					oNewNode.order[0].id = oNewNode.order[0].id + " - Copy" + Math.floor((Math.random() * 1000) + 1);
					aTreeNodes.splice(i + 1, 0, oNewNode);
					return;
				}

				if (aChildNodes && aChildNodes.length > 0){
					this._addRow(aChildNodes, sId);
				}
			}
		},

		/*
		 * Delete task
		 * @public
		 * @returns undefined
		 */
		deleteTask: function() {
			var oGanttChartContainer = this.getView().byId("GanttChartContainer");
			var aSelectedRows = oGanttChartContainer.getSelectedRows(1)[0].selectedRows;

			if (this._checkSelectedRow(aSelectedRows)) {
				this._deleteRows(aSelectedRows);
				this._clearSelection();
			}
		},

		/*
		 * Clear Selection
		 * @private
		 *@returns undefined
		 */
		_clearSelection: function() {
			var oGanttChartContainer = this.getView().byId("GanttChartContainer");

			oGanttChartContainer.deselectRows(oGanttChartContainer.getSelectedRows(0));
		},

		/*
		 * Delete one or more rows
		 * @public
		 * @param {Array} [aSelectedRows] array contain selected rows
		 * @returns undefined
		 */
		_deleteRows: function(aSelectedRows) {
			var oModelData = this._oModel.getData(); //data in model
			var aTreeData = oModelData.root.children; //data of root level

			for (var i = 0, len = aSelectedRows.length; i < len; i++) {
				var sId = aSelectedRows[i].id;
				this._deleteRow(aTreeData, sId);
			}

			this._oModel.setData(oModelData); //update data of model
		},

		/*
		 * Delete one row
		 * @public
		 * @param {Array} [aTreeNodes] array contain selected rows
		 * @param {String} [sId] id of selected row
		 * @returns undefined
		 */
		_deleteRow: function(aTreeNodes, sId) {
			if (!aTreeNodes || !aTreeNodes.length){
				return;
			}

			for (var i = 0, len = aTreeNodes.length; i < len; i++) {
				var oNode = aTreeNodes[i];
				var aChildNodes = oNode.children;

				//find object of corresponding sId and delete it
				if (oNode.id === sId) {
					aTreeNodes.splice(i, 1);
					return;
				}

				if (aChildNodes && aChildNodes.length > 0){
					this._deleteRow(aChildNodes, sId);
				}
			}
		}
	});
});