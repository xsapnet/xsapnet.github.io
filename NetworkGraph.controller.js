sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	var oPageController = Controller.extend("sap.suite.ui.commons.sample.NetworkGraph.NetworkGraph", {
		onInit: function () {
			var oModel = new JSONModel(jQuery.sap.getModulePath("sap.suite.ui.commons.sample.NetworkGraph", "/graph.json"));
			this.getView().setModel(oModel);

			this._oModelSettings = new JSONModel({
				source: "atomicCircle",
				orientation: "LeftRight",
				arrowPosition: "End",
				arrowOrientation: "ParentOf",
				nodeSpacing: 55,
				mergeEdges: false
			});

			this.getView().setModel(this._oModelSettings, "settings");
		},
		onAfterRendering: function () {
			this.byId("graphWrapper").$().css("overflow-y", "auto");
		},
		mergeChanged: function (oEvent) {
			this._oModelSettings.setProperty("/mergeEdges", !!Number(oEvent.getSource().getProperty("selectedKey")));
		},
		spacingChanged: function (oEvent) {
			this._oModelSettings.setProperty("/nodeSpacing", Number(oEvent.getSource().getProperty("selectedKey")));
		}
	});
	return oPageController;
});