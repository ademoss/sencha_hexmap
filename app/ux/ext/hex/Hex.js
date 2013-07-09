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
			path.push('M',coord.x+(width*.25),',',coord.y,' ');
			path.push('l',width*.5,',',0,' ');
			path.push('l',width*.25,',',height*.5,' ');
			path.push('l',-width*.25,',',height*.5,' ');
			path.push('l',-width*.5,',',0,' ');
			path.push('l',-width*.25,',',-height*.5,' ');
			path.push('l',width*.25,',',-height*.5,' ');
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
			x : coord.x,
			y : coord.y,
			width : this.getWidth(),
			height: this.getHeight(),
			path : path, 
			group : group,
			src : this.getImg(record, tiles)
		});

		coordString = record.get('coord');
		coordString = Ext.String.leftPad(coordString.x, 2, '0')+Ext.String.leftPad(coordString.y, 2, '0');


		Ext.each(tiles.supers, function(superImg){
			var rect = canvas.add({
				type : 'image',
				x : coord.x,
				y : coord.y,
				width : me.getWidth(),
				height : me.getHeight(),
				path : path,
				group : group,
				src : me.getBasePath() + superImg
			});
		});

		cellNumber = canvas.add({
			type : 'text',
			x : coord.x+(width*.5),
			y : coord.y+10,
			text : coordString,
			group : group
		});

		if(record.get('elevation') != 0){		
			elevation = canvas.add({
				type : 'text',
				x : coord.x+(width*.5)-this.getWidth()/4,
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