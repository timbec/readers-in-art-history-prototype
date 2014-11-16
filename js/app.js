(function ($) {

    //demo data
    var paintings = [
        { name: "Michelangelo", country: "Italy", year: "1760", title: "David", century: "17th Century", readerAge: "child" },
        { name: "Rembrandt", country: "Holland", year: "1650", title: "A Peasant", century: "17th Century", readerAge: "adult" },
        { name: "Goya", country: "Spain", year: "1780", title: "Women On Balcony", century: "18th Century", readerAge: "adolescent" },
        { name: "Jackson Pollock", country: "USA", year: "1952", title: "Autumn Leaves", century: "20th Century", readerAge: "adolescent" },
        { name: "Henri Matisse", country: "France", year: "1922", title: "The Lilies", century: "20th Century", readerAge: "adult" },
        { name: "Roy Lichtenstein", country: "USA", year: "1965", title: "Pow!", century: "20th Century", readerAge: "middle age" },
        { name: "David Katz", country: "", year: "2006", title: "Jersey Shore", century: "21st Century", readerAge: "older" },
        { name: "Pablo Picasso", country: "Spain", year: "1910", title: "Women Bathing", century: "20th Century", readerAge: "older" }
    ];

    //define product model
    var Painting = Backbone.Model.extend({
        defaults: {
            photo: "img/placeholder.png"
        }
    });

    //define directory collection
    var Timeline = Backbone.Collection.extend({
        model: Painting
    });

    //define individual contact view
    var PaintingView = Backbone.View.extend({
        tagName: "article",
        className: "timeline-container",
        template: _.template($("#timelineTemplate").html()),

        render: function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        }
    });

    //define master view
    var TimelineView = Backbone.View.extend({
        el: $("#timeline"),

        initialize: function () {
            this.collection = new Timeline(paintings);

            this.render();
            this.$el.find("#filter").append(this.createSelect()); 

            this.on("change:filterType", this.filterByType, this);
            this.collection.on("reset", this.render, this);
        },

        render: function () {
            this.$el.find("article").remove();

            _.each(this.collection.models, function (item) {
                this.renderPainting(item);
            }, this);
        },

        renderPainting: function (item) {
            var paintingView = new PaintingView({
                model: item
            });
            this.$el.append(paintingView.render().el);
        },

        getTypes: function () {
            var plucked =  _.uniq(this.collection.pluck("readerAge"));
            console.log(plucked); 
            return plucked; 
        },

        createSelect: function () {
            var select = $("<select/>", {
                    html: "<option value='all'>See All Reader Ages</option>"
                });

            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item,
                    text: item
                }).appendTo(select);
            });
            return select;
        },

        //add ui events
        events: {
            "change #filter select": "setFilter"
        },


        //Set filter property and fire change event
        setFilter: function (e) {
            this.filterType = e.currentTarget.value;
            this.trigger("change:filterType");
        },

        //filter the view
        filterByType: function () {
            if (this.filterType === "all") {
                this.collection.reset(paintings);
                //Set to show an empty url (before it was 'filter/all')
                paintingsRouter.navigate("");
            } else {
                this.collection.reset(paintings, { silent: true });

                var filterType = this.filterType,
                    filtered = _.filter(this.collection.models, function (item) {
                        return item.get("readerAge") === filterType;
                    });

                this.collection.reset(filtered);

                paintingsRouter.navigate("/" + filterType);
            }
        }
    });

    //add routing
    var PaintingsRouter = Backbone.Router.extend({
        routes: {
            "/:readerAge": "urlFilter"
        },

        urlFilter: function (readerAge) {
            timeline.filterType = readerAge;
            timeline.trigger("change:filterType");
        }
    });

    //create instance of master view
    var timeline = new TimelineView();


    //create router instance
    var paintingsRouter = new PaintingsRouter();

    //start history service
    Backbone.history.start();

} (jQuery));