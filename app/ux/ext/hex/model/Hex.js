Ext.define('Ext.ux.hex.model.Hex', {
	extend : 'Ext.data.Model',

	config : {
		idProperty : 'location',
		fields : [
			'location',
			{ name : 'elevation', type : 'int', defaultValue : '0' },
			'terrain',
			'coord',
			'theme',
			'node'
		]	
	}
})