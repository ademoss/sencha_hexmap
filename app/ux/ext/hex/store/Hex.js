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
			// coord.y !== lastCoord.y
			neighbors = [
				this.getById(Ext.String.leftPad(location-1, 4, "0")),
				// Bottom tiles don't have a north east hex, instead the south east hex takes its place
				coord.y !== lastCoord.y ? this.getById(Ext.String.leftPad(location+99, 4, "0")) : undefined,
				this.getById(Ext.String.leftPad(location+100, 4, "0")),
				this.getById(Ext.String.leftPad(location+1, 4, "0")),
				// Top tiles don't have a south west hex, instead the north west hex takes its place
				coord.y !== 1 ? this.getById(Ext.String.leftPad(location-99, 4, "0")) : undefined,
				this.getById(Ext.String.leftPad(location-100, 4, "0"))
			];
		return Ext.Array.clean(neighbors);
	}
});