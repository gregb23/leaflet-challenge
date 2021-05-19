//set up map 
var myMap = L.map("map", {
    center: [5.8926, 95.3238],
    zoom: 5,
});

//create tile layer
L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY,
    }

).addTo(myMap);

// link from geoJson data (M4.5+ Earthquakes from past 7 days)
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

//use d3 to get and view data
d3.json(url).then(function (data){
    console.log(data);

    //set up markers
    function markers(magnitude) {
        return magnitude * 5;
    }

    //set colors for depth - https://www.schemecolor.com/flat-graphic.php
    function colorSelect(depth){
        switch (true){
            case depth > 100:
                return "#9B271B";
            case depth > 75:
                return "#C1392D";
            case depth > 50:
                return "#DEB319";
            case depth > 25:
                return "#F1C50E";
            case depth > 0:
                return "#00BE9C";
            default:
                return "#52D68A";
                    
        }
    }

    //load data into geojson
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(
                latlng,
                { 
                    radius: markers(feature.properties.mag),
                    fillColor: colorSelect(feature.geometry.coordinates[2]),
                    fillOpacity: 0.75,
                    color: "gray",
                    weight: 0.3,
                }
            );
        },

        //set up marker popup
        onEachFeature: function (feature, layer){
            layer.bindPopup(
                "<h4> Site: " +
                feature.properties.place +
                "</h4> <hr> <h4> Magnitude: " +
                feature.properties.mag +
                "</h4> <hr> <h4> Time: " +
                new Date(feature.properties.time) +
                "</h4>"
            );
        },
    }).addTo(myMap);

    //create legend
    var legend = L.control({ position: "bottomright"});
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend");
        depthScale =[0, 25, 50, 75, 100];
        //write function
        for (var i = 0; i < depthScale.length; i++){
            div.innerHTML +=
                '<i style="background:' +
                colorSelect(depthScale[i] + 1) +
                '"></i>' + 
                + depthScale[i] +
                (depthScale[i + 1] ? " - " + depthScale[i + 1 ] + "<br>" : " + ");
        }
        return div;            
    };
    legend.addTo(myMap);
});