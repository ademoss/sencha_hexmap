Ext.define('HexMap.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'Ext.TitleBar',
        'Ext.ux.hex.Map'
    ],
    config: {
        tabBarPosition: 'bottom',

        items: [
            {
                title: 'Welcome',
                iconCls: 'home',
                // scrollable : {
                //     direction : 'both'
                // },

                styleHtmlContent: true,
                scrollable: false,
                // layout : 'fit',
                items: [{
                    docked: 'top',
                    xtype: 'titlebar',
                    title: 'Welcome to Sencha Touch 2'
                },{
                    xtype : 'hex-map',
                    // url : 'resources/boards/boxcanyon.board',
                    url : 'resources/boards/tallassia6_country_road_ii.board',
                    // url : 'resources/boards/unofficial/dropport1_with_fuel_tanks.board',
                    tileset : 'resources/images/hexes/atmospheric.tileset'
                }]
            }
        ]
    }
});
