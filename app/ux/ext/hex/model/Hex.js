(function(){
	var clean = function(v){
		v = v || '';
		return v.split('"').join('');
	};
	var splitString = function(v){
		return Ext.Array.clean(clean(v).split(';'));
	};
	Ext.define('Ext.ux.hex.model.Hex', {
		extend : 'Ext.data.Model',
		config : {
			idProperty : 'location',
			fields : [
				{ name : 'priority', convert : clean },		// base || super || hex || octo
				{ name : 'elevation' }, 	// what elevation a given tile works with. can be * for all
				{ name : 'terrain', convert : function(val){
					if(Ext.isEmpty(val)){
						val = 'none';
					}
					val = (val || '').split(';');
					Ext.iterate(val, function(v, key){
						var terrain, level = '', exits = '';
						v = v.split(':');

						terrain = v[0];

						if(v[1] !== undefined){
							level = Ext.num(v[1], v[1]);
						}

						if(v[2] !== undefined){
							exits = Ext.num(v[2], v[2]);
						}
						val[key] = { name : terrain, elevation : level, exits : exits};
					});
					return val;
				} }, 	// semicolon delimited string of terrain types to apply to rough:1;swamp:1
				{ name : 'theme', convert : clean }, 		// specific theme in which to apply this tile to.
				{ name : 'image', convert : splitString }, 		// semicolon delimited string of tile image paths
				'coord',
				'node',
				'location'
			],
			proxy : {
				type : 'ajax',
				reader : {
					type : 'json'
				}
			}
		},

		getImage : function(){
			var images = this.get('image'),
				i = Math.floor(Math.random()*(images.length));
				image = images[i];
			
			return image;
		},

		getTerrain : function(name){
			var terrains = this.get('terrain'),
				terrain;
			Ext.each(terrains, function(t){
				if(t.name === name){
					terrain = t;
					return false;
				}
			});
			return terrain;
		},

		removeTerrain : function(type){
			var terrains = this.get('terrain');
			Ext.iterate(terrains, function(t,key){
				if(t.name === type){
					terrains.splice(key, 1);
					return false;
				}
			});
		},

		/**
		 * [isPathable description]
		 * @param  {[type]}  from assumes a record instance which is a neighbor of this
		 * @return {Boolean}      [description]
		 */
		isPathable : function(from){
			var me = this,
				pathable = true,
				unpathableTerrains = [
					'water', 'building', 'impassable'
				]
			Ext.each(unpathableTerrains, function(t){
				if(me.getTerrain(t)){
					pathable = false;
					return false;
				}
			});
			if(pathable && from){
				if(Math.abs(this.get('elevation') - from.get('elevation')) > 1){
					pathable = false;
				}

				// TODO add exit handling
			}
			return pathable;
		},

		getMovementCost : function(start){
			// TODO add cost for more types of terrains
			return this.getTerrain('none') ? 1 : 2;
		},

		statics : {
			// TODO: Implement more from common/Terrains.java
			Terrains : {
				// base terrain types
				NONE 			: "none",
				WOODS 			: "woods",
				WATER 			: "water",
				ROUGH 			: "rough",
				RUBBLE 			: "rubble",
				JUNGLE 			: "jungle",
				SAND 			: "sand",
				TUNDRA 			: "tundra",
				MAGMA 			: "magma",
				FIELDS 			: "planted_fields",
				INDUSTRIAL 		: "heavy_industrial",
				SPACE 			: "space",

				// terrain modifiers
				PAVEMENT 		: "pavement",
				ROAD 			: "road",
				SWAMP 			: "swamp",
				MUD 			: "mud",
				RAPIDS 			: "rapids",
				ICE 			: "ice",
				SNOW 			: "snow",
				FIRE 			: "fire",
				SMOKE 			: "smoke",
				GEYSER 			: "geyser",

				// bulidings
				BUILDING 		: "building",
				BLDG_CF 		: "bldg_cf",
				BLDG_ELEV 		: "bldg_elev",
				BLDG_BASEMENT 	: "bldg_basement",
				BRIDGE 			: "bridge",
				BRIDGE_CF 		: "bridge_cf",
				BRIDGE_ELEV 	: "bridge_elev",
				FUEL_TANK 		: "fuel_tank",
				FUEL_TANK_CF 	: "fuel_tank_cf",
				FUEL_TANK_ELEV 	: "fuel_tank_elev",
				FUEL_TANK_MAGN 	: "fuel_tank_magn",

				//special
				IMPASSABLE 		: "impassable",
				ELEVATOR 		: "elevator",
				FORTIFIED 		: "fortified",
				SCREEN 			: "screen",

				// fluff
				FLUFF 			: "fluff",
				ARMS 			: "arms",
				LEGS 			: "legs"
			}
		}
	});
})();