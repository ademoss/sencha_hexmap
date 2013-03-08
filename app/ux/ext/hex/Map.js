Ext.define('Ext.ux.hex.Map', {
	// extend : 'Ext.draw.Component',
	extend : 'Ext.Component',
	alias : 'widget.hex-map',
	requires : [
		'Ext.Ajax', 
		'Ext.data.Store', 
		'Ext.ux.hex.model.Hex',
		'Ext.ux.hex.store.Hex',
		'Ext.ux.hex.model.HexTileset',
		'Ext.ux.hex.Hex'
	],
	config : {
		url : undefined,
		tileset : undefined,
		mapSize : undefined,
		store : undefined,

		hexWidth : 84,
		hexHeight: 72,

		canvas : true,
		zPD : undefined,
		tileset : undefined
	},

	initialize : function(){
		this.setStore(Ext.create('Ext.ux.hex.store.Hex'));
		this.on('resize', this.resizeCanvas, this);
		this.callParent(arguments);
	},

	applyCanvas : function(canvas){
		if(canvas === true){
			canvas = Raphael(this.getEl().dom, this.getWidth(), this.getHeight());
		}
		return canvas;
	},

	updateCanvas : function(canvas){
		var zpd;
		if(canvas instanceof Raphael){
			zpd = new RaphaelZPD(canvas, { zoom: true, pan: true, drag: false });
			this.setZPD(zpd);
		}
	},

	// getCanvas : function(id){
	// 	return this.getSurface(id);
	// },

	updateUrl : function(url){
		Ext.Ajax.request({
			url : url,
			scope : this,
			success : function(response){
				// console.profile('Parse Data');
				this.parseMapData(response.responseText);
				// console.profileEnd();
				// console.profile('Build Map');
				this.buildMap();
				// console.profileEnd();
			},
			failure : function(response){
				Ext.Msg.alert('Map Data Load Failure!');
			}
		})
	},

	applyTileset : function(tileset){
		var me = this;
		if(Ext.isString(tileset)){
			tileset = Ext.ux.hex.model.HexTileset.loadUrl(tileset, { callback : function(record){
				me.setTileset(record);
			}});
		} else if(tileset instanceof Ext.ux.hex.model.HexTileset){
			return tileset
		} else {
			return undefined;
		}
	},

	updateTileset : function(tileset){
		this.fireEvent('tilesetloaded', this, tileset);
	},

	applyMapSize : function(size){
		if(!size){
			size = { width : 0, height: 0 };
		}
		return size;
	},

	updateMapSize : function(size){
		// this.setSize((1.75*84) + ((size.width-2)*.75*84), (72*size.height) + (size.height*2) + 3);
		this.getCanvas().setSize((1.75*84) + ((size.width-2)*.75*84), (72*size.height) + (size.height*2) + 3);
	},

	resizeCanvas : function(cmp, size){
		var canvas = this.getCanvas();
		// canvas.setViewBox(0, 0, size.width, size.height);
	},

	parseMapData : function(data){
		var size, store = this.getStore();

		store.removeAll();

		if(!data){
			return data;
		}

		// Remove the quotes which we don't need and split it up by line
		data = data.split('"').join('').split("\n");

		// Grab Size of map
		size = data.shift().split(' ');
		size = { width : Ext.num(size[1]), height : Ext.num(size[2]) };
		this.setMapSize(size);

		// Parse through map items and instantiate them
		Ext.each(data, function(hex){
			if(Ext.isEmpty(hex) || hex.indexOf("end") !== -1){
				return;
			}
			hex = hex.split(' ');
			hex = Ext.create('Ext.ux.hex.model.Hex',{
				type 		: hex[0],
				location 	: hex[1],
				coord 		: { x : Ext.num(hex[1].substring(0,String(size.width).length)), y : Ext.num(hex[1].substring(String(size.width).length)) },
				elevation 	: hex[2],
				terrain 	: hex[3],
				theme 		: hex[4]
			});
			store.add(hex);
		}, this);

		store.sort();
	},

	buildMap : function(){
		var me = this,
			store = this.getStore(),
			canvas = this.getCanvas(),
			tileset = this.getTileset();

		if(!tileset){
			this.on('tilesetloaded', this.buildMap, this, { single : true } );
			return;
		}

		store.each(function(record){
			var sprite = Ext.create('Ext.ux.hex.Hex',{
				canvas : canvas,
				record : record,
				tileset : tileset,
				listeners : {
					click : me.onHexClick,
					scope: this
				}
			});
			record.set('node', sprite);
		}, this);
	},

	onHexClick : function(hex){
		var neighbors = this.getStore().getNeighors(hex.getRecord());
		console.log(hex, neighbors);

		Ext.each(neighbors, function(record){
			
		})
	}
})