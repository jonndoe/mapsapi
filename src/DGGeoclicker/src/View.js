L.DG.Geoclicker.View = L.Class.extend({

    initialize: function(map, options) { // (Object, Object)
        this._map = map;
        this._popup = L.popup({
            maxHeight:300,
            maxWidth: 438,
            minWidth: 150
        });
        this._templates = __DGGeoclicker_TMPL__;
        options && L.Util.setOptions(this, options);
    },

    showLoader: function () {
        var popup = this._popup,
            loaderDiv =  document.getElementById('dg-popup-firm-loading');

        this.hideLoader();
        if (loaderDiv) {
            loaderDiv.style.display = 'block';
        } else {
            popup.setContent('<img src="__BASE_URL__/img/loader_directory.gif"');
        }
    },

    hideLoader: function () {
        var loaderDiv = document.getElementById('dg-popup-firm-loading');
        if (loaderDiv) {
            loaderDiv.style.display = "none";
        } else {
            //this._popup.setContent(this.getTemplate("loader"));
        }
    },

    showPopup: function (latlng) { // (Object)
        this._popup.setLatLng(latlng).openOn(this._map);
    },

    render: function(options) { // (Object) -> String
        var html,
            tmpl,
            tmplFileContent;

        options = options || {};
        options.tmpl = options.tmpl || "";
        options.tmplFile = options.tmplFile || null;
        tmplFileContent = this._templates[options.tmplFile];

        if (options.data) {
            tmpl = tmplFileContent ? tmplFileContent : options.tmpl;
            html = L.DG.Template(tmpl, options.data);
        } else {
            html = options.tmpl;
        }

        options.beforeRender && options.beforeRender();

        if (options.popup) {
            if (options.append) {
                var popupLoader = document.getElementById("dg-popup-firm-loading");
                if (popupLoader) {
                    popupLoader.previousSibling.innerHTML += html;
                    options.updateScrollPosition && this._popup.updateScrollPosition();
                }
            } else {
                options.header && this._popup.setHeaderContent(options.header);
                options.footer && this._popup.setFooterContent(options.footer);
                //console.log(html);
                this._popup.setContent(html);
            }
        }
        options.afterRender && options.afterRender();

        return html;
    },

    renderPopup: function(options) { // (Object) -> String
        options.popup = true;
        return this.render(options);
    },

    getPopup: function() { // () -> Object
        return this._popup;
    },

    getTemplate: function(tmplFile) {
        var tmpl = this._templates[tmplFile];
        return tmpl ? tmpl : "";
    }
});
