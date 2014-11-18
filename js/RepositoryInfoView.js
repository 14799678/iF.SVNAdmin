(function (jQ) {
  "use strict";
  brite.registerView("RepositoryInfoView", {}, {

    create: function (data) {
      var view = this;
      jQuery.extend(view.options, data);
      return jQuery("#tmpl-RepositoryInfoView").render({ options: view.options });
    },

    postDisplay: function (data) {
      var view = this;
      view.showPaths(view.options.providerId, view.options.repositoryId);
    },

    events: {
    },

    ///////////////////////////////////////////////////////////////////
    //
    ///////////////////////////////////////////////////////////////////

    options: {
      providerId: "",
      repositoryId: ""
    },

    showPaths: function (providerId, repositoryId) {
      var view = this;
      var html = jQ("#tmpl-RepositoryInfoView-PathList").render({ options: view.options });
      view.$el.find(".paths-wrapper").html(html);

      var options = {
        showPaging: false,
        showRowNumber: svnadmin.app.config.showtablerownumber,
        pageSize: svnadmin.app.config.tablepagesize,

        singleActions: [
          {
            id: "permissions",
            getName: function (id) { return tr("Permissions"); },
            getLink: function (id) { return ""; },
            callback: function (id) { return null; }
          }
        ],

        multiActions: [
          {
            id: "delete",
            name: tr("Delete"),
            callback: function (ids) {
              var promises = [],
                i = 0;
              for (i = 0; i < ids.length; ++i) {
                promises.push(svnadmin.service.deleteRepositoryPath(providerId, repositoryId, ids[i]));
              }
              return jQ.when.apply(null, promises).done(function () {
                view.showRepositoryInfoView(providerId, repositoryId);
              });
            }
          }
        ],

        columns: [
          { id: "", name: tr("Path") }
        ],

        loadMore: function (offset, num) {
          var def = new jQuery.Deferred();
          svnadmin.service.getRepositoryPaths(providerId, repositoryId).done(function (resp) {
            var obj = {}, i = 0, row = null;
            obj.hasMore = false;
            obj.rows = [];
            for (i = 0; i < resp.paths.length; ++i) {
              row = {};
              row.id = resp.paths[i].path;
              row.cells = [resp.paths[i].path];
              obj.rows.push(row);
            }
            def.resolve(obj);
          }).fail(function () {
            def.reject();
          });
          return def.promise();
        }
      };
      brite.display("BasicTableView", view.$el.find(".table-wrapper"), { options: options });
    }

  });
}(jQuery));