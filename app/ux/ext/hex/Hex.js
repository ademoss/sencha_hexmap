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
			group = canvas.set(),
			me = this,
			cellNumber,
			elevation;

		this.setGroup(group);

		var hex = canvas.path(path);
		group.push(hex);

		coordString = record.get('coord');
		coordString = Ext.String.leftPad(coordString.x, 2, '0')+Ext.String.leftPad(coordString.y, 2, '0');

		var tiles = this.getTileset().getTiles(record);

		hex.attr({
			// "fill" : me.getFillStyle(record)
			"fill" : 'url('+this.getImg(record, tiles)+')'
		});

		Ext.each(tiles.supers, function(superImg){
			var rect = canvas.path(path);
			rect.attr({
				"fill" : 'url('+me.getBasePath() + superImg + ')',
				'stroke-width' : 0
			});
			group.push(rect);
		});

		cellNumber = canvas.text(coord.x+(width*.5),coord.y+10,coordString);
		group.push(cellNumber);

		if(record.get('elevation') != 0){
			elevation = canvas.text(coord.x+(width*.5),coord.y+height-10,'LEVEL '+record.get('elevation'));				
			group.push(elevation);
		}

		group.click(function(e,x,y){
			me.fireEvent('click', me);
		});

		group.hover(function(){
			// group.toFront();
			hex.attr({
				"stroke" : 'green'
			});
		},function(){
			hex.attr({
				"stroke" : 'black'
			});
		});
	},

	/*colors : {
		default : ['ffff00','cccc00','aaaa00','999900','888800','777700','666600','555500','444400','333300','222200','111100'],
		woods : ['00ff00','00cc00','00aa00','009900','008800','007700','006600','005500','004400','003300','002200','001100'],
		water : ['0000ff','0000cc','0000aa','000099','000088','000077','000066','000055','000044','000033','000022','000011'],
		rough : ['cccccc','c0c0c0','a0a0a0','909090','808080','707070','606060','505050','404040','303030','202020','101010']

	},*/

	/*getFillStyle : function(record){
		var tiles = this.getTileset().getTiles(record),
			fillStyle = 'yellow';
			//boring/beige_plains_0.gif
		debugger;

		if(terrain.indexOf('woods') !== -1){
			fillStyle = '#'+this.colors.woods[Math.abs(record.get('elevation'))];
		} else if(terrain.indexOf('rough') !== -1){
			fillStyle = '#'+this.colors.rough[Math.abs(record.get('elevation'))];
		} else if(terrain.indexOf('water') !== -1){
			fillStyle = '#'+this.colors.water[Math.abs(record.get('elevation'))];
		} else {
			fillStyle = '#'+this.colors.default[Math.abs(record.get('elevation'))];
		}
		return fillStyle;
	},*/

	getImg : function(record, tiles){
		var path = this.getBasePath();
		path = path + tiles.base;
		return path;
	}
})