Ext.define('Ext.ux.hex.model.Hex', {
	extend : 'Ext.data.Model',

	config : {
		idProperty : 'location',
		fields : [
			// {name : 'id', convert : function(hex){
			// 	return hex.get('elevation') + hex.get('terrain');
			// }},
			'location',
			{ name : 'elevation', type : 'int', defaultValue : 0 },
			'terrain',
			'coord',
			'theme',
			'node'
		]	
	}
})