Ext.define('Ext.ux.hex.model.HexTileset', {
	extend : 'Ext.data.Model',
	requires : ['Ext.ux.hex.reader.megamek.Tileset'],
	config : {
		fields : [
			// ID should be the url to load from
			{ name : 'id' }
		],
		proxy : {
			type : 'ajax',
			reader : {
				type : 'megamek.tileset'
			}
		},

		hasMany : [
			{ model : 'Ext.ux.hex.model.Tile', name : 'super', associationKey : 'super' },
			{ model : 'Ext.ux.hex.model.Tile', name : 'base', associationKey : 'base' }
		],
		hexImageCache : true
	},

	statics : {
		/**
		 * loadUrl provides similar functionality to Model.load except it overwrites the proxy url and passes an undefined id.
		 * @param  {[type]} url     [description]
		 * @param  {[type]} options [description]
		 * @param  {[type]} scope   [description]
		 * @return {[type]}         [description]
		 */
		loadUrl : function(url, options, scope){
			if(!Ext.isEmpty(url)){
				this.getProxy().setUrl(url);
			}
			return Ext.data.Model.load.call(this, undefined, options, scope);	
		}
	},

	applyHexImageCache : function(cache){
		if(cache === true){
			cache = new Ext.util.MixedCollection();
		} else {
			return undefined;
		}
		return cache;
	},

	/**
	 * getTile takes a terrain and grabs the best match for a tile record.
	 * @param  {int} elevation [description]
	 * @param  {String} terrain [description]
	 * @return {[Ext.ux.hex.model.Tile]} An array of tiles where the first tile is the first image to be displayed
	 */
	getTiles : function(hex){
		var me = this,
			hexCopy, supers, base, tiles,
			hexImageCache = this.getHexImageCache(),
			hexId = hex.get('elevation') + hex.get('terrain');

		if(hexImageCache){
			tiles = hexImageCache.getByKey(hexId);
		}

		if(!tiles){
			console.log('cache hit');
			hexCopy = hex.copy();
			supers = this.supersFor(hexCopy);
			base = this.baseFor(hexCopy);
			tiles = { 
				id : hexId, 
				base : base, 
				supers : supers 
			};
			hexImageCache.add(tiles)
		}

		return tiles;
	},

	supersFor : function(hex){
		return ['TESTING SUPER'];
	},

	baseFor : function(hex){
		return ['TESTING BASE'];
	},
	
	matchSuper : function(hex){
		// var me = this,
		// 	superStore = this.super(),
		// 	matches = [];

		// superStore.each(function(entry){
		// 	if(me.matchSuper(hex, entry) >= 1.0){
		// 		matches.push(entry.getImage());
		// 		me.removeMatchingTerrains(hex, entry)
		// 	}
		// })
	},

	/**
	 * [getBase description]
	 * @param  {[type]} hex Directly modifies hex
	 * @return {[type]}     [description]
	 */
	getBase : function(hex){
		return this.getTiles()['base'];
	},

	getSupers : function(hex){
		return this.getTiles()['supers'];
	},

	removeMatchingTerrains : function(hex, tile){

	}
});