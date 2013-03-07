(function(){
	var clean = function(v){
		v = v || '';
		return v.split('"').join('');
	};
	var splitString = function(v){
		return Ext.Array.clean(clean(v).split(';'));
	};
	Ext.define('Ext.ux.hex.model.Tile', {
		extend : 'Ext.data.Model',
		requires : ['Ext.ux.hex.reader.megamek.Tileset'],
		config : {
			fields : [
				{ name : 'priority', convert : clean },		// base || super
				{ name : 'elevation', convert : clean }, 	// what elevation a given tile works with. can be * for all
				{ name : 'terrain', convert : function(val){
					val = (val || '').split(';');
					Ext.iterate(val, function(v, key){
						var terrain, level = '*', exits = '*';
						v = v.split(':');

						terrain = v[0];

						if(v[1] !== undefined){
							level = Ext.num(v[1], v[1]);
						}

						if(v[2] !== undefined){
							exits = Ext.num(v[2], v[2]);
						}
						val[key] = { name : terrain, level : level, exits : exits};
					});
					return val;
				} }, 	// semicolon delimited string of terrain types to apply to rough:1;swamp:1
				{ name : 'theme', convert : clean }, 		// specific theme in which to apply this tile to.
				{ name : 'image', convert : splitString } 		// semicolon delimited string of tile image paths
			],
			proxy : {
				type : 'ajax',
				reader : {
					type : 'json'
				}
			}
		}
	});
})();