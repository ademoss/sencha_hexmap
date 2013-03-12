Ext.define('Ext.ux.hex.store.Hex',{
	extend : 'Ext.data.Store',
	config : {
		model : 'Ext.ux.hex.model.Hex',
		sorters : [{
			property : 'location',
			direction : 'asc'
		}]
	},
	getNeighors : function(record){
		var location = Ext.num(record.get('location')),
			coord = record.get('coord'),
			lastCoord = this.last().get('coord'),
			neighbors = {};

			neighbors.north = this.getById(Ext.String.leftPad(location-1, 4, "0"));
			neighbors.south = this.getById(Ext.String.leftPad(location+1, 4, "0"));

			if(coord.x % 2 === 0){
				neighbors.northwest = this.getById(Ext.String.leftPad(location-100, 4, "0"));
				neighbors.northeast = this.getById(Ext.String.leftPad(location+100, 4, "0"))
				neighbors.southwest = this.getById(Ext.String.leftPad(location-99, 4, "0"));
				neighbors.southeast = this.getById(Ext.String.leftPad(location+101, 4, "0"))
			} else {
				neighbors.northwest = this.getById(Ext.String.leftPad(location-101, 4, "0"));
				neighbors.northeast = this.getById(Ext.String.leftPad(location+99, 4, "0"))
				neighbors.southwest = this.getById(Ext.String.leftPad(location-100, 4, "0"));
				neighbors.southeast = this.getById(Ext.String.leftPad(location+100, 4, "0"))
			}
			
		return neighbors;
	}
});