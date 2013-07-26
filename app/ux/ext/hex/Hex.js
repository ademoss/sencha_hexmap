Ext.define('Ext.ux.hex.Hex', {
	extend : 'Ext.Evented',

	config : {
		basePath : 'resources/images/hexes/',
		// imageUrl : undefined,
		record : undefined,
		coord : true,
		// hidden : false,
		width : 84,
		canvas : undefined,
		height: 72,
		group : undefined,
		tileset : undefined,
		path : undefined
	},

	constructor : function(config){
		this.callParent(arguments);
		this.initConfig(config);
		if(this.getRecord()){
			this.buildBackground(this.getRecord());
		}
	},


	applyCoord : function(coord){
		var width = this.getWidth(),
			height = this.getHeight(),
			distanceApart = width/4;

		if(coord === true){
			coord = { x : 0, y : 0 };
		}


		if(coord.x % 2 === 0){
			coord.y =((coord.y-1) * height)+(height/2);
		} else {
			coord.y = (coord.y-1) * height;
		}
		coord.x =((coord.x-1) * width)-(distanceApart*(coord.x-1));
		coord.y += height/2 + 1;
		coord.x += width/2;
		return coord;
	},

	updateCoord : function(coord){
		this.setPath(true);
	},

	applyPath : function(path){
		var coord = this.getCoord(),
			width = this.getWidth(),
			height = this.getHeight();

		if(path === true){
			path = [];
			// http://www.redblobgames.com/grids/hexagons/#basics
			var center_x = coord.x, 
				center_y = coord.y,
				size = this.getWidth()/2,
				angle, x_i, y_i;
			for(var i = 0; i <= 6; i++){
				angle = 2 * Math.PI / 6 * i;
			    x_i = (center_x + size * Math.cos(angle));
			    y_i = (center_y + size * Math.sin(angle));
			    if (i == 0) {
			        path.push('M',x_i,',',y_i,' ');
			    } else {
					path.push('L',x_i,',',y_i,' ');
			    }
			}
			path = path.join('');
		}
		return path;
	},

	updateRecord : function(record){
		this.setCoord(Ext.apply({}, record.get('coord')));
	},

	buildBackground : function(record){
		var path = this.getPath(),
			width = this.getWidth(),
			height = this.getHeight(),
			coord = this.getCoord(),
			canvas = this.getCanvas(),
			location = record.get('location'),
			group = record.getId(),
			me = this,
			cellNumber,
			elevation;

		var tiles = this.getTileset().getTiles(record);

		var hex = canvas.add({
			type : 'image',
			x : coord.x-width/2,
			y : coord.y-height/2,
			width : this.getWidth(),
			height: this.getHeight(),
			path : path, 
			group : group,
			src : this.getImg(record, tiles)
		});

		// For Testing
		// var hex = canvas.add({
		// 	type : 'path',
		// 	path : path, 
		// 	group : group,
		// 	"stroke" : 'black',
		// 	"stroke-width": 1,
		// 	"fill" : 'rgba(255,0,0,.5)'
		// });

		coordString = record.get('coord');
		coordString = Ext.String.leftPad(coordString.x, 2, '0')+Ext.String.leftPad(coordString.y, 2, '0');


		Ext.each(tiles.supers, function(superImg){
			var rect = canvas.add({
				type : 'image',
				x : coord.x-width/2,
				y : coord.y-height/2,
				width : me.getWidth(),
				height : me.getHeight(),
				path : path,
				group : group,
				src : me.getBasePath() + superImg
			});
		});

		cellNumber = canvas.add({
			type : 'text',
			x : coord.x,
			y : coord.y,
			text : coordString,
			group : group
		});

		if(record.get('elevation') != 0){		
			elevation = canvas.add({
				type : 'text',
				x : coord.x-this.getWidth()/4,
				y : coord.y+30,
				text : 'LEVEL '+record.get('elevation'),
				group : group
			});
		}

	},

	getImg : function(record, tiles){
		var path = this.getBasePath();
		path = path + tiles.base;
		return path;
	}
})