Ext.define('Ext.ux.hex.reader.megamek.Tileset',{
	extend : 'Ext.data.reader.Json',
	alias : 'reader.megamek.tileset',

    commentChar : '#',
    quoteChar : '"',
    emptyChar : '',

	getResponseData : function(response){
		var responseText = response;

        // Handle an XMLHttpRequest object
        if (response && response.responseText) {
            responseText = response.responseText;
        }

        // Handle the case where data has already been decoded
        if (typeof responseText !== 'string') {
            return responseText;
        }

        // getData expects an array of data in the case that getResponseData ever gets overridden to support multiple tilesheets
        return [responseText.split("\r").join('').split("\n")];
	},

	getData : function(data){
        var me = this,
            superTiles = [],
            baseTiles = [],
            commentChar = this.commentChar,
            emptyChar = this.emptyChar,
            tempData = [];

        for(var key in data){
            if(!data.hasOwnProperty(key)){
                continue;
            }
            try {
                Ext.each(data[key], function(line){
                    var temp;
                    if(line[0] === commentChar || line === emptyChar){
                        return;
                    }
                    temp = line.split(/\s+/).join(' ').split(me.quoteChar).join('').split(' ');
                    temp = {
                        priority : temp[0],
                        elevation : temp[1],
                        terrain : temp[2],
                        theme : temp[3],
                        image : temp[4]
                    };
                    if(temp.priority === 'super'){
                        superTiles.push(temp);
                    } else {
                        baseTiles.push(temp);
                    }
                });
                tempData.push({
                    base : baseTiles,
                    super : superTiles
                });
            } catch (ex) {
                /**
                 * @event exception Fires whenever the reader is unable to parse a response.
                 * @param {Ext.data.reader.Xml} reader A reference to this reader.
                 * @param {XMLHttpRequest} response The XMLHttpRequest response object.
                 * @param {String} error The error message.
                 */
                this.fireEvent('exception', this, data, 'Unable to parse the STRING returned from the server: ' + ex.toString());
                Ext.Logger.warn('Unable to parse the STRING returned by the server: ' + ex.toString());
            }
        };
        return tempData;
	}
})