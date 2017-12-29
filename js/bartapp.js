// Exception handling when Googlemaps API Fails
var googleError = function(){
    self.error_message('Unable to access GoogleMaps API');
    self.apiError(true);
};
// Exception handling when BART API fails
var BartApiError = function(){
    self.error_message('Unable to access Bart API');
    self.apiError(true);
};

var map ;
this.marker;
var initMap = function(){
    var bayarea = {lat: 37.668819, lng: -122.080795};
    // Display Map content in 'map' div
    map = new google.maps.Map(document.getElementById('map'), {
        center: bayarea,
        zoom: 10
    });
    // Display Station info in a window when clicked
    infowindow = new google.maps.InfoWindow();          
    for(var i=0; i<places.length; i++){
        CreateMarker(places[i]);
    };
  
};


// Puts a marker by fetching the station details
var CreateMarker = function(place){
        var LatLng = { lat:place.location.lat,
                         lng:place.location.lng };
        self.marker = new google.maps.Marker({
            map:map,
            animation: google.maps.Animation.DROP,
            position: LatLng
        });
        if(self.marker){
            self.markersArray().push([LatLng,
                                     self.marker]);                    
            google.maps.event.addListener(marker, 'click', function() {
                stopAnimation();
                startAnimation(LatLng)
                BartData(place);
            });
        }
};

// Remoes all the markers
var removeMarkers = function(){
    for(var x=0; x<self.markersArray().length; x++ ){
        self.markersArray()[x][1].setMap(null);
    }
};
// Displays all the markers    
var showMarkers = function(){
    for(var i=0; i<self.markersArray().length; i++ ){
        self.markersArray()[i][1].setMap(map);
    }
}; 

// Marker animation start
var startAnimation = function(LatLng){
    ko.computed(function(){
            ko.utils.arrayForEach(self.markersArray(), function(m){
                if(LatLng.lat === m[0].lat && LatLng.lng ===m[0].lng){
                    m[1].setAnimation(google.maps.Animation.BOUNCE);
                }
            });
        });
}

// Marker animation stop
var stopAnimation = function(){
    for(var i=0; i<self.markersArray().length; i++ ){
        self.markersArray()[i][1].setAnimation(null);
    }
}


// Gets the station info from Bart API
var BartData = function(place){

    var abbrv = place.abbr;
    var bartapiURL = "http://api.bart.gov/api/stn.aspx?cmd=stninfo&orig="+abbrv+"&key=MW9S-E7SL-26DU-VV8V&json=y";
    
    $.ajax({
        url:bartapiURL,
        dataType:"json",
        async:true        
    }).success(function(data){
            self.des_name(data.root.stations.station.name);
            self.address(data.root.stations.station.address);
            self.city(data.root.stations.station.city);
            self.zipcode(data.root.stations.station.zipcode);
            self.platform(data.root.stations.station.platform_info);   
    }).error(function(data){
        BartApiError();
    })
    
};


// View Model 
var viewModel = function(){
    var self = this;
    this.markersArray = ko.observableArray([]);
    this.query = ko.observable();
    this.location_image = ko.observable();
    this.des_name = ko.observable();
    this.address = ko.observable();
    this.city = ko.observable();
    this.platform = ko.observable();
    this.zipcode = ko.observable();
    this.apiError = ko.observable(false);
    this.error_message = ko.observable();
    // Filters the places array when searched
    this.queryResults = ko.computed(function() {
        q = self.query();
        if(!q){
            showMarkers();
            return places;
        }
        else{
            removeMarkers();
            return ko.utils.arrayFilter(places, function(place) {
                if(place.name.indexOf(q) >= 0) {
                    CreateMarker(place);
                    return place;
                }    
            });
        }
    });

    // When the station name is clicked on the left, opens the infowindow
    this.viewStation = function(place){
        var check_LatLng = {lat:place.location.lat,
                               lng:place.location.lng};
        stopAnimation();
        startAnimation(check_LatLng);
        BartData(place);       
    };  
    this.closeDesc = function(){
        self.des_name(null);
    };
     
};     

    
ko.applyBindings(viewModel);  
