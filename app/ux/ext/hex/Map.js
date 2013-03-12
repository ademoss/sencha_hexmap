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
		this.paths = [];
		this.overlays = [];
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

	hexesClicked : [],

	onHexClick : function(hex){
		if(this.hexesClicked.indexOf(hex) > -1){
			Ext.Array.remove(this.hexesClicked, hex);
			hex.glow.remove();
		} else if(this.hexesClicked.length === 2) {
			this.hexesClicked.pop().glow.remove();
			hex.glow = hex.getGroup()[0].glow({ fill : false, color: 'red' });
			hex.glow.toFront();
			this.hexesClicked.push(hex);
		} else {
			hex.glow = hex.getGroup()[0].glow({ fill : false, color: 'red' });
			hex.glow.toFront();
			this.hexesClicked.push(hex);
		}

		if(this.hexesClicked.length < 2){
			this.clearPath();
		} else {
			this.displayPath.apply(this, this.hexesClicked);
		}
	},

	clearPath : function(hex1, hex2){
		Ext.each(this.overlays, function(overlay){
			overlay.remove();
		});
		this.path = [];
		this.overlays = [];
	},

	displayPath: function(start, end, keepExisting){
		var start = start instanceof Ext.data.Model ? start : start.getRecord(),
			end = end instanceof Ext.data.Model ? end : end.getRecord(),
			canvas = this.getCanvas();

		if(keepExisting !== true){
			this.clearPath();
		}

		var path = this.getPath(start, end);
		this.path.push(path);
		return path;
	},

	getNodeByRecord : function(record, list){
		var node;
		for(var i = 0, l = list.length; i < l; i++){
			if(list[i].record === record){
				node = list[i];
				break;
			}
		}
		return node;
	},

	showPathOverlay : function(pathNode, attributes){
		var record = pathNode.record,
			parentRecord = pathNode.parent ? pathNode.parent.record : undefined,
			node = record.get('node'),
			coord = node.getCoord(),
			pathCoord = record.get('coord'),
			parentCoord = parentRecord ? parentRecord.get('coord') : {},
			direction = 'none',
			hexWidth = node.getWidth(),
			hexHeight = node.getHeight(),
			arrowStartX = coord.x + hexWidth/2,
			arrowStartY = coord.y + hexHeight/2,
			canvas = this.getCanvas(),
			path = ['M',arrowStartX,',',arrowStartY,' '],
			pX = parentCoord.x,
			pY = parentCoord.y,
			nX = pathCoord.x,
			nY = pathCoord.y;

		attributes = attributes || {};

		if(pathNode.overlay){
			Ext.Array.remove(this.overlays, pathNode.overlay);
			pathNode.overlay.remove();
		}

		if(pX %2 === 0){
			pY = pY +1;
		}
		if(nX %2 === 0){
			nY = nY + 1;
		}

		if(pX && pY){
			if(pY > nY){
				direction = 'south';
 			} else {
 				direction = 'north';
 			}
			if(pX > nX){
				direction = direction + 'east';
			} else if(pX < nX) {
				direction = direction + 'west';
			}
		}

		if(direction === 'none'){
			path.push('l,0,1');
		} else if(direction === 'north') {
			path.push('l,0,-20');
		} else if(direction === 'northeast') {
			path.push('l,20,-20');
		} else if(direction === 'east') {
			path.push('l,20,0');
		} else if(direction === 'southeast') {
			path.push('l,20,20');
		} else if(direction === 'south') {
			path.push('l,0,20');
		} else if(direction === 'southwest') {
			path.push('l,-20,20');
		} else if(direction === 'northwest') {
			path.push('l,-20,-20');
		}
		console.log(pathCoord.x,pathCoord.y,' ',direction, path.join(''));
		var path = canvas.path(path.join(''));
		path.attr(Ext.apply({
			"arrow-end" : direction === 'none' ? 'none' : 'classic-5',
			"stroke-width" : 5
		},attributes));
		pathNode.overlay = path;

		this.overlays.push(path);
	},

	applyNodeScore : function(node, parentNode, endRecord){
		var me = this, costToEnd, costFromParent, score,
			record = node.record,
			parentRecord = parentNode.record;

		costToEnd = me.estimateDistance(record, endRecord);
		costFromParent = record.getMovementCost(parentRecord) + parentNode.costFromParent;
		score = costToEnd + costFromParent;

		node.costFromParent = costFromParent;
		node.costToEnd = costToEnd;
		node.score = score;
	},

	/**
	 * Basis for A* taken from http://www.policyalmanac.org/games/aStarTutorial.htm
	 * @param  {[type]} startRecord [description]
	 * @param  {[type]} endRecord   [description]
	 * @return {[type]}             [description]
	 */
	getPath : function(startRecord, endRecord){
		var me = this,
			openList = [],
			closedList = [],
			parentRecord = startRecord,
			parentNode = { record : parentRecord, costFromParent : 0 , score : 0 },
			neighbors,
			store = me.getStore(),
			bestNode,
			lowestScore;

		while(parentRecord !== endRecord){
			// Gather all pathable neighbors
			neighbors = store.getNeighors(parentRecord);
			Ext.iterate(neighbors, function(key, record){
				var oNode;
				if(record && record.isPathable(parentRecord)){
					oNode = me.getNodeByRecord(record, openList);
					cNode = me.getNodeByRecord(record, closedList);
					if(oNode){
						if(!cNode && oNode.record.getMovementCost(parentRecord) + parentNode.costFromParent < oNode.costFromParent){
							me.applyNodeScore(oNode, parentNode, endRecord);
							oNode.parent = parentNode;
						}
					} else if(!cNode) {
						openList.push({ record : record, parent : parentNode });
					}
				}
			});

			if(openList.length === 0){
				throw 'PATH NOT FOUND';
				return undefined;
			}

			closedList.push(parentNode);
			Ext.Array.remove(openList, parentNode);

			parentNode.overlay && parentNode.overlay.remove();
			this.showPathOverlay(parentNode);

			bestNode = undefined;
			lowestScore = undefined;
			Ext.each(openList, function(node){
				var distance, score, costFromStart, costToEnd,
					record = node.record;

				if(node.score === undefined){
					me.applyNodeScore(node, parentNode, endRecord);
				}

				if(lowestScore === undefined || node.score + parentNode.score < lowestScore){
					lowestScore = node.score;
					bestNode = node;
				}
			});
			parentNode = bestNode;
			parentRecord = bestNode.record;
		}

		var n = parentNode;
		do{
			this.showPathOverlay(n, { stroke : 'green' });
			n = n.parent;
		} while(n)

		return parentNode;
	},

	/**
	 * Logic for estimating distance using the Manhattan method
	 * @param  {[type]} startNode [description]
	 * @param  {[type]} endNode   [description]
	 * @return {[type]}           [description]
	 */
	estimateDistance : function(start, end){
		var dx, dy, 
			sX = start.get('coord').x,
			sY = start.get('coord').y,
			eX = end.get('coord').x,
			eY = end.get('coord').y;

		// if(sX % 2 === 0){
		// 	sY + 1;
		// }

		// if(eX % 2 === 0){
		// 	eY + 1;
		// }

		dx = Math.abs(sX - eX);
		dy = Math.abs(sY - eY) - Math.ceil(dx/2);

		if (dy < 0){
			dy = 0;
		}
		return dx + dy;
	}
})