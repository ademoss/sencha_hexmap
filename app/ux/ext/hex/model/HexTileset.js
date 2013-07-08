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
			{ model : 'Ext.ux.hex.model.Hex', name : 'super', associationKey : 'super' },
			{ model : 'Ext.ux.hex.model.Hex', name : 'base', associationKey : 'base' }
		],
		hexImageCache : true
	},

	WILDCARD : '*',

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

	buildHexId : function(hex){
		var hexId = hex.get('theme') + hex.get('elevation'),
			terrains = [];

		Ext.each(hex.get('terrain'), function(t){
			terrains.push(t.name + t.elevation + t.exits);
		});

		hexId = hexId + terrains.join(';');

		return hexId;
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
			hexId = me.buildHexId(hex);

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
		var me = this,
			matches = [],
			tile,
			supers = this.super().getRange();
// console.log(supers);
		for(var i = 0, len = supers.length; i < len; i++){
		// this.super().each(function(tile){
			tile = supers[i];
			if (me.superMatch(hex, tile) >= 1.0) {
				matches.push(tile.getImage());
				me.removeMatchingTerrains(hex, tile);
			}
		}
		// });
		// Fix a bug where no terrain matches anything
		if(hex.get('terrain').length === 0){
			hex.set('terrain','');
		}
		return matches.length > 0 ? matches : undefined;
	},

	baseFor : function(hex){
		var me = this,
			bestMatch,
			match = -1;

		this.base().each(function(tile){
			var matchValue = me.baseMatch(hex, tile);

			// stop if perfect match
            if (matchValue == 1.0) {
                bestMatch = tile;
                return false;
            }
            // compare match with best
            if (matchValue > match) {
                bestMatch = tile;
                match = matchValue;
            }
		});
		return bestMatch.getImage();
	},
	
	/**
	 * [superMatch description]
	 * 
     * Match the two hexes using the "super" formula. All matches must be exact,
     * however the match only depends on the original hex matching all the
     * elements of the comparision, not vice versa. <p/> EXCEPTION: a themed
     * original matches any unthemed comparason.
     *
	 * @param  {[type]} hex  [description]
	 * @param  {[type]} tile [description]
	 * @return {[type]}      [description]
	 */
	superMatch : function(hex, tile){
		var me = this, match = 0;

		// Elevation either must be a wildcard or match to continue
		if(tile.get('elevation') !== me.WILDCARD
			 	&& hex.get('elevation') != tile.get('elevation')){
			return 0;
		}

		var hTerrain,
     		tTerrain,
     		key,
     		terrain,
     		terrains = Ext.ux.hex.model.Hex.Terrains;

     	for(key in terrains){
     		if(!terrains.hasOwnProperty(key)){
     			continue;
     		}
     		terrain = terrains[key];
     		hTerrain = hex.getTerrain(terrain);
			tTerrain = tile.getTerrain(terrain);

			if(!tTerrain){
				continue;
			} else if(!hTerrain 
				|| (tTerrain.elevation !== me.WILDCARD 
						&& tTerrain.elevation != hTerrain.elevation )
				|| (tTerrain.exits !== "" && hTerrain.exits != tTerrain.exits) 
			){
				match = 0;
	        	break;
			}

			// A themed original matches any unthemed comparason.
	        if (tile.get('theme') !== ""
	                && tile.get('theme').toLowerCase() !== hex.get('theme').toLowerCase()) {
	            match = 0.0;
	        	break;
	        }

	        match = 1.0;
	        break;
		}

		return match;
	},

	 /**
     * Match the two hexes using the "base" formula. <p/> Returns a value
     * indicating how close of a match the original hex is to the comparison
     * hex. 0 means no match, 1 means perfect match.
     */
    baseMatch : function(hex, tile){
    	var me = this, 
    		elevation, 
    		terrain, 
    		theme, 
    		maxTerrains,
    		matches = 0.0;

    	// check elevation
        if (tile.get('elevation') == me.WILDCARD) {
            elevation = 1.0;
        } else {
            elevation = 1.01 / (Math.abs(hex.get('elevation')
                    - tile.get('elevation')) + 1.01);
        }

     	maxTerrains = Math.max(hex.get('terrain').length, tile.get('terrain').length);

     	var hTerrain,
     		tTerrain,
     		thisMatch = 0, 
     		key,
     		terrain,
     		terrains = Ext.ux.hex.model.Hex.Terrains;

     	for(key in terrains){
     		if(!terrains.hasOwnProperty(key)){
     			continue;
     		}
     		terrain = terrains[key];
     		hTerrain = hex.getTerrain(terrain);
			tTerrain = tile.getTerrain(terrain);
			thisMatch = 0;

			if (!tTerrain || !hTerrain) {
                continue;
            }

            if (hTerrain.elevation == me.WILDCARD) {
                thisMatch = 1.0;
            } else {
                thisMatch = 1.0 / (Math.abs(tTerrain.elevation - hTerrain.elevation) + 1.0);
            }

            // without exit match, terrain counts... um, half?
            if (hTerrain.exits !== ""
                    && tTerrain.exits != hTerrain.exits) {
                thisMatch *= 0.5;
            }
            // add up match value
            matches += thisMatch;

     	}

        if (maxTerrains == 0) {
            terrain = 1.0;
        } else {
            terrain = matches / maxTerrains;
        }

        // check theme
        if (tile.get('theme') == hex.get('theme')
                || (tile.get('theme') != "" && tile.get('theme').toLowerCase() === hex.get('theme').toLowerCase() )) {
            theme = 1.0;
        } else {
            // also don't throw a match entirely out because the theme is off
            theme = 0.0001;
        }

        return elevation * terrain * theme;
    },

	/**
	 * [getBase description]
	 * @param  {[type]} hex Directly modifies hex
	 * @return {[type]}     [description]
	 */
	getBase : function(hex){
		return this.getTiles(hex)['base'];
	},

	getSupers : function(hex){
		return this.getTiles(hex)['supers'];
	},

	removeMatchingTerrains : function(hex, tile){
		Ext.iterate(Ext.ux.hex.model.Hex.Terrains, function(key, t){
			var tTerrain = tile.getTerrain(t);
			tTerrain && hex.removeTerrain(t);
		});
	}
});